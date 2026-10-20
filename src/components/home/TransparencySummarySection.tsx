"use client";

/**
 * ============================================================
 * TRANSPARÊNCIA EM NÚMEROS (home)
 * ============================================================
 * Substitui, na home, as antigas StatsSection (CTA "Central de
 * Transparência") e ESGMetrics ("Dashboard ESG ao vivo"), que
 * continuam no projeto mas não são mais usadas.
 *
 * Mostra um resumo dos 4 indicadores principais com dados reais do
 * Supabase (useESGMetrics), contagem animada, barra de meta e a data
 * da última atualização. Indicador zerado aparece como "Em apuração"
 * (nunca mostramos 0 como se fosse resultado). Todo o detalhamento
 * fica na página /transparencia.
 * ============================================================
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Cloud,
  Recycle,
  RefreshCw,
  Trees,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useESGMetrics } from "@/hooks/useESGMetrics";
import "@/styles/transparency-summary.css";

type Indicador = {
  titulo: string;
  valor: number;
  meta: number;
  unidade: "kg" | "un";
  sufixo?: string;
  descricao: string;
  icone: LucideIcon;
  tom: "emerald" | "sky" | "violet" | "green";
};

/** Formata peso: até 999 kg em kg, acima disso em toneladas. */
function formatarPeso(kg: number) {
  if (kg >= 1000)
    return `${(kg / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} t`;
  return `${Math.round(kg).toLocaleString("pt-BR")} kg`;
}

function formatar(valor: number, unidade: Indicador["unidade"], sufixo = "") {
  return unidade === "kg"
    ? formatarPeso(valor)
    : `${Math.round(valor).toLocaleString("pt-BR")}${sufixo}`;
}

/** Número que conta do 0 até o valor quando entra na tela. */
function Contador({ ind }: { ind: Indicador }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visivel = useInView(ref, { once: true });
  const reduzir = useReducedMotion();
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (!visivel) return;
    if (reduzir) {
      setAtual(ind.valor);
      return;
    }
    const c = animate(0, ind.valor, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: setAtual,
    });
    return () => c.stop();
  }, [visivel, reduzir, ind.valor]);

  return <span ref={ref}>{formatar(atual, ind.unidade, ind.sufixo)}</span>;
}

export default function TransparencySummarySection() {
  const m = useESGMetrics();
  const reduzir = useReducedMotion();

  const indicadores: Indicador[] = [
    {
      titulo: "Resíduos coletados",
      valor: m.totalPeso,
      meta: m.metas.residuos,
      unidade: "kg",
      descricao: "Soma de todas as pesagens registradas pela associação.",
      icone: Recycle,
      tom: "emerald",
    },
    {
      titulo: "CO₂ evitado",
      valor: m.co2,
      meta: m.metas.co2,
      unidade: "kg",
      descricao: "Emissões que deixaram de ir para a atmosfera com a reciclagem.",
      icone: Cloud,
      tom: "sky",
    },
    {
      titulo: "Famílias impactadas",
      valor: m.familiasImpactadas,
      meta: m.metas.familias,
      unidade: "un",
      sufixo: "+",
      descricao: "Famílias com renda ligada ao trabalho da coleta seletiva.",
      icone: Users,
      tom: "violet",
    },
    {
      titulo: "Árvores preservadas",
      valor: m.arvores,
      meta: m.metas.arvores,
      unidade: "un",
      descricao: "Equivalente ambiental informado nos relatórios da associação.",
      icone: Trees,
      tom: "green",
    },
  ];

  const dataAtualizacao = m.atualizadoEm
    ? new Date(m.atualizadoEm).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const semDados = !m.loading && !m.erro && indicadores.every((i) => i.valor <= 0);

  const entrada = (atraso = 0) =>
    reduzir
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay: atraso },
        };

  return (
    <section id="transparencia" className="tsum" lang="pt-BR" aria-labelledby="tsum-titulo">
      <div className="tsum__container">
        {/* ---------- Cabeçalho ---------- */}
        <motion.div className="tsum__header" {...entrada()}>
          <span className="tsum__tag">
            <BarChart3 size={16} aria-hidden /> Transparência em números
          </span>
          <h2 id="tsum-titulo" className="tsum__title">
            Resultados reais, <span>abertos a todos</span>
          </h2>
          <p className="tsum__description">
            Cada quilo pesado na associação é registrado e soma nos indicadores
            abaixo. Os números são públicos e atualizados conforme novas pesagens
            e relatórios são lançados pela equipe da ACMRB.
          </p>
        </motion.div>

        {/* ---------- Estados ---------- */}
        {m.erro && (
          <div className="tsum__aviso" role="alert">
            <p>{m.erro} Tente novamente em instantes.</p>
            <button type="button" onClick={() => m.atualizar()} className="tsum__retry">
              <RefreshCw size={16} aria-hidden /> Tentar de novo
            </button>
          </div>
        )}

        {semDados && (
          <div className="tsum__aviso tsum__aviso--neutro">
            <p>Os primeiros indicadores estão sendo apurados e aparecerão aqui em breve.</p>
          </div>
        )}

        {/* ---------- Indicadores ---------- */}
        <div className="tsum__grid" aria-busy={m.loading}>
          {indicadores.map((ind, i) => {
            const Icone = ind.icone;
            const apurando = ind.valor <= 0;
            const pct = apurando ? 0 : Math.min((ind.valor / ind.meta) * 100, 100);
            return (
              <motion.article key={ind.titulo} className={`tsum__card tsum__card--${ind.tom}`} {...entrada(i * 0.08)}>
                <div className="tsum__card-top">
                  <span className="tsum__icon" aria-hidden>
                    <Icone size={22} />
                  </span>
                  <h3 className="tsum__label">{ind.titulo}</h3>
                </div>

                <div className="tsum__value">
                  {m.loading ? (
                    <span className="tsum__skeleton" aria-label="Carregando" />
                  ) : apurando ? (
                    <span className="tsum__apurando">Em apuração</span>
                  ) : (
                    <Contador ind={ind} />
                  )}
                </div>

                <p className="tsum__desc">{ind.descricao}</p>

                <div className="tsum__meta">
                  <div className="tsum__meta-info">
                    <span>Meta: {formatar(ind.meta, ind.unidade)}</span>
                    <strong>{m.loading || apurando ? "—" : `${pct.toFixed(0)}%`}</strong>
                  </div>
                  <div
                    className="tsum__track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(pct)}
                    aria-label={`Progresso da meta de ${ind.titulo.toLowerCase()}`}
                  >
                    <motion.div
                      className="tsum__bar"
                      initial={{ width: reduzir ? `${pct}%` : 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: reduzir ? 0 : 1.1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ---------- Chamada para a página de transparência ---------- */}
        <motion.div className="tsum__cta" {...entrada(0.2)}>
          <div className="tsum__cta-text">
            <h3>Veja o detalhamento completo</h3>
            <p>
              Na página de transparência você encontra os materiais por tipo, as
              metas, os demais indicadores sociais e ambientais e as notícias de
              prestação de contas da associação.
            </p>
            <small className="tsum__updated">
              {dataAtualizacao
                ? `Última atualização: ${dataAtualizacao}`
                : m.loading
                  ? "Carregando dados…"
                  : "Dados conforme os registros da associação"}
            </small>
          </div>
          <div className="tsum__cta-buttons">
            <Link href="/transparencia" className="tsum__btn tsum__btn--primary">
              Ver transparência completa <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/projetos" className="tsum__btn tsum__btn--secondary">
              Conhecer projetos
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
