"use client";

/**
 * GuardaAparelho — troca a página aberta pela tela de bloqueio, sem recarregar
 * ------------------------------------------------------------
 * Enquanto a aba está visível pergunta a cada ~10 s (e ao voltar para a aba,
 * ao recuperar a internet ou ao restaurar a página) para /api/dispositivo/estado:
 *   - bloqueado/suspenso → cobre o site com a TelaBloqueio (motivo e prazo);
 *   - expulso            → sai da conta neste aparelho, apaga o id do aparelho
 *                          e mostra o aviso "Você foi desconectado" (com o motivo);
 *   - voltou ao normal   → recarrega a página (desbloqueado ou prazo acabou).
 * Funciona mesmo com "Do Not Track" (é segurança, não estatística).
 * Não roda no /admin. Falha de rede = não faz nada (nunca derruba o site).
 * CSS: src/styles/acesso-bloqueado.css.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { esquecerAparelho } from "@/lib/dispositivoCliente";
import { dispositivoDoCookie } from "@/lib/dispositivo";
import TelaBloqueio, { type TipoBloqueio } from "./TelaBloqueio";

const INTERVALO_MS = 10_000;

interface Resposta {
  estado: "ok" | "bloqueado" | "expulsar";
  bloqueio: { tipo: "bloqueio" | "suspensao"; motivo: string; ate: string | null } | null;
  expulsao: { motivo: string } | null;
}
interface Tela { tipo: TipoBloqueio; motivo: string; ate: string | null }

export default function GuardaAparelho() {
  const pathname = usePathname();
  const [tela, setTela] = useState<Tela | null>(null);
  const [montado, setMontado] = useState(false);
  const telaRef = useRef<Tela | null>(null);
  telaRef.current = tela;
  const desligado = pathname.startsWith("/admin");

  useEffect(() => setMontado(true), []);

  // Marca/desmarca o <html> (o CSS esconde o resto do site enquanto a camada estiver ativa)
  useEffect(() => {
    if (tela) document.documentElement.setAttribute("data-bloqueado", "1");
    else document.documentElement.removeAttribute("data-bloqueado");
    return () => document.documentElement.removeAttribute("data-bloqueado");
  }, [tela]);

  const verificar = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const resp = await fetch("/api/dispositivo/estado", {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!resp.ok) return;
      const r = (await resp.json()) as Resposta;
      const paginaBloqueada = !!document.querySelector("[data-pagina-bloqueio]");

      // Expulso (ou sessão da conta encerrada pelo deus): sai da conta neste aparelho
      if (r.expulsao) {
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch {
          /* já sem sessão */
        }
      }

      if (r.estado === "bloqueado" && r.bloqueio) {
        if (!paginaBloqueada) setTela({ tipo: r.bloqueio.tipo, motivo: r.bloqueio.motivo, ate: r.bloqueio.ate });
        return;
      }
      if (r.estado === "expulsar" && r.expulsao) {
        // Sem impedimento de retorno: apaga o id; um novo nasce no próximo carregamento
        if (dispositivoDoCookie(document.cookie)) esquecerAparelho();
        setTela({ tipo: "expulsao", motivo: r.expulsao.motivo, ate: null });
        return;
      }
      // Voltou ao normal: se estava bloqueado/suspenso (camada ou página), recarrega
      if (paginaBloqueada || telaRef.current?.tipo === "bloqueio" || telaRef.current?.tipo === "suspensao") {
        window.location.reload();
      }
    } catch {
      /* sem rede: tenta de novo no próximo ciclo */
    }
  }, []);

  useEffect(() => {
    if (desligado) return;
    const inicio = setTimeout(() => void verificar(), 2000);
    const ciclo = setInterval(() => {
      if (document.visibilityState === "visible") void verificar();
    }, INTERVALO_MS);
    const agora = () => {
      if (document.visibilityState === "visible") void verificar();
    };
    document.addEventListener("visibilitychange", agora);
    window.addEventListener("focus", agora);
    window.addEventListener("online", agora);
    window.addEventListener("pageshow", agora);
    return () => {
      clearTimeout(inicio);
      clearInterval(ciclo);
      document.removeEventListener("visibilitychange", agora);
      window.removeEventListener("focus", agora);
      window.removeEventListener("online", agora);
      window.removeEventListener("pageshow", agora);
    };
  }, [desligado, verificar]);

  if (!montado || !tela) return null;
  return createPortal(
    <div className="ab-camada" data-camada-bloqueio role="alertdialog" aria-modal="true" aria-labelledby="ab-titulo">
      <TelaBloqueio
        tipo={tela.tipo}
        motivo={tela.motivo}
        ate={tela.ate}
        codigo={dispositivoDoCookie(document.cookie)?.slice(0, 8) ?? null}
        onTerminou={() => void verificar()}
        onContinuar={tela.tipo === "expulsao" ? () => window.location.replace("/") : undefined}
      />
    </div>,
    document.body,
  );
}
