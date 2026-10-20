"use client";

/**
 * Cabeçalho da Central ESG • Transparência Pública.
 * Mostra breadcrumb, título, texto institucional, data real da última
 * atualização (registro de material ou indicador mais recente) e
 * período/observação pública quando cadastrados.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Clock, RefreshCw, ShieldCheck } from "lucide-react";
import { fmtData } from "./formatos";

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
    <section className="tp-hero" aria-labelledby="tp-hero-titulo">
      <div className="tp-container">
        <nav className="tp-breadcrumb" aria-label="Você está em">
          <Link href="/">Início</Link>
          <ChevronRight size={14} aria-hidden />
          <span aria-current="page">Transparência</span>
        </nav>

        <motion.div
          initial={reduzir ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="tp-hero__tag">
            <ShieldCheck size={15} aria-hidden /> Central ESG • Transparência Pública
          </span>

          <h1 id="tp-hero-titulo" className="tp-hero__titulo">
            Cada quilo reciclado, <span>prestado contas</span> à comunidade
          </h1>

          <p className="tp-hero__texto">
            Esta central reúne os indicadores ambientais, operacionais e sociais da Associação de
            Catadores de Materiais Recicláveis de Baturité. Os números de materiais são calculados a
            partir de cada pesagem registrada pela equipe, e os demais indicadores são informados e
            revisados pela administração da associação.
          </p>

          <div className="tp-hero__meta">
            <span className="tp-hero__chip">
              <Clock size={15} aria-hidden />
              {loading ? "Carregando dados…" : data ? `Dados atualizados em ${data}` : "Ainda sem registros publicados"}
            </span>
            {periodo && <span className="tp-hero__chip tp-hero__chip--claro">Período: {periodo}</span>}
            <button type="button" className="tp-hero__btn" onClick={onAtualizar} disabled={loading}>
              <RefreshCw size={15} className={loading ? "tp-girando" : ""} aria-hidden /> Atualizar
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
