"use client";

/**
 * RastreadorAcessos — conta TODAS as visitas do site (com ou sem login)
 * ------------------------------------------------------------
 * Montado no layout. Envia avisos para /api/acessos:
 *   inicio   → nova visita (origem, utm, tamanho de tela, idioma)
 *   pagina   → mudou de página (com o tempo na página anterior)
 *   ping     → batimento a cada 30 s enquanto a aba está visível
 *   fim      → ao sair/fechar (sendBeacon)
 *   vincular → depois do login: os acessos passam a ser da conta
 * Guarda no navegador só um id aleatório (localStorage) e o id da visita
 * (sessionStorage). Não lê campos digitados, não envia IP (o servidor
 * não o grava) e respeita a recusa do aviso de privacidade / "Do Not Track".
 * Administradores logados não são contados. Páginas /admin são ignoradas.
 * Complementa (não substitui) o RastreadorVisitante, que detalha cliques
 * de visitantes cadastrados.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { EVENTO_PRIVACIDADE, medicaoPermitida } from "@/lib/privacidade";
import { idDoAparelho } from "@/lib/dispositivoCliente";

const CHAVE_SESSAO = "acmrb_acesso_sessao";
const BATIMENTO_MS = 30_000;
const VALIDADE_SESSAO_MS = 30 * 60 * 1000;
const IGNORAR = /^\/(admin|redefinir-senha)(\/|$)/;
const URL_API = "/api/acessos";

const novoId = () => crypto.randomUUID();

/** Id do aparelho (cookie do middleware + cópia local); é o mesmo que o ADM DEUS bloqueia */
const anonId = idDoAparelho;

export default function RastreadorAcessos() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const sessaoId = useRef<string | null>(null);
  const ativoMs = useRef(0); // tempo visível acumulado da visita
  const paginaMs = useRef(0); // tempo visível acumulado da página atual
  const desde = useRef<number | null>(null); // início do trecho visível atual
  const caminhoAtual = useRef<string | null>(null);
  const vinculado = useRef<string | null>(null);

  // Soma o trecho visível em andamento
  const fechar = useRef(() => {
    if (desde.current !== null) {
      const d = Date.now() - desde.current;
      ativoMs.current += d;
      paginaMs.current += d;
      desde.current = Date.now();
    }
  });

  const enviar = useRef(async (t: string, extra: Record<string, unknown> = {}, opcoes: { beacon?: boolean; token?: string | null } = {}) => {
    const a = anonId();
    if (!a || !sessaoId.current || !medicaoPermitida()) return;
    fechar.current();
    const corpo = JSON.stringify({
      t,
      s: sessaoId.current,
      a,
      at: Math.round(ativoMs.current / 1000),
      ant: Math.round(paginaMs.current / 1000),
      ...extra,
    });
    try {
      if (opcoes.beacon && navigator.sendBeacon) {
        navigator.sendBeacon(URL_API, new Blob([corpo], { type: "application/json" }));
        return;
      }
      await fetch(URL_API, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json", ...(opcoes.token ? { Authorization: `Bearer ${opcoes.token}` } : {}) },
        body: corpo,
      });
    } catch {
      /* sem rede: ignora */
    }
  });

  const tokenAtual = async () => (await supabase.auth.getSession()).data.session?.access_token ?? null;

  // Início da visita (espera o login ser verificado para não contar administradores)
  useEffect(() => {
    if (loading) return;
    let encerrado = false;

    const iniciar = async () => {
      if (!medicaoPermitida() || sessaoId.current) return;
      const caminho = window.location.pathname;
      if (IGNORAR.test(caminho)) return;
      if (!anonId()) return;

      // Mesma aba, recarregada há pouco: continua a mesma visita
      let reaproveitou = false;
      try {
        const g = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) ?? "null") as { id: string; ts: number } | null;
        if (g && Date.now() - g.ts < VALIDADE_SESSAO_MS) {
          sessaoId.current = g.id;
          reaproveitou = true;
        }
      } catch {
        /* sessionStorage indisponível */
      }
      if (!sessaoId.current) sessaoId.current = novoId();
      try {
        sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({ id: sessaoId.current, ts: Date.now() }));
      } catch {
        /* ignora */
      }

      caminhoAtual.current = caminho;
      desde.current = document.visibilityState === "visible" ? Date.now() : null;
      const token = await tokenAtual();
      if (encerrado) return;

      if (reaproveitou) {
        await enviar.current("pagina", { c: caminho }, { token });
      } else {
        const q = new URLSearchParams(window.location.search);
        await enviar.current(
          "inicio",
          {
            c: caminho,
            ref: document.referrer || null,
            utm: { s: q.get("utm_source"), m: q.get("utm_medium"), c: q.get("utm_campaign") },
            w: window.innerWidth,
            l: navigator.language,
          },
          { token },
        );
      }
      paginaMs.current = 0;
    };

    void iniciar();

    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "visible") desde.current = Date.now();
      else {
        fechar.current();
        desde.current = null;
        void enviar.current("ping", {}, { beacon: true });
      }
    };
    const aoSair = () => void enviar.current("fim", {}, { beacon: true });
    const aoMudarPrivacidade = () => {
      if (medicaoPermitida()) void iniciar();
      else sessaoId.current = null;
    };
    const batimento = setInterval(() => {
      if (document.visibilityState === "visible" && sessaoId.current) {
        void enviar.current("ping");
        try {
          sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({ id: sessaoId.current, ts: Date.now() }));
        } catch {
          /* ignora */
        }
      }
    }, BATIMENTO_MS);

    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    window.addEventListener("pagehide", aoSair);
    window.addEventListener(EVENTO_PRIVACIDADE, aoMudarPrivacidade);
    return () => {
      encerrado = true;
      clearInterval(batimento);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      window.removeEventListener("pagehide", aoSair);
      window.removeEventListener(EVENTO_PRIVACIDADE, aoMudarPrivacidade);
    };
  }, [loading]);

  // Troca de página
  useEffect(() => {
    if (!sessaoId.current || caminhoAtual.current === null || pathname === caminhoAtual.current) return;
    if (IGNORAR.test(pathname)) {
      caminhoAtual.current = pathname;
      return;
    }
    caminhoAtual.current = pathname;
    void (async () => {
      await enviar.current("pagina", { c: pathname }, { token: await tokenAtual() });
      paginaMs.current = 0;
    })();
  }, [pathname]);

  // Login feito durante a visita: os acessos anônimos passam a ser da conta
  useEffect(() => {
    if (loading || !user || vinculado.current === user.id) return;
    vinculado.current = user.id;
    void (async () => {
      const a = anonId();
      if (!a || !medicaoPermitida()) return;
      if (!sessaoId.current) sessaoId.current = novoId();
      await enviar.current("vincular", {}, { token: await tokenAtual() });
    })();
  }, [user, loading]);

  return null;
}
