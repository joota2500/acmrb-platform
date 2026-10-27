/**
 * Ranking — lista com barras horizontais (gráfico simples, sem biblioteca).
 * Estilos em src/styles/admin-acessos.css (prefixo "aac-").
 */

import type { ItemRanking } from "./tipos";

interface Props {
  titulo: string;
  itens: ItemRanking[];
  vazio?: string;
  /** Texto extra à direita do total (ex.: tempo médio) */
  extra?: (i: ItemRanking) => string | null;
}

export default function Ranking({ titulo, itens, vazio = "Sem dados no período.", extra }: Props) {
  const max = Math.max(1, ...itens.map((i) => i.total));
  return (
    <section className="aac-bloco">
      <h3>{titulo}</h3>
      {itens.length === 0 ? (
        <p className="aac-vazio">{vazio}</p>
      ) : (
        <ul className="aac-ranking">
          {itens.map((i) => (
            <li key={i.nome + (i.regiao ?? "")}>
              <span className="aac-ranking__nome" title={i.nome}>{i.nome}{i.regiao ? ` · ${i.regiao}` : ""}</span>
              <span className="aac-ranking__barra"><i style={{ width: `${(i.total / max) * 100}%` }} /></span>
              <b>{i.total}</b>
              {extra && <small>{extra(i)}</small>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
