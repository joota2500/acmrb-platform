"use client";

/**
 * Indicadores principais (com meta) + indicadores complementares.
 *  - Resíduos: soma real das pesagens (materiais_registros).
 *  - CO₂, famílias, árvores e complementares: dashboard_metricas,
 *    preenchidos manualmente pelo ADM DEUS. Zero = "Em apuração"
 *    (principais) ou oculto (complementares). Nada é estimado aqui.
 */

import { motion, useReducedMotion } from "framer-motion";
import {
  Cloud, Droplets, Factory, Landmark, Leaf, MapPin, Recycle, Trees, Truck, Users, Zap,
  type LucideIcon,
} from "lucide-react";
import Contador from "@/components/ui/Contador";
import Container from "@/components/ui/Container";
import TituloSecao from "@/components/home/TituloSecao";
import { useAparecer } from "@/hooks/useAparecer";
import { fmtNum, fmtPeso } from "@/utils/formatosTransparencia";
import { num, type Metas } from "@/hooks/useTransparencia";

/* Cor de cada cartão principal: faixa do topo, ícone e barra da meta */
const TONS: Record<string, { faixa: string; icone: string; barra: string }> = {
  verde: { faixa: "bg-emerald-600", icone: "bg-emerald-100 text-emerald-700", barra: "bg-emerald-600" },
  ceu: { faixa: "bg-sky-600", icone: "bg-sky-100 text-sky-700", barra: "bg-sky-600" },
  violeta: { faixa: "bg-violet-600", icone: "bg-violet-100 text-violet-700", barra: "bg-violet-600" },
  folha: { faixa: "bg-green-600", icone: "bg-green-100 text-green-700", barra: "bg-green-600" },
};

type Props = {
  totalPeso: number;
  metricas: Record<string, unknown> | null;
  metas: Metas;
};

type Principal = {
  titulo: string; valor: number; meta: number; formatar: (n: number) => string;
  descricao: string; icone: LucideIcon; tom: string;
};

export default function TranspIndicadores({ totalPeso, metricas, metas }: Props) {
  const aparecer = useAparecer();
  const reduzirBarra = useReducedMotion();
  const m = (k: string) => num(metricas?.[k]);

  const principais: Principal[] = [
    { titulo: "Resíduos recuperados", valor: totalPeso, meta: metas.residuos, formatar: fmtPeso,
      descricao: "Soma de todas as pesagens registradas pela equipe.", icone: Recycle, tom: "verde" },
    { titulo: "CO₂ evitado", valor: m("co2_evitado"), meta: metas.co2, formatar: (n) => fmtPeso(n),
      descricao: "Emissões evitadas com a reciclagem, informadas pela associação.", icone: Cloud, tom: "ceu" },
    { titulo: "Famílias impactadas", valor: m("familias_impactadas"), meta: metas.familias,
      formatar: (n) => fmtNum(Math.round(n)), descricao: "Famílias com renda ligada à coleta seletiva.",
      icone: Users, tom: "violeta" },
    { titulo: "Árvores preservadas", valor: m("arvores_preservadas"), meta: metas.arvores,
      formatar: (n) => fmtNum(Math.round(n)), descricao: "Equivalente ambiental do papel reciclado.",
      icone: Trees, tom: "folha" },
  ];

  const extras = [
    { titulo: "Água economizada", valor: m("agua_economizada"), un: "litros", icone: Droplets },
    { titulo: "Energia economizada", valor: m("energia_economizada"), un: "kWh", icone: Zap },
    { titulo: "Desviado do aterro", valor: m("residuos_desviados_aterro"), un: "kg", icone: Landmark },
    { titulo: "Coletas realizadas", valor: m("coletas_realizadas"), un: "", icone: Truck },
    { titulo: "Bairros atendidos", valor: m("bairros_atendidos"), un: "", icone: MapPin },
    { titulo: "Pontos de coleta", valor: m("pontos_coleta"), un: "", icone: MapPin },
    { titulo: "Empresas parceiras", valor: m("empresas_parceiras"), un: "", icone: Factory },
  ].filter((e) => e.valor > 0);

  const observacao = typeof metricas?.observacao_publica === "string" ? metricas.observacao_publica.trim() : "";

  return (
    <section id="indicadores" className="scroll-mt-32 bg-surface-alt py-14 sm:py-20">
      <Container>
        <TituloSecao
          etiqueta="Indicadores ESG"
          icone={Leaf}
          alinhamento="esquerda"
          className="mb-8 sm:mb-10"
          titulo={<>Resultados <span>ambientais</span> da associação</>}
          descricao="Cada indicador mostra o valor atual e o avanço em relação à meta pública definida pela ACMRB. Quando um dado ainda está sendo levantado, ele aparece como “Em apuração”."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {principais.map((p, i) => {
            const pct = p.meta > 0 ? Math.min(100, (p.valor / p.meta) * 100) : 0;
            const Icone = p.icone;
            const tom = TONS[p.tom];
            return (
              <motion.article
                key={p.titulo}
                {...aparecer(i * 0.08)}
                className="relative flex flex-col overflow-hidden rounded-card border border-black/5 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${tom.faixa}`} />
                <div className={`grid size-11 place-items-center rounded-2xl ${tom.icone}`}><Icone size={22} aria-hidden="true" /></div>
                <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-muted">{p.titulo}</h3>
                <strong className="mt-1 text-3xl font-black leading-tight tabular-nums text-ink sm:text-[2rem]">
                  {p.valor > 0 ? <Contador valor={p.valor} formatar={p.formatar} /> : <span className="inline-block py-1 text-lg font-bold text-zinc-400">Em apuração</span>}
                </strong>
                <p lang="pt-BR" className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{p.descricao}</p>
                {p.valor > 0 && (
                  <div className="mt-5">
                    <div className="mb-1.5 flex justify-between text-xs font-semibold text-ink-muted">
                      <span>Meta: {p.formatar(p.meta)}</span>
                      <span>{fmtNum(pct, 0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso da meta de ${p.titulo}`}>
                      <motion.span
                        className={`block h-full rounded-full ${tom.barra}`}
                        {...(reduzirBarra ? { style: { width: `${pct}%` } } : {
                          initial: { width: 0 },
                          whileInView: { width: `${pct}%` },
                          viewport: { once: true },
                          transition: { duration: 1.1, ease: "easeOut" },
                        })}
                      />
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>

        {extras.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {extras.map((e) => {
              const Icone = e.icone;
              return (
                <div key={e.titulo} className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-soft px-4 py-3.5 text-leaf">
                  <Icone size={20} className="shrink-0" aria-hidden="true" />
                  <div className="flex min-w-0 flex-col">
                    <strong className="text-lg font-extrabold tabular-nums text-brand-dark"><Contador valor={e.valor} formatar={(n) => `${fmtNum(Math.round(n))}${e.un ? ` ${e.un}` : ""}`} /></strong>
                    <span className="text-xs text-ink-soft">{e.titulo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {observacao && (
          <aside className="mt-6 rounded-r-2xl border-l-4 border-leaf bg-brand-soft px-5 py-4">
            <strong className="text-sm font-extrabold text-brand-dark">Nota da associação</strong>
            <p lang="pt-BR" className="mt-1 text-sm leading-relaxed text-ink-soft">{observacao}</p>
          </aside>
        )}
      </Container>
    </section>
  );
}
