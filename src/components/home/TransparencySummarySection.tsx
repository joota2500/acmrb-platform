"use client";

/**
 * TransparencySummarySection — "Transparência em números" (página inicial)
 * ------------------------------------------------------------
 * O que mostra: 4 indicadores (resíduos, CO₂, famílias e árvores) com
 * número animado, descrição e barra de progresso até a meta, em uma seção
 * verde escura, e uma chamada para a página /transparencia.
 *
 * De onde vêm os dados: hook useESGMetrics (Supabase).
 *  - valor: o que já foi registrado; meta: metas do admin (ou padrão do hook).
 *  - Se o valor for 0, o card mostra "Em apuração" (sem inventar número).
 *  - Se o banco der erro, aparece um aviso com o botão "Tentar de novo".
 *
 * Responsivo: 1 coluna (celular), 2 (tablet) e 4 (desktop).
 */

import { motion, useReducedMotion } from "framer-motion";
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

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Contador from "@/components/ui/Contador";
import { useAparecer } from "@/hooks/useAparecer";
import { useESGMetrics } from "@/hooks/useESGMetrics";
import { formatarPeso } from "@/utils/formatadores";
import TituloSecao from "./TituloSecao";

type Indicador = {
  titulo: string;
  valor: number;
  meta: number;
  unidade: "kg" | "un";
  sufixo?: string;
  descricao: string;
  icone: LucideIcon;
  /** classes do quadradinho do ícone (cada indicador com uma cor) */
  corIcone: string;
};

/** Formata o valor: peso vira kg/t; contagem vira número com separador */
function formatar(valor: number, unidade: Indicador["unidade"], sufixo = "") {
  return unidade === "kg" ? formatarPeso(valor) : `${Math.round(valor).toLocaleString("pt-BR")}${sufixo}`;
}

