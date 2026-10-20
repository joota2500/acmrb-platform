/**
 * API — Trocar o PRÓPRIO e-mail (deus ou admin normal)
 * ------------------------------------------------------------
 * POST { senhaAtual, novoEmail }
 * 1. Valida o token e que é admin ativo.
 * 2. Confere a senha atual.
 * 3. Confere se o e-mail novo não está em uso.
 * 4. Troca no Auth e em admins juntos (desfaz se falhar).
 * Depois o navegador renova a sessão para o token levar o e-mail novo.
 */

import { NextResponse } from "next/server";
import { auditar, autorizar, emailEmUso, emailValido, erro, senhaConfere, trocarEmail } from "@/lib/supabaseServidor";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const r = await autorizar(req);
  if (r.resposta) return r.resposta;
  const { admin, ator } = r;

  const corpo = await req.json().catch(() => ({}));
  const novo = String(corpo.novoEmail ?? "").trim().toLowerCase();
  const senha = String(corpo.senhaAtual ?? "");

  if (!emailValido(novo)) return erro("E-mail inválido.", 400);
  if (novo === ator.email.toLowerCase()) return erro("O novo e-mail é igual ao atual.", 400);
  if (!senha || !(await senhaConfere(ator.email, senha))) return erro("Senha atual incorreta.", 401);
  if (await emailEmUso(admin, novo, ator.authId)) return erro("Este e-mail já está em uso.", 409);

  const falha = await trocarEmail(admin, { ...ator, auth_user_id: ator.auth_user_id ?? ator.authId }, novo);
  if (falha) return erro(falha, 500);

  await auditar(admin, ator.email, "trocar_proprio_email", novo, { anterior: ator.email });
  return NextResponse.json({ ok: true });
}
