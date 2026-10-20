"use client";

/**
 * ConfirmDialog — caixa de confirmação acessível
 * ------------------------------------------------------------
 * Substitui o confirm() do navegador. Fecha com Esc ou "Cancelar".
 * O foco vai para o botão "Cancelar" ao abrir (escolha segura).
 */

import { useEffect, useRef } from "react";

interface Props {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  perigo?: boolean;
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
  carregando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  const cancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    cancelarRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancelar();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aberto, onCancelar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancelar} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-titulo"
        aria-describedby="confirm-msg"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6"
      >
        <h2 id="confirm-titulo" className="text-xl font-black text-zinc-900">
          {titulo}
        </h2>
        <p id="confirm-msg" className="mt-3 text-zinc-600 leading-relaxed">
          {mensagem}
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            ref={cancelarRef}
            type="button"
            onClick={onCancelar}
            className="h-12 px-5 rounded-2xl border border-zinc-200 font-semibold hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-[#2E5E4E]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={carregando}
            className={`h-12 px-5 rounded-2xl font-bold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 ${
              perigo ? "bg-red-600 hover:bg-red-700 focus-visible:outline-red-600" : "bg-[#2E5E4E] hover:bg-[#21463A] focus-visible:outline-[#2E5E4E]"
            }`}
          >
            {carregando ? "Aguarde..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
