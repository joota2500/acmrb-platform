/**
 * API — Ações de segurança do painel (somente o deus)
 * ------------------------------------------------------------
 * POST { acao: "limpar_agora" }          roda a limpeza dos anônimos (24 h)
 * POST { acao: "liberar_bloqueio", email | email_hash | ip_hash }  libera quem está bloqueado por
 *      senhas erradas (apaga as falhas recentes dele). Tudo é auditado.
 */

import { NextResponse } from "next/server";
import { auditar, autorizar, emailValido, erro } from "@/lib/supabaseServidor";
import { hashar } from "@/lib/segurancaServidor";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const r = await autorizar(req, true);
  if (r.resposta) return r.resposta;
  const { admin, ator } = r;
  const c = await req.json().catch(() => ({}));

  if (c.acao === "limpar_agora") {
    const a = await admin.rpc("acessos_limpar", { p_horas: 24 });
    const s = await admin.rpc("seguranca_limpar");
    if (a.error || s.error) return erro("A limpeza falhou. As migrations de acessos e segurança já foram rodadas?", 500);
    await auditar(admin, ator.email, "limpeza_manual", null, { resultado: a.data });
    return NextResponse.json({ ok: true, ...a.data });
  }

  if (c.acao === "liberar_bloqueio") {
    // Aceita o e-mail digitado ou o "hash" de uma linha do log (e-mail e/ou rede)
    const HASH = /^[0-9a-f]{40}$/;
    const email = String(c.email ?? "").trim().toLowerCase();
    const hashEmail = HASH.test(String(c.email_hash ?? "")) ? String(c.email_hash) : email && emailValido(email) ? hashar(`email:${email}`) : null;
    const hashIp = HASH.test(String(c.ip_hash ?? "")) ? String(c.ip_hash) : null;
    if (!hashEmail && !hashIp) return erro("Informe o e-mail ou escolha uma linha do log.", 400);

    const desde = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    let consulta = admin.from("login_tentativas").delete().eq("sucesso", false).gt("criado_em", desde);
    if (hashEmail) consulta = consulta.eq("email_hash", hashEmail);
    if (hashIp) consulta = consulta.eq("ip_hash", hashIp);
    const { error } = await consulta;
    if (error) return erro("Não foi possível liberar o bloqueio.", 500);
    await auditar(admin, ator.email, "liberar_bloqueio_login", null, { por: hashEmail ? "email" : "rede" });
    return NextResponse.json({ ok: true });
  }

  return erro("Ação desconhecida.", 400);
}
