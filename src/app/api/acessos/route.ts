/**
 * API — Registro de acessos ao site (POST /api/acessos)
 * ------------------------------------------------------------
 * Recebe os avisos do navegador (RastreadorAcessos): início da visita,
 * troca de página, batimento, saída e "vincular" (quando a pessoa faz
 * login e passa a ser identificada).
 *
 * Privacidade: NÃO grava IP. Cidade/estado/país vêm dos cabeçalhos
 * x-vercel-ip-* (aproximados). Quem não tem conta só fica 24 h
 * (função acessos_limpar). Administradores nunca são registrados.
 * Grava com a service role (as tabelas não aceitam escrita do navegador).
 * Sem a chave configurada ou sem a migration, responde 204 em silêncio
 * para não atrapalhar o site.
 */

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clienteServidor } from "@/lib/supabaseServidor";
import { analisarUA } from "@/lib/userAgent";
import { classificarOrigem } from "@/lib/origemAcesso";
import { geoDaRequisicao, hashDoIp, limitar } from "@/lib/segurancaServidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IGNORAR = /^\/(admin|api|redefinir-senha|_next)(\/|$)/;
const MAX_SEG = 6 * 3600;

const vazio = () => new NextResponse(null, { status: 204 });

const inteiro = (v: unknown, max: number) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0;
};

/** Só o caminho (sem ?query nem #hash), começando com "/" */
function caminhoLimpo(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const c = v.split(/[?#]/)[0].replace(/[\u0000-\u001f]/g, "").slice(0, 300);
  return c.startsWith("/") && !IGNORAR.test(c) ? c : null;
}

/** Quem é o usuário do token e se é administrador */
async function quemE(admin: SupabaseClient, req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data } = await admin.auth.getUser(token);
  const u = data.user;
  if (!u?.email) return null;
  const { data: a } = await admin.from("admins").select("id").ilike("email", u.email.replace(/[\\%_]/g, (c) => `\\${c}`)).maybeSingle();
  return { id: u.id, admin: !!a };
}

export async function POST(req: Request) {
  const admin = clienteServidor();
  if (!admin) return vazio();

  const corpo = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!corpo || typeof corpo !== "object") return vazio();
  const tipo = String(corpo.t ?? "");
  const sessaoId = String(corpo.s ?? "");
  const anonId = String(corpo.a ?? "");
  if (!UUID.test(sessaoId) || !UUID.test(anonId)) return vazio();

  const ua = analisarUA(req.headers.get("user-agent"));
  if (ua.robo) return vazio();

  // Limite por rede: 600 avisos a cada 10 minutos
  const ip = hashDoIp(req);
  if (ip) {
    const lim = await limitar(admin, `acessos:${ip}`, 600, 600);
    if (!lim.permitido) return new NextResponse(null, { status: 429 });
  }

  try {
    // ---------- Vincular: a pessoa fez login; os acessos dela passam a ser dela ----------
    if (tipo === "vincular") {
      const quem = await quemE(admin, req);
      if (!quem) return vazio();
      if (quem.admin) {
        // Administrador não entra na estatística: apaga o que foi gravado antes do login
        await admin.from("acessos_sessoes").delete().eq("anon_id", anonId);
        return vazio();
      }
      await admin.from("acessos_sessoes").update({ auth_user_id: quem.id }).eq("anon_id", anonId).is("auth_user_id", null);
      return vazio();
    }

    // ---------- Início da visita ----------
    if (tipo === "inicio") {
      const caminho = caminhoLimpo(corpo.c);
      if (!caminho) return vazio();
      const quem = await quemE(admin, req);
      if (quem?.admin) return vazio();

      const siteHost = req.headers.get("host");
      const utm = (corpo.utm ?? {}) as { s?: unknown; m?: unknown; c?: unknown };
      const o = classificarOrigem(corpo.ref, siteHost, utm);
      const geo = geoDaRequisicao(req);
      const largura = inteiro(corpo.w, 20000);

      const { error } = await admin.from("acessos_sessoes").upsert(
        {
          id: sessaoId,
          anon_id: anonId,
          auth_user_id: quem?.id ?? null,
          pagina_inicial: caminho,
          paginas: 1,
          ...o,
          dispositivo: ua.dispositivo,
          navegador: ua.navegador,
          sistema: ua.sistema,
          tela_largura: largura || null,
          idioma: typeof corpo.l === "string" ? corpo.l.slice(0, 20) : null,
          ...geo,
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
      if (error) return vazio();
      await admin.from("acessos_paginas").insert({ sessao_id: sessaoId, caminho });
      if (quem) await admin.from("acessos_sessoes").update({ auth_user_id: quem.id }).eq("anon_id", anonId).is("auth_user_id", null);
      return vazio();
    }

    // Os demais avisos só valem para a sessão do próprio navegador (id + anon_id)
    const { data: sessao } = await admin
      .from("acessos_sessoes")
      .select("id, iniciada_em, encerrada_em")
      .eq("id", sessaoId)
      .eq("anon_id", anonId)
      .maybeSingle();
    if (!sessao) return vazio();
    const decorrido = Math.max(0, Math.round((Date.now() - new Date(sessao.iniciada_em).getTime()) / 1000));
    const ativo = Math.min(inteiro(corpo.at, MAX_SEG), decorrido, MAX_SEG);

    // ---------- Troca de página ----------
    if (tipo === "pagina") {
      const caminho = caminhoLimpo(corpo.c);
      if (!caminho) return vazio();
      const { data: ultima } = await admin.from("acessos_paginas").select("id").eq("sessao_id", sessaoId).order("id", { ascending: false }).limit(1).maybeSingle();
      if (ultima) await admin.from("acessos_paginas").update({ duracao_seg: inteiro(corpo.ant, MAX_SEG) }).eq("id", ultima.id);
      await admin.from("acessos_paginas").insert({ sessao_id: sessaoId, caminho });
      const { count } = await admin.from("acessos_paginas").select("id", { count: "exact", head: true }).eq("sessao_id", sessaoId);
      await admin
        .from("acessos_sessoes")
        .update({ paginas: count ?? 1, ultima_atividade: new Date().toISOString(), duracao_seg: ativo, encerrada_em: null })
        .eq("id", sessaoId);
      return vazio();
    }

    // ---------- Batimento / saída ----------
    if (tipo === "ping" || tipo === "fim") {
      if (tipo === "fim") {
        const { data: ultima } = await admin.from("acessos_paginas").select("id").eq("sessao_id", sessaoId).order("id", { ascending: false }).limit(1).maybeSingle();
        if (ultima) await admin.from("acessos_paginas").update({ duracao_seg: inteiro(corpo.ant, MAX_SEG) }).eq("id", ultima.id);
      }
      await admin
        .from("acessos_sessoes")
        .update({
          ultima_atividade: new Date().toISOString(),
          duracao_seg: ativo,
          encerrada_em: tipo === "fim" ? new Date().toISOString() : null,
        })
        .eq("id", sessaoId);
      return vazio();
    }
  } catch {
    /* o registro de acessos nunca pode derrubar o site */
  }
  return vazio();
}
