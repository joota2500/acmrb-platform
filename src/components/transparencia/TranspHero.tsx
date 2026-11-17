"use client";

/**
 * Topo da Central ESG • Transparência Pública.
 * Mostra breadcrumb, título, texto institucional, data real da última
 * atualização (registro de material ou indicador mais recente) e
 * período/observação pública quando cadastrados.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarRange, ChevronRight, Clock, RefreshCw, ShieldCheck } from "lucide-react";
import { fmtData } from "@/utils/formatosTransparencia";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { cn } from "@/utils/cn";

type Props = {
  atualizadoEm: string | null;
  periodo?: string;
  loading: boolean;
  onAtualizar: () => void;
};

export default function TranspHero({ atualizadoEm, periodo, loading, onAtualizar }: Props) {
  const reduzir = useReducedMotion();
  const data = fmtData(atualizadoEm);

  return (
    <section className="relative isolate overflow-hidden bg-emerald-950 pb-12 pt-24 sm:pb-16 sm:pt-28" aria-labelledby="tp-hero-titulo">
      {/* brilhos decorativos no fundo */}
      <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 -z-10 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 -z-10 size-80 rounded-full bg-sun/10 blur-3xl" />

      <Container>
        <nav aria-label="Você está em">
          <ol className="flex items-center gap-1.5 text-sm text-emerald-200">
            <li><Link href="/" className="hover:text-white hover:underline">Início</Link></li>
            <li aria-hidden="true"><ChevronRight size={14} /></li>
            <li aria-current="page" className="font-semibold text-white">Transparência</li>
          </ol>
        </nav>

        <motion.div
          className="mt-6 max-w-3xl"
          initial={reduzir ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-md">
            <ShieldCheck size={14} className="text-emerald-300" aria-hidden="true" /> Central ESG • Transparência Pública
          </span>

          <h1 id="tp-hero-titulo" className="mt-5 text-balance text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Cada quilo reciclado, <span className="text-emerald-300">prestado contas</span> à comunidade
          </h1>

          <p lang="pt-BR" className="mt-5 text-pretty text-base leading-relaxed text-emerald-100 sm:text-lg">
            Esta central reúne os indicadores ambientais, operacionais e sociais da Associação de
            Catadores de Materiais Recicláveis de Baturité. Os números de materiais são calculados a
            partir de cada pesagem registrada pela equipe, e os demais indicadores são informados e
            revisados pela administração da associação.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-control bg-white/10 px-3.5 py-2 text-sm text-emerald-50">
              <Clock size={15} aria-hidden="true" />
              {loading ? "Carregando dados…" : data ? `Dados atualizados em ${data}` : "Ainda sem registros publicados"}
            </span>
            {periodo && (
              <span className="inline-flex items-center gap-2 rounded-control bg-brand-mint px-3.5 py-2 text-sm font-semibold text-brand-dark">
                <CalendarRange size={15} aria-hidden="true" /> Período: {periodo}
              </span>
            )}
            <Button type="button" variante="contornoClaro" tamanho="pequeno" onClick={onAtualizar} disabled={loading}>
              <RefreshCw size={15} className={cn(loading && "animate-spin")} aria-hidden="true" /> Atualizar
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
