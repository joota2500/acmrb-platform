/**
 * API — Administradores (somente o deus)
 * ------------------------------------------------------------
 * POST   → cria o administrador normal (usuário no Auth + linha em admins)
 * PATCH  → ações sobre o admin normal: { id, acao: "desativar" | "ativar"
 *          | "senha" (novaSenha) | "email" (novoEmail) }
 * DELETE → exclui o administrador normal (?id=)
 *
 * Todas validam o token e o papel deus (autorizar) e gravam auditoria.
 * O banco ainda reforça: no máximo 1 deus + 1 admin (índice + gatilho).
 */

import { NextResponse } from "next/server";
import {
  auditar, autorizar, emailEmUso, emailValido, erro, idAuth, senhaForte, trocarEmail,
} from "@/lib/supabaseServidor";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const r = await autorizar(req, true);
  if (r.resposta) return r.resposta;
  const { admin, ator } = r;

  const corpo = await req.json().catch(() => ({}));
  const nome = String(corpo.nome ?? "").trim();
  const email = String(corpo.email ?? "").trim().toLowerCase();
  const senha = String(corpo.senha ?? "");

  if (nome.length < 3) return erro("Informe o nome completo.", 400);
  if (!emailValido(email)) return erro("E-mail inválido.", 400);
  if (!senhaForte(senha))
    return erro("A senha temporária precisa ter 8+ caracteres, com maiúscula, minúscula e número.", 400);

  const { count } = await admin.from("admins").select("id", { count: "exact", head: true }).eq("role", "admin");
  if ((count ?? 0) >= 1)
    return erro("Limite atingido: já existe um administrador normal. Exclua o atual para cadastrar outro.", 409);

  if (await emailEmUso(admin, email))
    return erro("Este e-mail já está em uso (por um administrador ou outra conta). Use outro.", 409);

  const { data: criado, error: erroAuth } = await admin.auth.admin.createUser({
    email, password: senha, email_confirm: true, user_metadata: { nome },
  });
  if (erroAuth || !criado.user) return erro("Não foi possível criar o usuário de acesso.", 500);

  const { error: erroLinha } = await admin.from("admins").insert({
    nome, email, role: "admin", ativo: true, auth_user_id: criado.user.id,
  });
  if (erroLinha) {
    await admin.auth.admin.deleteUser(criado.user.id);
    const limite = /Limite|duplicate|um_por_papel/i.test(erroLinha.message);
    return erro(limite ? "Limite atingido: já existe um administrador normal." : "Não foi possível salvar o administrador.", limite ? 409 : 500);
  }

  await auditar(admin, ator.email, "criar_admin", email, { nome });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const r = await autorizar(req, true);
  if (r.resposta) return r.resposta;
  const { admin, ator } = r;

  const corpo = await req.json().catch(() => ({}));
  const { data: alvo } = await admin
    .from("admins").select("id, email, role, ativo, auth_user_id").eq("id", String(corpo.id ?? "")).maybeSingle();
  if (!alvo) return erro("Administrador não encontrado.", 404);
  if (alvo.role === "deus") return erro("Use “Minha conta” para alterar a sua própria conta.", 403);

  const authId = await idAuth(admin, alvo);

  switch (corpo.acao) {
    case "desativar":
    case "ativar": {
      const ativo = corpo.acao === "ativar";
      const { error } = await admin.from("admins").update({ ativo }).eq("id", alvo.id);
      if (error) return erro("Não foi possível alterar a situação.", 500);
      // Bloqueia o login no Auth também (derruba as sessões ao expirar o token)
      if (authId) await admin.auth.admin.updateUserById(authId, { ban_duration: ativo ? "none" : "876000h" });
      await auditar(admin, ator.email, ativo ? "reativar_admin" : "desativar_admin", alvo.email);
      return NextResponse.json({ ok: true });
    }
    case "senha": {
      const nova = String(corpo.novaSenha ?? "");
      if (!senhaForte(nova)) return erro("A nova senha precisa ter 8+ caracteres, com maiúscula, minúscula e número.", 400);
      if (!authId) return erro("Usuário de acesso não encontrado.", 404);
      const { error } = await admin.auth.admin.updateUserById(authId, { password: nova });
      if (error) return erro("Não foi possível redefinir a senha.", 500);
      await auditar(admin, ator.email, "redefinir_senha", alvo.email);
      return NextResponse.json({ ok: true });
    }
    case "email": {
      const novo = String(corpo.novoEmail ?? "").trim().toLowerCase();
      if (!emailValido(novo)) return erro("E-mail inválido.", 400);
      if (novo === alvo.email.toLowerCase()) return erro("O novo e-mail é igual ao atual.", 400);
      if (await emailEmUso(admin, novo, authId)) return erro("Este e-mail já está em uso.", 409);
      const falha = await trocarEmail(admin, alvo, novo);
      if (falha) return erro(falha, 500);
      await auditar(admin, ator.email, "trocar_email", novo, { anterior: alvo.email });
      return NextResponse.json({ ok: true });
    }
    default:
      return erro("Ação inválida.", 400);
  }
}

export async function DELETE(req: Request) {
  const r = await autorizar(req, true);
  if (r.resposta) return r.resposta;
  const { admin, ator } = r;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return erro("Administrador não informado.", 400);

  const { data: alvo } = await admin.from("admins").select("id, role, email, auth_user_id").eq("id", id).maybeSingle();
  if (!alvo) return erro("Administrador não encontrado.", 404);
  if (alvo.role === "deus") return erro("O administrador deus não pode ser excluído.", 403);

  const authId = await idAuth(admin, alvo);
  const { error } = await admin.from("admins").delete().eq("id", id);
  if (error) return erro("Não foi possível excluir o administrador.", 500);
  if (authId) await admin.auth.admin.deleteUser(authId);

  await auditar(admin, ator.email, "excluir_admin", alvo.email);
  return NextResponse.json({ ok: true });
}
