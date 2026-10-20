/**
 * Supabase no SERVIDOR (service role) + utilitários das rotas /api/admin
 * ------------------------------------------------------------
 * NUNCA importe este arquivo em componentes "use client": a chave
 * SUPABASE_SERVICE_ROLE_KEY ignora todas as regras de segurança (RLS).
 * Ela não tem o prefixo NEXT_PUBLIC_, então o Next não a envia ao
 * navegador.
 */

import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const MSG_SEM_CHAVE =
  "A chave SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor. " +
  "Pegue em Supabase → Project Settings → API → service_role, adicione " +
  "SUPABASE_SERVICE_ROLE_KEY=... no arquivo .env.local e reinicie o npm run dev.";

const semSessao = { auth: { persistSession: false, autoRefreshToken: false } };

/** Retorna o cliente admin ou null se a chave não estiver configurada */
export function clienteServidor(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) return null;
  return createClient(url, chave, semSessao);
}

export const erro = (mensagem: string, status: number) =>
  NextResponse.json({ erro: mensagem }, { status });

export interface AdminLogado {
  id: string;
  email: string;
  role: "deus" | "admin";
  auth_user_id: string | null;
  authId: string;
}

/**
 * Valida o token (Authorization: Bearer ...) e confere na tabela admins
 * que o usuário é um administrador ativo. Com somenteDeus, exige o deus.
 */
/** Resultado de autorizar: ou a resposta de erro, ou o cliente + quem chamou */
type Autorizacao =
  | { resposta: NextResponse; admin?: undefined; ator?: undefined }
  | { resposta?: undefined; admin: SupabaseClient; ator: AdminLogado };

export async function autorizar(req: Request, somenteDeus = false): Promise<Autorizacao> {
  const admin = clienteServidor();
  if (!admin) return { resposta: erro(MSG_SEM_CHAVE, 500) };

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { resposta: erro("Sessão ausente. Entre novamente.", 401) };

  const { data, error } = await admin.auth.getUser(token);
  const email = data.user?.email;
  if (error || !email || !data.user) return { resposta: erro("Sessão inválida ou expirada. Entre novamente.", 401) };

  const { data: linha } = await admin
    .from("admins")
    .select("id, email, role, auth_user_id")
    .ilike("email", email)
    .eq("ativo", true)
    .maybeSingle();

  if (!linha) return { resposta: erro("Acesso permitido apenas para administradores ativos.", 403) };
  if (somenteDeus && linha.role !== "deus")
    return { resposta: erro("Somente o administrador deus pode fazer isso.", 403) };

  return { admin, ator: { ...linha, authId: data.user.id } as AdminLogado };
}

/** Grava na auditoria; falha aqui não derruba a ação principal */
export async function auditar(
  admin: SupabaseClient,
  ator: string,
  acao: string,
  alvo: string | null,
  detalhes: Record<string, unknown> = {},
) {
  const { error } = await admin.from("admin_auditoria").insert({ ator_email: ator, acao, alvo_email: alvo, detalhes });
  if (error) console.warn("[auditoria] não gravou:", error.message);
}

/** Confere a senha atual sem criar sessão no servidor */
export async function senhaConfere(email: string, senha: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const c = createClient(url, anon, semSessao);
  const { data, error } = await c.auth.signInWithPassword({ email, password: senha });
  if (data.session) await c.auth.signOut({ scope: "local" }).catch(() => {});
  return !error;
}

/** Senha forte: 8+ caracteres com maiúscula, minúscula e número */
export const senhaForte = (s: string) =>
  s.length >= 8 && /[A-Z]/.test(s) && /[a-z]/.test(s) && /\d/.test(s);

export const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/** Acha o id do usuário no Auth (usa auth_user_id; se faltar, busca por e-mail) */
export async function idAuth(admin: SupabaseClient, linha: { auth_user_id?: string | null; email: string }) {
  if (linha.auth_user_id) return linha.auth_user_id;
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  return data?.users.find((u) => u.email?.toLowerCase() === linha.email.toLowerCase())?.id ?? null;
}

/** E-mail já usado por outro admin ou outra conta do Auth? */
export async function emailEmUso(admin: SupabaseClient, email: string, ignorarAuthId?: string | null) {
  const { data: a } = await admin.from("admins").select("id").ilike("email", email).maybeSingle();
  if (a) return true;
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  return !!data?.users.some((u) => u.email?.toLowerCase() === email && u.id !== ignorarAuthId);
}

/**
 * Troca o e-mail no Auth E na tabela admins juntos. Se a segunda parte
 * falhar, desfaz a primeira — assim o acesso ao painel nunca se perde.
 * O e-mail é trocado direto (email_confirm), sem link de confirmação,
 * porque com confirmação o Auth só mudaria depois do clique e a tabela
 * admins ficaria fora de sincronia. A senha atual já foi exigida antes.
 */
export async function trocarEmail(
  admin: SupabaseClient,
  linha: { id: string; email: string; auth_user_id: string | null },
  novo: string,
) {
  const authId = await idAuth(admin, linha);
  if (!authId) return "Usuário de acesso não encontrado.";

  const r1 = await admin.auth.admin.updateUserById(authId, { email: novo, email_confirm: true });
  if (r1.error) return "Não foi possível trocar o e-mail de acesso.";

  const r2 = await admin.from("admins").update({ email: novo, auth_user_id: authId }).eq("id", linha.id);
  if (r2.error) {
    await admin.auth.admin.updateUserById(authId, { email: linha.email, email_confirm: true });
    return "Não foi possível atualizar o cadastro; nada foi alterado.";
  }
  return null;
}
