"use client";

/**
 * Página /transparencia — Central ESG • Transparência Pública
 * ------------------------------------------------------------
 * Refeita do zero (antes: um arquivo único de ~1.800 linhas).
 * Tudo o que é transparência no site fica aqui; a home mostra só
 * um resumo (TransparencySummarySection) com link para esta página.
 *
 * Seções (componentes em src/components/transparencia/):
 *  1. TranspHero         — título, data real da última atualização
 *  2. TranspNav          — navegação fixa por âncoras
 *  3. TranspIndicadores  — #indicadores: 4 principais com meta + extras
 *  4. TranspOperacional  — #operacional: filtros, totais, ranking, CSV
 *  5. TranspEvolucao     — #evolucao: gráfico mensal (CSS puro)
 *  6. TranspSocial       — #impacto: associados, famílias, ações...
 *  7. TranspDocumentos   — #documentos: transparencia_documentos
 *  8. TranspFaq          — #metodologia: como os dados são produzidos
 *
 * Dados: hook useTransparencia (Supabase). Os filtros de ano e
 * material ficam aqui porque valem para Materiais e Evolução.
 * Estilo: Tailwind em cada componente (sem arquivos CSS). Celular
 * compacto, tablet 2 colunas, desktop completo.
 */

import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import Button from "@/components/ui/Button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TranspHero from "@/components/transparencia/TranspHero";
import TranspNav from "@/components/transparencia/TranspNav";
import TranspIndicadores from "@/components/transparencia/TranspIndicadores";
import TranspOperacional from "@/components/transparencia/TranspOperacional";
import TranspEvolucao from "@/components/transparencia/TranspEvolucao";
import TranspSocial from "@/components/transparencia/TranspSocial";
import TranspDocumentos from "@/components/transparencia/TranspDocumentos";
import TranspFaq from "@/components/transparencia/TranspFaq";
import { useTransparencia } from "@/hooks/useTransparencia";
import Container from "@/components/ui/Container";

export default function TransparenciaPage() {
  const t = useTransparencia();
  const [ano, setAno] = useState("todos");
  const [material, setMaterial] = useState("todos");

  const anos = useMemo(
    () => [...new Set(t.registros.filter((r) => r.data).map((r) => new Date(r.data).getFullYear()))].sort((a, b) => b - a),
    [t.registros],
  );
  const materiais = useMemo(() => [...new Set(t.registros.map((r) => r.material))].sort(), [t.registros]);

  // Filtro por ano + material
  const porAno = useMemo(
    () => (ano === "todos" ? t.registros : t.registros.filter((r) => r.data && String(new Date(r.data).getFullYear()) === ano)),
    [t.registros, ano],
  );
  const filtrados = useMemo(
    () => (material === "todos" ? porAno : porAno.filter((r) => r.material === material)),
    [porAno, material],
  );

  const totalPeso = useMemo(() => t.registros.reduce((s, r) => s + r.peso, 0), [t.registros]);
  const periodo = typeof t.metricas?.periodo_referencia === "string" ? t.metricas.periodo_referencia : undefined;

  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-clip bg-surface-alt" lang="pt-BR">
        <TranspHero atualizadoEm={t.atualizadoEm} periodo={periodo} loading={t.loading} onAtualizar={t.recarregar} />
        <TranspNav />

        {t.erro && (
          <Container className="mt-6">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>{t.erro}</span>
              <Button type="button" variante="perigo" tamanho="pequeno" className="ml-auto" onClick={t.recarregar}>
                <RefreshCw size={14} aria-hidden="true" /> Tentar de novo
              </Button>
            </div>
          </Container>
        )}

        {t.loading && !t.registros.length ? (
          <Container className="grid gap-5 py-12 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-card bg-white sm:h-44" />)}
            <span className="sr-only">Carregando dados de transparência…</span>
          </Container>
        ) : (
          <>
            <TranspIndicadores totalPeso={totalPeso} metricas={t.metricas} metas={t.metas} />
            <TranspOperacional
              registros={filtrados}
              anos={anos}
              materiais={materiais}
              ano={ano}
              material={material}
              onAno={setAno}
              onMaterial={setMaterial}
            />
            <TranspEvolucao registros={filtrados} ano={ano} />
            <TranspSocial metricas={t.metricas} associadosAtivos={t.associadosAtivos} parceirosAtivos={t.parceirosAtivos} />
            <TranspDocumentos documentos={t.documentos} />
          </>
        )}

        <TranspFaq />
      </main>
      <Footer />
    </>
  );
}
