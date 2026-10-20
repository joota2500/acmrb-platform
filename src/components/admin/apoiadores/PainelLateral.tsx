"use client";

/**
 * PainelLateral — janela de formulário do painel (Apoiadores/Logística)
 * Abre como gaveta à direita no desktop e tela cheia no celular.
 * Fecha com Esc; foca o primeiro campo ao abrir.
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
    <div className="admap-overlay" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div ref={ref} className="admap-painel" role="dialog" aria-modal="true" aria-labelledby="admap-painel-titulo">
        <header className="admap-painel__head">
          <h2 id="admap-painel-titulo">{titulo}</h2>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="admap-icon-btn">
            <X size={20} />
          </button>
        </header>
        <div className="admap-painel__body">{children}</div>
        {rodape && <footer className="admap-painel__foot">{rodape}</footer>}
      </div>
    </div>
  );
}
