/**
 * ConteudoNoticia — mostra o texto da notícia com formatação simples
 * ------------------------------------------------------------
 * Sem HTML cru (nada de dangerouslySetInnerHTML): o texto vira
 * elementos React, então não há risco de script injetado.
 * Formatação aceita (escrita no painel):
 *   linha em branco  → novo parágrafo
 *   ## Título        → subtítulo      ### Título → subtítulo menor
 *   - item           → lista
 *   > frase          → citação
 *   **negrito**      e [texto](https://link)
 * Tags HTML antigas (<p>, <br>) são convertidas em quebras de linha.
 */

import { Fragment, type ReactNode } from "react";

function inline(texto: string, chave: string): ReactNode[] {
  const partes = texto.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g);
  return partes.map((p, i) => {
    const k = `${chave}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={k}>{p.slice(2, -2)}</strong>;
    const link = p.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link) {
      return (
        <a key={k} href={link[2]} target="_blank" rel="noopener noreferrer nofollow">
          {link[1]}
        </a>
      );
    }
    // quebras simples dentro do parágrafo
    const linhas = p.split("\n");
    return (
      <Fragment key={k}>
        {linhas.map((l, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {l}
          </Fragment>
        ))}
      </Fragment>
    );
  });
}

function limparHtml(texto: string): string {
  return texto
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

export default function ConteudoNoticia({ texto, className }: { texto: string; className?: string }) {
  const blocos = limparHtml(texto).split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className={className} lang="pt-BR">
      {blocos.map((b, i) => {
        const k = `b${i}`;
        if (b.startsWith("### ")) return <h3 key={k}>{b.slice(4)}</h3>;
        if (b.startsWith("## ")) return <h2 key={k}>{b.slice(3)}</h2>;
        const linhas = b.split("\n");
        if (linhas.every((l) => /^\s*[-•]\s+/.test(l))) {
          return (
            <ul key={k}>
              {linhas.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-•]\s+/, ""), `${k}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (linhas.every((l) => l.startsWith(">"))) {
          return (
            <blockquote key={k}>
              <p>{inline(linhas.map((l) => l.replace(/^>\s?/, "")).join("\n"), k)}</p>
            </blockquote>
          );
        }
        return <p key={k}>{inline(b, k)}</p>;
      })}
    </div>
  );
}