export default function TransparencySummarySection() {
  const m = useESGMetrics();
  const reduzir = useReducedMotion();
  const aparecer = useAparecer();

  const indicadores: Indicador[] = [
    {
      titulo: "Resíduos coletados",
      valor: m.totalPeso,
      meta: m.metas.residuos,
      unidade: "kg",
      descricao: "Soma de todas as pesagens registradas pela associação.",
      icone: Recycle,
      corIcone: "bg-emerald-500/20 text-emerald-300",
    },
    {
      titulo: "CO₂ evitado",
      valor: m.co2,
      meta: m.metas.co2,
      unidade: "kg",
      descricao: "Emissões que deixaram de ir para a atmosfera com a reciclagem.",
      icone: Cloud,
      corIcone: "bg-sky-400/20 text-sky-300",
    },
    {
      titulo: "Famílias impactadas",
      valor: m.familiasImpactadas,
      meta: m.metas.familias,
      unidade: "un",
      sufixo: "+",
      descricao: "Famílias com renda ligada ao trabalho da coleta seletiva.",
      icone: Users,
      corIcone: "bg-violet-400/20 text-violet-300",
    },
    {
      titulo: "Árvores preservadas",
      valor: m.arvores,
      meta: m.metas.arvores,
      unidade: "un",
      descricao: "Equivalente ambiental informado nos relatórios da associação.",
      icone: Trees,
      corIcone: "bg-lime-400/20 text-lime-300",
    },
  ];

  // "17 de novembro de 2026" (data da última atualização das métricas)
  const dataAtualizacao = m.atualizadoEm
    ? new Date(m.atualizadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  // Nenhum indicador com valor: mostra o aviso de "em apuração"
  const semDados = !m.loading && !m.erro && indicadores.every((i) => i.valor <= 0);

  return (
    <section
      id="transparencia"
      lang="pt-BR"
      aria-labelledby="tsum-titulo"
      className="relative isolate overflow-hidden bg-emerald-950 py-16 sm:py-20 lg:py-24"
    >
      {/* brilhos decorativos no fundo */}
      <span aria-hidden="true" className="pointer-events-none absolute -left-32 top-0 -z-10 size-96 rounded-full bg-emerald-500/15 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 -z-10 size-96 rounded-full bg-sun/10 blur-3xl" />

      <Container>
        <motion.div {...aparecer()}>
          <TituloSecao
            id="tsum-titulo"
            escuro
            icone={BarChart3}
            etiqueta="Transparência em números"
            titulo={
              <>
                Resultados reais, <span>abertos a todos</span>
              </>
            }
            descricao="Cada quilo pesado na associação é registrado e soma nos indicadores abaixo. Os números são públicos e atualizados conforme novas pesagens e relatórios são lançados pela equipe da ACMRB."
          />
        </motion.div>

        {/* ---------- Avisos de erro / sem dados ---------- */}
        {m.erro && (
          <div role="alert" className="mx-auto mb-8 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-red-300/30 bg-red-500/10 p-5 text-center text-red-100">
            <p>{m.erro} Tente novamente em instantes.</p>
            <Button type="button" variante="claro" tamanho="pequeno" onClick={() => m.atualizar()}>
              <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
            </Button>
          </div>
        )}
        {semDados && (
          <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-white/15 bg-white/5 p-5 text-center text-emerald-100">
            <p>Os primeiros indicadores estão sendo apurados e aparecerão aqui em breve.</p>
          </div>
        )}

        {/* ---------- Indicadores ---------- */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy={m.loading}>
          {indicadores.map((ind, i) => {
            const Icone = ind.icone;
            const apurando = ind.valor <= 0;
            // porcentagem da meta (no máximo 100%)
            const pct = apurando ? 0 : Math.min((ind.valor / ind.meta) * 100, 100);

            return (
              <motion.article
                key={ind.titulo}
                {...aparecer(i * 0.08)}
                className="rounded-card border border-white/10 bg-white/6 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className={`grid size-11 place-items-center rounded-xl ${ind.corIcone}`} aria-hidden="true">
                    <Icone size={22} />
                  </span>
                  <h3 className="font-bold text-emerald-50">{ind.titulo}</h3>
                </div>

                <p className="mt-5 min-h-12 text-4xl font-black tracking-tight text-white">
                  {m.loading ? (
                    <span className="block h-9 w-28 animate-pulse rounded-lg bg-white/15" aria-label="Carregando" />
                  ) : apurando ? (
                    <span className="text-lg font-bold text-emerald-300">Em apuração</span>
                  ) : (
                    <Contador valor={ind.valor} formatar={(n) => formatar(n, ind.unidade, ind.sufixo)} />
                  )}
                </p>

                <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">{ind.descricao}</p>

                {/* Progresso até a meta */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-emerald-100/80">
                    <span>Meta: {formatar(ind.meta, ind.unidade)}</span>
                    <strong className="text-emerald-300">{m.loading || apurando ? "—" : `${pct.toFixed(0)}%`}</strong>
                  </div>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(pct)}
                    aria-label={`Progresso da meta de ${ind.titulo.toLowerCase()}`}
                  >
                    <motion.div
                      className="h-full rounded-full bg-linear-to-r from-emerald-400 to-sun"
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
        <motion.div
          {...aparecer(0.2)}
          className="mt-10 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="max-w-2xl">
            <h3 className="text-2xl font-black text-white">Veja o detalhamento completo</h3>
            <p className="mt-2 leading-relaxed text-emerald-100/90">
              Na página de transparência você encontra os materiais por tipo, as metas, os demais indicadores sociais e
              ambientais e as notícias de prestação de contas da associação.
            </p>
            <small className="mt-3 block text-xs font-semibold text-emerald-300">
              {dataAtualizacao
                ? `Última atualização: ${dataAtualizacao}`
                : m.loading
                  ? "Carregando dados…"
                  : "Dados conforme os registros da associação"}
            </small>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
            <Button href="/transparencia" variante="claro" tamanho="grande">
              Ver transparência completa <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <Button href="/projetos" variante="contornoClaro" tamanho="grande">
              Conhecer projetos
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
