/**
 * API — Visitantes (somente o deus)
 * ------------------------------------------------------------
 * PATCH  → edita dados ou situação: { id, nome?, telefone?, cidade?,
 *          data_nascimento?, ativo? }. Desativar também bloqueia o
 *          login no Auth (ban) e reativar desbloqueia.
 * DELETE → ?id= exclui o usuário do Auth (a linha em visitantes, as
 *          sessões e os eventos caem junto por ON DELETE CASCADE).
 *          Se o Auth falhar, desativa e apaga só o perfil.
 * autorizar(req, true) confere o token e o papel deus; tudo é auditado.
 */

import { NextResponse } from "next/server";
import { auditar, autorizar, erro } from "@/lib/supabaseServidor";

export const runtime = "nodejs";

const UUID = /^[0-9a-f-]{36}$/i;

export async function PATCH(req: Request) {
  const r = await autorizar(req, true);
  if (r.resposta) return r.resposta;
  const { admin, ator } = r;

  const c = await req.json().catch(() => ({}));
  const id = String(c.id ?? "");
  if (!UUID.test(id)) return erro("Visitante inválido.", 400);

  const { data: linha } = await admin.from("visitantes").select("id, email, auth_user_id, ativo").eq("id", id).maybeSingle();
  if (!linha) return erro("Visitante não encontrado.", 404);

  const dados: Record<string, unknown> = {};
  if (c.nome !== undefined) {
    const nome = String(c.nome).trim();
    if (nome.length < 3 || nome.length > 100) return erro("Nome inválido.", 400);
    dados.nome = nome;
  }
  if (c.telefone !== undefined) dados.telefone = String(c.telefone).trim().slice(0, 20) || null;
  if (c.cidade !== undefined) dados.cidade = String(c.cidade).trim().slice(0, 80) || null;
  if (c.data_nascimento !== undefined) {
    const d = String(c.data_nascimento ?? "");
    if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) return erro("Data de nascimento inválida.", 400);
    dados.data_nascimento = d || null;
  }
  if (typeof c.ativo === "boolean") dados.ativo = c.ativo;
  if (!Object.keys(dados).length) return erro("Nada para alterar.", 400);

  const { error } = await admin.from("visitantes").update(dados).eq("id", id);
  if (error) return erro("Não foi possível salvar as alterações.", 500);

  // Situação: bloqueia/desbloqueia o login no Auth também
  if (typeof c.ativo === "boolean" && c.ativo !== linha.ativo && linha.auth_user_id) {
    await admin.auth.admin
      .updateUserById(linha.auth_user_id, { ban_duration: c.ativo ? "none" : "876000h" })
      .catch(() => null);
  }

  await auditar(admin, ator.email, "visitante_editar", linha.email, dados);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const r = await autorizar(req, true);
  if (r.resposta) return r.resposta;
  const { admin, ator } = r;

  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!UUID.test(id)) return erro("Visitante inválido.", 400);

  const { data: linha } = await admin.from("visitantes").select("id, email, auth_user_id").eq("id", id).maybeSingle();
  if (!linha) return erro("Visitante não encontrado.", 404);

  // Segurança: nunca apaga a conta de um administrador por aqui
  const { data: ehAdmin } = await admin.from("admins").select("id").ilike("email", linha.email).maybeSingle();
  if (ehAdmin) return erro("Este e-mail pertence a um administrador; exclusão bloqueada.", 409);

  let modo = "completo";
  if (linha.auth_user_id) {
    const { error } = await admin.auth.admin.deleteUser(linha.auth_user_id);
    if (error) modo = "somente_perfil";
  } else modo = "somente_perfil";

  // Garante que o perfil some (no modo completo o CASCADE já removeu)
  await admin.from("visitantes").delete().eq("id", id);

  await auditar(admin, ator.email, "visitante_excluir", linha.email, { modo });
  return NextResponse.json({ ok: true, modo });
}
