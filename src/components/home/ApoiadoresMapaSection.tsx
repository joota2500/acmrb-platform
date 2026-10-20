"use client";

/**
 * ApoiadoresMapaSection — "Parceiros e Apoiadores" (página inicial, id="parceiros")
 * ------------------------------------------------------------
 * Substitui a antiga PartnersSection (cards genéricos "ESG").
 *
 * O que mostra:
 *  1. Cabeçalho: selo, título (parte em verde) e apresentação.
 *  2. Contadores (apoiadores, pontos no mapa, categorias).
 *  3. Filtros em chips por categoria e por tipo de apoio.
 *  4. Mapa interativo de Baturité (Leaflet + OpenStreetMap, só no
 *     navegador via next/dynamic) e, ao lado, lista acessível que
 *     também funciona por teclado e para quem não usa o mapa.
 *  5. Botões: "Conheça nossas empresas parceiras" (/parceiros) e
 *     "Quero apoiar" (/#contato).
 *
 * Dados: view pública apoiadores_publicos (sem CPF; pessoa física e
 * anônimos com localização aproximada). Se a migration ainda não foi
 * rodada ou não houver pontos, aparece o estado "Em breve".
 * Responsividade em src/styles/apoiadores-mapa.css.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, Handshake, HeartHandshake, MapPin, MapPinned, RotateCcw, Tags } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { CATEGORIAS, TIPOS_APOIO, corCategoria, listarApoiadoresPublicos, type ApoiadorPublico } from "@/lib/apoiadores";
import "@/styles/apoiadores-mapa.css";

// Leaflet usa window: carrega só no navegador (não quebra o SSR)
const MapaPontos = dynamic(() => import("@/components/mapa/MapaPontos"), {
  ssr: false,
  loading: () => <div className="apmapa__map-loading" aria-hidden="true">Carregando mapa…</div>,
});

export default function ApoiadoresMapaSection() {
  const reduzir = useReducedMotion();
  const [lista, setLista] = useState<ApoiadorPublico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [apoio, setApoio] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    listarApoiadoresPublicos(supabase).then((r) => {
      if (!vivo) return;
      setLista(r.dados);
      setCarregando(false);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const fade = (delay = 0) => ({
    initial: reduzir ? { opacity: 1 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduzir ? 0 : 0.5, delay: reduzir ? 0 : delay },
  });

  // Só mostra chips de categorias/apoios que existem nos dados
  const categoriasUsadas = useMemo(() => CATEGORIAS.filter((c) => lista.some((a) => a.categoria === c)), [lista]);
  const apoiosUsados = useMemo(() => TIPOS_APOIO.filter((t) => lista.some((a) => a.tipos_apoio.includes(t))), [lista]);

  const filtrados = useMemo(
    () => lista.filter((a) => (!categoria || a.categoria === categoria) && (!apoio || a.tipos_apoio.includes(apoio))),
    [lista, categoria, apoio],
  );
  const noMapa = useMemo(() => filtrados.filter((a) => a.no_mapa), [filtrados]);
  const totalNoMapa = lista.filter((a) => a.no_mapa).length;

  const selecionar = useCallback((id: string) => setSelecionado(id), []);
  const limpar = () => {
    setCategoria(null);
    setApoio(null);
  };

  return (
    <section id="parceiros" className="apmapa" aria-labelledby="apmapa-titulo" lang="pt-BR">
      <div className="apmapa__container">
        {/* Cabeçalho */}
        <motion.header className="apmapa__header" {...fade()}>
          <span className="apmapa__tag">
            <Handshake size={14} aria-hidden="true" /> Parceiros e Apoiadores
          </span>
          <h2 id="apmapa-titulo" className="apmapa__title">
            Quem faz a reciclagem acontecer <span>em Baturité</span>
          </h2>
          <p className="apmapa__description">
            Comércios, restaurantes, pousadas, residências, empresas e instituições que apoiam a ACMRB com pontos de
            entrega, doações, divulgação e logística reversa. Cada ponto no mapa representa alguém que fortalece a coleta
            seletiva e o trabalho dos catadores do Maciço de Baturité.
          </p>
        </motion.header>

        {/* Contadores */}
        <motion.ul className="apmapa__stats" {...fade(0.05)} aria-label="Resumo dos apoiadores">
          <li>
            <HeartHandshake size={20} aria-hidden="true" />
            <strong>{carregando ? "—" : lista.length}</strong>
            <span>apoiadores cadastrados</span>
          </li>
          <li>
            <MapPinned size={20} aria-hidden="true" />
            <strong>{carregando ? "—" : totalNoMapa}</strong>
            <span>pontos no mapa</span>
          </li>
          <li>
            <Tags size={20} aria-hidden="true" />
            <strong>{carregando ? "—" : categoriasUsadas.length}</strong>
            <span>categorias</span>
          </li>
        </motion.ul>

        {/* Filtros */}
        {(categoriasUsadas.length > 0 || apoiosUsados.length > 0) && (
          <motion.div className="apmapa__filters" {...fade(0.1)}>
            {categoriasUsadas.length > 0 && (
              <div className="apmapa__chips" role="group" aria-label="Filtrar por categoria">
                <span className="apmapa__chips-label">Categoria</span>
                {categoriasUsadas.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="apmapa__chip"
                    aria-pressed={categoria === c}
                    style={{ ["--chip" as string]: corCategoria(c) }}
                    onClick={() => setCategoria(categoria === c ? null : c)}
                  >
                    <span className="apmapa__dot" aria-hidden="true" /> {c}
                  </button>
                ))}
              </div>
            )}
            {apoiosUsados.length > 0 && (
              <div className="apmapa__chips" role="group" aria-label="Filtrar por tipo de apoio">
                <span className="apmapa__chips-label">Tipo de apoio</span>
                {apoiosUsados.map((t) => (
                  <button key={t} type="button" className="apmapa__chip apmapa__chip--apoio" aria-pressed={apoio === t} onClick={() => setApoio(apoio === t ? null : t)}>
                    {t}
                  </button>
                ))}
              </div>
            )}
            {(categoria || apoio) && (
              <button type="button" className="apmapa__clear" onClick={limpar}>
                <RotateCcw size={14} aria-hidden="true" /> Limpar filtros
              </button>
            )}
          </motion.div>
        )}

        {/* Mapa + lista */}
        <motion.div className="apmapa__board" {...fade(0.15)}>
          <div className="apmapa__map">
            <MapaPontos pontos={noMapa} selecionado={selecionado} onSelecionar={selecionar} />
            {!carregando && noMapa.length === 0 && (
              <div className="apmapa__empty" role="status">
                <MapPin size={28} aria-hidden="true" />
                <strong>{lista.length === 0 || totalNoMapa === 0 ? "Em breve os primeiros pontos no mapa" : "Nenhum ponto com esse filtro"}</strong>
                <p>
                  {totalNoMapa === 0
                    ? "Estamos cadastrando os comércios, casas e instituições que apoiam a coleta seletiva em Baturité."
                    : "Tente outra categoria ou limpe os filtros para ver todos os pontos."}
                </p>
              </div>
            )}
          </div>

          <aside className="apmapa__list" aria-label="Lista de apoiadores">
            <p className="apmapa__list-count" aria-live="polite">
              {carregando ? "Carregando apoiadores…" : `${filtrados.length} ${filtrados.length === 1 ? "apoiador" : "apoiadores"}`}
            </p>
            {!carregando && filtrados.length === 0 ? (
              <p className="apmapa__list-empty">Os apoiadores aparecerão aqui assim que forem cadastrados.</p>
            ) : (
              <ul>
                {filtrados.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      className="apmapa__item"
                      aria-current={selecionado === a.id}
                      disabled={!a.no_mapa}
                      title={a.no_mapa ? "Ver no mapa" : "Ainda sem ponto no mapa"}
                      onClick={() => setSelecionado(a.id)}
                    >
                      {a.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.logo_url} alt="" className="apmapa__item-logo" loading="lazy" />
                      ) : (
                        <span className="apmapa__item-logo apmapa__item-logo--ini" style={{ background: corCategoria(a.categoria) }} aria-hidden="true">
                          {a.nome_exibicao.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="apmapa__item-text">
                        <strong>{a.nome_exibicao}</strong>
                        <span>
                          {a.categoria}
                          {a.bairro ? ` · ${a.bairro}` : ""}
                        </span>
                      </span>
                      {a.no_mapa && <MapPin size={16} className="apmapa__item-pin" aria-hidden="true" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </motion.div>

        {/* CTAs */}
        <motion.div className="apmapa__cta" {...fade(0.2)}>
          <div className="apmapa__cta-text">
            <h3>Empresas parceiras e logística reversa</h3>
            <p>
              Conheça as empresas que recebem os materiais triados pela ACMRB, os responsáveis por cada parceria e o histórico
              público do que já foi repassado para reciclagem.
            </p>
          </div>
          <div className="apmapa__cta-actions">
            <Link href="/parceiros" className="apmapa__btn">
              <Building2 size={18} aria-hidden="true" /> Conheça nossas empresas parceiras <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a href="/#contato" className="apmapa__btn apmapa__btn--ghost">
              <HeartHandshake size={18} aria-hidden="true" /> Quero apoiar
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
