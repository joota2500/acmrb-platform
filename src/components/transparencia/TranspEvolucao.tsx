"use client";

/**
 * Evolução mensal das pesagens (gráfico de barras em CSS, sem biblioteca).
 * Com ano selecionado: jan–dez daquele ano. Em "todos": últimos 12 meses
 * com registro. Alterna entre peso (kg) e valor (R$).
 */

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import Container from "@/components/ui/Container";
import TituloSecao from "@/components/home/TituloSecao";
import { MESES, fmtMoeda, fmtPeso } from "@/utils/formatosTransparencia";
import type { RegistroMaterial } from "@/hooks/useTransparencia";
import { cn } from "@/utils/cn";

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
    <section id="evolucao" className="scroll-mt-32 bg-surface-alt py-14 sm:py-20">
      <Container>
        <TituloSecao
          etiqueta="Evolução"
          icone={BarChart3}
          alinhamento="esquerda"
          className="mb-8 sm:mb-10"
          titulo={<>Pesagens <span>mês a mês</span></>}
          descricao="Acompanhe como o volume de materiais recuperados varia ao longo do tempo. O gráfico respeita os filtros de ano e material escolhidos acima."
        />

        <div className="rounded-card border border-black/5 bg-white p-4 shadow-card sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-control bg-zinc-100 p-1" role="tablist" aria-label="Medida do gráfico">
              {(["peso", "valor"] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={modo === m}
                  onClick={() => setModo(m)}
                  className={cn(
                    "cursor-pointer rounded-xl px-5 py-2 text-sm font-bold capitalize transition",
                    modo === m ? "bg-leaf text-white shadow-sm" : "text-ink-soft hover:text-ink",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            {melhor && max > 0 && (
              <span className="text-sm text-ink-soft">
                Maior mês: <strong className="capitalize text-leaf">{melhor.rotulo}</strong> ({fmt(valorDe(melhor))})
              </span>
            )}
          </div>

          {max === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-ink-muted">
              <BarChart3 size={28} aria-hidden="true" />
              <p>{modo === "valor" ? "Os valores por quilo ainda não foram informados para este período." : "Sem pesagens registradas neste período."}</p>
            </div>
          ) : (
            // no celular o gráfico rola para o lado, para as colunas não ficarem espremidas
            <div className="flex h-52 items-end gap-1.5 overflow-x-auto pb-1 sm:h-64 sm:gap-2.5" role="img" aria-label={`Gráfico de ${modo} por mês`}>
              {meses.map((m) => {
                const v = valorDe(m);
                const h = max > 0 ? Math.max(v > 0 ? 3 : 0, (v / max) * 100) : 0;
                return (
                  <div key={m.chave} className="group flex h-full min-w-10 flex-1 flex-col items-center sm:min-w-11" title={`${m.rotulo}: ${fmt(v)}`}>
                    <span className="min-h-4 whitespace-nowrap text-[0.6rem] font-bold text-emerald-800 sm:text-[0.68rem]">{v > 0 ? fmt(v) : ""}</span>
                    <div className="flex w-full max-w-12 flex-1 items-end rounded-xl bg-brand-soft">
                      <span
                        className="w-full rounded-xl bg-linear-to-t from-leaf to-leaf-bright transition-[height] duration-700 group-hover:from-emerald-600 group-hover:to-emerald-400 motion-reduce:transition-none"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="mt-1.5 whitespace-nowrap text-[0.68rem] font-semibold capitalize text-ink-muted sm:text-xs">{m.rotulo}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
