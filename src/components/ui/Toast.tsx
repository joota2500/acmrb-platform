"use client";

/**
 * Toast — o aviso rápido único do site (sucesso, erro, atenção, info)
 * ------------------------------------------------------------
 * Fica sempre no mesmo canto: embaixo à direita no computador e embaixo,
 * na largura da tela, no celular. Some sozinho depois de 5 s (erro: 7 s).
 *
 * Em qualquer lugar (até fora de componente):
 *   import { aviso } from "@/components/ui/Toast";
 *   aviso("sucesso", "Notícia salva");
 *
 * Dentro de componente também dá para usar o jeito antigo:
 *   const { mostrar } = useToast();
 *   mostrar("erro", "Não foi possível salvar");
 *
 * <Avisos /> é colocado UMA vez só, no layout principal (app/layout.tsx).
 * Anunciados por leitores de tela (role="status" ou "alert").
 */

import { useCallback, useSyncExternalStore, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export type TipoToast = "sucesso" | "erro" | "aviso" | "info";

export interface ToastItem {
  id: number;
  tipo: TipoToast;
  mensagem: ReactNode;
  titulo?: string;
}

// ---- "lojinha" simples: lista de avisos + quem está ouvindo ----
let lista: ToastItem[] = [];
const ouvintes = new Set<() => void>();
const avisarOuvintes = () => ouvintes.forEach((f) => f());

export function fecharAviso(id: number) {
  lista = lista.filter((t) => t.id !== id);
  avisarOuvintes();
}

/** Mostra um aviso rápido no canto da tela */
export function aviso(tipo: TipoToast, mensagem: ReactNode, titulo?: string) {
  const id = Date.now() + Math.random();
  // no máximo 4 avisos ao mesmo tempo (os mais antigos saem)
  lista = [...lista, { id, tipo, mensagem, titulo }].slice(-4);
  avisarOuvintes();
  setTimeout(() => fecharAviso(id), tipo === "erro" ? 7000 : 5000);
}

/** Jeito antigo (usado nas telas do painel): continua funcionando */
export function useToast() {
  const mostrar = useCallback((tipo: TipoToast, mensagem: string) => aviso(tipo, mensagem), []);
  return { mostrar, fechar: fecharAviso };
}

const ESTILO: Record<TipoToast, { icone: string; barra: string; Icone: typeof CheckCircle2 }> = {
  sucesso: { icone: "bg-brand-mint text-brand", barra: "bg-brand", Icone: CheckCircle2 },
  erro: { icone: "bg-red-100 text-red-700", barra: "bg-red-600", Icone: XCircle },
  aviso: { icone: "bg-amber-100 text-amber-700", barra: "bg-amber-500", Icone: AlertTriangle },
  info: { icone: "bg-sky-100 text-sky-700", barra: "bg-sky-500", Icone: Info },
};

const assinar = (f: () => void) => {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
};
const VAZIA: ToastItem[] = [];

/** Área dos avisos (vai no layout principal, uma vez só) */
export function Avisos() {
  const toasts = useSyncExternalStore(assinar, () => lista, () => VAZIA);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[2100] flex flex-col gap-2.5 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-96"
    >
      {toasts.map((t) => {
        const { icone, barra, Icone } = ESTILO[t.tipo];
        return (
          <div
            key={t.id}
            role={t.tipo === "erro" ? "alert" : "status"}
            className="pointer-events-auto relative flex animate-subir items-start gap-3 overflow-hidden rounded-card border border-black/5 bg-white py-3 pr-2 pl-4 shadow-pop motion-reduce:animate-none"
          >
            {/* faixa colorida na esquerda */}
            <span className={`absolute inset-y-0 left-0 w-1 ${barra}`} aria-hidden="true" />
            <span className={`grid size-8 shrink-0 place-items-center rounded-xl ${icone}`}>
              <Icone size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5 text-[0.88rem] leading-snug text-ink-soft">
              {t.titulo && <p className="font-extrabold text-ink">{t.titulo}</p>}
              <div className="break-words">{t.mensagem}</div>
            </div>
            <button
              type="button"
              onClick={() => fecharAviso(t.id)}
              aria-label="Fechar aviso"
              className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-ink-muted transition hover:bg-zinc-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
