/**
 * API — Aparelhos: bloquear, suspender, editar, expulsar e desbloquear (somente o deus)
 * ------------------------------------------------------------
 * POST { acao, ... } — o prazo é sempre { modo, quantidade, unidade, ate }
 * (indeterminado | daqui a N minutos/horas/dias | data e hora exatas):
 *  - "bloquear":   { anon_id, motivo, prazo?, bloquear_rede? }   tela "Aparelho bloqueado"
 *  - "suspender":  { anon_id, motivo, prazo?, bloquear_rede? }   tela "Aparelho suspenso"
 *  - "editar":     { anon_id, motivo?, prazo? }                  muda motivo/prazo do bloqueio em vigor
 *  - "desbloquear":{ anon_id, motivo? }                          libera o aparelho
 *  - "expulsar":   { anon_id?, usuario_id?, motivo, impedir?, prazo? }  derruba a sessão.
 *        Com impedir, o aparelho (ou a conta) também fica sem entrar pelo prazo.
 *        Com usuario_id encerra TODAS as sessões de login dessa conta.
 * O MOTIVO aparece na tela da pessoa. O bloqueio vale na próxima navegação
 * (até ~5 s) e a página aberta é trocada em até ~10 s. Tudo é auditado.
 * Nunca bloqueia: o aparelho/rede do deus que age, aparelhos de
 * administradores e contas de administradores.
 */

import { NextResponse } from "next/server";
import { auditar, autorizar, erro } from "@/lib/supabaseServidor";
import { hashDoIp } from "@/lib/segurancaServidor";
import { dispositivoDoCookie, UUID_RE } from "@/lib/dispositivo";
import { calcularAte, type PrazoEntrada } from "@/lib/prazo";

export const runtime = "nodejs";

const MSG_MIGRATION = "O banco ainda não tem a estrutura de bloqueios. Rode, nesta ordem, as migrations 20261027130000_dispositivos_bloqueios.sql e 20261027140000_bloqueios_prazo_estado.sql no Supabase (SQL Editor).";
const faltaEstrutura = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || e.code === "PGRST202" || e.code === "42883" || e.code === "42703" || /does not exist|Could not find/i.test(e.message ?? ""));

