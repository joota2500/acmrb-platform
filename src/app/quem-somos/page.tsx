"use client";

/**
 * Página /quem-somos — apresentação institucional da ACMRB
 * ------------------------------------------------------------
 * Ordem das seções:
 *  1. Hero        — breadcrumb, selo, título, textos, botões e citação
 *  2. Impacto     — números do useESGMetrics (materiais_registros +
 *                   dashboard_metricas), mesma formatação do Hero da home
 *  3. História    — introdução + linha do tempo (datas reais do conteúdo)
 *  4. Missão, visão e valores — missão/visão só aparecem quando forem
 *                   cadastradas no banco (ainda não existe texto oficial)
 *  5. O que fazemos — frentes de atuação
 *  6. Associados  — tabela associados (somente campos públicos)
 *  7. Parceiros   — tabela parceiros
 *  8. Próximos passos
 *  9. Vídeo e Instagram (conteúdos que já existiam na página)
 * 10. Chamada final — contato / associados
 *
 * De onde vêm os textos: tabela quem_somos_conteudo (hook useQuemSomos).
 * Sem banco, a página usa os textos reais de src/lib/quemSomosFallback.ts.
 *
 * Responsividade (src/styles/quem-somos.css, mobile-first):
 *  - Celular (<640px): textos menores, 1 coluna, botões h-12 empilhados
 *    com largura total, números de impacto em 2 colunas.
 *  - Tablet (640–1023px): grades em 2 colunas, botões lado a lado.
 *  - Desktop (>=1024px): hero em 2 colunas (texto + foto), grades em 3–4
 *    colunas, linha do tempo com mais respiro.
 *  - Parágrafos justificados com hifenização (pedido do Artur); títulos não.
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
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

import { useQuemSomos } from "@/hooks/useQuemSomos";
import { useESGMetrics } from "@/hooks/useESGMetrics";
import { formatarNumero, formatarPeso } from "@/lib/formatadores";

import "@/styles/quem-somos.css";

/** Ícones que podem ser escolhidos pelo campo "icone" no banco. */
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
const icone = (nome: string | null): LucideIcon =>
  (nome && ICONES[nome]) || Leaf;

/** Animação padrão de entrada (sutil, só uma vez). */
const surgir = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

