/**
 * Ranking — lista com barras horizontais (gráfico simples, sem biblioteca).
 * Classes em src/components/admin/acessos/estilos.ts.
 */

import type { ItemRanking } from "@/types/acessos";
import * as E from "@/components/admin/acessos/estilos";

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
    <section className={E.BLOCO}>
      <h3>{titulo}</h3>
      {itens.length === 0 ? (
        <p className={E.VAZIO}>{vazio}</p>
      ) : (
        <ul className={E.RANKING}>
          {itens.map((i) => (
            <li key={i.nome + (i.regiao ?? "")}>
              <span className={E.RANKING_NOME} title={i.nome}>{i.nome}{i.regiao ? ` · ${i.regiao}` : ""}</span>
              <span className={E.RANKING_BARRA}><i style={{ width: `${(i.total / max) * 100}%` }} /></span>
              <b>{i.total}</b>
              {extra && <small>{extra(i)}</small>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
