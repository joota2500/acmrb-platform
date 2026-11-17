"use client";

/**
 * Página /associados — Equipe ACMRB
 * ------------------------------------------------------------
 * Seções:
 *  1. Hero: breadcrumb (Início › Quem somos › Associados), título e texto
 *  2. Diretoria: Presidente, Secretário(a) e Tesoureiro(a) em destaque
 *  3. Todos os associados ativos, com busca por nome e filtros por
 *     cargo e por tipo de associado
 *
 * Dados: listarAssociadosPublicos() (src/services/associados.ts) → view
 * associados_publicos, ou a tabela associados (só colunas públicas)
 * enquanto a migration não for rodada. Nada de CPF, e-mail, telefone
 * ou endereço é buscado aqui.
 *
 * Responsividade:
 *  - Celular (<640px): diretoria em 1 coluna, grade geral em 2 colunas,
 *    filtros empilhados.
 *  - Tablet (640–1023px): diretoria 3 colunas, grade 3 colunas.
 *  - Desktop (>=1024px): grade em 4 colunas.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, ChevronRight, Search, Users, X } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AssociadoCard from "@/components/associados/AssociadoCard";
import FaixaCta from "@/components/home/FaixaCta";
import TituloSecao from "@/components/home/TituloSecao";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Input";
import { useAparecer } from "@/hooks/useAparecer";

import {
  cargoDiretoria,
  filtrarDiretoria,
  listarAssociadosPublicos,
  normalizar,
  ordenarAssociados,
} from "@/services/associados";
import type { AssociadoPublico } from "@/types/associados";

/** Valores únicos (sem repetir por maiúsculas/acentos), em ordem alfabética. */
function opcoesUnicas(valores: (string | null)[]) {
  const mapa = new Map<string, string>();
  valores.forEach((v) => {
    if (v && v.trim()) mapa.set(normalizar(v), v.trim());
  });
  return [...mapa.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export default function AssociadosPage() {
  const aparecer = useAparecer();
  const [lista, setLista] = useState<AssociadoPublico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros
  const [busca, setBusca] = useState("");
  const [cargo, setCargo] = useState("");
  const [tipo, setTipo] = useState("");

  // Carrega uma vez ao abrir a página (com limite de 10s na lib)
  useEffect(() => {
    let ativo = true;
    listarAssociadosPublicos().then(({ data, erro }) => {
      if (!ativo) return;
      setLista(ordenarAssociados(data));
      setErro(erro);
      setLoading(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const diretoria = useMemo(() => filtrarDiretoria(lista), [lista]);
  const cargos = useMemo(() => opcoesUnicas(lista.map((a) => a.cargo)), [lista]);
  const tipos = useMemo(() => opcoesUnicas(lista.map((a) => a.tipo_associado)), [lista]);

  // Aplica busca (sem acento/maiúscula) + filtros
  const filtrados = useMemo(() => {
    const termo = normalizar(busca);
    return lista.filter(
      (a) =>
        (!termo || normalizar(a.nome).includes(termo)) &&
        (!cargo || normalizar(a.cargo) === normalizar(cargo)) &&
        (!tipo || normalizar(a.tipo_associado) === normalizar(tipo)),
    );
  }, [lista, busca, cargo, tipo]);

  const temFiltro = Boolean(busca || cargo || tipo);
  const limpar = () => {
    setBusca("");
    setCargo("");
    setTipo("");
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-surface-alt" lang="pt-BR">
        {/* ==================== 1. HERO ==================== */}
        <section className="relative isolate overflow-hidden bg-emerald-950 pb-20 pt-24 sm:pb-24 sm:pt-28 lg:pb-28" aria-labelledby="as-titulo">
          {/* brilhos decorativos no fundo */}
          <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 -z-10 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 -z-10 size-80 rounded-full bg-sun/10 blur-3xl" />

          <Container>
            <nav aria-label="Você está em">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-emerald-200">
                <li><Link href="/" className="hover:text-white hover:underline">Início</Link></li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li><Link href="/quem-somos" className="hover:text-white hover:underline">Quem somos</Link></li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li aria-current="page" className="font-semibold text-white">Associados</li>
              </ol>
            </nav>

            <motion.div className="mt-6 max-w-3xl" {...aparecer()}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-md">
                <Users size={14} className="text-emerald-300" aria-hidden="true" /> Associação dos Catadores de Baturité
              </span>
              <h1 id="as-titulo" className="mt-5 text-balance text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Equipe <span className="text-emerald-300">ACMRB</span>
              </h1>
              <p className="mt-5 text-pretty text-base leading-relaxed text-emerald-100 sm:text-lg">
                Conheça as pessoas que fazem a ACMRB acontecer: catadores, diretoria e voluntários que, juntos,
                transformam materiais recicláveis em renda, dignidade e cuidado com Baturité.
              </p>
            </motion.div>
          </Container>
        </section>

        {/* ---------- Carregando / erro ---------- */}
        {loading && (
          <Container className="-mt-10 pb-16 sm:-mt-12">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Carregando associados" role="status">
              {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-4/5 animate-pulse rounded-card bg-white shadow-card" />)}
            </div>
          </Container>
        )}

        {!loading && erro && (
          <Container className="py-16" role="alert">
            <EmptyState
              title="Não foi possível carregar"
              description="Estamos com dificuldade para acessar a lista de associados. Tente novamente em alguns instantes."
            />
          </Container>
        )}

        {!loading && !erro && (
          <>
            {/* ==================== 2. DIRETORIA ==================== */}
            {diretoria.length > 0 && (
              <Container className="relative z-10 -mt-10 sm:-mt-12">
                <section aria-labelledby="as-diretoria" className="rounded-3xl border border-black/5 bg-white p-5 shadow-pop sm:p-8 lg:p-10">
                  <TituloSecao
                    id="as-diretoria"
                    etiqueta="Diretoria"
                    icone={Award}
                    alinhamento="esquerda"
                    className="mb-6 sm:mb-8"
                    titulo={<>Quem <span>conduz</span> a associação</>}
                  />
                  <ul className="grid gap-4 sm:grid-cols-3 sm:gap-6">
                    {diretoria.map((a, i) => (
                      <motion.li key={a.id} {...aparecer(i * 0.08)}>
                        <AssociadoCard associado={a} variante="diretoria" />
                      </motion.li>
                    ))}
                  </ul>
                </section>
              </Container>
            )}

            {/* ==================== 3. TODOS OS ASSOCIADOS ==================== */}
            <Container className={diretoria.length > 0 ? "pb-16 pt-14 sm:pb-24 sm:pt-20" : "relative z-10 -mt-10 pb-16 sm:-mt-12 sm:pb-24"}>
              <section aria-labelledby="as-todos">
                <TituloSecao
                  id="as-todos"
                  etiqueta="Associados"
                  icone={Users}
                  alinhamento="esquerda"
                  className="mb-6 sm:mb-8"
                  titulo={<>Todos os <span>associados</span></>}
                />

                {/* Busca e filtros */}
                <form
                  role="search"
                  onSubmit={(e) => e.preventDefault()}
                  className="z-20 mb-4 grid gap-3 rounded-card border border-line bg-white/90 p-3 shadow-card backdrop-blur-md sm:sticky sm:top-18 sm:grid-cols-2 sm:p-4 lg:top-17 lg:grid-cols-[1fr_13rem_13rem_auto]"
                >
                  <label className="relative sm:col-span-2 lg:col-span-1">
                    <span className="sr-only">Buscar por nome</span>
                    <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="search"
                      placeholder="Buscar por nome"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="h-11 w-full rounded-control border border-line bg-white pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none"
                    />
                  </label>

                  <label>
                    <span className="sr-only">Filtrar por cargo</span>
                    <Select value={cargo} onChange={(e) => setCargo(e.target.value)}>
                      <option value="">Todos os cargos</option>
                      {cargos.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </label>

                  <label>
                    <span className="sr-only">Filtrar por tipo</span>
                    <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                      <option value="">Todos os tipos</option>
                      {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </label>

                  {temFiltro && (
                    <Button type="button" variante="fantasma" onClick={limpar} className="sm:col-span-2 lg:col-span-1">
                      <X size={16} aria-hidden="true" /> Limpar
                    </Button>
                  )}
                </form>

                {/* Leitores de tela são avisados do resultado da busca */}
                <p className="mb-6 text-sm text-ink-soft" aria-live="polite">
                  {filtrados.length === 1 ? "1 associado encontrado" : `${filtrados.length} associados encontrados`}
                </p>

                {lista.length === 0 ? (
                  <EmptyState
                    title="Nenhum associado cadastrado"
                    description="A lista de associados ainda está sendo preparada."
                  />
                ) : filtrados.length === 0 ? (
                  <EmptyState
                    title="Nenhum resultado"
                    description="Nenhum associado corresponde à busca. Tente outro nome ou limpe os filtros."
                  />
                ) : (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                    {filtrados.map((a, i) => (
                      <motion.li key={a.id} {...aparecer(Math.min(i, 7) * 0.04)}>
                        <AssociadoCard associado={a} variante={cargoDiretoria(a.cargo) ? "destaque" : "padrao"} />
                      </motion.li>
                    ))}
                  </ul>
                )}
              </section>

              <FaixaCta
                titulo="Conheça a história da ACMRB"
                texto="Saiba como a associação nasceu, o que defendemos e como a coleta seletiva muda a vida de quem trabalha com reciclagem em Baturité."
              >
                <Button href="/quem-somos" variante="claro" tamanho="grande">Quem somos</Button>
                <Button href="/#contato" variante="contornoClaro" tamanho="grande">Fale conosco</Button>
              </FaixaCta>
            </Container>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
