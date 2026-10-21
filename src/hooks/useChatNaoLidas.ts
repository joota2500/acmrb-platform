"use client";

/**
 * useChatNaoLidas — total de mensagens não lidas do chat geral para
 * quem está logado (admin: de todos os visitantes; visitante: respostas
 * da equipe). Realtime quando disponível + atualização a cada 12 s.
 * Evento "acmrb-chat-lido" força recarregar (ao abrir uma conversa).
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { contarNaoLidasChat, INTERVALO_CHAT_MS } from "@/lib/chatGeral";

export const EVENTO_CHAT_LIDO = "acmrb-chat-lido";

export function useChatNaoLidas(ativo: boolean) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!ativo) {
      setTotal(0);
      return;
    }
    let vivo = true;
    const carregar = async () => {
      const n = await contarNaoLidasChat();
      if (vivo) setTotal(n);
    };
    void carregar();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") void carregar();
    }, INTERVALO_CHAT_MS);
    const canal = supabase
      .channel(`chat-nao-lidas-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_mensagens" }, () => void carregar())
      .subscribe();
    const aoLer = () => void carregar();
    window.addEventListener(EVENTO_CHAT_LIDO, aoLer);
    return () => {
      vivo = false;
      clearInterval(t);
      window.removeEventListener(EVENTO_CHAT_LIDO, aoLer);
      void supabase.removeChannel(canal);
    };
  }, [ativo]);

  return total;
}
