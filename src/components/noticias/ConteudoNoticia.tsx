/**
 * ConteudoNoticia — mostra o texto da notícia já formatado
 * ------------------------------------------------------------
 * Usa o interpretador de src/utils/markdownNoticia.ts: o texto vira
 * elementos React (sem dangerouslySetInnerHTML), então não há risco de
 * script injetado e nenhum "#", "**" ou "-" cru aparece na leitura.
 * Usado na página pública e na pré-visualização do editor.
 * Estilo: classes do Tailwind direto em cada elemento (sem arquivo CSS).
 */

import { Fragment, type ReactNode } from "react";
import { blocos, type Trecho } from "@/utils/markdownNoticia";
import { cn } from "@/utils/cn";

/* Estilos de cada tipo de bloco (parágrafo, títulos, listas...) */
const ESTILO = {
  paragrafo: "texto-justo mb-5",
  link: "font-bold text-brand underline decoration-brand-line decoration-2 underline-offset-4 [overflow-wrap:anywhere] hover:text-brand-dark hover:decoration-current",
  h1: "mb-4 mt-11 border-b-[3px] border-brand-mint pb-2.5 text-2xl font-black leading-tight tracking-tight text-brand-dark sm:text-3xl",
  h2: "mb-3.5 mt-10 border-l-4 border-brand pl-3 text-xl font-black leading-tight tracking-tight text-brand-dark sm:border-l-[5px] sm:pl-4 sm:text-2xl",
  h3: "mb-3 mt-8 text-lg font-black leading-snug text-brand-dark sm:text-xl",
  h4: "mb-2.5 mt-7 text-sm font-black uppercase tracking-widest text-brand",
  lista: "mb-6 space-y-2.5",
  itemUl:
    "texto-justo relative pl-7 before:absolute before:left-1.5 before:top-[0.8em] before:size-2 before:rounded-full before:bg-brand before:content-[''] sm:pl-8",
  itemOl:
    "texto-justo relative pl-8 [counter-increment:item] before:absolute before:left-0 before:top-[0.2em] before:grid before:size-6 before:place-items-center before:rounded-full before:bg-brand-mint before:text-xs before:font-extrabold before:leading-none before:text-brand-dark before:content-[counter(item)]",
  citacao:
    "relative my-8 rounded-r-card border-l-[5px] border-brand bg-brand-soft py-5 pl-12 pr-5 text-brand-dark before:absolute before:left-3 before:top-1 before:font-serif before:text-6xl before:leading-none before:text-brand/40 before:content-['“'] sm:pl-14",
  divisor: "my-8 h-6 border-0 text-center after:text-base after:tracking-[0.6em] after:text-brand-line after:content-['•_•_•']",
};

function renderizar(lista: Trecho[], chave: string): ReactNode {
  return lista.map((x, i) => {
    const k = `${chave}-${i}`;
    switch (x.t) {
      case "texto":
        return <Fragment key={k}>{x.v}</Fragment>;
      case "br":
        return <br key={k} />;
      case "negrito":
        return <strong key={k} className="font-extrabold text-ink">{renderizar(x.v, k)}</strong>;
      case "italico":
        return <em key={k}>{renderizar(x.v, k)}</em>;
      case "link":
        return (
          <a key={k} href={x.href} target="_blank" rel="noopener noreferrer nofollow" className={ESTILO.link}>
            {renderizar(x.v, k)}
          </a>
        );
    }
  });
}

export default function ConteudoNoticia({ texto, className }: { texto: string; className?: string }) {
  const lista = blocos(texto);

  return (
    <div className={cn("text-base leading-[1.75] text-zinc-800 sm:text-[1.08rem] sm:leading-[1.85] [&>*:first-child]:mt-0", className)} lang="pt-BR">
      {lista.map((b, i) => {
        const k = `b${i}`;
        switch (b.t) {
          case "titulo":
            // # e ## são subtítulos principais (h2); ### h3; #### h4. O h1 é o título da notícia
            if (b.nivel === 3) return <h3 key={k} className={ESTILO.h3}>{renderizar(b.v, k)}</h3>;
            if (b.nivel === 4) return <h4 key={k} className={ESTILO.h4}>{renderizar(b.v, k)}</h4>;
            return <h2 key={k} className={b.nivel === 1 ? ESTILO.h1 : ESTILO.h2}>{renderizar(b.v, k)}</h2>;
          case "lista": {
            const Tag = b.ordenada ? "ol" : "ul";
            return (
              <Tag key={k} className={ESTILO.lista}>
                {b.itens.map((it, j) => <li key={j} className={b.ordenada ? ESTILO.itemOl : ESTILO.itemUl}>{renderizar(it, `${k}-${j}`)}</li>)}
              </Tag>
            );
          }
          case "citacao":
            return <blockquote key={k} className={ESTILO.citacao}><p className="text-base font-semibold italic leading-relaxed sm:text-lg">{renderizar(b.v, k)}</p></blockquote>;
          case "divisor":
            return <hr key={k} className={ESTILO.divisor} />;
          default:
            return <p key={k} className={ESTILO.paragrafo}>{renderizar(b.v, k)}</p>;
        }
      })}
    </div>
  );
}
