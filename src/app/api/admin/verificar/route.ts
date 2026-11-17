/**
 * API — Confere, NO SERVIDOR, quem acabou de entrar no painel
 * ------------------------------------------------------------
 * POST { exigir: "admin" | "deus" }  (com o token da sessão)
 * Usa o mesmo autorizar() das demais rotas /api/admin: valida o token,
 * confere em admins se a conta está ativa e, com "deus", se role = deus.
 * Responde { ok: true, role } ou o erro (401/403/429). As telas de login
 * (/admin/login e o login do ADM DEUS) usam isto e, se falhar, fazem
 * signOut e mostram uma mensagem genérica.
 */

import { NextResponse } from "next/server";
import { autorizar } from "@/lib/supabaseServidor";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const corpo = await req.json().catch(() => ({}));
  const r = await autorizar(req, corpo?.exigir === "deus");
  if (r.resposta) return r.resposta;
  return NextResponse.json({ ok: true, role: r.ator.role }, { headers: { "Cache-Control": "no-store" } });
}
