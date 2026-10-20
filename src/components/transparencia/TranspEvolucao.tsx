"use client";

/**
 * Evolução mensal das pesagens (gráfico de barras em CSS, sem biblioteca).
 * Com ano selecionado: jan–dez daquele ano. Em "todos": últimos 12 meses
 * com registro. Alterna entre peso (kg) e valor (R$).
 */

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import TranspSecaoTitulo from "./TranspSecaoTitulo";
import { MESES, fmtMoeda, fmtPeso } from "./formatos";
import type { RegistroMaterial } from "@/hooks/useTransparencia";
import "@/styles/transp-evolucao.css";

type Props = { registros: RegistroMaterial[]; ano: string };
type Mes = { chave: string; rotulo: string; peso: number; valor: number };

export default function TranspEvolucao({ registros, ano }: Props) {
  const [modo, setModo] = useState<"peso" | "valor">("peso");

  const meses = useMemo<Mes[]>(() => {
    const mapa = new Map<string, Mes>();
    if (ano !== "todos") {
      MESES.forEach((m, i) => {
        const chave = `${ano}-${String(i + 1).padStart(2, "0")}`;
        mapa.set(chave, { chave, rotulo: m, peso: 0, valor: 0 });
      });
    }
    for (const r of registros) {
      if (!r.data) continue;
      const d = new Date(r.data);
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const atual = mapa.get(chave) ?? { chave, rotulo: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, peso: 0, valor: 0 };
      atual.peso += r.peso;
      atual.valor += r.subtotal;
      mapa.set(chave, atual);
    }
    const lista = [...mapa.values()].sort((a, b) => a.chave.localeCompare(b.chave));
    return ano === "todos" ? lista.slice(-12) : lista;
  }, [registros, ano]);

  const valorDe = (m: Mes) => (modo === "peso" ? m.peso : m.valor);
  const max = Math.max(0, ...meses.map(valorDe));
  const fmt = modo === "peso" ? fmtPeso : fmtMoeda;
  const melhor = meses.reduce<Mes | null>((a, m) => (!a || valorDe(m) > valorDe(a) ? m : a), null);

  return (
    <section id="evolucao" className="tp-secao">
      <div className="tp-container">
        <TranspSecaoTitulo
          tag="Evolução"
          titulo="Pesagens mês a mês"
          texto="Acompanhe como o volume de materiais recuperados varia ao longo do tempo. O gráfico respeita os filtros de ano e material escolhidos acima."
        />

        <div className="te-card">
          <div className="te-topo">
            <div className="te-alternar" role="tablist" aria-label="Medida do gráfico">
              <button role="tab" aria-selected={modo === "peso"} className={modo === "peso" ? "is-ativo" : ""} onClick={() => setModo("peso")}>Peso</button>
              <button role="tab" aria-selected={modo === "valor"} className={modo === "valor" ? "is-ativo" : ""} onClick={() => setModo("valor")}>Valor</button>
            </div>
            {melhor && max > 0 && (
              <span className="te-destaque">Maior mês: <strong>{melhor.rotulo}</strong> ({fmt(valorDe(melhor))})</span>
            )}
          </div>

          {max === 0 ? (
            <div className="te-vazio">
              <BarChart3 size={28} aria-hidden />
              <p>{modo === "valor" ? "Os valores por quilo ainda não foram informados para este período." : "Sem pesagens registradas neste período."}</p>
            </div>
          ) : (
            <div className="te-grafico" role="img" aria-label={`Gráfico de ${modo} por mês`}>
              {meses.map((m) => {
                const v = valorDe(m);
                const h = max > 0 ? Math.max(v > 0 ? 3 : 0, (v / max) * 100) : 0;
                return (
                  <div key={m.chave} className="te-coluna" title={`${m.rotulo}: ${fmt(v)}`}>
                    <span className="te-coluna__valor">{v > 0 ? fmt(v) : ""}</span>
                    <div className="te-coluna__trilho">
                      <span className="te-coluna__barra" style={{ height: `${h}%` }} />
                    </div>
                    <span className="te-coluna__rotulo">{m.rotulo}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
