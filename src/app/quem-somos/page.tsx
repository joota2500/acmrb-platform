"use client";

/**
 * Página /quem-somos — apresentação institucional da ACMRB (visual novo)
 * ------------------------------------------------------------
 * Ordem das seções:
 *  1. Hero        — breadcrumb, selo, título, textos, botões e foto com citação
 *  2. Impacto     — números do useESGMetrics (mesma formatação do Hero da home)
 *  3. História    — introdução + linha do tempo (datas reais do conteúdo)
 *  4. Missão, visão e valores — missão/visão só aparecem quando cadastradas
 *  5. O que fazemos — frentes de atuação
 *  6. Diretoria   — só Presidente, Secretário(a) e Tesoureiro(a)
 *  7. Parceiros   — tabela parceiros
 *  8. Próximos passos
 *  9. Vídeo e Instagram
 * 10. Chamada final — contato / associados
 *
 * De onde vêm os textos: tabela quem_somos_conteudo (hook useQuemSomos).
 * Sem banco, a página usa os textos reais de src/constants/quemSomos.ts.
 *
 * Tudo em Tailwind, no mesmo padrão da home: TituloSecao, FaixaCta e os
 * componentes de src/components/ui. Responsivo (360 / 768 / 1280):
 *  - Celular: 1 coluna, botões em largura total, linha do tempo à esquerda.
 *  - Tablet: grades em 2 colunas.
 *  - Desktop: hero com foto ao lado, grades de 3–4 colunas e linha do
 *    tempo alternando os lados.
 */

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Eye,
  Handshake,
  Heart,
  HeartHandshake,
  Leaf,
  PlayCircle,
  Recycle,
  Scale,
  Sparkles,
  Sun,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FaixaCta from "@/components/home/FaixaCta";
import TituloSecao from "@/components/home/TituloSecao";
import Button from "@/components/ui/Button";
import Contador from "@/components/ui/Contador";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import { useAparecer } from "@/hooks/useAparecer";
import { useESGMetrics } from "@/hooks/useESGMetrics";
import { useQuemSomos } from "@/hooks/useQuemSomos";
import { formatarNumero, formatarPeso } from "@/utils/formatadores";
import { cn } from "@/utils/cn";

/** Ícones que o banco pode pedir pelo nome (campo "icone" do conteúdo) */
const ICONES: Record<string, LucideIcon> = {
  Building2,
  Handshake,
  Heart,
  HeartHandshake,
  Leaf,
  Recycle,
  Scale,
  Sun,
  Users,
};
const icone = (nome: string | null): LucideIcon => (nome && ICONES[nome]) || Leaf;

/** Espaçamento padrão das seções (igual ao da home) */
const SECAO = "py-16 sm:py-20 lg:py-24";

