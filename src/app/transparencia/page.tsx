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
 * Estilos gerais: src/styles/transparencia-page.css; cada seção tem
 * o seu CSS. Celular ≤480px compacto, tablet 2 colunas, desktop completo.
 */

import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
import "@/styles/transparencia-page.css";

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
    <main className="tp-pagina" lang="pt-BR">
      <Header />
      <TranspHero atualizadoEm={t.atualizadoEm} periodo={periodo} loading={t.loading} onAtualizar={t.recarregar} />
      <TranspNav />

      {t.erro && (
        <div className="tp-container">
          <div className="tp-alerta" role="alert">
            <AlertTriangle size={18} aria-hidden />
            <span>{t.erro}</span>
            <button type="button" onClick={t.recarregar}><RefreshCw size={14} aria-hidden /> Tentar de novo</button>
          </div>
        </div>
      )}

      {t.loading && !t.registros.length ? (
        <div className="tp-container tp-carregando" aria-live="polite">
          {[0, 1, 2, 3].map((i) => <div key={i} className="tp-esqueleto" />)}
          <span className="sr-only">Carregando dados de transparência…</span>
        </div>
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
      <Footer />
    </main>
  );
}
