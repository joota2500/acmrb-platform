"use client";

/**
 * NoticiasJornal — conteúdo da página /noticias
 * ------------------------------------------------------------
 *  1. Topo: breadcrumb, título e contagem
 *  2. Filtros: busca, categoria, ano, mês, tag e ordenação. Ficam
 *     na URL (dá para compartilhar o link já filtrado).
 *  3. Manchete (destaque ou mais recente) + "Mais lidas" ao lado,
 *     só quando não há filtro ativo.
 *  4. Grade de notícias com "Carregar mais" (9 por vez).
 * Os dados vêm de useNoticiasPublicas (só notícias publicadas).
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ChevronRight, Newspaper, RefreshCw, Search, SlidersHorizontal, TrendingUp, X } from "lucide-react";
import NoticiaCard from "@/components/noticias/NoticiaCard";
import { useNoticiasPublicas } from "@/hooks/useNoticiasPublicas";
import { selecionarHome, textoPuro, type Noticia } from "@/lib/noticias";

import "@/styles/noticias-page.css";

const POR_PAGINA = 9;
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const semAcento = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function NoticiasJornal() {
  const { noticias, carregando, erro, recarregar } = useNoticiasPublicas(500);
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const reduzir = useReducedMotion();

  const q = params.get("q") ?? "";
  const categoria = params.get("categoria") ?? "";
  const ano = params.get("ano") ?? "";
  const mes = params.get("mes") ?? "";
  const tag = params.get("tag") ?? "";
  const ordem = params.get("ordem") === "lidas" ? "lidas" : "recentes";

  const [busca, setBusca] = useState(q);
  const [qtd, setQtd] = useState(POR_PAGINA);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  useEffect(() => setBusca(q), [q]);
  useEffect(() => setQtd(POR_PAGINA), [q, categoria, ano, mes, tag, ordem]);

  /** Atualiza um ou mais filtros na URL sem recarregar a página */
  function definir(novos: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(novos).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
    const s = sp.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  // busca com atraso de 350 ms enquanto digita
  useEffect(() => {
    if (busca === q) return;
    const t = setTimeout(() => definir({ q: busca.trim() }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  /* ---------- Opções dos filtros (a partir dos dados) ---------- */
  const opcoes = useMemo(() => {
    const cats = new Map<string, number>();
    const anos = new Set<string>();
    const tags = new Map<string, number>();
    noticias.forEach((n) => {
      if (n.categoria) cats.set(n.categoria, (cats.get(n.categoria) ?? 0) + 1);
      anos.add(String(new Date(n.publicado_em).getFullYear()));
      n.tags.forEach((t) => tags.set(t, (tags.get(t) ?? 0) + 1));
    });
    return {
      categorias: [...cats.entries()].sort((a, b) => b[1] - a[1]),
      anos: [...anos].sort((a, b) => +b - +a),
      tags: [...tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14),
    };
  }, [noticias]);

  /* ---------- Filtragem e ordenação ---------- */
  const filtradas = useMemo(() => {
    const termo = semAcento(q.trim());
    let lista = noticias.filter((n) => {
      const d = new Date(n.publicado_em);
      if (categoria && n.categoria !== categoria) return false;
      if (ano && String(d.getFullYear()) !== ano) return false;
      if (mes && String(d.getMonth() + 1) !== mes) return false;
      if (tag && !n.tags.includes(tag)) return false;
      if (termo) {
        const alvo = semAcento(`${n.titulo} ${n.resumo} ${n.categoria} ${n.tags.join(" ")} ${textoPuro(n.conteudo)}`);
        if (!termo.split(/\s+/).every((p) => alvo.includes(p))) return false;
      }
      return true;
    });
    if (ordem === "lidas") lista = [...lista].sort((a, b) => b.visualizacoes - a.visualizacoes);
    return lista;
  }, [noticias, q, categoria, ano, mes, tag, ordem]);

  const temFiltro = Boolean(q || categoria || ano || mes || tag || ordem === "lidas");
  const manchete: Noticia | undefined = !temFiltro ? selecionarHome(noticias, 1)[0] : undefined;
  const maisLidas = useMemo(
    () => [...noticias].filter((n) => n.id !== manchete?.id).sort((a, b) => b.visualizacoes - a.visualizacoes).slice(0, 4),
    [noticias, manchete],
  );
  const grade = manchete ? filtradas.filter((n) => n.id !== manchete.id) : filtradas;
  const visiveis = grade.slice(0, qtd);

  const limpar = () => {
    setBusca("");
    router.replace(pathname, { scroll: false });
  };

  const entrar = (i: number) =>
    reduzir
      ? {}
      : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, delay: Math.min(i, 8) * 0.04 } };

  return (
    <main className="nj" lang="pt-BR">
      {/* ---------- Topo ---------- */}
      <section className="nj__topo">
        <div className="nj__container">
          <nav aria-label="Você está em" className="nj__breadcrumb">
            <Link href="/">Início</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">Notícias</span>
          </nav>
          <div className="nj__masthead">
            <span className="nj__tag">
              <Newspaper size={14} aria-hidden="true" /> Portal de Notícias da ACMRB
            </span>
            <h1 className="nj__titulo">
              Notícias e <span>Atualizações</span>
            </h1>
            <p className="nj__descricao">
              Acompanhe os projetos, as ações sociais, a educação ambiental, as parcerias e os resultados da
              coleta seletiva da Associação de Catadores de Materiais Recicláveis de Baturité. Todo o conteúdo
              é publicado pela própria associação.
            </p>
            <p className="nj__edicao">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              {!carregando && ` • ${noticias.length} ${noticias.length === 1 ? "notícia publicada" : "notícias publicadas"}`}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Filtros ---------- */}
      <section className="nj__filtros-faixa" aria-label="Filtrar notícias">
        <div className="nj__container">
          <div className="nj__busca-linha">
            <label className="nj__busca">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">Buscar notícias</span>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por título, assunto ou palavra-chave"
              />
              {busca && (
                <button type="button" onClick={() => setBusca("")} aria-label="Limpar busca">
                  <X size={16} />
                </button>
              )}
            </label>
            <button
              type="button"
              className="nj__btn-filtros"
              aria-expanded={filtrosAbertos}
              aria-controls="nj-filtros"
              onClick={() => setFiltrosAbertos((v) => !v)}
            >
              <SlidersHorizontal size={16} aria-hidden="true" /> Filtros
            </button>
          </div>

          <div id="nj-filtros" className={`nj__filtros ${filtrosAbertos ? "nj__filtros--aberto" : ""}`}>
            <label className="nj__campo">
              <span>Categoria</span>
              <select value={categoria} onChange={(e) => definir({ categoria: e.target.value })}>
                <option value="">Todas</option>
                {opcoes.categorias.map(([c, n]) => (
                  <option key={c} value={c}>{c} ({n})</option>
                ))}
              </select>
            </label>
            <label className="nj__campo">
              <span>Ano</span>
              <select value={ano} onChange={(e) => definir({ ano: e.target.value })}>
                <option value="">Todos</option>
                {opcoes.anos.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="nj__campo">
              <span>Mês</span>
              <select value={mes} onChange={(e) => definir({ mes: e.target.value })}>
                <option value="">Todos</option>
                {MESES.map((m, i) => (
                  <option key={m} value={String(i + 1)}>{m}</option>
                ))}
              </select>
            </label>
            <label className="nj__campo">
              <span>Ordenar</span>
              <select value={ordem} onChange={(e) => definir({ ordem: e.target.value === "lidas" ? "lidas" : "" })}>
                <option value="recentes">Mais recentes</option>
                <option value="lidas">Mais lidas</option>
              </select>
            </label>
          </div>

          {opcoes.tags.length > 0 && (
            <div className="nj__tags" aria-label="Assuntos">
              {opcoes.tags.map(([t]) => (
                <button
                  key={t}
                  type="button"
                  className={`nj__chip ${tag === t ? "nj__chip--ativo" : ""}`}
                  aria-pressed={tag === t}
                  onClick={() => definir({ tag: tag === t ? "" : t })}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          <div className="nj__resultado" aria-live="polite">
            {!carregando && (
              <span>
                {filtradas.length} {filtradas.length === 1 ? "notícia encontrada" : "notícias encontradas"}
              </span>
            )}
            {temFiltro && (
              <button type="button" className="nj__limpar" onClick={limpar}>
                <X size={14} aria-hidden="true" /> Limpar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Conteúdo ---------- */}
      <section className="nj__conteudo">
        <div className="nj__container">
          {carregando && (
            <div className="nj__grade" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="nj__esqueleto" />
              ))}
            </div>
          )}

          {!carregando && erro && (
            <div className="nj__aviso" role="alert">
              <AlertTriangle size={30} aria-hidden="true" />
              <p>{erro}</p>
              <button type="button" className="nj__btn" onClick={recarregar}>
                <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
              </button>
            </div>
          )}

          {!carregando && !erro && manchete && (
            <div className="nj__capa">
              <motion.div className="nj__manchete" {...entrar(0)}>
                <span className="nj__rotulo">Manchete</span>
                <NoticiaCard noticia={manchete} variante="grande" nivelTitulo="h2" />
              </motion.div>
              {maisLidas.length > 0 && (
                <aside className="nj__lateral" aria-labelledby="nj-mais-lidas">
                  <h2 id="nj-mais-lidas" className="nj__rotulo">
                    <TrendingUp size={14} aria-hidden="true" /> Mais lidas
                  </h2>
                  <ol className="nj__lista-lidas">
                    {maisLidas.map((n) => (
                      <li key={n.id}>
                        <NoticiaCard noticia={n} variante="compacto" mostrarVisualizacoes />
                      </li>
                    ))}
                  </ol>
                </aside>
              )}
            </div>
          )}

          {!carregando && !erro && grade.length > 0 && (
            <>
              <h2 className="nj__secao">{temFiltro ? "Resultados" : "Últimas notícias"}</h2>
              <div className="nj__grade">
                {visiveis.map((n, i) => (
                  <motion.div key={n.id} {...entrar(i)}>
                    <NoticiaCard noticia={n} mostrarVisualizacoes={ordem === "lidas"} />
                  </motion.div>
                ))}
              </div>
              {qtd < grade.length && (
                <div className="nj__mais">
                  <button type="button" className="nj__btn" onClick={() => setQtd((v) => v + POR_PAGINA)}>
                    Carregar mais notícias ({grade.length - qtd} restantes)
                  </button>
                </div>
              )}
            </>
          )}

          {!carregando && !erro && filtradas.length === 0 && (
            <div className="nj__aviso">
              <Newspaper size={30} aria-hidden="true" />
              <h2>{noticias.length ? "Nenhuma notícia com esses filtros" : "Nenhuma notícia publicada ainda"}</h2>
              <p>{noticias.length ? "Tente outra palavra ou limpe os filtros." : "Em breve as novidades da ACMRB estarão aqui."}</p>
              {temFiltro && (
                <button type="button" className="nj__btn" onClick={limpar}>
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