const BAN_INDETERMINADO = "876000h"; // ~100 anos

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

  // ---------- Editar motivo e/ou prazo do bloqueio em vigor ----------
  if (acao === "editar") {
    if (!UUID_RE.test(anon)) return erro("Aparelho inválido.", 400);
    const dados: Record<string, unknown> = { editado_em: agora.toISOString(), editado_por: ator.email };
    if (c.motivo !== undefined) {
      if (motivo.length < 3 || motivo.length > 300) return erro("Informe o motivo (3 a 300 letras).", 400);
      dados.motivo = motivo;
    }
    if (c.prazo !== undefined) {
      const p = calcularAte(c.prazo as PrazoEntrada);
      if ("erro" in p) return erro(p.erro, 400);
      dados.ate = p.ate;
    }
    if (c.tipo === "bloqueio" || c.tipo === "suspensao") dados.tipo = c.tipo;
    if (Object.keys(dados).length <= 2) return erro("Nada para alterar.", 400);
    const { data, error } = await admin
      .from("dispositivos_bloqueios")
      .update(dados)
      .eq("dispositivo_id", anon)
      .eq("ativo", true)
      .select("id");
    if (error) return erro(faltaEstrutura(error) ? MSG_MIGRATION : "Não foi possível salvar a alteração.", 500);
    if (!data?.length) return erro("Este aparelho não está bloqueado.", 404);
    await auditar(admin, ator.email, "aparelho_editar_bloqueio", null, { aparelho: anon.slice(0, 8), motivo: dados.motivo ?? null, ate: "ate" in dados ? dados.ate : "inalterado" });
    return NextResponse.json({ ok: true });
  }

  // Todas as outras ações exigem um motivo (aparece para a pessoa e vai para a auditoria)
  if (motivo.length < 3 || motivo.length > 300) return erro("Informe o motivo (3 a 300 letras).", 400);

  /** Cria o bloqueio (o anterior do mesmo aparelho vira histórico). Devolve mensagem de erro ou null. */
  async function criarBloqueio(dispositivo: string, tipo: "bloqueio" | "suspensao", ate: string | null, ipHash: string | null, contaId: string | null) {
    const { error: eAnt } = await admin
      .from("dispositivos_bloqueios")
      .update({ ativo: false, desbloqueado_em: agora.toISOString(), desbloqueado_por: ator.email, desbloqueio_motivo: "Substituído por um novo bloqueio" })
      .eq("dispositivo_id", dispositivo)
      .eq("ativo", true);
    if (eAnt) return faltaEstrutura(eAnt) ? MSG_MIGRATION : "Não foi possível registrar o bloqueio.";
    const { error } = await admin.from("dispositivos_bloqueios").insert({
      tipo,
      dispositivo_id: dispositivo,
      ip_hash: ipHash,
      usuario_id: contaId,
      motivo,
      ate,
      criado_por: ator.email,
    });
    return error ? "Não foi possível registrar o bloqueio." : null;
  }

  /** Proteções comuns: o deus nunca se tranca para fora nem bloqueia aparelho de administrador */
  async function protegido(dispositivo: string, verbo: string) {
    if (dispositivoDoCookie(req.headers.get("cookie")) === dispositivo)
      return `Este é o aparelho que você está usando agora. Para evitar que você se tranque para fora, ele não pode ser ${verbo}.`;
    const { data, error } = await admin.from("dispositivos_admin").select("dispositivo_id").eq("dispositivo_id", dispositivo).maybeSingle();
    if (error && faltaEstrutura(error)) return MSG_MIGRATION;
    if (data) return `Este aparelho já foi usado por um administrador e não pode ser ${verbo}.`;
    return null;
  }

  // ---------- Bloquear / suspender ----------
  if (acao === "bloquear" || acao === "suspender") {
    if (!UUID_RE.test(anon)) return erro("Aparelho inválido.", 400);
    const p = calcularAte((c.prazo as PrazoEntrada | undefined) ?? { modo: "indeterminado" });
    if ("erro" in p) return erro(p.erro, 400);

    const prot = await protegido(anon, acao === "bloquear" ? "bloqueado" : "suspenso");
    if (prot) return erro(prot, prot === MSG_MIGRATION ? 500 : 409);

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

    const falha = await criarBloqueio(anon, acao === "bloquear" ? "bloqueio" : "suspensao", p.ate, ipHash, (ultima?.auth_user_id as string | null) ?? null);
    if (falha) return erro(falha, falha === MSG_MIGRATION ? 500 : 500);

    await admin.from("acessos_sessoes").update({ encerrada_em: agora.toISOString() }).eq("anon_id", anon).is("encerrada_em", null);
    await auditar(admin, ator.email, acao === "bloquear" ? "aparelho_bloquear" : "aparelho_suspender", null, {
      aparelho: anon.slice(0, 8), motivo, ate: p.ate, rede: !!ipHash, conta: ultima?.auth_user_id ?? null,
    });
    return NextResponse.json({ ok: true });
  }

  // ---------- Expulsar ----------
  if (acao === "expulsar") {
    const temAnon = UUID_RE.test(anon);
    const temUsuario = UUID_RE.test(usuario);
    if (!temAnon && !temUsuario) return erro("Informe o aparelho ou a conta.", 400);
    if (temAnon && dispositivoDoCookie(req.headers.get("cookie")) === anon) return erro("Este é o aparelho que você está usando agora; não dá para expulsá-lo.", 409);

    const impedir = c.impedir === true;
    let ate: string | null = null;
    if (impedir) {
      const p = calcularAte((c.prazo as PrazoEntrada | undefined) ?? { modo: "indeterminado" });
      if ("erro" in p) return erro(p.erro, 400);
      ate = p.ate;
    }

    if (temAnon && impedir) {
      const prot = await protegido(anon, "impedido de voltar");
      if (prot) return erro(prot, prot === MSG_MIGRATION ? 500 : 409);
    }

    if (temUsuario) {
      const { data: u } = await admin.auth.admin.getUserById(usuario);
      const email = u?.user?.email;
      if (!email) return erro("Conta não encontrada.", 404);
      const { data: ehAdmin } = await admin.from("admins").select("id").ilike("email", email.replace(/[\\%_]/g, (ch) => `\\${ch}`)).maybeSingle();
      if (ehAdmin) return erro("Esta conta é de um administrador e não pode ser expulsa por aqui.", 409);

      // Derruba todas as sessões de login da conta
      const { error: eAuth } = await admin.rpc("expulsar_usuario_auth", { p_usuario: usuario });
      if (eAuth) return erro(faltaEstrutura(eAuth) ? MSG_MIGRATION : "Não foi possível encerrar as sessões da conta.", 500);

      // Impedir retorno da conta: bloqueio de login pelo prazo (indeterminado = conta desativada)
      if (impedir) {
        const duracao = ate ? `${Math.max(1, Math.ceil((Date.parse(ate) - agora.getTime()) / 60_000))}m` : BAN_INDETERMINADO;
        const { error: eBan } = await admin.auth.admin.updateUserById(usuario, { ban_duration: duracao });
        if (eBan) return erro("As sessões foram encerradas, mas não foi possível impedir a volta da conta.", 500);
        if (!ate) await admin.from("visitantes").update({ ativo: false }).eq("auth_user_id", usuario);
      }
    }

    // Aparelho impedido de voltar: bloqueio com prazo (mantém o id, senão a pessoa escaparia com um id novo)
    if (temAnon && impedir) {
      const falha = await criarBloqueio(anon, "suspensao", ate, null, temUsuario ? usuario : null);
      if (falha) return erro(falha, 500);
    }

    const { error } = await admin.from("dispositivos_expulsoes").insert({
      dispositivo_id: temAnon ? anon : null,
      usuario_id: temUsuario ? usuario : null,
      motivo,
      criado_por: ator.email,
      impede_ate: impedir ? ate : null,
    });
    if (error) return erro(faltaEstrutura(error) ? MSG_MIGRATION : "Não foi possível registrar a expulsão.", 500);

    const fim = { encerrada_em: agora.toISOString() };
    if (temAnon) await admin.from("acessos_sessoes").update(fim).eq("anon_id", anon).is("encerrada_em", null);
    if (temUsuario) await admin.from("acessos_sessoes").update(fim).eq("auth_user_id", usuario).is("encerrada_em", null);

    await auditar(admin, ator.email, temUsuario ? "conta_expulsar" : "aparelho_expulsar", null, {
      aparelho: temAnon ? anon.slice(0, 8) : null, conta: temUsuario ? usuario : null, motivo, impedir, ate,
    });
    return NextResponse.json({ ok: true });
  }

  return erro("Ação desconhecida.", 400);
}
