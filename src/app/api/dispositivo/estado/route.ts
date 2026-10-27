/**
 * API — Situação do aparelho (GET /api/dispositivo/estado)
 * ------------------------------------------------------------
 * O site pergunta a cada ~10 s (e ao voltar para a aba) se este aparelho
 * foi bloqueado, suspenso ou expulso pelo ADM DEUS. A resposta troca a
 * página aberta pela tela de bloqueio, sem recarregar.
 *   { estado: "ok" | "bloqueado" | "expulsar",
 *     bloqueio: { tipo, motivo, ate } | null, expulsao: { motivo } | null }
 * Lê direto do banco (sem cache), por uma única função (dispositivo_estado).
 * Usa o cookie acmrb_did; com login, o token confere se a sessão foi
 * encerrada pelo deus (expulsão da conta). Sem chave/migration: "ok"
 * (nunca derruba o site por falha técnica). Não grava nada além de marcar
 * a expulsão como entregue.
 */

import { NextResponse } from "next/server";
import { clienteServidor } from "@/lib/supabaseServidor";
import { hashDoIp } from "@/lib/segurancaServidor";
import { dispositivoDoCookie } from "@/lib/dispositivo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Bloqueio { tipo: "bloqueio" | "suspensao"; motivo: string; ate: string | null }

const resposta = (estado: "ok" | "bloqueado" | "expulsar", bloqueio: Bloqueio | null = null, expulsao: { motivo: string } | null = null) =>
  NextResponse.json({ estado, bloqueio, expulsao }, { headers: { "Cache-Control": "no-store" } });

export async function GET(req: Request) {
  const admin = clienteServidor();
  const did = dispositivoDoCookie(req.headers.get("cookie"));
  if (!admin || !did) return resposta("ok");

  try {
    const { data, error } = await admin.rpc("dispositivo_estado", { p_did: did, p_ip_hash: hashDoIp(req) });
    if (error || !data) return resposta("ok"); // migration ainda não rodada ou falha: nunca bloqueia
    if (data.protegido) return resposta("ok");

    let bloqueio: Bloqueio | null = data.bloqueio
      ? { tipo: data.bloqueio.tipo, motivo: String(data.bloqueio.motivo ?? ""), ate: data.bloqueio.ate ?? null }
      : null;
    let expulsao: { motivo: string } | null = data.expulsao ? { motivo: String(data.expulsao.motivo ?? "") } : null;

    // Conta expulsa pelo deus (todas as sessões de login encerradas): o token deixa de valer
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (token && !expulsao) {
      const { error: eUser } = await admin.auth.getUser(token);
      if (eUser && (eUser as { code?: string }).code === "session_not_found") {
        let motivo = "";
        try {
          const sub = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8")).sub as string | undefined;
          if (sub && /^[0-9a-f-]{36}$/i.test(sub)) {
            const { data: e } = await admin
              .from("dispositivos_expulsoes")
              .select("motivo")
              .eq("usuario_id", sub)
              .gt("criado_em", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
              .order("criado_em", { ascending: false })
              .limit(1)
              .maybeSingle();
            motivo = e?.motivo ?? "";
          }
        } catch {
          /* sem motivo para mostrar */
        }
        expulsao = { motivo };
      }
    }

    if (bloqueio) return resposta("bloqueado", bloqueio, expulsao);
    if (expulsao) return resposta("expulsar", null, expulsao);
    return resposta("ok");
  } catch {
    return resposta("ok");
  }
}