export default function QuemSomosPage() {
  const { secao, associados, parceiros, loading, erro } = useQuemSomos();
  const esg = useESGMetrics();
  const aparecer = useAparecer();

  // Blocos de conteúdo (cada um vem de uma "seção" do banco)
  const hero = secao("hero");
  const citacao = secao("citacao")[0];
  const historia = secao("historia")[0];
  const timeline = secao("timeline");
  const missao = secao("missao")[0];
  const visao = secao("visao")[0];
  const valores = secao("valor");
  const atuacao = secao("atuacao");
  const futuro = secao("futuro")[0];

  // Números de impacto: o valor conta de 0 até o número quando aparece na tela
  const impacto = [
    { Icone: Recycle, valor: esg.totalPeso, formatar: formatarPeso, rotulo: "Resíduos reciclados" },
    { Icone: HeartHandshake, valor: esg.familiasImpactadas, formatar: (n: number) => formatarNumero(Math.round(n)), rotulo: "Famílias beneficiadas" },
    { Icone: Leaf, valor: esg.co2, formatar: formatarPeso, rotulo: "CO₂ evitado" },
    { Icone: Sparkles, valor: 2025, formatar: (n: number) => String(Math.round(n)), rotulo: "Ano de fundação" },
  ];

  return (
    <>
      <Header />
      <main className="bg-white">
        {/* ==================== 1. HERO ==================== */}
        <section
          aria-labelledby="qs-titulo"
          className="relative isolate overflow-hidden bg-emerald-950 pb-28 pt-24 sm:pb-32 sm:pt-28 lg:pb-40 lg:pt-32"
        >
          {/* brilhos decorativos no fundo */}
          <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 -z-10 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 -z-10 size-96 rounded-full bg-sun/10 blur-3xl" />

          <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Breadcrumb (trilha de navegação) */}
              <nav aria-label="Você está em">
                <ol className="flex items-center gap-1.5 text-sm text-emerald-200">
                  <li>
                    <Link href="/" className="hover:text-white hover:underline">
                      Início
                    </Link>
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight size={14} />
                  </li>
                  <li aria-current="page" className="font-semibold text-white">
                    Quem somos
                  </li>
                </ol>
              </nav>

              {hero[0]?.subtitulo && (
                <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-md">
                  <Recycle size={15} className="text-emerald-300" aria-hidden="true" />
                  {hero[0].subtitulo}
                </span>
              )}

              <h1
                id="qs-titulo"
                className="mt-5 text-balance text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                {hero[0]?.titulo}
              </h1>

              <div className="mt-6 max-w-2xl space-y-4">
                {hero.map((b) =>
                  b.texto ? (
                    <p key={b.ordem} lang="pt-BR" className="text-pretty text-base leading-relaxed text-emerald-100 sm:text-lg">
                      {b.texto}
                    </p>
                  ) : null,
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button href="#historia" variante="destaque" tamanho="grande" className="w-full shadow-pop sm:w-auto">
                  Conheça nossa história
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
                <Button href="/#contato" variante="contornoClaro" tamanho="grande" className="w-full sm:w-auto">
                  Seja parceiro
                </Button>
              </div>
            </motion.div>

            {/* Foto com a citação por cima (some no celular para encurtar a página) */}
            <motion.figure
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative hidden aspect-4/3 overflow-hidden rounded-3xl border border-white/15 shadow-2xl md:block lg:aspect-4/5"
            >
              <Image
                src="/images/acmrb-hero.jpg"
                alt="Catadores da ACMRB em atividade"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              {citacao?.texto && (
                <figcaption className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-emerald-950/70 p-5 text-base font-semibold italic leading-relaxed text-white backdrop-blur-md sm:inset-x-5 sm:bottom-5">
                  “{citacao.texto}”
                </figcaption>
              )}
            </motion.figure>
          </Container>
        </section>

        {/* ==================== 2. IMPACTO (faixa que sobe sobre o hero) ==================== */}
        <section aria-label="Nosso impacto em números" className="relative z-10 -mt-16 sm:-mt-20">
          <Container>
            <ul
              aria-busy={esg.loading}
              className="grid grid-cols-2 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-pop md:grid-cols-4"
            >
              {impacto.map(({ Icone, valor, formatar, rotulo }, i) => (
                <li
                  key={rotulo}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-3 py-6 text-center sm:px-6 sm:py-8",
                    i % 2 === 0 && "border-r border-line",
                    i < 2 && "border-b border-line md:border-b-0",
                    i === 1 && "md:border-r",
                  )}
                >
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-mint text-leaf" aria-hidden="true">
                    <Icone size={22} />
                  </span>
                  <span className="mt-1 text-3xl font-black tracking-tight text-brand sm:text-4xl">
                    {/* o ano de fundação não depende do banco; os outros esperam carregar */}
                    {esg.loading && rotulo !== "Ano de fundação" ? "—" : <Contador valor={valor} formatar={formatar} />}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted sm:text-sm">{rotulo}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* ==================== 3. HISTÓRIA ==================== */}
        <section id="historia" className={SECAO} aria-labelledby="qs-historia">
          <Container>
            <motion.div {...aparecer()}>
              <TituloSecao
                id="qs-historia"
                etiqueta="Nossa história"
                titulo={historia?.titulo}
                descricao={historia?.texto ?? undefined}
              />
            </motion.div>

            {/* Linha do tempo: lista ordenada (semântica de sequência).
                Celular: linha à esquerda. Desktop: cards alternando os lados. */}
            <ol className="relative mx-auto max-w-5xl space-y-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-0.5 before:bg-leaf-bright/30 lg:before:left-1/2 lg:before:-translate-x-1/2">
              {timeline.map((item, i) => {
                const marco = /funda/i.test(item.titulo ?? "");
                return (
                  <motion.li
                    key={item.ordem}
                    {...aparecer(i * 0.05)}
                    className="group/li relative pl-10 lg:w-1/2 lg:pl-0 lg:pr-12 lg:even:ml-auto lg:even:pl-12 lg:even:pr-0"
                  >
                    {/* bolinha sobre a linha */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-0 top-6 size-4 rounded-full border-4 border-white shadow-md lg:-right-2 lg:left-auto lg:group-even/li:-left-2 lg:group-even/li:right-auto",
                        marco ? "bg-sun" : "bg-leaf-bright",
                      )}
                    />
                    <div
                      className={cn(
                        "rounded-card border p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:p-6",
                        marco ? "border-brand bg-brand text-white" : "border-black/5 bg-surface-alt",
                      )}
                    >
                      {item.rotulo && (
                        <span
                          className={cn(
                            "inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                            marco ? "bg-sun text-ink" : "bg-brand-mint text-leaf",
                          )}
                        >
                          {item.rotulo}
                        </span>
                      )}
                      <h3 className={cn("mt-3 text-lg font-black", marco ? "text-white" : "text-ink")}>{item.titulo}</h3>
                      <p lang="pt-BR" className={cn("mt-2 leading-relaxed", marco ? "text-emerald-100" : "text-ink-soft")}>
                        {item.texto}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </Container>
        </section>

        {/* ==================== 4. MISSÃO, VISÃO E VALORES ==================== */}
        <section id="valores" className={cn(SECAO, "bg-surface-alt")} aria-labelledby="qs-valores">
          <Container>
            <motion.div {...aparecer()}>
              <TituloSecao
                id="qs-valores"
                etiqueta={missao || visao ? "Missão, visão e valores" : "Nossos valores"}
                titulo="O que nos guia todos os dias"
              />
            </motion.div>

            {/* Missão e visão: aparecem só quando cadastradas no banco */}
            {(missao || visao) && (
              <div className="mb-6 grid gap-5 md:grid-cols-2">
                {[
                  { bloco: missao, nome: "Missão", Icone: Target },
                  { bloco: visao, nome: "Visão", Icone: Eye },
                ].map(({ bloco, nome, Icone }, i) =>
                  bloco?.texto ? (
                    <motion.article
                      key={nome}
                      {...aparecer(i * 0.08)}
                      className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-dark via-brand to-leaf p-7 text-white shadow-pop sm:p-9"
                    >
                      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
                      <span className="relative grid size-12 place-items-center rounded-2xl bg-white/15" aria-hidden="true">
                        <Icone size={26} />
                      </span>
                      <h3 className="relative mt-5 text-2xl font-black">{bloco.titulo || nome}</h3>
                      <p lang="pt-BR" className="relative mt-3 leading-relaxed text-emerald-100">
                        {bloco.texto}
                      </p>
                    </motion.article>
                  ) : null,
                )}
              </div>
            )}

            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {valores.map((v, i) => {
                const Icone = icone(v.icone);
                return (
                  <motion.li
                    key={v.ordem}
                    {...aparecer(i * 0.05)}
                    className="rounded-card border border-black/5 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                  >
                    <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-leaf" aria-hidden="true">
                      <Icone size={24} />
                    </span>
                    <h3 className="mt-4 text-lg font-black text-ink">{v.titulo}</h3>
                    <p lang="pt-BR" className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {v.texto}
                    </p>
                  </motion.li>
                );
              })}
            </ul>
          </Container>
        </section>

        {/* ==================== 5. O QUE FAZEMOS ==================== */}
        {atuacao.length > 0 && (
          <section id="atuacao" className={SECAO} aria-labelledby="qs-atuacao">
            <Container>
              <motion.div {...aparecer()}>
                <TituloSecao id="qs-atuacao" etiqueta="O que fazemos" titulo="Nossas frentes de atuação" />
              </motion.div>

              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {atuacao.map((a, i) => {
                  const Icone = icone(a.icone);
                  return (
                    <motion.li
                      key={a.ordem}
                      {...aparecer(i * 0.05)}
                      className="group rounded-card border border-black/5 border-t-4 border-t-leaf-bright bg-surface-alt p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card-hover"
                    >
                      <span
                        className="grid size-12 place-items-center rounded-2xl bg-brand text-white shadow-md transition group-hover:bg-leaf"
                        aria-hidden="true"
                      >
                        <Icone size={24} />
                      </span>
                      <h3 className="mt-4 text-lg font-black text-ink">{a.titulo}</h3>
                      <p lang="pt-BR" className="mt-2 text-sm leading-relaxed text-ink-soft">
                        {a.texto}
                      </p>
                    </motion.li>
                  );
                })}
              </ul>
            </Container>
          </section>
        )}

        {/* ==================== 6. DIRETORIA ==================== */}
        <section id="associados" className={cn(SECAO, "bg-surface-alt")} aria-labelledby="qs-associados">
          <Container>
            <motion.div {...aparecer()} className="mb-10 text-center sm:mb-14">
              <TituloSecao
                id="qs-associados"
                etiqueta="Diretoria"
                titulo="Pessoas que fazem a diferença todos os dias"
                descricao="Conheça a diretoria da ACMRB, responsável por conduzir o fortalecimento ambiental, social e operacional da associação."
                className="mb-6 sm:mb-6"
              />
              <Button href="/associados" variante="primario" tamanho="grande">
                Ver todos os associados
                <ChevronRight size={18} aria-hidden="true" />
              </Button>
            </motion.div>

            {loading ? (
              <LoadingState text="Carregando diretoria..." />
            ) : associados.length === 0 ? (
              <EmptyState
                title="Diretoria em breve"
                description={
                  erro
                    ? "Não conseguimos carregar a lista agora. Tente novamente mais tarde."
                    : "Os cargos de Presidente, Secretário(a) e Tesoureiro(a) ainda não foram cadastrados."
                }
              />
            ) : (
              /* 3 cargos: cartão horizontal no celular, 3 colunas a partir de 640px */
              <ul className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-3">
                {associados.map((a, i) => (
                  <motion.li key={a.id} {...aparecer(i * 0.08)}>
                    <Link
                      href={a.slug ? `/associados/${a.slug}` : "/associados"}
                      className="group flex h-full overflow-hidden rounded-card border border-black/5 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:flex-col"
                    >
                      <div className="relative size-28 shrink-0 bg-brand-soft sm:aspect-square sm:size-auto">
                        {a.foto_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.foto_url} alt={a.nome} loading="lazy" className="absolute inset-0 size-full object-cover" />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 grid place-items-center text-5xl font-black text-leaf"
                          >
                            {a.nome.charAt(0).toUpperCase()}
                          </span>
                        )}
                        {a.destaque && (
                          <span className="absolute left-2 top-2 rounded-full bg-sun px-2.5 py-0.5 text-[11px] font-black text-ink shadow">
                            Destaque
                          </span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
                        <h3 className="text-lg font-black leading-snug text-ink">{a.nome}</h3>
                        {a.cargo && <p className="mt-0.5 text-sm font-bold text-leaf">{a.cargo}</p>}
                        {a.tipo_associado && <p className="text-sm text-ink-muted">{a.tipo_associado}</p>}
                        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                          Ver perfil
                          <ArrowRight size={15} aria-hidden="true" className="transition group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </Container>
        </section>

        {/* ==================== 7. PARCEIROS ==================== */}
        <section id="parceiros" className={SECAO} aria-labelledby="qs-parceiros">
          <Container>
            <motion.div {...aparecer()}>
              <TituloSecao id="qs-parceiros" etiqueta="Parceiros" titulo="Quem caminha conosco" />
            </motion.div>

            {loading ? (
              <LoadingState text="Carregando parceiros..." />
            ) : parceiros.length === 0 ? (
              <EmptyState
                title="Seja o primeiro parceiro"
                description="Empresas, instituições e órgãos públicos podem apoiar a ACMRB. Fale com a gente pela página de contato."
              />
            ) : (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {parceiros.map((p) => {
                  // logo, se houver; senão o nome da empresa
                  const conteudo = p.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo_url} alt={p.nome} loading="lazy" className="max-h-14 w-auto max-w-full object-contain" />
                  ) : (
                    <span className="text-center text-sm font-bold text-brand">{p.nome}</span>
                  );
                  return (
                    <li
                      key={p.id}
                      title={p.categoria ?? p.nome}
                      className="grid h-28 place-items-center rounded-card border border-black/5 bg-surface-alt p-4 transition duration-300 hover:bg-white hover:shadow-card-hover"
                    >
                      {p.site_url ? (
                        <a
                          href={p.site_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid size-full place-items-center"
                        >
                          {conteudo}
                        </a>
                      ) : (
                        conteudo
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Container>
        </section>

        {/* ==================== 8. PRÓXIMOS PASSOS ==================== */}
        {futuro && (
          <section className="bg-surface-alt py-16 sm:py-20" aria-labelledby="qs-futuro">
            <Container tamanho="medio">
              <motion.div
                {...aparecer()}
                className="relative isolate overflow-hidden rounded-3xl bg-emerald-950 p-8 text-center sm:p-12"
              >
                <span aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 -z-10 size-56 rounded-full bg-emerald-500/20 blur-2xl" />
                <span aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 -z-10 size-56 rounded-full bg-sun/15 blur-2xl" />
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-200">
                  <Sparkles size={15} aria-hidden="true" />
                  {futuro.rotulo}
                </span>
                <h2 id="qs-futuro" className="mt-5 text-balance text-headline font-black text-white">
                  {futuro.titulo}
                </h2>
                <p lang="pt-BR" className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-emerald-100 sm:text-lg">
                  {futuro.texto}
                </p>
              </motion.div>
            </Container>
          </section>
        )}

        {/* ==================== 9. VÍDEO E INSTAGRAM ==================== */}
        <section className={SECAO} aria-labelledby="qs-midia">
          <Container>
            <motion.div {...aparecer()}>
              <TituloSecao
                id="qs-midia"
                icone={PlayCircle}
                etiqueta="Vídeo institucional"
                titulo="Conheça mais sobre a ACMRB"
              />
            </motion.div>

            <div className="mx-auto aspect-video max-w-4xl overflow-hidden rounded-3xl border border-black/5 bg-ink shadow-pop">
              <iframe
                src="https://www.youtube.com/embed/ITur0JNJZos"
                title="Vídeo institucional da ACMRB"
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full border-0"
              />
            </div>

            <h3 className="mb-6 mt-14 text-center text-xl font-black text-ink sm:text-2xl">
              Acompanhe nossas ações no Instagram
            </h3>
            {/* Celular: os 3 posts rolam de lado. Do tablet para cima: 3 colunas. */}
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {[
                "https://www.instagram.com/p/DYcEwegMSmg/embed",
                "https://www.instagram.com/reel/DX4O5DgtuE3/embed",
                "https://www.instagram.com/p/DW90q-MF38J/embed",
              ].map((src, i) => (
                <iframe
                  key={src}
                  src={src}
                  title={`Publicação ${i + 1} da ACMRB no Instagram`}
                  loading="lazy"
                  className="h-[34rem] w-[85%] shrink-0 snap-center rounded-2xl border border-line bg-white md:w-full"
                />
              ))}
            </div>
          </Container>
        </section>

        {/* ==================== 10. CHAMADA FINAL ==================== */}
        <section className="pb-16 sm:pb-20 lg:pb-24" aria-label="Chamada para participar">
          <Container>
            <motion.div {...aparecer()}>
              <FaixaCta
                className="mt-0 sm:mt-0"
                titulo="Faça parte dessa transformação"
                texto="Seja parceiro, voluntário, doador ou apoiador. Juntos, podemos construir uma Baturité mais limpa, justa e sustentável."
              >
                <Button href="/#contato" variante="claro" tamanho="grande">
                  Fale conosco
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
                <Button href="/associados" variante="contornoClaro" tamanho="grande">
                  <Users size={18} aria-hidden="true" />
                  Conheça os associados
                </Button>
              </FaixaCta>
            </motion.div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
