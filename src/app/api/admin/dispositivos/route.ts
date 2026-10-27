/**
 * API — Aparelhos: bloquear, suspender, expulsar e desbloquear (somente o deus)
 * ------------------------------------------------------------
 * POST { acao, ... }
 *  - "bloquear":   { anon_id, motivo, bloquear_rede? }       bloqueio sem prazo
 *  - "suspender":  { anon_id, motivo, horas (1–720), bloquear_rede? }  bloqueio com prazo
 *  - "desbloquear":{ anon_id, motivo? }                      libera o aparelho
 *  - "expulsar":   { anon_id?, usuario_id?, motivo }         derruba a sessão e o id.
 *        Com usuario_id (conta cadastrada) também encerra TODAS as sessões de
 *        login dessa conta (signOut global).
 * O bloqueio vale no middleware em até ~15 s (cache curto). Tudo é auditado
 * (quem fez, o quê, motivo). Nunca bloqueia: o próprio aparelho/rede do deus
 * que está agindo, aparelhos de administradores e contas de administradores.
 * Grava com a service role (as tabelas não aceitam escrita do navegador).
 */

import { NextResponse } from "next/server";
import { auditar, autorizar, erro } from "@/lib/supabaseServidor";
import { hashDoIp } from "@/lib/segurancaServidor";
import { dispositivoDoCookie, UUID_RE } from "@/lib/dispositivo";

export const runtime = "nodejs";

const MSG_MIGRATION = "As tabelas de bloqueio ainda não existem. Rode a migration 20261027130000_dispositivos_bloqueios.sql no Supabase (SQL Editor).";
const faltaEstrutura = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || e.code === "PGRST202" || e.code === "42883" || e.code === "42703" || /does not exist|Could not find/i.test(e.message ?? ""));

