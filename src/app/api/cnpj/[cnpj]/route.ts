/**
 * API — Consulta pública de CNPJ (GET /api/cnpj/{cnpj})
 * ------------------------------------------------------------
 * BrasilAPI e, se falhar, publica.cnpj.ws (dados abertos da Receita).
 * Resposta normalizada (DadosCnpjNormalizados). Limite de 10 req/min por IP.
 */

import { NextResponse } from "next/server";
import { consultarCnpj, excedeuLimite } from "@/lib/geocodificacao";
import { cnpjValido } from "@/lib/apoiadores";
import { limitarRota } from "@/lib/segurancaServidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ cnpj: string }> }) {
  // Limite compartilhado entre todas as instâncias (banco); o de memória abaixo continua como segunda barreira
  const bloqueio = await limitarRota(req, "cnpj", 20, 60);
  if (bloqueio) return bloqueio;
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  if (excedeuLimite(`cnpj:${ip}`, 10)) {
    return NextResponse.json({ erro: "Muitas consultas seguidas. Aguarde um minuto." }, { status: 429 });
  }
  const { cnpj } = await ctx.params;
  const d = (cnpj ?? "").replace(/\D/g, "");
  if (!cnpjValido(d)) return NextResponse.json({ erro: "CNPJ inválido." }, { status: 400 });
  const r = await consultarCnpj(d);
  if (r === "nao_encontrado") return NextResponse.json({ erro: "CNPJ não encontrado na Receita." }, { status: 404 });
  if (!r) return NextResponse.json({ erro: "Serviço de CNPJ indisponível agora. Tente mais tarde." }, { status: 502 });
  return NextResponse.json(r, { headers: { "Cache-Control": "no-store" } });
}
