"use client";

/**
 * PainelLateral — janela de formulário do painel (Apoiadores/Logística)
 * Abre como gaveta à direita no desktop e tela cheia no celular.
 * Fecha com Esc; foca o primeiro campo ao abrir.
 * Visual só com Tailwind: cabeçalho e rodapé fixos, só o meio rola.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  rodape?: ReactNode;
}

export default function PainelLateral({ aberto, titulo, onFechar, children, rodape }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    // fundo escuro: clicar fora fecha
    <div
      className="fixed inset-0 z-90 flex animate-aparecer justify-end bg-ink/45 motion-reduce:animate-none"
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        ref={ref}
        className="flex h-full w-full animate-subir flex-col bg-surface-alt shadow-[-10px_0_40px_rgb(0_0_0/0.2)] motion-reduce:animate-none sm:w-[min(44rem,100%)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admap-painel-titulo"
      >
        <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3.5 sm:px-5">
          <h2 id="admap-painel-titulo" className="min-w-0 truncate text-[1.1rem] font-black tracking-tight text-ink">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-zinc-100 text-zinc-600 transition hover:bg-brand-mint hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
          >
            <X size={18} />
          </button>
        </header>
        {/* só o meio rola; cabeçalho e rodapé ficam fixos */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden p-3 sm:p-5">{children}</div>
        {rodape && (
          <footer className="flex justify-end gap-2.5 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:px-5 max-sm:[&>button]:flex-1">
            {rodape}
          </footer>
        )}
      </div>
    </div>
  );
}
