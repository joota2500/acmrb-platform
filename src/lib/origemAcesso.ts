/**
 * Descobre de onde o visitante veio (referrer + utm) e o resume em um
 * grupo simples. Só o endereço sem parâmetros é guardado (nada de
 * ?query), para não registrar termos de busca nem códigos pessoais.
 * Usado SOMENTE no servidor.
 */

export interface Origem {
  origem: string;
  referrer: string | null;
  referrer_host: string | null;
}

const BUSCA = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex|baidu|brave|startpage)\./i;
const REDES = /(^|\.)(facebook|fb|instagram|whatsapp|wa|twitter|x|t|telegram|linkedin|youtube|youtu|tiktok|pinterest|threads|reddit)\.(com|me|co|be)$/i;
const EMAIL = /(^|\.)(mail\.google|outlook|office|live|mail\.yahoo|proton)\./i;

const limpar = (v: unknown, max: number) => {
  const t = typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, "").trim() : "";
  return t ? t.slice(0, max) : null;
};

export function classificarOrigem(referrerBruto: unknown, siteHost: string | null, utm: { s?: unknown; m?: unknown; c?: unknown }) {
  const utm_source = limpar(utm.s, 80);
  const utm_medium = limpar(utm.m, 80);
  const utm_campaign = limpar(utm.c, 80);

  let referrer: string | null = null;
  let host: string | null = null;
  const r = limpar(referrerBruto, 500);
  if (r) {
    try {
      const u = new URL(r);
      if (u.protocol === "http:" || u.protocol === "https:") {
        host = u.hostname.replace(/^www\./, "").slice(0, 120);
        referrer = `${u.origin}${u.pathname}`.slice(0, 300);
      }
    } catch {
      /* referrer inválido: ignora */
    }
  }
  // Veio do próprio site (abriu em nova aba): conta como direto
  if (host && siteHost && host === siteHost.replace(/^www\./, "")) {
    host = null;
    referrer = null;
  }

  let origem = "direto";
  const medio = (utm_medium ?? "").toLowerCase();
  if (utm_source || utm_medium) {
    origem = /mail/.test(medio) ? "e-mail" : /social/.test(medio) ? "rede social" : /cpc|ppc|paid|ads/.test(medio) ? "anúncio" : "campanha";
  } else if (host) {
    origem = BUSCA.test(host) ? "busca" : REDES.test(host) ? "rede social" : EMAIL.test(host) ? "e-mail" : "outros sites";
  }
  return { origem, referrer, referrer_host: host, utm_source, utm_medium, utm_campaign };
}
