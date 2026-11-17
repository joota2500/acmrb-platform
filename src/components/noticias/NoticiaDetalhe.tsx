"use client";

/**
 * NoticiaDetalhe — corpo da página /noticias/[slug]
 * ------------------------------------------------------------
 * Barra de progresso de leitura, topo verde com breadcrumb, título, data e autor,
 * capa inteira (sobe sobre o topo) com legenda/crédito, texto formatado (ConteudoNoticia),
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
  ExternalLink, Eye, Newspaper, UserRound, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ConteudoNoticia from "@/components/noticias/ConteudoNoticia";
import NoticiaCard from "@/components/noticias/NoticiaCard";
import CompartilharNoticia from "@/components/noticias/CompartilharNoticia";
import { formatarData, textoPuro, type Noticia } from "@/utils/noticias";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import TituloSecao from "@/components/home/TituloSecao";
import { cn } from "@/utils/cn";

/* botões redondos da foto ampliada (fechar e setas) */
const BOTAO_LB = "absolute z-10 grid size-11 cursor-pointer place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25";

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
    <main className="bg-surface-alt" lang="pt-BR">
      {/* barra de progresso de leitura (fixa no topo) */}
      <motion.div
        className="fixed inset-x-0 top-0 z-60 h-1 origin-left bg-linear-to-r from-leaf-bright to-sun"
        style={{ scaleX: progresso }}
        aria-hidden="true"
      />

      <article>
        {/* ---------- Topo verde: breadcrumb, título e dados ---------- */}
        <header className={cn("relative isolate overflow-hidden bg-emerald-950 pt-24 sm:pt-28", n.imagem_url ? "pb-28 sm:pb-36" : "pb-12 sm:pb-16")}>
          <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 -z-10 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 -z-10 size-80 rounded-full bg-sun/10 blur-3xl" />

          <Container tamanho="medio">
            <motion.div {...entrada}>
              <nav aria-label="Você está em">
                <ol className="flex flex-wrap items-center gap-1.5 text-sm text-emerald-200">
                  <li><Link href="/" className="hover:text-white hover:underline">Início</Link></li>
                  <li aria-hidden="true"><ChevronRight size={14} /></li>
                  <li><Link href="/noticias" className="hover:text-white hover:underline">Notícias</Link></li>
                  <li aria-hidden="true"><ChevronRight size={14} /></li>
                  <li aria-current="page" className="max-w-full truncate font-semibold text-white sm:max-w-md">{n.titulo}</li>
                </ol>
              </nav>

              {n.categoria && (
                <Link
                  href={`/noticias?categoria=${encodeURIComponent(n.categoria)}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-md transition hover:bg-white/20"
                >
                  <Newspaper size={14} className="text-emerald-300" aria-hidden="true" /> {n.categoria}
                </Link>
              )}

              <h1 className={cn("max-w-4xl text-balance text-3xl font-black leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl [overflow-wrap:anywhere]", n.categoria ? "mt-4" : "mt-6")}>
                {n.titulo}
              </h1>
              {n.resumo && (
                <p className="mt-5 max-w-3xl text-pretty border-l-4 border-leaf-bright pl-4 text-base leading-relaxed text-emerald-100 sm:text-lg lg:text-xl">
                  {n.resumo}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-emerald-100">
                <span className="inline-flex items-center gap-1.5"><UserRound size={15} className="text-emerald-300" aria-hidden="true" /> {n.autor_nome}</span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-emerald-300" aria-hidden="true" />
                  <time dateTime={n.publicado_em}>{formatarData(n.publicado_em, true)}</time>
                </span>
                <span className="inline-flex items-center gap-1.5"><Clock size={15} className="text-emerald-300" aria-hidden="true" /> {n.tempo_leitura} min de leitura</span>
                {visualizacoes > 0 && (
                  <span className="inline-flex items-center gap-1.5"><Eye size={15} className="text-emerald-300" aria-hidden="true" /> {visualizacoes} {visualizacoes === 1 ? "visualização" : "visualizações"}</span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
                <Link href="/noticias" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-200 hover:text-white hover:underline">
                  <ArrowLeft size={16} aria-hidden="true" /> Todas as notícias
                </Link>
                <CompartilharNoticia
                  variante="botao"
                  rotulo="Compartilhar"
                  titulo={n.titulo}
                  resumo={resumo}
                  slug={n.slug}
                  imagemUrl={n.imagem_url}
                  className="h-10 rounded-full border-white/25 bg-white/10 px-4 text-sm text-white hover:border-white/40 hover:bg-white/20"
                />
              </div>
            </motion.div>
          </Container>
        </header>

        {/* ---------- Capa inteira (sobe sobre o topo verde) ---------- */}
        {n.imagem_url && (
          <Container tamanho="medio" className="relative z-10 -mt-20 sm:-mt-28">
            <figure>
              <div className="relative flex h-[min(55vh,26rem)] min-h-48 w-full items-center justify-center overflow-hidden rounded-card bg-zinc-200 shadow-pop sm:h-[min(70vh,40rem)] sm:min-h-64">
                {/* fundo desfocado com a própria imagem (preenche as laterais) */}
                <span aria-hidden="true" className="absolute -inset-[10%] bg-cover bg-center blur-2xl brightness-80 saturate-110" style={{ backgroundImage: `url("${n.imagem_url}")` }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={n.imagem_url} alt={n.imagem_alt} className="relative z-10 block size-full object-contain" />
              </div>
              {(n.imagem_legenda || n.imagem_credito) && (
                <figcaption className="mx-auto mt-3 max-w-3xl px-1 text-sm italic text-ink-soft">
                  {n.imagem_legenda}
                  {n.imagem_credito && <span className="not-italic text-ink-muted"> Foto: {n.imagem_credito}</span>}
                </figcaption>
              )}
            </figure>
          </Container>
        )}

        {/* ---------- Texto (coluna de leitura) ---------- */}
        <Container tamanho="estreito" className="py-10 sm:py-14">
          <ConteudoNoticia texto={n.conteudo} />

          {n.galeria.length > 0 && (
            <section className="mt-12" aria-labelledby="nd-galeria">
              <h2 id="nd-galeria" className="flex items-center gap-3 text-xl font-extrabold text-brand-dark after:h-px after:flex-1 after:bg-linear-to-r after:from-brand-line after:to-transparent">
                Galeria de fotos
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {n.galeria.map((g, i) => (
                  <button
                    key={g.url + i}
                    type="button"
                    onClick={() => setAmpliada(i)}
                    aria-label={`Ampliar foto ${i + 1}${g.legenda ? `: ${g.legenda}` : ""}`}
                    className="group aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-brand-line bg-zinc-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.url} alt={g.legenda || `Foto ${i + 1} da notícia`} loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {n.fonte_url && (
            <p className="mt-8">
              <a href={n.fonte_url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 font-bold text-brand hover:underline">
                Fonte / saiba mais <ExternalLink size={14} aria-hidden="true" />
              </a>
            </p>
          )}

          {n.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2" aria-label="Assuntos">
              <span className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">Assuntos:</span>
              {n.tags.map((t) => (
                <Link key={t} href={`/noticias?tag=${encodeURIComponent(t)}`} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-ink transition hover:border-brand-line hover:bg-brand-soft">
                  #{t}
                </Link>
              ))}
            </div>
          )}

          {/* Compartilhar */}
          <section className="mt-10 grid items-center gap-5 rounded-card border border-brand-line bg-brand-soft p-5 sm:p-6 md:grid-cols-2" aria-labelledby="nd-gostou">
            <div>
              <h2 id="nd-gostou" className="text-xl font-black text-brand-dark">Gostou? Compartilhe!</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                Envie para amigos e familiares. No celular, a foto, o resumo e o link seguem juntos.
              </p>
            </div>
            <CompartilharNoticia variante="inline" rotulo="Compartilhar" titulo={n.titulo} resumo={resumo} slug={n.slug} imagemUrl={n.imagem_url} />
          </section>

          {/* Anterior / próxima */}
          {(anterior || proxima) && (
            <nav className="mt-12 grid gap-4 border-t border-line pt-8 sm:grid-cols-2" aria-label="Outras notícias">
              {anterior ? (
                <Link href={`/noticias/${anterior.slug}`} className="group flex flex-col gap-1.5 rounded-card border border-line bg-white p-4 shadow-card transition hover:border-brand-line hover:shadow-card-hover">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-leaf">
                    <ArrowLeft size={14} className="transition group-hover:-translate-x-0.5" aria-hidden="true" /> Anterior
                  </span>
                  <strong className="text-sm leading-snug text-ink sm:text-base">{anterior.titulo}</strong>
                </Link>
              ) : <span />}
              {proxima ? (
                <Link href={`/noticias/${proxima.slug}`} className="group flex flex-col gap-1.5 rounded-card border border-line bg-white p-4 shadow-card transition hover:border-brand-line hover:shadow-card-hover sm:items-end sm:text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-leaf">
                    Próxima <ArrowRight size={14} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                  <strong className="text-sm leading-snug text-ink sm:text-base">{proxima.titulo}</strong>
                </Link>
              ) : <span />}
            </nav>
          )}
        </Container>
      </article>

      {/* ---------- Leia também ---------- */}
      {relacionadas.length > 0 && (
        <section className="border-t border-line bg-white py-14 sm:py-20" aria-labelledby="nd-relacionadas">
          <Container>
            <TituloSecao etiqueta="Continue lendo" icone={Newspaper} id="nd-relacionadas" titulo={<>Leia <span>também</span></>} className="mb-8 sm:mb-10" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relacionadas.map((r) => <NoticiaCard key={r.id} noticia={r} />)}
            </div>
            <div className="mt-10 flex justify-center">
              <Button href="/noticias" variante="contorno">Ver todas as notícias</Button>
            </div>
          </Container>
        </section>
      )}

      {/* ---------- Foto ampliada (galeria) ---------- */}
      {ampliada !== null && n.galeria[ampliada] && (
        <div className="fixed inset-0 z-95 flex items-center justify-center bg-gray-900/90 p-4 sm:p-6" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setAmpliada(null)}>
          <button type="button" className={BOTAO_LB + " right-4 top-4"} onClick={() => setAmpliada(null)} aria-label="Fechar"><X size={22} /></button>
          {n.galeria.length > 1 && (
            <button type="button" className={BOTAO_LB + " left-2 top-1/2 -translate-y-1/2 sm:left-4"} aria-label="Foto anterior"
              onClick={(e) => { e.stopPropagation(); setAmpliada((ampliada - 1 + n.galeria.length) % n.galeria.length); }}>
              <ChevronLeft size={26} />
            </button>
          )}
          <figure className="max-w-5xl text-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={n.galeria[ampliada].url} alt={n.galeria[ampliada].legenda || `Foto ${ampliada + 1}`} className="mx-auto max-h-[80vh] max-w-full object-contain" />
            <figcaption className="mt-3 text-sm text-gray-200">
              {n.galeria[ampliada].legenda} <span className="text-gray-400">({ampliada + 1}/{n.galeria.length})</span>
            </figcaption>
          </figure>
          {n.galeria.length > 1 && (
            <button type="button" className={BOTAO_LB + " right-2 top-1/2 -translate-y-1/2 sm:right-4"} aria-label="Próxima foto"
              onClick={(e) => { e.stopPropagation(); setAmpliada((ampliada + 1) % n.galeria.length); }}>
              <ChevronRight size={26} />
            </button>
          )}
        </div>
      )}
    </main>
  );
}
