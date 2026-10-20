"use client";

/**
 * RastreadorVisitante — atividade de VISITANTES logados (montado no layout)
 * ------------------------------------------------------------
 * Só roda quando há visitante logado (admins e anônimos: nada).
 *  - Abre uma sessão (visitante_sessoes) ao entrar; na mesma aba, um
 *    recarregamento retoma a sessão (sessionStorage + RPC 'retomar').
 *  - Batimento a cada 60 s: atualiza última atividade e duração.
 *  - Registra troca de página e cliques em links, botões e [data-track]
 *    (com limite de frequência e envio em lote).
 *  - Encerra a sessão ao sair (logout) ou ao fechar a aba (pagehide).
 * Privacidade: NUNCA lê valores de campos (input/textarea/select) nem
 * senhas; o caminho é salvo sem query string nem hash.
 * Banco: migration 20261020270000_visitantes_atividade.sql.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const CHAVE_SESSAO = "acmrb_vis_sessao";
const BATIMENTO_MS = 60_000;
const LOTE_MS = 10_000;
const LOTE_MAX = 20;
const INTERVALO_CLIQUE_MS = 400;
// Páginas que não são registradas
const IGNORAR = [/^\/admin/, /^\/redefinir-senha/];

type Evento = {
  sessao_id: string;
  auth_user_id: string;
  tipo: "pagina" | "clique";
  caminho: string;
  rotulo: string | null;
  alvo: string | null;
  criado_em: string;
};

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Envio que sobrevive ao fechamento da aba (fetch keepalive na API REST) */
function enviarKeepalive(caminho: string, token: string, corpo: unknown) {
  try {
    fetch(`${URL_BASE}/rest/v1/${caminho}`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(corpo),
    }).catch(() => {});
  } catch {
    /* sem rede: ignora */
  }
}

const cortar = (t: string | null | undefined, max: number) => {
  const v = (t ?? "").replace(/\s+/g, " ").trim();
  return v ? v.slice(0, max) : null;
};

/** Rótulo e seletor do elemento clicado — sem ler valores digitados */
function descrever(el: HTMLElement): { rotulo: string | null; alvo: string | null } {
  const track = el.getAttribute("data-track");
  const rotulo =
    track ||
    el.getAttribute("aria-label") ||
    el.getAttribute("title") ||
    // innerText de link/botão é texto visível do site, não dado do usuário
    el.innerText ||
    null;
  let alvo: string;
  if (track) alvo = `[data-track="${track}"]`;
  else {
    alvo = el.tagName.toLowerCase();
    if (el.id) alvo += `#${el.id}`;
    const classe = el.classList[0];
    if (classe) alvo += `.${classe}`;
    const href = el.getAttribute("href");
    if (href && !href.startsWith("mailto:") && !href.startsWith("tel:")) alvo += ` → ${href.split("?")[0]}`;
  }
  return { rotulo: cortar(rotulo, 120), alvo: cortar(alvo, 200) };
}

export default function RastreadorVisitante() {
  const { user, perfil, session } = useAuth();
  const pathname = usePathname();

  const ativo = !!user && perfil?.tipo === "visitante";
  const sessaoId = useRef<string | null>(null);
  const userId = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const fila = useRef<Evento[]>([]);

  // Guarda o token atual (usado no envio keepalive e no encerramento)
  useEffect(() => {
    if (session?.access_token) token.current = session.access_token;
  }, [session]);

  // Envia a fila de eventos em lote
  const esvaziar = useRef((keepalive = false) => {
    if (!fila.current.length) return;
    const lote = fila.current.splice(0, fila.current.length);
    if (keepalive && token.current) enviarKeepalive("visitante_eventos", token.current, lote);
    else void supabase.from("visitante_eventos").insert(lote).then(() => {});
  });

  const registrar = useRef((tipo: Evento["tipo"], rotulo: string | null, alvo: string | null) => {
    if (!sessaoId.current || !userId.current) return;
    const caminho = window.location.pathname;
    if (IGNORAR.some((r) => r.test(caminho))) return;
    fila.current.push({
      sessao_id: sessaoId.current,
      auth_user_id: userId.current,
      tipo,
      caminho: caminho.slice(0, 300),
      rotulo,
      alvo,
      criado_em: new Date().toISOString(),
    });
    if (fila.current.length >= LOTE_MAX) esvaziar.current();
  });

  // Início/fim da sessão conforme o login
  useEffect(() => {
    if (!ativo || !user) return;
    let cancelado = false;
    userId.current = user.id;

    (async () => {
      // Recarregou a mesma aba? tenta retomar a sessão anterior
      const guardada = sessionStorage.getItem(CHAVE_SESSAO);
      if (guardada) {
        const { data } = await supabase.rpc("visitante_sessao_ping", { p_id: guardada, p_acao: "retomar" });
        if (data === true) {
          sessaoId.current = guardada;
          registrar.current("pagina", null, null);
          return;
        }
      }
      if (cancelado) return;
      const id = crypto.randomUUID();
      // Sem .select(): o visitante não pode ler a tabela (só inserir)
      const { error } = await supabase.from("visitante_sessoes").insert({
        id,
        auth_user_id: user.id,
        user_agent: navigator.userAgent.slice(0, 400),
      });
      if (error || cancelado) return;
      sessaoId.current = id;
      sessionStorage.setItem(CHAVE_SESSAO, id);
      registrar.current("pagina", null, null);
    })();

    const batimento = setInterval(() => {
      if (sessaoId.current && document.visibilityState === "visible") {
        void supabase.rpc("visitante_sessao_ping", { p_id: sessaoId.current, p_acao: "ping" });
      }
    }, BATIMENTO_MS);
    const lote = setInterval(() => esvaziar.current(), LOTE_MS);

    // Aba fechando/recarregando: envia o que falta e encerra
    const aoSair = () => {
      esvaziar.current(true);
      if (sessaoId.current && token.current) {
        enviarKeepalive("rpc/visitante_sessao_ping", token.current, { p_id: sessaoId.current, p_acao: "encerrar" });
      }
    };
    window.addEventListener("pagehide", aoSair);

    return () => {
      // Logout (ou troca de usuário): encerra com o último token conhecido
      cancelado = true;
      clearInterval(batimento);
      clearInterval(lote);
      window.removeEventListener("pagehide", aoSair);
      aoSair();
      sessaoId.current = null;
      sessionStorage.removeItem(CHAVE_SESSAO);
    };
  }, [ativo, user]);

  // Troca de página
  useEffect(() => {
    if (ativo && sessaoId.current) registrar.current("pagina", null, null);
  }, [pathname, ativo]);

  // Cliques em links, botões e [data-track]
  useEffect(() => {
    if (!ativo) return;
    let ultimo = 0;
    let ultimoEl: Element | null = null;
    const aoClicar = (ev: MouseEvent) => {
      const alvo = ev.target as HTMLElement | null;
      if (!alvo || alvo.closest("input, textarea, select, [contenteditable]")) return;
      const el = alvo.closest<HTMLElement>("a, button, [data-track], [role='button']");
      if (!el) return;
      const agora = Date.now();
      if (agora - ultimo < INTERVALO_CLIQUE_MS || (el === ultimoEl && agora - ultimo < 1500)) return;
      ultimo = agora;
      ultimoEl = el;
      const { rotulo, alvo: seletor } = descrever(el);
      registrar.current("clique", rotulo, seletor);
    };
    document.addEventListener("click", aoClicar, { capture: true, passive: true });
    return () => document.removeEventListener("click", aoClicar, { capture: true });
  }, [ativo]);

  return null;
}
