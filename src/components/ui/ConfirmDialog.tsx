"use client";

/**
 * ConfirmDialog — caixa de confirmação (usa o SweetAlert2 de utils/alertas.ts)
 * ------------------------------------------------------------
 * Continua sendo controlado pelo "aberto": quando vira true, mostra a
 * pergunta e chama onConfirmar ou onCancelar conforme a escolha.
 * Esc / clique fora = cancelar. O foco começa no "Cancelar" (escolha segura).
 */

import { useEffect, useRef } from "react";
import { confirmar } from "@/utils/alertas";

interface Props {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  perigo?: boolean;
  /** Mantido por compatibilidade: a caixa fecha ao escolher */
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  perigo = false,
  onConfirmar,
  onCancelar,
}: Props) {
  // guarda as funções mais recentes sem reabrir a caixa a cada render
  const acoes = useRef({ onConfirmar, onCancelar });
  acoes.current = { onConfirmar, onCancelar };

  useEffect(() => {
    if (!aberto) return;
    let ativo = true;
    void confirmar({ titulo, mensagem, textoConfirmar, perigo }).then((ok) => {
      if (!ativo) return;
      if (ok) acoes.current.onConfirmar();
      else acoes.current.onCancelar();
    });
    return () => {
      ativo = false;
    };
  }, [aberto, titulo, mensagem, textoConfirmar, perigo]);

  return null;
}
