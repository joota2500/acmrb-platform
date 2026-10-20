"use client";

/**
 * Encerra a sessão do painel após um período sem uso.
 * Qualquer clique, tecla, toque ou rolagem reinicia a contagem.
 * A contagem é compartilhada entre abas pelo localStorage.
 */

import { useEffect } from "react";

/** Minutos sem uso até sair automaticamente (ajuste aqui) */
export const MINUTOS_INATIVIDADE = 30;

const CHAVE = "acmrb-admin-ultima-atividade";
const EVENTOS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

export function useInatividade(ativo: boolean, aoExpirar: () => void, minutos = MINUTOS_INATIVIDADE) {
  useEffect(() => {
    if (!ativo) return;
    const limite = minutos * 60 * 1000;
    let ultimaGravacao = 0;

    const marcar = () => {
      const agora = Date.now();
      // grava no máximo a cada 5 s para não pesar
      if (agora - ultimaGravacao > 5000) {
        ultimaGravacao = agora;
        localStorage.setItem(CHAVE, String(agora));
      }
    };
    marcar();
    EVENTOS.forEach((e) => window.addEventListener(e, marcar, { passive: true }));

    const timer = window.setInterval(() => {
      const ultima = Number(localStorage.getItem(CHAVE) || Date.now());
      if (Date.now() - ultima > limite) {
        window.clearInterval(timer);
        aoExpirar();
      }
    }, 30_000);

    return () => {
      window.clearInterval(timer);
      EVENTOS.forEach((e) => window.removeEventListener(e, marcar));
    };
  }, [ativo, aoExpirar, minutos]);
}
