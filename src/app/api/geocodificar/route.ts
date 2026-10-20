/**
 * API — Geocodificação gratuita (GET /api/geocodificar)
 * ------------------------------------------------------------
 * Parâmetros: q (texto livre) e/ou logradouro, numero, bairro, cidade,
 * uf, cep. Responde { resultados: [{ lat, lng, nome, fonte, precisao }] }
 * ordenados do mais preciso para o menos preciso.
 * Roda no servidor para evitar CORS e identificar a aplicação no
 * Nominatim (User-Agent). Cache em memória e limite de 20 req/min por IP.
 * Usado pelo painel (Apoiadores, Logística Reversa e Visão do Mapa).
 */

import { NextResponse } from "next/server";
import { excedeuLimite, geocodificar, ROTULO_PRECISAO } from "@/lib/geocodificacao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  if (excedeuLimite(ip)) {
    return NextResponse.json({ erro: "Muitas buscas seguidas. Aguarde um minuto e tente de novo." }, { status: 429 });
  }
  const u = new URL(req.url);
  const p = (k: string) => (u.searchParams.get(k) ?? "").slice(0, 200);
  const consulta = { q: p("q"), logradouro: p("logradouro"), numero: p("numero"), bairro: p("bairro"), cidade: p("cidade"), uf: p("uf"), cep: p("cep") };
  if ((consulta.q + consulta.logradouro + consulta.bairro + consulta.cep).trim().length < 3) {
    return NextResponse.json({ erro: "Informe um endereço, bairro ou CEP." }, { status: 400 });
  }
  try {
    const { resultados, consultados } = await geocodificar(consulta);
    return NextResponse.json(
      { resultados: resultados.map((r) => ({ ...r, rotulo_precisao: ROTULO_PRECISAO[r.precisao] })), consultados },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ erro: "Serviços de mapa indisponíveis agora." }, { status: 502 });
  }
}
