"use client";

/**
 * NewsSection — "Notícias e Atualizações" (home)
 * ------------------------------------------------------------
 * Mostra no máximo 3 notícias:
 *   1. as marcadas como destaque pelo ADM DEUS (ordem_destaque);
 *   2. se não houver destaque, as 3 mais recentes publicadas.
 *   3. nunca mais de 3 (selecionarHome deduplica e corta).
 * Desktop: 3 colunas iguais (mesma altura). Tablet: 2 colunas e o
 * 3º cartão ocupa a linha inteira na horizontal. Celular: 1 coluna.
 * Estados: carregando (esqueleto), vazio e erro com "Tentar de novo".
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowRight, Newspaper, RefreshCw } from "lucide-react";
import NoticiaCard from "@/components/noticias/NoticiaCard";
import { useNoticiasPublicas } from "@/hooks/useNoticiasPublicas";
import { selecionarHome } from "@/lib/noticias";

import "@/styles/news-section.css";

export default function NewsSection() {
  const { noticias, carregando, erro, recarregar } = useNoticiasPublicas(60);
  const reduzir = useReducedMotion();
  const lista = selecionarHome(noticias, 3);

  const anim = (atraso = 0) =>
    reduzir
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay: atraso },
        };

  return (
    <section id="noticias" className="news" aria-labelledby="news-titulo" lang="pt-BR">
      <div className="news__container">
        <motion.header className="news__header" {...anim()}>
          <span className="news__tag">
            <Newspaper size={14} aria-hidden="true" /> Notícias e Atualizações
          </span>
          <h2 id="news-titulo" className="news__title">
            O que está acontecendo <span>na ACMRB</span>
          </h2>
          <p className="news__description">
            Projetos, ações sociais, educação ambiental, parcerias e resultados da coleta seletiva em
            Baturité e no Maciço. Informação oficial da associação, publicada para a comunidade, os
            parceiros e o poder público acompanharem de perto o nosso trabalho.
          </p>
        </motion.header>

        {carregando && (
          <div className="news__grid" aria-busy="true" aria-label="Carregando notícias">
            <div className="news__skeleton" />
            <div className="news__skeleton" />
            <div className="news__skeleton" />
          </div>
        )}

        {!carregando && erro && (
          <div className="news__aviso" role="alert">
            <AlertTriangle size={28} aria-hidden="true" />
            <p>{erro}</p>
            <button type="button" onClick={recarregar} className="news__btn news__btn--claro">
              <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
            </button>
          </div>
        )}

        {!carregando && !erro && lista.length === 0 && (
          <div className="news__aviso">
            <Newspaper size={28} aria-hidden="true" />
            <h3>Nenhuma notícia publicada ainda</h3>
            <p>Em breve você vai encontrar aqui as novidades e ações da ACMRB.</p>
          </div>
        )}

        {!carregando && !erro && lista.length > 0 && (
          <div className={`news__grid news__grid--${lista.length}`}>
            {lista.map((n, i) => (
              <motion.div key={n.id} className="news__item" {...anim(0.05 + i * 0.08)}>
                <NoticiaCard noticia={n} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="news__acoes">
          <Link href="/noticias" className="news__btn">
            Ver todas as notícias <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
