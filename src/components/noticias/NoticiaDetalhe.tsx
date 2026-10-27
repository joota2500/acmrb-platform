"use client";

/**
 * NoticiaDetalhe — corpo da página /noticias/[slug]
 * ------------------------------------------------------------
 * Barra de progresso de leitura, breadcrumb, título, data e autor,
 * capa inteira com legenda/crédito, texto formatado (ConteudoNoticia),
 * galeria com ampliação, assuntos, compartilhar (CompartilharNoticia:
 * folha nativa com foto no celular; redes e copiar link no computador),
 * voltar, anterior/próxima e relacionadas.
 * Conta 1 visualização por notícia por sessão.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock,
  ExternalLink, Eye, UserRound, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ConteudoNoticia from "@/components/noticias/ConteudoNoticia";
import NoticiaCard from "@/components/noticias/NoticiaCard";
import CompartilharNoticia from "@/components/noticias/CompartilharNoticia";
import { formatarData, textoPuro, type Noticia } from "@/lib/noticias";

import "@/styles/noticia-detalhe.css";

interface Props {
  noticia: Noticia;
  anterior: Noticia | null;
  proxima: Noticia | null;
  relacionadas: Noticia[];
}

export default function NoticiaDetalhe({ noticia: n, anterior, proxima, relacionadas }: Props) {
  const reduzir = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 25, restDelta: 0.001 });

  const [visualizacoes, setVisualizacoes] = useState(n.visualizacoes);
  const [ampliada, setAmpliada] = useState<number | null>(null);

  // conta a visualização uma vez por sessão (RPC security definer)
  useEffect(() => {
    const chave = `noticia-vista-${n.id}`;
    if (sessionStorage.getItem(chave)) return;
    sessionStorage.setItem(chave, "1");
    supabase
      .rpc("incrementar_visualizacao_noticia", { p_id: n.id })
      .then(({ data, error }) => {
        if (!error && typeof data === "number") setVisualizacoes(data);
      });
  }, [n.id]);

  // galeria: Esc fecha, setas navegam
  useEffect(() => {
    if (ampliada === null) return;
    const total = n.galeria.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAmpliada(null);
      if (e.key === "ArrowRight") setAmpliada((i) => (i === null ? i : (i + 1) % total));
      if (e.key === "ArrowLeft") setAmpliada((i) => (i === null ? i : (i - 1 + total) % total));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ampliada, n.galeria.length]);

  const resumo = n.resumo || textoPuro(n.conteudo).slice(0, 220);

  const entrada = reduzir ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } };

  return (
    <main className="nd" lang="pt-BR">
      <motion.div className="nd__progresso" style={{ scaleX: progresso }} aria-hidden="true" />

      <article className="nd__artigo">
        <motion.header className="nd__cabecalho" {...entrada}>
          <nav aria-label="Você está em" className="nd__breadcrumb">
            <Link href="/">Início</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/noticias">Notícias</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">{n.titulo}</span>
          </nav>

          {n.categoria && (
            <Link href={`/noticias?categoria=${encodeURIComponent(n.categoria)}`} className="nd__categoria">
              {n.categoria}
            </Link>
          )}

          <h1 className="nd__titulo">{n.titulo}</h1>
          {n.resumo && <p className="nd__linha-fina">{n.resumo}</p>}

          <div className="nd__meta">
            <span><UserRound size={15} aria-hidden="true" /> {n.autor_nome}</span>
            <span>
              <CalendarDays size={15} aria-hidden="true" />
              <time dateTime={n.publicado_em}>{formatarData(n.publicado_em, true)}</time>
            </span>
            <span><Clock size={15} aria-hidden="true" /> {n.tempo_leitura} min de leitura</span>
            {visualizacoes > 0 && (
              <span><Eye size={15} aria-hidden="true" /> {visualizacoes} {visualizacoes === 1 ? "visualização" : "visualizações"}</span>
            )}
          </div>

          <div className="nd__acoes-topo">
            <Link href="/noticias" className="nd__voltar"><ArrowLeft size={16} aria-hidden="true" /> Todas as notícias</Link>
            <CompartilharNoticia variante="botao" rotulo="Compartilhar" titulo={n.titulo} resumo={resumo} slug={n.slug} imagemUrl={n.imagem_url} className="nd__compartilhar-topo" />
          </div>
        </motion.header>

        {n.imagem_url && (
          <figure className="nd__figura">
            <div className="nd__moldura">
              {/* fundo desfocado com a própria imagem (preenche as laterais) */}
              <span className="nd__fundo" aria-hidden="true" style={{ backgroundImage: `url("${n.imagem_url}")` }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={n.imagem_url} alt={n.imagem_alt} />
            </div>
            {(n.imagem_legenda || n.imagem_credito) && (
              <figcaption>
                {n.imagem_legenda}
                {n.imagem_credito && <span className="nd__credito"> Foto: {n.imagem_credito}</span>}
              </figcaption>
            )}
          </figure>
        )}

        <div className="nd__corpo">
          <div className="nd__principal">
            <ConteudoNoticia texto={n.conteudo} className="nd__texto" />

            {n.galeria.length > 0 && (
              <section className="nd__galeria" aria-labelledby="nd-galeria">
                <h2 id="nd-galeria" className="nd__subtitulo">Galeria de fotos</h2>
                <div className="nd__galeria-grade">
                  {n.galeria.map((g, i) => (
                    <button key={g.url + i} type="button" className="nd__galeria-item" onClick={() => setAmpliada(i)} aria-label={`Ampliar foto ${i + 1}${g.legenda ? `: ${g.legenda}` : ""}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.url} alt={g.legenda || `Foto ${i + 1} da notícia`} loading="lazy" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {n.fonte_url && (
              <p className="nd__fonte">
                <a href={n.fonte_url} target="_blank" rel="noopener noreferrer nofollow">
                  Fonte / saiba mais <ExternalLink size={14} aria-hidden="true" />
                </a>
              </p>
            )}

            {n.tags.length > 0 && (
              <div className="nd__tags" aria-label="Assuntos">
                <span className="nd__tags-rotulo">Assuntos:</span>
                {n.tags.map((t) => (
                  <Link key={t} href={`/noticias?tag=${encodeURIComponent(t)}`} className="nd__tag">{t}</Link>
                ))}
              </div>
            )}

            <section className="nd__cartao" aria-labelledby="nd-gostou">
              <div className="nd__cartao-texto">
                <h2 id="nd-gostou">Gostou? Compartilhe!</h2>
                <p>Envie para amigos e familiares. No celular, a foto, o resumo e o link seguem juntos.</p>
              </div>
              <CompartilharNoticia variante="inline" rotulo="Compartilhar" titulo={n.titulo} resumo={resumo} slug={n.slug} imagemUrl={n.imagem_url} />
            </section>
          </div>
        </div>

        {(anterior || proxima) && (
          <nav className="nd__navegacao" aria-label="Outras notícias">
            {anterior ? (
              <Link href={`/noticias/${anterior.slug}`} className="nd__nav-item">
                <span><ArrowLeft size={14} aria-hidden="true" /> Anterior</span>
                <strong>{anterior.titulo}</strong>
              </Link>
            ) : <span />}
            {proxima ? (
              <Link href={`/noticias/${proxima.slug}`} className="nd__nav-item nd__nav-item--direita">
                <span>Próxima <ArrowRight size={14} aria-hidden="true" /></span>
                <strong>{proxima.titulo}</strong>
              </Link>
            ) : <span />}
          </nav>
        )}
      </article>

      {relacionadas.length > 0 && (
        <section className="nd__relacionadas" aria-labelledby="nd-relacionadas">
          <div className="nd__container">
            <h2 id="nd-relacionadas" className="nd__subtitulo">Leia também</h2>
            <div className="nd__rel-grade">
              {relacionadas.map((r) => <NoticiaCard key={r.id} noticia={r} />)}
            </div>
            <div className="nd__centro">
              <Link href="/noticias" className="nd__btn">Ver todas as notícias</Link>
            </div>
          </div>
        </section>
      )}

      {ampliada !== null && n.galeria[ampliada] && (
        <div className="nd__lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setAmpliada(null)}>
          <button type="button" className="nd__lb-fechar" onClick={() => setAmpliada(null)} aria-label="Fechar"><X size={22} /></button>
          {n.galeria.length > 1 && (
            <button type="button" className="nd__lb-seta nd__lb-seta--esq" aria-label="Foto anterior"
              onClick={(e) => { e.stopPropagation(); setAmpliada((ampliada - 1 + n.galeria.length) % n.galeria.length); }}>
              <ChevronLeft size={26} />
            </button>
          )}
          <figure onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={n.galeria[ampliada].url} alt={n.galeria[ampliada].legenda || `Foto ${ampliada + 1}`} />
            <figcaption>
              {n.galeria[ampliada].legenda} <span>({ampliada + 1}/{n.galeria.length})</span>
            </figcaption>
          </figure>
          {n.galeria.length > 1 && (
            <button type="button" className="nd__lb-seta nd__lb-seta--dir" aria-label="Próxima foto"
              onClick={(e) => { e.stopPropagation(); setAmpliada((ampliada + 1) % n.galeria.length); }}>
              <ChevronRight size={26} />
            </button>
          )}
        </div>
      )}
    </main>
  );
}
