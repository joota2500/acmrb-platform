/**
 * Apoiadores, mapa e logística reversa — tipos, constantes e leitura pública
 * ------------------------------------------------------------
 * Leitura pública SEMPRE pelas views (apoiadores_publicos,
 * empresas_logistica_publicas, repasses_logistica_publicos), que não
 * expõem CPF, observações internas nem coordenadas exatas de pessoas.
 * Migration: supabase/migrations/20261020240000_apoiadores_mapa.sql
 *
 * Se a migration ainda não foi rodada, as funções devolvem listas
 * vazias com "indisponivel = true" (a tela mostra um estado amigável).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ---------- Constantes ----------

/** Centro aproximado de Baturité – CE */
export const BATURITE_CENTRO: [number, number] = [-4.3286, -38.8848];
export const BATURITE_ZOOM = 14;

export const CATEGORIAS = [
  "Comércio",
  "Restaurante",
  "Pousada/Hotel",
  "Residência",
  "Empresa",
  "Indústria",
  "Órgão público",
  "ONG/Associação",
  "Outro",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const TIPOS_APOIO = [
  "Coleta/Ponto de entrega",
  "Doação em dinheiro",
  "Doação de materiais",
  "Voluntário",
  "Divulgação",
  "Logística reversa",
  "Outro",
] as const;
export type TipoApoio = (typeof TIPOS_APOIO)[number];

/** Cor de cada categoria (marcadores, chips e legenda) — tons da paleta */
export const COR_CATEGORIA: Record<string, string> = {
  "Comércio": "#059669",
  "Restaurante": "#d97706",
  "Pousada/Hotel": "#7c3aed",
  "Residência": "#0891b2",
  "Empresa": "#047857",
  "Indústria": "#475569",
  "Órgão público": "#1d4ed8",
  "ONG/Associação": "#db2777",
  "Outro": "#65a30d",
};
export const corCategoria = (c?: string | null) => COR_CATEGORIA[c ?? ""] ?? "#10b981";

export const STATUS_LOGISTICA: Record<string, string> = {
  ativa: "Parceria ativa",
  em_negociacao: "Em negociação",
  pausada: "Pausada",
  encerrada: "Encerrada",
};

// ---------- Tipos ----------

export interface ApoiadorPublico {
  id: string;
  tipo_pessoa: "juridica" | "fisica";
  nome_exibicao: string;
  nome: string | null;
  categoria: string;
  tipos_apoio: string[];
  descricao: string | null;
  logo_url: string | null;
  site: string | null;
  instagram: string | null;
  telefone_publico: string | null;
  email_publico: string | null;
  cnpj: string | null;
  endereco: string | null;
  bairro: string | null;
  latitude: number | null;
  longitude: number | null;
  no_mapa: boolean;
  localizacao_aproximada: boolean;
  anonimo: boolean;
  desde: string | null;
  ordem: number;
}

export interface EmpresaLogisticaPublica {
  id: string;
  nome: string;
  cnpj: string | null;
  logo_url: string | null;
  responsavel_nome: string | null;
  responsavel_cargo: string | null;
  telefone_publico: string | null;
  email_publico: string | null;
  site: string | null;
  descricao: string | null;
  materiais_aceitos: string[];
  parceria_desde: string | null;
  status: string;
  ordem: number;
  total_repassado_kg: number;
  total_repasses: number;
  ultimo_repasse: string | null;
}

export interface RepassePublico {
  id: string;
  empresa_id: string;
  data: string;
  material: string;
  peso_kg: number;
  valor: number | null;
  documento_url: string | null;
  observacao: string | null;
}

export interface Resultado<T> {
  dados: T[];
  /** true quando a tabela/view ainda não existe (migration não rodada) */
  indisponivel: boolean;
  erro: string | null;
}

/** Códigos do PostgREST/Postgres para "relação não existe" */
function tabelaAusente(err: { code?: string; message?: string } | null) {
  if (!err) return false;
  return err.code === "42P01" || err.code === "PGRST205" || /does not exist|schema cache/i.test(err.message ?? "");
}

async function ler<T>(cli: SupabaseClient | null, view: string, ordem: string): Promise<Resultado<T>> {
  if (!cli) return { dados: [], indisponivel: true, erro: null };
  try {
    const { data, error } = await cli.from(view).select("*").order(ordem, { ascending: true });
    if (error) {
      if (tabelaAusente(error)) return { dados: [], indisponivel: true, erro: null };
      return { dados: [], indisponivel: false, erro: error.message };
    }
    return { dados: (data ?? []) as T[], indisponivel: false, erro: null };
  } catch (e) {
    return { dados: [], indisponivel: false, erro: e instanceof Error ? e.message : "Falha de conexão" };
  }
}

export const listarApoiadoresPublicos = (cli: SupabaseClient | null) =>
  ler<ApoiadorPublico>(cli, "apoiadores_publicos", "ordem");

export const listarEmpresasLogisticaPublicas = (cli: SupabaseClient | null) =>
  ler<EmpresaLogisticaPublica>(cli, "empresas_logistica_publicas", "ordem");

export async function listarRepassesPublicos(cli: SupabaseClient | null): Promise<Resultado<RepassePublico>> {
  const r = await ler<RepassePublico>(cli, "repasses_logistica_publicos", "data");
  return { ...r, dados: [...r.dados].reverse() }; // mais recentes primeiro
}

// ---------- Documentos (CNPJ/CPF) ----------

export const soDigitos = (v: string) => (v ?? "").replace(/\D/g, "");

export function cnpjValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (base: string, pesos: number[]) => {
    const soma = pesos.reduce((s, p, i) => s + Number(base[i]) * p, 0);
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const dv1 = calc(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = calc(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv1 === Number(d[12]) && dv2 === Number(d[13]);
}

export function cpfValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export function mascaraCnpj(v: string) {
  return soDigitos(v)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function mascaraCpf(v: string) {
  return soDigitos(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// ---------- Formatação ----------

export const formatarKg = (kg: number) =>
  `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(Number(kg) || 0)} kg`;

export const formatarReais = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

export function formatarData(iso?: string | null, opcoes: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }) {
  if (!iso) return "";
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!a) return "";
  return new Date(a, (m || 1) - 1, d || 1).toLocaleDateString("pt-BR", opcoes);
}

/** Garante "https://" em links digitados sem protocolo */
export function linkExterno(url?: string | null) {
  if (!url) return null;
  const u = url.trim();
  if (!u) return null;
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export function linkInstagram(v?: string | null) {
  if (!v) return null;
  const u = v.trim();
  if (/^https?:\/\//i.test(u)) return u;
  return `https://instagram.com/${u.replace(/^@/, "")}`;
}

/** Escapa texto para HTML (popups do Leaflet) */
export function escaparHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
