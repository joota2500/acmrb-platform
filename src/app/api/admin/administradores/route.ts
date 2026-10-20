/**
 * API — Administradores (somente o "deus")
 * ------------------------------------------------------------
 * POST   → cria o administrador normal (usuário no Auth + linha em admins)
 * DELETE → exclui o administrador normal (?id=<id da tabela admins>)
 *
 * Segurança:
 *  1. O navegador envia o token da sessão (Authorization: Bearer ...).
 *  2. Validamos o token no Supabase e conferimos na tabela admins que
 *     quem chama é o deus ativo.
 *  3. Só então usamos a service role (que fica apenas no servidor).
 * O banco ainda reforça: no máximo 1 deus + 1 admin (índice + gatilho).
 */

import { NextResponse } from "next/server";
import { clienteServidor, MSG_SEM_CHAVE } from "@/lib/supabaseServidor";

export const runtime = "nodejs";

const erro = (mensagem: string, status: number) =>
  NextResponse.json({ erro: mensagem }, { status });

/** Confere o token e se o usuário é o deus. Retorna o cliente admin. */
async function autorizarDeus(req: Request) {
  const admin = clienteServidor();
  if (!admin) return { resposta: erro(MSG_SEM_CHAVE, 500) };

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { resposta: erro("Sessão ausente. Entre novamente.", 401) };

  const { data, error } = await admin.auth.getUser(token);
  const email = data.user?.email;
  if (error || !email) return { resposta: erro("Sessão inválida ou expirada. Entre novamente.", 401) };

  const { data: linha } = await admin
    .from("admins")
    .select("id")
    .eq("email", email)
    .eq("ativo", true)
    .eq("role", "deus")
    .maybeSingle();

  if (!linha) return { resposta: erro("Somente o administrador deus pode gerenciar administradores.", 403) };
  return { admin };
}

/** Senha forte: 8+ caracteres com maiúscula, minúscula e número */
function senhaForte(s: string) {
  return s.length >= 8 && /[A-Z]/.test(s) && /[a-z]/.test(s) && /\d/.test(s);
}

export async function POST(req: Request) {
  const { admin, resposta } = await autorizarDeus(req);
  if (!admin) return resposta;

  let corpo: { nome?: string; email?: string; senha?: string };
  try {
    corpo = await req.json();
  } catch {
    return erro("Dados inválidos.", 400);
  }

  const nome = (corpo.nome ?? "").trim();
  const email = (corpo.email ?? "").trim().toLowerCase();
  const senha = corpo.senha ?? "";

  if (nome.length < 3) return erro("Informe o nome completo.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return erro("E-mail inválido.", 400);
  if (!senhaForte(senha))
    return erro("A senha temporária precisa ter 8+ caracteres, com maiúscula, minúscula e número.", 400);

  // Limite: só um admin normal
  const { count } = await admin.from("admins").select("id", { count: "exact", head: true }).eq("role", "admin");
  if ((count ?? 0) >= 1)
    return erro("Limite atingido: já existe um administrador normal. Exclua o atual para cadastrar outro.", 409);

  const { data: existente } = await admin.from("admins").select("id").ilike("email", email).maybeSingle();
  if (existente) return erro("Este e-mail já é usado por um administrador.", 409);

  // 1) Usuário no Auth (já confirmado, entra com a senha temporária)
  const { data: criado, error: erroAuth } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });

  if (erroAuth || !criado.user) {
    const jaExiste = /already|registered|exists/i.test(erroAuth?.message ?? "");
    return erro(
      jaExiste
        ? "Este e-mail já tem uma conta no sistema (por exemplo, como visitante). Use outro e-mail."
        : "Não foi possível criar o usuário de acesso.",
      jaExiste ? 409 : 500,
    );
  }

  // 2) Linha em admins; se falhar, desfaz o usuário do Auth
  const { error: erroLinha } = await admin.from("admins").insert({
    nome,
    email,
    role: "admin",
    ativo: true,
    auth_user_id: criado.user.id,
  });

  if (erroLinha) {
    await admin.auth.admin.deleteUser(criado.user.id);
    const limite = /Limite|duplicate|um_por_papel/i.test(erroLinha.message);
    return erro(
      limite ? "Limite atingido: já existe um administrador normal." : "Não foi possível salvar o administrador.",
      limite ? 409 : 500,
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { admin, resposta } = await autorizarDeus(req);
  if (!admin) return resposta;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return erro("Administrador não informado.", 400);

  const { data: alvo } = await admin
    .from("admins")
    .select("id, role, email, auth_user_id")
    .eq("id", id)
    .maybeSingle();

  if (!alvo) return erro("Administrador não encontrado.", 404);
  if (alvo.role === "deus") return erro("O administrador deus não pode ser excluído.", 403);

  const { error: erroLinha } = await admin.from("admins").delete().eq("id", id);
  if (erroLinha) return erro("Não foi possível excluir o administrador.", 500);

  // Remove também o acesso (usuário do Auth)
  let authId: string | null = alvo.auth_user_id ?? null;
  if (!authId) {
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    authId = data?.users.find((u) => u.email?.toLowerCase() === alvo.email.toLowerCase())?.id ?? null;
  }
  if (authId) await admin.auth.admin.deleteUser(authId);

  return NextResponse.json({ ok: true });
}
