"use client";

/**
 * NoticiasJornal — conteúdo da página /noticias (visual novo, só Tailwind)
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
import { selecionarHome, textoPuro, type Noticia } from "@/utils/noticias";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Input, { Select } from "@/components/ui/Input";
import { cn } from "@/utils/cn";

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

  // caixa de aviso (erro e "nada encontrado")
  const caixaAviso =
    "mx-auto flex max-w-xl flex-col items-center gap-3 rounded-card border border-black/5 bg-white p-8 text-center text-ink-soft shadow-card";

  // classe do rótulo pequeno em cima das seções ("Manchete", "Mais lidas")
  const rotulo =
    "mb-3 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-leaf";

  return (
    <main className="bg-surface-alt" lang="pt-BR">
      {/* ---------- Topo ---------- */}
      <section className="relative isolate overflow-hidden bg-emerald-950 pb-24 pt-24 sm:pb-28 sm:pt-28 lg:pb-32">
        {/* brilhos decorativos no fundo */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 -z-10 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 -z-10 size-80 rounded-full bg-sun/10 blur-3xl" />

        <Container>
          <nav aria-label="Você está em">
            <ol className="flex items-center gap-1.5 text-sm text-emerald-200">
              <li>
                <Link href="/" className="hover:text-white hover:underline">Início</Link>
              </li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li aria-current="page" className="font-semibold text-white">Notícias</li>
            </ol>
          </nav>

          <div className="mt-6 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-md">
              <Newspaper size={14} className="text-emerald-300" aria-hidden="true" /> Portal de Notícias da ACMRB
            </span>
            <h1 className="mt-5 text-balance text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Notícias e <span className="text-emerald-300">Atualizações</span>
            </h1>
            <p className="mt-5 text-pretty text-base leading-relaxed text-emerald-100 sm:text-lg">
              Acompanhe os projetos, as ações sociais, a educação ambiental, as parcerias e os resultados da
              coleta seletiva da Associação de Catadores de Materiais Recicláveis de Baturité. Todo o conteúdo
              é publicado pela própria associação.
            </p>
            <p className="mt-4 text-sm font-semibold capitalize text-emerald-300">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              {!carregando && ` • ${noticias.length} ${noticias.length === 1 ? "notícia publicada" : "notícias publicadas"}`}
            </p>
          </div>
        </Container>
      </section>

      {/* ---------- Filtros (cartão que sobe sobre o topo) ---------- */}
      <section className="relative z-10 -mt-14 sm:-mt-16" aria-label="Filtrar notícias">
        <Container>
          <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-pop sm:p-6">
            <div className="flex gap-3">
              <label className="relative flex-1">
                <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
                <span className="sr-only">Buscar notícias</span>
                <Input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar notícias"
                  className="h-12 pl-11 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
                />
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca("")}
                    aria-label="Limpar busca"
                    className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-brand-soft"
                  >
                    <X size={16} />
                  </button>
                )}
              </label>
              {/* no celular os filtros ficam escondidos atrás deste botão */}
              <Button
                type="button"
                variante="contorno"
                className="h-12 px-3 md:hidden"
                aria-expanded={filtrosAbertos}
                aria-controls="nj-filtros"
                onClick={() => setFiltrosAbertos((v) => !v)}
              >
                <SlidersHorizontal size={16} aria-hidden="true" /> Filtros
              </Button>
            </div>

            <div id="nj-filtros" className={cn("mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4", !filtrosAbertos && "max-md:hidden")}>
              {[
                {
                  rotulo: "Categoria",
                  valor: categoria,
                  aoMudar: (v: string) => definir({ categoria: v }),
                  opcoes: [["", "Todas"], ...opcoes.categorias.map(([c, n]) => [c, `${c} (${n})`])],
                },
                {
                  rotulo: "Ano",
                  valor: ano,
                  aoMudar: (v: string) => definir({ ano: v }),
                  opcoes: [["", "Todos"], ...opcoes.anos.map((a) => [a, a])],
                },
                {
                  rotulo: "Mês",
                  valor: mes,
                  aoMudar: (v: string) => definir({ mes: v }),
                  opcoes: [["", "Todos"], ...MESES.map((m, i) => [String(i + 1), m])],
                },
                {
                  rotulo: "Ordenar",
                  valor: ordem,
                  aoMudar: (v: string) => definir({ ordem: v === "lidas" ? "lidas" : "" }),
                  opcoes: [["recentes", "Mais recentes"], ["lidas", "Mais lidas"]],
                },
              ].map((f) => (
                <label key={f.rotulo} className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">{f.rotulo}</span>
                  <Select value={f.valor} onChange={(e) => f.aoMudar(e.target.value)}>
                    {f.opcoes.map(([v, texto]) => (
                      <option key={v} value={v}>{texto}</option>
                    ))}
                  </Select>
                </label>
              ))}
            </div>

            {opcoes.tags.length > 0 && (
              <div className={cn("mt-4 flex flex-wrap gap-2", !filtrosAbertos && "max-md:hidden")} aria-label="Assuntos">
                {opcoes.tags.map(([t]) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tag === t}
                    onClick={() => definir({ tag: tag === t ? "" : t })}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                      tag === t ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-brand-soft",
                    )}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-sm" aria-live="polite">
              <span className="font-semibold text-ink-soft">
                {!carregando &&
                  `${filtradas.length} ${filtradas.length === 1 ? "notícia encontrada" : "notícias encontradas"}`}
              </span>
              {temFiltro && (
                <button type="button" onClick={limpar} className="inline-flex items-center gap-1.5 font-bold text-leaf hover:underline">
                  <X size={14} aria-hidden="true" /> Limpar filtros
                </button>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- Conteúdo ---------- */}
      <section className="py-12 sm:py-16 lg:py-20">
        <Container>
          {carregando && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-card bg-white" />
              ))}
            </div>
          )}

          {!carregando && erro && (
            <div className={caixaAviso} role="alert">
              <AlertTriangle size={30} className="text-warning" aria-hidden="true" />
              <p>{erro}</p>
              <Button type="button" onClick={recarregar}>
                <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
              </Button>
            </div>
          )}

          {/* Manchete + "Mais lidas" (só sem filtro ativo) */}
          {!carregando && !erro && manchete && (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
              <motion.div {...entrar(0)} className="min-w-0">
                <span className={rotulo}>Manchete</span>
                <NoticiaCard noticia={manchete} variante="grande" nivelTitulo="h2" />
              </motion.div>
              {maisLidas.length > 0 && (
                <aside aria-labelledby="nj-mais-lidas" className="min-w-0">
                  <h2 id="nj-mais-lidas" className={rotulo}>
                    <TrendingUp size={14} aria-hidden="true" /> Mais lidas
                  </h2>
                  <ol className="flex flex-col gap-3">
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

          {/* Grade de notícias */}
          {!carregando && !erro && grade.length > 0 && (
            <>
              <h2 className="mb-6 mt-14 text-2xl font-black text-ink first:mt-0 sm:text-3xl">
                {temFiltro ? "Resultados" : "Últimas notícias"}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visiveis.map((n, i) => (
                  <motion.div key={n.id} {...entrar(i)} className="min-w-0">
                    <NoticiaCard noticia={n} mostrarVisualizacoes={ordem === "lidas"} />
                  </motion.div>
                ))}
              </div>
              {qtd < grade.length && (
                <div className="mt-10 flex justify-center">
                  <Button type="button" tamanho="grande" onClick={() => setQtd((v) => v + POR_PAGINA)}>
                    Carregar mais notícias ({grade.length - qtd} restantes)
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Nada encontrado */}
          {!carregando && !erro && filtradas.length === 0 && (
            <div className={caixaAviso}>
              <Newspaper size={30} className="text-leaf" aria-hidden="true" />
              <h2 className="text-xl font-black text-ink">
                {noticias.length ? "Nenhuma notícia com esses filtros" : "Nenhuma notícia publicada ainda"}
              </h2>
              <p>{noticias.length ? "Tente outra palavra ou limpe os filtros." : "Em breve as novidades da ACMRB estarão aqui."}</p>
              {temFiltro && (
                <Button type="button" onClick={limpar}>
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