export async function POST(req: Request) {
  const r = await autorizar(req, true);
  if (r.resposta) return r.resposta;
  const { admin, ator } = r;

  const c = await req.json().catch(() => ({}));
  const acao = String(c.acao ?? "");
  const anon = String(c.anon_id ?? "").toLowerCase();
  const usuario = String(c.usuario_id ?? "").toLowerCase();
  const motivo = String(c.motivo ?? "").trim();
  const agora = new Date();

  // ---------- Desbloquear ----------
  if (acao === "desbloquear") {
    if (!UUID_RE.test(anon)) return erro("Aparelho inválido.", 400);
    if (motivo.length > 300) return erro("O motivo pode ter no máximo 300 letras.", 400);
    const { data, error } = await admin
      .from("dispositivos_bloqueios")
      .update({ ativo: false, desbloqueado_em: agora.toISOString(), desbloqueado_por: ator.email, desbloqueio_motivo: motivo || null })
      .eq("dispositivo_id", anon)
      .eq("ativo", true)
      .select("id");
    if (error) return erro(faltaEstrutura(error) ? MSG_MIGRATION : "Não foi possível desbloquear.", 500);
    if (!data?.length) return erro("Este aparelho não está bloqueado.", 404);
    await auditar(admin, ator.email, "aparelho_desbloquear", null, { aparelho: anon.slice(0, 8), motivo: motivo || null });
    return NextResponse.json({ ok: true });
  }

  // Todas as outras ações exigem um motivo para a auditoria
  if (motivo.length < 3 || motivo.length > 300) return erro("Informe o motivo (3 a 300 letras).", 400);

  // ---------- Bloquear / suspender ----------
  if (acao === "bloquear" || acao === "suspender") {
    if (!UUID_RE.test(anon)) return erro("Aparelho inválido.", 400);
    const horas = Math.floor(Number(c.horas));
    if (acao === "suspender" && !(horas >= 1 && horas <= 720)) return erro("Escolha uma duração de 1 hora a 30 dias.", 400);

    // Proteções: o deus nunca se bloqueia nem bloqueia aparelho de administrador
    if (dispositivoDoCookie(req.headers.get("cookie")) === anon) return erro("Este é o aparelho que você está usando agora. Para evitar que você se tranque para fora, ele não pode ser bloqueado.", 409);
    const { data: protegido, error: eProt } = await admin.from("dispositivos_admin").select("dispositivo_id").eq("dispositivo_id", anon).maybeSingle();
    if (eProt && faltaEstrutura(eProt)) return erro(MSG_MIGRATION, 500);
    if (protegido) return erro("Este aparelho já foi usado por um administrador e não pode ser bloqueado.", 409);

    // Última visita do aparelho: de onde vem a conta (se houver) e a rede
    const { data: ultima } = await admin
      .from("acessos_sessoes")
      .select("auth_user_id, ip_hash")
      .eq("anon_id", anon)
      .order("ultima_atividade", { ascending: false })
      .limit(1)
      .maybeSingle();

    let ipHash: string | null = null;
    if (c.bloquear_rede === true) {
      ipHash = (ultima?.ip_hash as string | null) ?? null;
      if (!ipHash) return erro("Não há registro da rede deste aparelho (visita antiga ou já apagada). Bloqueie só o aparelho.", 400);
      if (ipHash === hashDoIp(req)) return erro("Esta rede é a mesma que você está usando agora; bloqueá-la trancaria você para fora.", 409);
    }

    // Um bloqueio ativo por aparelho: o anterior vira histórico
    const { error: eAnt } = await admin
      .from("dispositivos_bloqueios")
      .update({ ativo: false, desbloqueado_em: agora.toISOString(), desbloqueado_por: ator.email, desbloqueio_motivo: "Substituído por um novo bloqueio" })
      .eq("dispositivo_id", anon)
      .eq("ativo", true);
    if (eAnt) return erro(faltaEstrutura(eAnt) ? MSG_MIGRATION : "Não foi possível registrar o bloqueio.", 500);

    const { error } = await admin.from("dispositivos_bloqueios").insert({
      tipo: acao === "bloquear" ? "bloqueio" : "suspensao",
      dispositivo_id: anon,
      ip_hash: ipHash,
      usuario_id: (ultima?.auth_user_id as string | null) ?? null,
      motivo,
      ate: acao === "suspender" ? new Date(agora.getTime() + horas * 3_600_000).toISOString() : null,
      criado_por: ator.email,
    });
    if (error) return erro("Não foi possível registrar o bloqueio.", 500);

    // Encerra as visitas abertas deste aparelho (somem do "tempo real")
    await admin.from("acessos_sessoes").update({ encerrada_em: agora.toISOString() }).eq("anon_id", anon).is("encerrada_em", null);
    await auditar(admin, ator.email, acao === "bloquear" ? "aparelho_bloquear" : "aparelho_suspender", null, {
      aparelho: anon.slice(0, 8),
      motivo,
      horas: acao === "suspender" ? horas : null,
      rede: !!ipHash,
      conta: ultima?.auth_user_id ?? null,
    });
    return NextResponse.json({ ok: true });
  }

  // ---------- Expulsar ----------
  if (acao === "expulsar") {
    const temAnon = UUID_RE.test(anon);
    const temUsuario = UUID_RE.test(usuario);
    if (!temAnon && !temUsuario) return erro("Informe o aparelho ou a conta.", 400);
    if (temAnon && dispositivoDoCookie(req.headers.get("cookie")) === anon) return erro("Este é o aparelho que você está usando agora; não dá para expulsá-lo.", 409);

    if (temUsuario) {
      // Administradores não são expulsos por aqui
      const { data: u } = await admin.auth.admin.getUserById(usuario);
      const email = u?.user?.email;
      if (!email) return erro("Conta não encontrada.", 404);
      const { data: ehAdmin } = await admin.from("admins").select("id").ilike("email", email.replace(/[\\%_]/g, (ch) => `\\${ch}`)).maybeSingle();
      if (ehAdmin) return erro("Esta conta é de um administrador e não pode ser expulsa por aqui.", 409);

      // Derruba todas as sessões de login da conta (o acesso atual expira em até 1 h; o aviso abaixo tira a pessoa do site em até 30 s)
      const { error: eAuth } = await admin.rpc("expulsar_usuario_auth", { p_usuario: usuario });
      if (eAuth) return erro(faltaEstrutura(eAuth) ? MSG_MIGRATION : "Não foi possível encerrar as sessões da conta.", 500);
    }

    const { error } = await admin.from("dispositivos_expulsoes").insert({
      dispositivo_id: temAnon ? anon : null,
      usuario_id: temUsuario ? usuario : null,
      motivo,
      criado_por: ator.email,
    });
    if (error) return erro(faltaEstrutura(error) ? MSG_MIGRATION : "Não foi possível registrar a expulsão.", 500);

    // Encerra as visitas abertas (do aparelho e/ou da conta)
    const fim = { encerrada_em: agora.toISOString() };
    if (temAnon) await admin.from("acessos_sessoes").update(fim).eq("anon_id", anon).is("encerrada_em", null);
    if (temUsuario) await admin.from("acessos_sessoes").update(fim).eq("auth_user_id", usuario).is("encerrada_em", null);

    await auditar(admin, ator.email, temUsuario ? "conta_expulsar" : "aparelho_expulsar", null, {
      aparelho: temAnon ? anon.slice(0, 8) : null,
      conta: temUsuario ? usuario : null,
      motivo,
    });
    return NextResponse.json({ ok: true });
  }

  return erro("Ação desconhecida.", 400);
}
