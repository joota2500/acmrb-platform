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
  Cloud, Droplets, Factory, Landmark, MapPin, Recycle, Trees, Truck, Users, Zap,
  type LucideIcon,
} from "lucide-react";
import Contador from "./Contador";
import TranspSecaoTitulo from "./TranspSecaoTitulo";
import { fmtNum, fmtPeso } from "./formatos";
import { num, type Metas } from "@/hooks/useTransparencia";
import "@/styles/transp-indicadores.css";

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
  const reduzir = useReducedMotion();
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
    <section id="indicadores" className="tp-secao">
      <div className="tp-container">
        <TranspSecaoTitulo
          tag="Indicadores ESG"
          titulo="Resultados ambientais da associação"
          texto="Cada indicador mostra o valor atual e o avanço em relação à meta pública definida pela ACMRB. Quando um dado ainda está sendo levantado, ele aparece como “Em apuração”."
        />

        <div className="ti-grade">
          {principais.map((p, i) => {
            const pct = p.meta > 0 ? Math.min(100, (p.valor / p.meta) * 100) : 0;
            const Icone = p.icone;
            return (
              <motion.article
                key={p.titulo}
                className={`ti-card ti-card--${p.tom}`}
                initial={reduzir ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <div className="ti-card__icone"><Icone size={22} aria-hidden /></div>
                <h3 className="ti-card__titulo">{p.titulo}</h3>
                <strong className="ti-card__valor">
                  {p.valor > 0 ? <Contador valor={p.valor} formatar={p.formatar} /> : <span className="ti-apuracao">Em apuração</span>}
                </strong>
                <p className="ti-card__desc">{p.descricao}</p>
                {p.valor > 0 && (
                  <div className="ti-meta">
                    <div className="ti-meta__topo">
                      <span>Meta: {p.formatar(p.meta)}</span>
                      <span>{fmtNum(pct, 0)}%</span>
                    </div>
                    <div className="ti-meta__barra" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso da meta de ${p.titulo}`}>
                      <motion.span
                        initial={reduzir ? false : { width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                        style={reduzir ? { width: `${pct}%` } : undefined}
                      />
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>

        {extras.length > 0 && (
          <div className="ti-extras">
            {extras.map((e) => {
              const Icone = e.icone;
              return (
                <div key={e.titulo} className="ti-extra">
                  <Icone size={18} aria-hidden />
                  <div>
                    <strong><Contador valor={e.valor} formatar={(n) => `${fmtNum(Math.round(n))}${e.un ? ` ${e.un}` : ""}`} /></strong>
                    <span>{e.titulo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {observacao && (
          <aside className="ti-nota">
            <strong>Nota da associação</strong>
            <p>{observacao}</p>
          </aside>
        )}
      </div>
    </section>
  );
}
