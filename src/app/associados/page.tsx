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
 * Dados: listarAssociadosPublicos() (src/lib/associados.ts) → view
 * associados_publicos, ou a tabela associados (só colunas públicas)
 * enquanto a migration não for rodada. Nada de CPF, e-mail, telefone
 * ou endereço é buscado aqui.
 *
 * Responsividade (src/styles/associados.css):
 *  - Celular (<640px): diretoria em 1 coluna (cartão horizontal), grade
 *    geral em 2 colunas compactas, filtros empilhados.
 *  - Tablet (640–1023px): diretoria 3 colunas, grade 3 colunas, filtros
 *    lado a lado.
 *  - Desktop (>=1024px): grade em 4 colunas.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Search, X } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import AssociadoCard from "@/components/associados/AssociadoCard";

import {
  cargoDiretoria,
  filtrarDiretoria,
  listarAssociadosPublicos,
  normalizar,
  ordenarAssociados,
} from "@/lib/associados";
import type { AssociadoPublico } from "@/types/associados";

import "@/styles/associados.css";

/** Valores únicos (sem repetir por maiúsculas/acentos), em ordem alfabética. */
function opcoesUnicas(valores: (string | null)[]) {
  const mapa = new Map<string, string>();
  valores.forEach((v) => {
    if (v && v.trim()) mapa.set(normalizar(v), v.trim());
  });
  return [...mapa.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export default function AssociadosPage() {
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

      <main className="as-page">
        {/* ==================== 1. HERO ==================== */}
        <section className="as-hero" aria-labelledby="as-titulo">
          <div className="as-container">
            <nav aria-label="Você está em" className="as-breadcrumb">
              <ol>
                <li><Link href="/">Início</Link></li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li><Link href="/quem-somos">Quem somos</Link></li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li aria-current="page">Associados</li>
              </ol>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="as-badge">Associação dos Catadores de Baturité</span>
              <h1 id="as-titulo" className="as-hero__title">Equipe ACMRB</h1>
              <p className="as-text as-text--light" lang="pt-BR">
                Conheça as pessoas que fazem a ACMRB acontecer: catadores,
                diretoria e voluntários que, juntos, transformam materiais
                recicláveis em renda, dignidade e cuidado com Baturité.
              </p>
            </motion.div>
          </div>
        </section>

        {loading ? (
          <div className="as-container as-section">
            <LoadingState text="Carregando associados..." />
          </div>
        ) : erro ? (
          <div className="as-container as-section" role="alert">
            <EmptyState
              title="Não foi possível carregar"
              description="Estamos com dificuldade para acessar a lista de associados. Tente novamente em alguns instantes."
            />
          </div>
        ) : (
          <>
            {/* ==================== 2. DIRETORIA ==================== */}
            {diretoria.length > 0 && (
              <section className="as-section as-section--alt" aria-labelledby="as-diretoria">
                <div className="as-container">
                  <header className="as-section__header">
                    <span className="as-label">Diretoria</span>
                    <h2 id="as-diretoria" className="as-section__title">
                      Quem conduz a associação
                    </h2>
                  </header>
                  <ul className="as-diretoria">
                    {diretoria.map((a) => (
                      <li key={a.id}>
                        <AssociadoCard associado={a} variante="diretoria" />
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* ==================== 3. TODOS OS ASSOCIADOS ==================== */}
            <section className="as-section" aria-labelledby="as-todos">
              <div className="as-container">
                <header className="as-section__header">
                  <span className="as-label">Associados</span>
                  <h2 id="as-todos" className="as-section__title">
                    Todos os associados
                  </h2>
                </header>

                {/* Busca e filtros */}
                <form
                  className="as-filtros"
                  role="search"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <label className="as-campo as-campo--busca">
                    <span className="sr-only">Buscar por nome</span>
                    <Search size={18} aria-hidden="true" className="as-campo__icone" />
                    <input
                      type="search"
                      placeholder="Buscar por nome"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                    />
                  </label>

                  <label className="as-campo">
                    <span className="sr-only">Filtrar por cargo</span>
                    <select value={cargo} onChange={(e) => setCargo(e.target.value)}>
                      <option value="">Todos os cargos</option>
                      {cargos.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>

                  <label className="as-campo">
                    <span className="sr-only">Filtrar por tipo</span>
                    <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                      <option value="">Todos os tipos</option>
                      {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>

                  {temFiltro && (
                    <button type="button" className="as-limpar" onClick={limpar}>
                      <X size={16} aria-hidden="true" /> Limpar
                    </button>
                  )}
                </form>

                {/* Leitores de tela são avisados do resultado da busca */}
                <p className="as-contagem" aria-live="polite">
                  {filtrados.length === 1
                    ? "1 associado encontrado"
                    : `${filtrados.length} associados encontrados`}
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
                  <ul className="as-grid">
                    {filtrados.map((a) => (
                      <li key={a.id}>
                        <AssociadoCard
                          associado={a}
                          variante={cargoDiretoria(a.cargo) ? "destaque" : "padrao"}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
