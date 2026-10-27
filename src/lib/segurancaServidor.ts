/**
 * Utilitários de segurança do SERVIDOR (rotas /api)
 * ------------------------------------------------------------
 * - ipDaRequisicao / hashar: o IP NUNCA é gravado; só um "hash" HMAC
 *   (impressão digital que não volta ao IP), usado para limitar abusos.
 * - geoDaRequisicao: cidade/estado/país aproximados pelos cabeçalhos que
 *   a Vercel envia (x-vercel-ip-*). Em computador local ficam vazios.
 * - limitar / limitarRota: limite de uso por janela de tempo, contado no
 *   banco (rate_limit_hit), que funciona entre várias instâncias da Vercel.
 *   Se a chave do servidor ou a migration faltarem, NÃO bloqueia ninguém.
 * Nunca importe este arquivo em componentes "use client".
 */

import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clienteServidor } from "@/lib/supabaseServidor";

export function ipDaRequisicao(req: Request): string | null {
  const h = req.headers;
  const bruto = h.get("x-real-ip") ?? h.get("x-vercel-forwarded-for") ?? h.get("x-forwarded-for") ?? "";
  const ip = bruto.split(",")[0]?.trim();
  return ip ? ip.slice(0, 64) : null;
}

/** Hash com segredo do servidor (HASH_SECRET, ou a própria chave do servidor como reserva) */
export function hashar(valor: string): string {
  const segredo = process.env.HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "acmrb";
  return createHmac("sha256", segredo).update(valor.trim().toLowerCase()).digest("hex").slice(0, 40);
}

export const hashDoIp = (req: Request) => {
  const ip = ipDaRequisicao(req);
  return ip ? hashar(`ip:${ip}`) : null;
};

export interface Geo {
  cidade: string | null;
  regiao: string | null;
  pais: string | null;
}

const NOMES_PAIS = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["pt-BR"], { type: "region" }) : null;

export function geoDaRequisicao(req: Request): Geo {
  const lerCabecalho = (nome: string, max: number) => {
    const v = req.headers.get(nome);
    if (!v) return null;
    let t = v;
    try {
      t = decodeURIComponent(v);
    } catch {
      /* mantém o valor bruto */
    }
    t = t.trim().slice(0, max);
    return t || null;
  };
  const codigo = lerCabecalho("x-vercel-ip-country", 2);
  let pais: string | null = codigo;
  try {
    if (codigo && NOMES_PAIS) pais = NOMES_PAIS.of(codigo.toUpperCase()) ?? codigo;
  } catch {
    /* código inválido */
  }
  return {
    cidade: lerCabecalho("x-vercel-ip-city", 80),
    regiao: lerCabecalho("x-vercel-ip-country-region", 80),
    pais,
  };
}

/** j***@gmail.com — para o painel mostrar quem tentou sem expor o e-mail inteiro */
export function mascararEmail(email: string): string {
  const [u = "", d = ""] = email.trim().toLowerCase().split("@");
  return `${u.slice(0, 1)}***@${d}`.slice(0, 120);
}

export interface ResultadoLimite {
  permitido: boolean;
  restanteSeg: number;
}

/** Soma 1 ao contador da chave. Em qualquer falha técnica, libera (fail-open). */
export async function limitar(admin: SupabaseClient, chave: string, max: number, janelaSeg: number): Promise<ResultadoLimite> {
  try {
    const { data, error } = await admin.rpc("rate_limit_hit", { p_chave: chave, p_janela_seg: janelaSeg, p_max: max });
    if (error || !data) return { permitido: true, restanteSeg: 0 };
    return { permitido: data.permitido !== false, restanteSeg: Number(data.restante_seg ?? janelaSeg) };
  } catch {
    return { permitido: true, restanteSeg: 0 };
  }
}

export function respostaLimite(restanteSeg: number) {
  const r = NextResponse.json(
    { erro: `Muitas requisições. Tente novamente em ${Math.max(1, Math.ceil(restanteSeg / 60))} min.` },
    { status: 429 },
  );
  r.headers.set("Retry-After", String(Math.max(1, restanteSeg)));
  return r;
}

/** Uso nas rotas: `const bloqueio = await limitarRota(req, "cnpj", 30, 60); if (bloqueio) return bloqueio;` */
export async function limitarRota(req: Request, nome: string, max: number, janelaSeg: number): Promise<NextResponse | null> {
  const admin = clienteServidor();
  const ip = hashDoIp(req);
  if (!admin || !ip) return null;
  const r = await limitar(admin, `${nome}:${ip}`, max, janelaSeg);
  return r.permitido ? null : respostaLimite(r.restanteSeg);
}