export default function QuemSomosPage() {
  const { secao, associados, parceiros, loading, erro } = useQuemSomos();
  const esg = useESGMetrics();

  // Blocos de conteúdo de cada seção (banco ou fallback)
  const hero = secao("hero");
  const citacao = secao("citacao")[0];
  const historia = secao("historia")[0];
  const timeline = secao("timeline");
  const missao = secao("missao")[0];
  const visao = secao("visao")[0];
  const valores = secao("valor");
  const atuacao = secao("atuacao");
  const futuro = secao("futuro")[0];

  // Números de impacto: "—" enquanto carrega, 0 se o banco não responder
  const impacto = [
    { Icone: Recycle, valor: esg.loading ? "—" : formatarPeso(esg.totalPeso), rotulo: "Resíduos reciclados" },
    { Icone: HeartHandshake, valor: esg.loading ? "—" : formatarNumero(esg.familiasImpactadas), rotulo: "Famílias beneficiadas" },
    { Icone: Leaf, valor: esg.loading ? "—" : `${formatarNumero(esg.co2)} t`, rotulo: "CO₂ evitado" },
    { Icone: Sparkles, valor: "2025", rotulo: "Ano de fundação" },
  ];

  return (
    <>
      <Header />

      <main className="qs-page">
        {/* ==================== 1. HERO ==================== */}
        <section className="qs-hero" aria-labelledby="qs-titulo">
          <div className="qs-container qs-hero__grid">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="qs-hero__content"
            >
              {/* Breadcrumb (trilha de navegação) */}
              <nav aria-label="Você está em" className="qs-breadcrumb">
                <ol>
                  <li>
                    <Link href="/">Início</Link>
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight size={14} />
                  </li>
                  <li aria-current="page">Quem somos</li>
                </ol>
              </nav>

              {hero[0]?.subtitulo && (
                <span className="qs-badge">
                  <Recycle size={16} aria-hidden="true" />
                  {hero[0].subtitulo}
                </span>
              )}

              <h1 id="qs-titulo" className="qs-hero__title">
                {hero[0]?.titulo}
              </h1>

              {hero.map((b) =>
                b.texto ? (
                  <p key={b.ordem} className="qs-text qs-text--light" lang="pt-BR">
                    {b.texto}
                  </p>
                ) : null,
              )}

              <div className="qs-actions">
                <a href="#historia" className="qs-btn qs-btn--primary">
                  Conheça nossa história
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <Link href="/#contato" className="qs-btn qs-btn--ghost">
                  Seja parceiro
                </Link>
              </div>
            </motion.div>

            {/* Foto + citação (a foto some no celular para encurtar a página) */}
            <motion.figure
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="qs-hero__media"
            >
              <Image
                src="/images/acmrb-hero.jpg"
                alt="Catadores da ACMRB em atividade"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="qs-hero__img"
              />
              {citacao?.texto && (
                <figcaption className="qs-quote">“{citacao.texto}”</figcaption>
              )}
            </motion.figure>
          </div>
        </section>

        {/* ==================== 2. IMPACTO ==================== */}
        <section className="qs-impacto" aria-label="Nosso impacto em números">
          <div className="qs-container">
            <ul className="qs-impacto__grid" aria-busy={esg.loading}>
              {impacto.map(({ Icone, valor, rotulo }) => (
                <li key={rotulo} className="qs-impacto__item">
                  <Icone size={22} aria-hidden="true" className="qs-impacto__icon" />
                  <span className="qs-impacto__valor">{valor}</span>
                  <span className="qs-impacto__rotulo">{rotulo}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ==================== 3. HISTÓRIA ==================== */}
        <section id="historia" className="qs-section" aria-labelledby="qs-historia">
          <div className="qs-container">
            <motion.header {...surgir} className="qs-section__header">
              <span className="qs-label">Nossa história</span>
              <h2 id="qs-historia" className="qs-section__title">
                {historia?.titulo}
              </h2>
              {historia?.texto && (
                <p className="qs-text" lang="pt-BR">
                  {historia.texto}
                </p>
              )}
            </motion.header>

            {/* Linha do tempo: lista ordenada (semântica de sequência) */}
            <ol className="qs-timeline">
              {timeline.map((item, i) => (
                <motion.li
                  key={item.ordem}
                  {...surgir}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  // O marco da fundação recebe destaque visual
                  className={`qs-timeline__item ${
                    /funda/i.test(item.titulo ?? "") ? "qs-timeline__item--marco" : ""
                  }`}
                >
                  <span className="qs-timeline__dot" aria-hidden="true" />
                  <div className="qs-card qs-timeline__card">
                    {item.rotulo && (
                      <span className="qs-timeline__rotulo">{item.rotulo}</span>
                    )}
                    <h3 className="qs-card__title">{item.titulo}</h3>
                    <p className="qs-text" lang="pt-BR">
                      {item.texto}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* ==================== 4. MISSÃO, VISÃO E VALORES ==================== */}
        <section id="valores" className="qs-section qs-section--alt" aria-labelledby="qs-valores">
          <div className="qs-container">
            <motion.header {...surgir} className="qs-section__header">
              <span className="qs-label">
                {missao || visao ? "Missão, visão e valores" : "Nossos valores"}
              </span>
              <h2 id="qs-valores" className="qs-section__title">
                O que nos guia todos os dias
              </h2>
            </motion.header>

            {/* Missão e visão: aparecem só quando cadastradas no banco */}
            {(missao || visao) && (
              <div className="qs-mv">
                {[
                  { bloco: missao, nome: "Missão", Icone: Target },
                  { bloco: visao, nome: "Visão", Icone: Eye },
                ].map(({ bloco, nome, Icone }) =>
                  bloco?.texto ? (
                    <motion.article key={nome} {...surgir} className="qs-card qs-mv__card">
                      <Icone size={26} aria-hidden="true" className="qs-mv__icon" />
                      <h3 className="qs-card__title">{bloco.titulo || nome}</h3>
                      <p className="qs-text" lang="pt-BR">
                        {bloco.texto}
                      </p>
                    </motion.article>
                  ) : null,
                )}
              </div>
            )}

            <ul className="qs-grid qs-grid--3 qs-grid--compacta">
              {valores.map((v, i) => {
                const Icone = icone(v.icone);
                return (
                  <motion.li
                    key={v.ordem}
                    {...surgir}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="qs-card"
                  >
                    <span className="qs-card__icon" aria-hidden="true">
                      <Icone size={24} />
                    </span>
                    <h3 className="qs-card__title">{v.titulo}</h3>
                    <p className="qs-text" lang="pt-BR">
                      {v.texto}
                    </p>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ==================== 5. O QUE FAZEMOS ==================== */}
        {atuacao.length > 0 && (
          <section id="atuacao" className="qs-section" aria-labelledby="qs-atuacao">
            <div className="qs-container">
              <motion.header {...surgir} className="qs-section__header">
                <span className="qs-label">O que fazemos</span>
                <h2 id="qs-atuacao" className="qs-section__title">
                  Nossas frentes de atuação
                </h2>
              </motion.header>

              <ul className="qs-grid qs-grid--4 qs-grid--compacta">
                {atuacao.map((a, i) => {
                  const Icone = icone(a.icone);
                  return (
                    <motion.li
                      key={a.ordem}
                      {...surgir}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="qs-card qs-card--destaque"
                    >
                      <span className="qs-card__icon" aria-hidden="true">
                        <Icone size={24} />
                      </span>
                      <h3 className="qs-card__title">{a.titulo}</h3>
                      <p className="qs-text" lang="pt-BR">
                        {a.texto}
                      </p>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* ==================== 6. ASSOCIADOS ==================== */}
        <section id="associados" className="qs-section qs-section--alt" aria-labelledby="qs-associados">
          <div className="qs-container">
            <div className="qs-section__header qs-section__header--centro">
              <div>
                <span className="qs-label">Associados</span>
                <h2 id="qs-associados" className="qs-section__title">
                  Pessoas que fazem a diferença todos os dias
                </h2>
                <p className="qs-text" lang="pt-BR">
                  Conheça alguns dos associados que contribuem diariamente para
                  o fortalecimento ambiental, social e operacional da ACMRB.
                </p>
              </div>
              {/* Botão centralizado abaixo do título (cabeçalho centralizado) */}
              <Link href="/associados" className="qs-btn qs-btn--primary">
                Ver todos os associados
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            </div>

            {loading ? (
              <LoadingState text="Carregando associados..." />
            ) : associados.length === 0 ? (
              <EmptyState
                title="Associados em breve"
                description={
                  erro
                    ? "Não conseguimos carregar a lista agora. Tente novamente mais tarde."
                    : "A lista de associados ainda está sendo cadastrada."
                }
              />
            ) : (
              <ul className="qs-grid qs-grid--4">
                {associados.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={a.slug ? `/associados/${a.slug}` : "/associados"}
                      className="qs-associado"
                    >
                      <div className="qs-associado__foto">
                        {a.foto_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.foto_url} alt={a.nome} loading="lazy" />
                        ) : (
                          <span aria-hidden="true">{a.nome.charAt(0).toUpperCase()}</span>
                        )}
                        {a.destaque && <span className="qs-associado__selo">Destaque</span>}
                      </div>
                      <div className="qs-associado__corpo">
                        <h3>{a.nome}</h3>
                        {a.cargo && <p className="qs-associado__cargo">{a.cargo}</p>}
                        {a.tipo_associado && (
                          <p className="qs-associado__tipo">{a.tipo_associado}</p>
                        )}
                        <span className="qs-associado__link">
                          Ver perfil <ArrowRight size={15} aria-hidden="true" />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ==================== 7. PARCEIROS ==================== */}
        <section id="parceiros" className="qs-section" aria-labelledby="qs-parceiros">
          <div className="qs-container">
            <motion.header {...surgir} className="qs-section__header">
              <span className="qs-label">Parceiros</span>
              <h2 id="qs-parceiros" className="qs-section__title">
                Quem caminha conosco
              </h2>
            </motion.header>

            {loading ? (
              <LoadingState text="Carregando parceiros..." />
            ) : parceiros.length === 0 ? (
              <EmptyState
                title="Seja o primeiro parceiro"
                description="Empresas, instituições e órgãos públicos podem apoiar a ACMRB. Fale com a gente pela página de contato."
              />
            ) : (
              <ul className="qs-parceiros">
                {parceiros.map((p) => {
                  const conteudo = p.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo_url} alt={p.nome} loading="lazy" />
                  ) : (
                    <span>{p.nome}</span>
                  );
                  return (
                    <li key={p.id} className="qs-parceiro" title={p.categoria ?? p.nome}>
                      {p.site_url ? (
                        <a href={p.site_url} target="_blank" rel="noopener noreferrer">
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
          </div>
        </section>

        {/* ==================== 8. PRÓXIMOS PASSOS ==================== */}
        {futuro && (
          <section className="qs-section qs-section--alt" aria-labelledby="qs-futuro">
            <div className="qs-container">
              <motion.div {...surgir} className="qs-futuro">
                <span className="qs-badge">
                  <Sparkles size={16} aria-hidden="true" />
                  {futuro.rotulo}
                </span>
                <h2 id="qs-futuro" className="qs-futuro__title">
                  {futuro.titulo}
                </h2>
                <p className="qs-text qs-text--light" lang="pt-BR">
                  {futuro.texto}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* ==================== 9. VÍDEO E INSTAGRAM ==================== */}
        <section className="qs-section" aria-labelledby="qs-midia">
          <div className="qs-container">
            <motion.header {...surgir} className="qs-section__header">
              <span className="qs-label">
                <PlayCircle size={16} aria-hidden="true" /> Vídeo institucional
              </span>
              <h2 id="qs-midia" className="qs-section__title">
                Conheça mais sobre a ACMRB
              </h2>
            </motion.header>

            <div className="qs-video">
              <iframe
                src="https://www.youtube.com/embed/ITur0JNJZos"
                title="Vídeo institucional da ACMRB"
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <h3 className="qs-subtitle">Acompanhe nossas ações no Instagram</h3>
            <div className="qs-instagram">
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
                />
              ))}
            </div>
          </div>
        </section>

        {/* ==================== 10. CHAMADA FINAL ==================== */}
        <section className="qs-section" aria-labelledby="qs-cta">
          <div className="qs-container">
            <motion.div {...surgir} className="qs-cta">
              <div>
                <h2 id="qs-cta" className="qs-cta__title">
                  Faça parte dessa transformação
                </h2>
                <p className="qs-text qs-text--light" lang="pt-BR">
                  Seja parceiro, voluntário, doador ou apoiador. Juntos, podemos
                  construir uma Baturité mais limpa, justa e sustentável.
                </p>
              </div>
              <div className="qs-actions qs-actions--cta">
                <Link href="/#contato" className="qs-btn qs-btn--light">
                  Fale conosco
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/associados" className="qs-btn qs-btn--ghost">
                  <Users size={18} aria-hidden="true" />
                  Conheça os associados
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
