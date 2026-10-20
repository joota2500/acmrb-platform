/**
 * Geocodificação gratuita em cadeia (uso SOMENTE no servidor)
 * ------------------------------------------------------------
 * Chamado pela rota /api/geocodificar. Tenta, em ordem, até achar
 * um resultado com precisão de endereço:
 *   a) Nominatim (OpenStreetMap) estruturado, limitado à região de Baturité
 *      (+ busca livre se o estruturado não achar)
 *   b) Photon (Komoot, dados OSM), com prioridade perto de Baturité
 *   c) Esri World Geocoder (sem chave) — APENAS sugestão de posição que o
 *      admin confirma; o resultado não é guardado como dado da Esri
 *   d) CEP pela BrasilAPI v2 (pode trazer coordenadas)
 *   e) centro do bairro e, por fim, centro da cidade
 * Resultados fora de ~40 km de Baturité são descartados (evita "Rua
 * Baturité" em São Paulo). Cada item traz a fonte e o nível de precisão.
 * Cache simples em memória (24 h) e fila de 1 req/s para o Nominatim,
 * conforme a política de uso dele (User-Agent identificado).
 */

export type Precisao = "endereco" | "rua" | "bairro" | "cidade";
export type Fonte = "Nominatim (OSM)" | "Photon (OSM)" | "Esri" | "CEP (BrasilAPI)" | "Centro da cidade";

export interface ResultadoGeo {
  lat: number;
  lng: number;
  nome: string;
  fonte: Fonte;
  precisao: Precisao;
}

export interface ConsultaGeo {
  /** texto livre (ex.: "Rua Kaolim, 252, Mangá") */
  q?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}

export const CENTRO_BATURITE = { lat: -4.3286, lng: -38.8848 };
const RAIO_KM = 40;
// caixa da região do Maciço de Baturité (lon_min, lat_max, lon_max, lat_min)
const VIEWBOX = "-39.15,-4.10,-38.60,-4.55";
const UA = "ACMRB-Plataforma/1.0 (Associacao de Catadores do Macico de Baturite; painel administrativo)";
const ORDEM: Record<Precisao, number> = { endereco: 0, rua: 1, bairro: 2, cidade: 3 };

export const ROTULO_PRECISAO: Record<Precisao, string> = {
  endereco: "Endereço exato",
  rua: "Rua",
  bairro: "Bairro",
  cidade: "Cidade",
};

// ---------- utilidades ----------

function distanciaKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = (g: number) => (g * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const naRegiao = (p: { lat: number; lng: number }, centro = CENTRO_BATURITE) => distanciaKm(p, centro) <= RAIO_KM;
const arred = (n: number) => Math.round(n * 1e6) / 1e6;
const limpar = (v?: string) => (v ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
const soDig = (v?: string) => (v ?? "").replace(/\D/g, "");

async function obterJson<T>(url: string, cabecalhos: Record<string, string> = {}, ms = 7000): Promise<T | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { Accept: "application/json", "User-Agent": UA, ...cabecalhos }, signal: ctrl.signal, cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

// Fila do Nominatim: no máximo 1 requisição por segundo (política OSMF)
let proximoNominatim = 0;
async function esperarVezNominatim() {
  const agora = Date.now();
  const espera = Math.max(0, proximoNominatim - agora);
  proximoNominatim = Math.max(agora, proximoNominatim) + 1100;
  if (espera) await new Promise((r) => setTimeout(r, espera));
}

// ---------- a) Nominatim ----------

interface ItemNominatim {
  lat: string;
  lon: string;
  display_name: string;
  addresstype?: string;
  type?: string;
  category?: string;
  address?: { house_number?: string; road?: string };
}

function precisaoNominatim(i: ItemNominatim): Precisao {
  if (i.address?.house_number) return "endereco";
  const t = i.addresstype ?? i.type ?? "";
  if (["house", "building", "amenity", "shop", "office", "tourism"].includes(t) || i.category === "building") return "endereco";
  if (["road", "street", "residential", "highway"].includes(t) || i.category === "highway") return "rua";
  if (["suburb", "neighbourhood", "quarter", "hamlet", "village", "locality"].includes(t)) return "bairro";
  return "cidade";
}

async function nominatim(params: Record<string, string>, regional = true): Promise<ResultadoGeo[]> {
  await esperarVezNominatim();
  const base = new URLSearchParams({
    format: "jsonv2", addressdetails: "1", limit: "5", countrycodes: "br", "accept-language": "pt-BR",
    ...(regional ? { viewbox: VIEWBOX, bounded: "1" } : {}), ...params,
  });
  const lista = await obterJson<ItemNominatim[]>(`https://nominatim.openstreetmap.org/search?${base}`);
  return (lista ?? []).map((i) => ({
    lat: arred(Number(i.lat)), lng: arred(Number(i.lon)), nome: i.display_name, fonte: "Nominatim (OSM)" as Fonte, precisao: precisaoNominatim(i),
  }));
}

// ---------- b) Photon ----------

interface FeaturePhoton {
  geometry: { coordinates: [number, number] };
  properties: { name?: string; street?: string; housenumber?: string; district?: string; city?: string; state?: string; type?: string; osm_key?: string };
}

async function photon(q: string): Promise<ResultadoGeo[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${CENTRO_BATURITE.lat}&lon=${CENTRO_BATURITE.lng}&limit=6`;
  const r = await obterJson<{ features?: FeaturePhoton[] }>(url);
  return (r?.features ?? []).map((f) => {
    const p = f.properties;
    // POI numa rua (sem número) não é o endereço procurado: conta como "rua"
    const precisao: Precisao = p.housenumber ? "endereco" : p.type === "street" || p.osm_key === "highway" || p.street ? "rua"
      : p.type === "district" || p.type === "locality" ? "bairro" : "cidade";
    const nome = [p.name, p.street && p.street !== p.name ? p.street : null, p.housenumber, p.district, p.city, p.state].filter(Boolean).join(", ");
    return { lat: arred(f.geometry.coordinates[1]), lng: arred(f.geometry.coordinates[0]), nome, fonte: "Photon (OSM)" as Fonte, precisao };
  });
}

// ---------- c) Esri (sem chave, apenas sugestão) ----------

interface CandidatoEsri {
  address: string;
  location: { x: number; y: number };
  score: number;
  attributes?: { Addr_type?: string };
}

async function esri(q: string): Promise<ResultadoGeo[]> {
  const url =
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&outFields=Addr_type&maxLocations=5" +
    `&countryCode=BRA&location=${CENTRO_BATURITE.lng},${CENTRO_BATURITE.lat}&SingleLine=${encodeURIComponent(q)}`;
  const r = await obterJson<{ candidates?: CandidatoEsri[] }>(url);
  return (r?.candidates ?? [])
    .filter((c) => c.score >= 70)
    .map((c) => {
      const t = c.attributes?.Addr_type ?? "";
      const precisao: Precisao = ["PointAddress", "Subaddress", "POI", "StreetAddress"].includes(t) ? "endereco"
        : ["StreetName", "StreetInt", "StreetAddressExt"].includes(t) ? "rua"
        : ["Neighborhood", "District", "Locality", "Postal"].includes(t) && !/^Batur/i.test(c.address) ? "bairro" : "cidade";
      return { lat: arred(c.location.y), lng: arred(c.location.x), nome: c.address, fonte: "Esri" as Fonte, precisao };
    });
}

// ---------- d) CEP (BrasilAPI v2) ----------

async function porCep(cep: string): Promise<ResultadoGeo[]> {
  const d = soDig(cep);
  if (d.length !== 8) return [];
  const r = await obterJson<{ street?: string; neighborhood?: string; city?: string; location?: { coordinates?: { latitude?: string; longitude?: string } } }>(
    `https://brasilapi.com.br/api/cep/v2/${d}`,
  );
  const c = r?.location?.coordinates;
  if (!c?.latitude || !c?.longitude) return [];
  const lat = Number(c.latitude);
  const lng = Number(c.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
  // CEP geral da cidade (sem rua) aponta para o centro: precisão de cidade
  const precisao: Precisao = r?.street ? "rua" : r?.neighborhood ? "bairro" : "cidade";
  const nome = [r?.street, r?.neighborhood, r?.city, `CEP ${d.replace(/(\d{5})(\d{3})/, "$1-$2")}`].filter(Boolean).join(", ");
  return [{ lat: arred(lat), lng: arred(lng), nome, fonte: "CEP (BrasilAPI)", precisao }];
}

// ---------- Cache e limite de taxa ----------

const CACHE = new Map<string, { em: number; dados: ResultadoGeo[] }>();
const CACHE_MS = 24 * 60 * 60 * 1000;
const ACESSOS = new Map<string, number[]>();

/** true se o IP passou de `max` consultas no último minuto */
export function excedeuLimite(ip: string, max = 20) {
  const agora = Date.now();
  const lista = (ACESSOS.get(ip) ?? []).filter((t) => agora - t < 60_000);
  lista.push(agora);
  ACESSOS.set(ip, lista);
  if (ACESSOS.size > 2000) ACESSOS.clear();
  return lista.length > max;
}

function dedup(lista: ResultadoGeo[]) {
  const vistos = new Set<string>();
  return lista.filter((r) => {
    const k = `${r.lat.toFixed(4)},${r.lng.toFixed(4)}`;
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

// ---------- Cadeia principal ----------

export async function geocodificar(c: ConsultaGeo): Promise<{ resultados: ResultadoGeo[]; consultados: Fonte[] }> {
  const logradouro = limpar(c.logradouro);
  const numero = limpar(c.numero);
  const bairro = limpar(c.bairro);
  const cidade = limpar(c.cidade) || "Baturité";
  const uf = limpar(c.uf) || "CE";
  const cep = soDig(c.cep);
  const q = limpar(c.q);
  const estado = /^ce$/i.test(uf) ? "Ceará" : uf;
  const textoBase = q || [logradouro && numero ? `${logradouro}, ${numero}` : logradouro, bairro].filter(Boolean).join(", ");
  const textoCompleto = /batur/i.test(textoBase) ? textoBase : [textoBase, cidade, uf].filter(Boolean).join(", ");

  const chave = JSON.stringify([textoCompleto.toLowerCase(), cep]);
  const emCache = CACHE.get(chave);
  if (emCache && Date.now() - emCache.em < CACHE_MS) return { resultados: emCache.dados, consultados: [] };

  const todos: ResultadoGeo[] = [];
  const consultados: Fonte[] = [];
  const temExato = () => todos.some((r) => r.precisao === "endereco");
  // em Baturité, descarta resultados longe (homônimos em outras cidades)
  const regional = /batur/i.test(cidade);
  const somar = (lista: ResultadoGeo[]) => todos.push(...lista.filter((r) => !regional || naRegiao(r)));

  // a) Nominatim estruturado (ou livre quando só há texto)
  consultados.push("Nominatim (OSM)");
  if (logradouro) {
    const street = numero ? `${numero} ${logradouro}` : logradouro;
    somar(await nominatim({ street, city: cidade, state: estado, country: "Brasil", ...(cep.length === 8 ? { postalcode: cep } : {}) }, regional));
    if (!todos.length) somar(await nominatim({ street, city: cidade, state: estado, country: "Brasil" }, regional));
  }
  if (!temExato() && textoBase) somar(await nominatim({ q: textoCompleto }, regional));

  // b) Photon
  if (!temExato() && textoBase) {
    consultados.push("Photon (OSM)");
    somar(await photon(textoCompleto));
  }

  // c) Esri (sugestão)
  if (!temExato() && textoBase) {
    consultados.push("Esri");
    somar(await esri(textoCompleto));
  }

  // d) CEP
  if (!temExato() && cep.length === 8) {
    consultados.push("CEP (BrasilAPI)");
    somar(await porCep(cep));
  }

  // e) bairro e cidade
  if (!todos.some((r) => ORDEM[r.precisao] <= ORDEM.bairro) && bairro) {
    somar((await nominatim({ q: `${bairro}, ${cidade}, ${estado}` }, regional)).map((r) => ({ ...r, precisao: r.precisao === "cidade" ? "bairro" : r.precisao })));
  }
  if (!todos.length && !regional && cidade) {
    const r = await nominatim({ city: cidade, state: estado, country: "Brasil" }, false);
    todos.push(...r.slice(0, 1).map((x) => ({ ...x, precisao: "cidade" as Precisao })));
  }
  if (!todos.length && regional) {
    todos.push({ ...CENTRO_BATURITE, nome: "Centro de Baturité – CE", fonte: "Centro da cidade", precisao: "cidade" });
  }

  const resultados = dedup(todos).sort((a, b) => ORDEM[a.precisao] - ORDEM[b.precisao]).slice(0, 8);
  CACHE.set(chave, { em: Date.now(), dados: resultados });
  if (CACHE.size > 500) CACHE.delete(CACHE.keys().next().value as string);
  return { resultados, consultados };
}

// ---------- CNPJ (BrasilAPI, com reserva na publica.cnpj.ws) ----------

export interface DadosCnpjNormalizados {
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  data_inicio_atividade: string;
  fonte: "BrasilAPI" | "CNPJ.ws";
}

export async function consultarCnpj(cnpj: string): Promise<DadosCnpjNormalizados | "nao_encontrado" | null> {
  const d = soDig(cnpj);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`, { headers: { "User-Agent": UA }, signal: ctrl.signal, cache: "no-store" });
    if (r.ok) {
      const b = await r.json();
      const tipoLog = b.descricao_tipo_de_logradouro ? `${b.descricao_tipo_de_logradouro} ` : "";
      const log = String(b.logradouro ?? "");
      return {
        razao_social: b.razao_social ?? "", nome_fantasia: b.nome_fantasia ?? "",
        logradouro: tipoLog && !log.toUpperCase().startsWith(tipoLog.trim().toUpperCase()) ? `${tipoLog}${log}` : log,
        numero: b.numero ?? "", complemento: b.complemento ?? "", bairro: b.bairro ?? "", municipio: b.municipio ?? "", uf: b.uf ?? "",
        cep: soDig(b.cep), telefone: b.ddd_telefone_1 ?? "", email: b.email ?? "", data_inicio_atividade: b.data_inicio_atividade ?? "",
        fonte: "BrasilAPI",
      };
    }
    if (r.status === 404) {
      // confirma na reserva antes de dizer que não existe
      const reserva = await cnpjWs(d);
      return reserva ?? "nao_encontrado";
    }
  } catch {
    /* cai na reserva */
  } finally {
    clearTimeout(t);
  }
  return cnpjWs(d);
}

async function cnpjWs(d: string): Promise<DadosCnpjNormalizados | null> {
  const b = await obterJson<{
    razao_social?: string;
    estabelecimento?: {
      nome_fantasia?: string; tipo_logradouro?: string; logradouro?: string; numero?: string; complemento?: string; bairro?: string; cep?: string;
      ddd1?: string; telefone1?: string; email?: string; data_inicio_atividade?: string; cidade?: { nome?: string }; estado?: { sigla?: string };
    };
  }>(`https://publica.cnpj.ws/cnpj/${d}`, {}, 9000);
  if (!b?.estabelecimento) return null;
  const e = b.estabelecimento;
  return {
    razao_social: b.razao_social ?? "", nome_fantasia: e.nome_fantasia ?? "",
    logradouro: [e.tipo_logradouro, e.logradouro].filter(Boolean).join(" "), numero: e.numero ?? "", complemento: e.complemento ?? "",
    bairro: e.bairro ?? "", municipio: e.cidade?.nome ?? "", uf: e.estado?.sigla ?? "", cep: soDig(e.cep),
    telefone: e.ddd1 && e.telefone1 ? `${e.ddd1}${e.telefone1}` : "", email: e.email ?? "", data_inicio_atividade: e.data_inicio_atividade ?? "",
    fonte: "CNPJ.ws",
  };
}
