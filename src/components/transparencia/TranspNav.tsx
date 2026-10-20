"use client";

/**
 * Navegação fixa por âncoras. Destaca a seção visível
 * (IntersectionObserver) e rola suavemente até a escolhida.
 * No celular vira uma faixa com rolagem horizontal.
 */

import { useEffect, useState } from "react";

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
    <nav className="tp-nav" aria-label="Seções da transparência">
      <div className="tp-container tp-nav__trilho">
        {SECOES.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => ir(e, s.id)}
            className={`tp-nav__link ${ativa === s.id ? "is-ativo" : ""}`}
            aria-current={ativa === s.id ? "true" : undefined}
          >
            {s.rotulo}
          </a>
        ))}
      </div>
    </nav>
  );
}
