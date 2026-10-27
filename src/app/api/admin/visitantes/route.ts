/**
 * API — Visitantes (somente o deus)
 * ------------------------------------------------------------
 * POST   → { acao: "criar", nome, email, senha, telefone?, cidade?,
 *            data_nascimento? }  cria conta + perfil já confirmados.
 *          { acao: "resetar_senha", id, modo: "email" | "link" }
 *            "email": o Supabase envia o e-mail de redefinição;
 *            "link": devolve o link para o deus copiar e enviar.
 * PATCH  → edita dados ou situação: { id, nome?, telefone?, cidade?,
 *          data_nascimento?, ativo? }. Desativar também bloqueia o
 *          login no Auth (ban) e reativar desbloqueia.
 * DELETE → ?id= exclui o usuário do Auth (a linha em visitantes, as
 *          sessões e os eventos caem junto por ON DELETE CASCADE).
 *          Se o Auth recusar, NADA é apagado: a conta é bloqueada e o
 *          motivo real volta para a tela (antes ficava escondido).
 * autorizar(req, true) confere o token e o papel deus; tudo é auditado.
 * A chave service_role só é lida no servidor (lib/supabaseServidor.ts).
 */

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { auditar, autorizar, emailEmUso, emailValido, erro, senhaForte } from "@/lib/supabaseServidor";
import { siteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

const UUID = /^[0-9a-f-]{36}$/i;
const BLOQUEIO = "876000h"; // ~100 anos

/** Escapa curingas do ilike (% e _) para comparar e-mail exato */
const exato = (e: string) => e.replace(/[\\%_]/g, (c) => `\\${c}`);

/** Endereço do site para o link de redefinição (usa a origem da própria chamada quando é do mesmo host) */
function origemDoSite(req: Request) {
  const origem = req.headers.get("origin");
  const host = req.headers.get("host");
  try {
    if (origem && host && new URL(origem).host === host) return origem;
  } catch {
    /* ignora */
  }
  return siteUrl();
}

/** Mensagem curta e segura vinda do Supabase (nunca contém chaves) */
const motivo = (e: { message?: string } | null | undefined) => (e?.message ?? "motivo desconhecido").slice(0, 160);

/** Apaga as fotos de coleta do visitante (pasta = id do usuário) para não travar a exclusão */
async function apagarFotos(admin: SupabaseClient, authId: string) {
  try {
    const { data } = await admin.storage.from("coletas").list(authId, { limit: 1000 });
    const arquivos = (data ?? []).map((f) => `${authId}/${f.name}`);
    if (arquivos.length) await admin.storage.from("coletas").remove(arquivos);
  } catch {
    /* sem fotos ou sem bucket: segue */
  }
}

export async function POST(req: Request) {
  const r = await autorizar(req, true);
  if (r.resposta) return r.resposta;
  const { admin, ator } = r;

  const c = await req.json().catch(() => ({}));

  // ---------- Criar visitante ----------
  if (c.acao === "criar") {
    const nome = String(c.nome ?? "").trim();
    const email = String(c.email ?? "").trim().toLowerCase();
    const senha = String(c.senha ?? "");
    if (nome.length < 3 || nome.length > 100) return erro("Informe o nome completo (3 a 100 letras).", 400);
    if (!emailValido(email)) return erro("E-mail inválido.", 400);
    if (!senhaForte(senha)) return erro("A senha precisa de 8+ caracteres com maiúscula, minúscula e número.", 400);
    const nasc = String(c.data_nascimento ?? "");
    if (nasc && !/^\d{4}-\d{2}-\d{2}$/.test(nasc)) return erro("Data de nascimento inválida.", 400);
    if (await emailEmUso(admin, email)) return erro("Já existe uma conta com este e-mail.", 409);

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        nome_completo: nome,
        telefone: String(c.telefone ?? "").trim().slice(0, 20) || null,
        cidade: String(c.cidade ?? "").trim().slice(0, 80) || null,
        data_nascimento: nasc || null,
        tipo: "visitante",
      },
    });
    if (error || !data.user) return erro(`Não foi possível criar a conta (${motivo(error)}).`, 500);

    // O gatilho do banco cria o perfil; se não criou, cria aqui
    const { data: perfil } = await admin.from("visitantes").select("id").eq("auth_user_id", data.user.id).maybeSingle();
    if (!perfil) {
      const { error: e2 } = await admin.from("visitantes").insert({
        auth_user_id: data.user.id,
        nome,
        email,
        telefone: String(c.telefone ?? "").trim().slice(0, 20) || null,
        cidade: String(c.cidade ?? "").trim().slice(0, 80) || null,
        data_nascimento: nasc || null,
        role: "visitante",
        ativo: true,
      });
      if (e2) {
        await admin.auth.admin.deleteUser(data.user.id).catch(() => null);
        return erro(`A conta não foi criada porque o perfil falhou (${motivo(e2)}).`, 500);
      }
    }
    await auditar(admin, ator.email, "visitante_criar", email, {});
    return NextResponse.json({ ok: true });
  }

  // ---------- Redefinir senha ----------
  if (c.acao === "resetar_senha") {
    const id = String(c.id ?? "");
    if (!UUID.test(id)) return erro("Visitante inválido.", 400);
    const { data: linha } = await admin.from("visitantes").select("email").eq("id", id).maybeSingle();
    if (!linha) return erro("Visitante não encontrado.", 404);

    const redirectTo = `${origemDoSite(req)}/redefinir-senha`;
    if (c.modo === "link") {
      const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email: linha.email, options: { redirectTo } });
      const link = data?.properties?.action_link;
      if (error || !link) return erro(`Não foi possível gerar o link (${motivo(error)}).`, 500);
      await auditar(admin, ator.email, "visitante_resetar_senha", linha.email, { modo: "link" });
      return NextResponse.json({ ok: true, link });
    }
    const { error } = await admin.auth.resetPasswordForEmail(linha.email, { redirectTo });
    if (error) {
      const limite = /rate|limit/i.test(error.message);
      return erro(limite ? "Muitos e-mails em pouco tempo. Aguarde alguns minutos ou gere o link." : `Não foi possível enviar o e-mail (${motivo(error)}).`, limite ? 429 : 500);
    }
    await auditar(admin, ator.email, "visitante_resetar_senha", linha.email, { modo: "email" });
    return NextResponse.json({ ok: true });
  }

  return erro("Ação desconhecida.", 400);
}

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

  // Situação: primeiro bloqueia/desbloqueia o login no Auth (se falhar, nada muda)
  if (typeof c.ativo === "boolean" && c.ativo !== linha.ativo && linha.auth_user_id) {
    const { error: eBan } = await admin.auth.admin.updateUserById(linha.auth_user_id, { ban_duration: c.ativo ? "none" : BLOQUEIO });
    if (eBan) return erro(`Não foi possível ${c.ativo ? "liberar" : "bloquear"} o login (${motivo(eBan)}).`, 500);
  }

  const { error } = await admin.from("visitantes").update(dados).eq("id", id);
  if (error) {
    // Desfaz o bloqueio do Auth para não ficar fora de sincronia
    if (typeof c.ativo === "boolean" && c.ativo !== linha.ativo && linha.auth_user_id) {
      await admin.auth.admin.updateUserById(linha.auth_user_id, { ban_duration: linha.ativo ? "none" : BLOQUEIO }).catch(() => null);
    }
    return erro(`Não foi possível salvar as alterações (${motivo(error)}).`, 500);
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
  const { data: ehAdmin } = await admin.from("admins").select("id").ilike("email", exato(linha.email)).maybeSingle();
  if (ehAdmin) return erro("Este e-mail pertence a um administrador; exclusão bloqueada.", 409);

  if (linha.auth_user_id) {
    await apagarFotos(admin, linha.auth_user_id);
    const { error } = await admin.auth.admin.deleteUser(linha.auth_user_id);
    if (error) {
      // Não apaga o perfil (senão a conta voltaria sozinha no próximo login): bloqueia e avisa o motivo
      await admin.auth.admin.updateUserById(linha.auth_user_id, { ban_duration: BLOQUEIO }).catch(() => null);
      await admin.from("visitantes").update({ ativo: false }).eq("id", id);
      await auditar(admin, ator.email, "visitante_excluir_falhou", linha.email, { motivo: motivo(error) });
      return erro(`O Supabase recusou a exclusão da conta (${motivo(error)}). Ela foi apenas bloqueada.`, 500);
    }
  }

  // Garante que o perfil some (com conta, o CASCADE já removeu)
  await admin.from("visitantes").delete().eq("id", id);

  await auditar(admin, ator.email, "visitante_excluir", linha.email, {});
  return NextResponse.json({ ok: true, modo: "completo" });
}
