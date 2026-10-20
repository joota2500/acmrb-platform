"use client";

/**
 * Toast — avisos rápidos (sucesso, erro, atenção)
 * ------------------------------------------------------------
 * Uso:
 *   const { toasts, mostrar, fechar } = useToast();
 *   mostrar("sucesso", "Associado cadastrado com sucesso");
 *   <ToastArea toasts={toasts} onFechar={fechar} />
 * Somem sozinhos após 5s. Anunciados por leitores de tela (aria-live).
 */

import { useCallback, useState } from "react";
import { AlertTriangle, CheckCircle2, X, XCircle } from "lucide-react";

export type TipoToast = "sucesso" | "erro" | "aviso";

export interface ToastItem {
  id: number;
  tipo: TipoToast;
  mensagem: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const fechar = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const mostrar = useCallback(
    (tipo: TipoToast, mensagem: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, tipo, mensagem }]);
      setTimeout(() => fechar(id), 5000);
    },
    [fechar],
  );

  return { toasts, mostrar, fechar };
}

const ESTILO: Record<TipoToast, { cor: string; Icone: typeof CheckCircle2 }> = {
  sucesso: { cor: "bg-emerald-600", Icone: CheckCircle2 },
  erro: { cor: "bg-red-600", Icone: XCircle },
  aviso: { cor: "bg-amber-500", Icone: AlertTriangle },
};

export function ToastArea({
  toasts,
  onFechar,
}: {
  toasts: ToastItem[];
  onFechar: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="fixed z-[100] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 flex flex-col gap-3 sm:w-96"
    >
      {toasts.map((t) => {
        const { cor, Icone } = ESTILO[t.tipo];
        return (
          <div
            key={t.id}
            role={t.tipo === "erro" ? "alert" : "status"}
            className={`${cor} text-white rounded-2xl shadow-xl px-4 py-3 flex items-start gap-3`}
          >
            <Icone size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
            <p className="flex-1 text-sm font-medium leading-relaxed">{t.mensagem}</p>
            <button
              type="button"
              onClick={() => onFechar(t.id)}
              aria-label="Fechar aviso"
              className="shrink-0 rounded-lg p-1 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
