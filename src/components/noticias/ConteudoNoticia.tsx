/**
 * ConteudoNoticia — mostra o texto da notícia já formatado
 * ------------------------------------------------------------
 * Usa o interpretador de src/lib/markdownNoticia.ts: o texto vira
 * elementos React (sem dangerouslySetInnerHTML), então não há risco de
 * script injetado e nenhum "#", "**" ou "-" cru aparece na leitura.
 * Usado na página pública e na pré-visualização do editor.
 * CSS: src/styles/noticia-conteudo.css (prefixo "nc").
 */

import { Fragment, type ReactNode } from "react";
import { blocos, type Trecho } from "@/lib/markdownNoticia";

import "@/styles/noticia-conteudo.css";

function renderizar(lista: Trecho[], chave: string): ReactNode {
  return lista.map((x, i) => {
    const k = `${chave}-${i}`;
    switch (x.t) {
      case "texto":
        return <Fragment key={k}>{x.v}</Fragment>;
      case "br":
        return <br key={k} />;
      case "negrito":
        return <strong key={k}>{renderizar(x.v, k)}</strong>;
      case "italico":
        return <em key={k}>{renderizar(x.v, k)}</em>;
      case "link":
        return (
          <a key={k} href={x.href} target="_blank" rel="noopener noreferrer nofollow">
            {renderizar(x.v, k)}
          </a>
        );
    }
  });
}

export default function ConteudoNoticia({ texto, className }: { texto: string; className?: string }) {
  const lista = blocos(texto);

  return (
    <div className={`nc ${className ?? ""}`} lang="pt-BR">
      {lista.map((b, i) => {
        const k = `b${i}`;
        switch (b.t) {
          case "titulo":
            // # e ## são subtítulos principais (h2); ### h3; #### h4. O h1 é o título da notícia
            if (b.nivel === 3) return <h3 key={k} className="nc__h3">{renderizar(b.v, k)}</h3>;
            if (b.nivel === 4) return <h4 key={k} className="nc__h4">{renderizar(b.v, k)}</h4>;
            return <h2 key={k} className={b.nivel === 1 ? "nc__h1" : "nc__h2"}>{renderizar(b.v, k)}</h2>;
          case "lista": {
            const Tag = b.ordenada ? "ol" : "ul";
            return (
              <Tag key={k} className={b.ordenada ? "nc__ol" : "nc__ul"}>
                {b.itens.map((it, j) => <li key={j}>{renderizar(it, `${k}-${j}`)}</li>)}
              </Tag>
            );
          }
          case "citacao":
            return <blockquote key={k} className="nc__citacao"><p>{renderizar(b.v, k)}</p></blockquote>;
          case "divisor":
            return <hr key={k} className="nc__divisor" />;
          default:
            return <p key={k}>{renderizar(b.v, k)}</p>;
        }
      })}
    </div>
  );
}
