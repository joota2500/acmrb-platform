"use client";

/**
 * Navegação fixa por âncoras. Destaca a seção visível
 * (IntersectionObserver) e rola suavemente até a escolhida.
 * No celular vira uma faixa com rolagem horizontal.
 */

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import { cn } from "@/utils/cn";

export const SECOES = [
  { id: "indicadores", rotulo: "Indicadores" },
  { id: "operacional", rotulo: "Materiais" },
  { id: "evolucao", rotulo: "Evolução" },
  { id: "impacto", rotulo: "Impacto social" },
  { id: "documentos", rotulo: "Documentos" },
  { id: "metodologia", rotulo: "Metodologia" },
];

export default function TranspNav() {
  const [ativa, setAtiva] = useState(SECOES[0].id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entradas) => {
        const vis = entradas.filter((e) => e.isIntersecting);
        if (vis.length) setAtiva(vis[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    SECOES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  function ir(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setAtiva(id);
  }

  return (
    // fica colado embaixo do Header fixo (64px no celular, 72px no tablet, 68px no desktop)
    <nav className="sticky top-16 z-30 border-b border-line bg-white/90 backdrop-blur-md sm:top-18 lg:top-17" aria-label="Seções da transparência">
      <Container className="flex gap-1.5 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECOES.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => ir(e, s.id)}
            aria-current={ativa === s.id ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              ativa === s.id ? "bg-leaf text-white shadow-sm" : "text-ink-soft hover:bg-brand-soft hover:text-leaf",
            )}
          >
            {s.rotulo}
          </a>
        ))}
      </Container>
    </nav>
  );
}
