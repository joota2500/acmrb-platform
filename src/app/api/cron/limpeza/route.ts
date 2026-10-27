/**
 * API — Limpeza agendada (GET /api/cron/limpeza)
 * ------------------------------------------------------------
 * Alternativa ao pg_cron: o Vercel Cron (vercel.json) chama esta rota
 * uma vez por dia e ela executa:
 *   • acessos_limpar(24): apaga acessos de quem não fez login após 24 h
 *   • seguranca_limpar(): apaga contadores e logs antigos
 * Protegida por CRON_SECRET: a Vercel envia "Authorization: Bearer <valor>"
 * sozinha quando a variável existe. Sem o segredo configurado, a rota
 * fica desligada (503). Não imprime nenhum segredo.
 */

import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { clienteServidor, MSG_SEM_CHAVE } from "@/lib/supabaseServidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function igual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return NextResponse.json({ erro: "CRON_SECRET não configurado; rota desligada." }, { status: 503 });
  const enviado = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!igual(enviado, segredo)) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const admin = clienteServidor();
  if (!admin) return NextResponse.json({ erro: MSG_SEM_CHAVE }, { status: 500 });

  const a = await admin.rpc("acessos_limpar", { p_horas: 24 });
  const s = await admin.rpc("seguranca_limpar");
  if (a.error || s.error) {
    return NextResponse.json({ erro: "A limpeza falhou. As migrations de acessos e segurança já foram rodadas?" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, acessos: a.data, seguranca: s.data });
}
