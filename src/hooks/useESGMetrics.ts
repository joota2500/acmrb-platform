"use client";

/**
 * Hook dos indicadores públicos (home e transparência).
 *
 * Origem dos dados:
 *  - Resíduos coletados / valor / materiais por tipo: CALCULADOS a partir de
 *    `materiais_registros` (cada pesagem lançada no painel).
 *  - CO₂, famílias, árvores, energia, água, empresas: MANUAIS, vêm da linha
 *    mais recente de `dashboard_metricas` (preenchida pelo admin "deus").
 *    Por isso o CO₂ aparece 0 enquanto o campo `co2_evitado` não for preenchido.
 *  - Metas: colunas `meta_*` de `dashboard_metricas` (migration
 *    20261020200000). Se ainda não existirem, usa METAS_PADRAO.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MaterialTipo = { nome?: string; cor?: string };

type MaterialRegistro = {
  peso: number | string;
  subtotal: number | string;
  created_at?: string;
  materiais_tipos?: MaterialTipo | null;
};

export type MaterialAgrupado = {
  nome: string;
  cor?: string;
  peso: number;
  valor: number;
  quantidade: number;
};

export type Metas = {
  residuos: number;
  co2: number;
  familias: number;
  arvores: number;
};

/** Metas usadas quando o banco ainda não tem as colunas meta_*. */
export const METAS_PADRAO: Metas = {
  residuos: 5000,
  co2: 10000,
  familias: 300,
  arvores: 500,
};

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const maisRecente = (a: string | null, b?: string | null) =>
  !b ? a : !a || new Date(b) > new Date(a) ? b : a;

export function useESGMetrics() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [totalPeso, setTotalPeso] = useState(0);
  const [totalValor, setTotalValor] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const [familiasImpactadas, setFamiliasImpactadas] = useState(0);
  const [empresasParceiras, setEmpresasParceiras] = useState(0);
  const [co2, setCo2] = useState(0);
  const [arvores, setArvores] = useState(0);
  const [energia, setEnergia] = useState(0);
  const [agua, setAgua] = useState(0);

  const [metas, setMetas] = useState<Metas>(METAS_PADRAO);
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null);

  const [materiais, setMateriais] = useState<MaterialRegistro[]>([]);
  const [materiaisAgrupados, setMateriaisAgrupados] = useState<MaterialAgrupado[]>([]);
  const [topMateriais, setTopMateriais] = useState<MaterialAgrupado[]>([]);

  const carregar = useCallback(async () => {
    // Trava de segurança: se o Supabase não responder em 10s, encerra o
    // carregamento e mostra estado de erro.
    const limite = setTimeout(() => {
      setLoading(false);
      setErro("Não foi possível carregar os indicadores agora.");
    }, 10000);

    setLoading(true);
    setErro(null);
    let ultima: string | null = null;
    let falhas = 0;

    try {
      // As duas consultas rodam em paralelo; uma falhar não impede a outra
      // (antes, erro nos materiais abortava tudo e zerava os manuais).
      const [regs, dash] = await Promise.all([
        supabase
          .from("materiais_registros")
          .select("peso, subtotal, created_at, materiais_tipos ( nome, cor )"),
        // "*" para funcionar com ou sem as colunas meta_* (fallback).
        supabase
          .from("dashboard_metricas")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      /* ---------- Materiais (calculados) ---------- */
      if (regs.error) {
        falhas++;
        console.log("ERRO MATERIAIS:", regs.error);
      } else {
        const lista = (regs.data || []) as unknown as MaterialRegistro[];
        const grupos: Record<string, MaterialAgrupado> = {};
        let peso = 0;
        let valor = 0;
        for (const item of lista) {
          const tipo = Array.isArray(item.materiais_tipos)
            ? (item.materiais_tipos[0] as MaterialTipo | undefined)
            : item.materiais_tipos;
          const nome = tipo?.nome || "Outros";
          const g = (grupos[nome] ??= { nome, cor: tipo?.cor, peso: 0, valor: 0, quantidade: 0 });
          g.peso += num(item.peso);
          g.valor += num(item.subtotal);
          g.quantidade += 1;
          peso += num(item.peso);
          valor += num(item.subtotal);
          ultima = maisRecente(ultima, item.created_at);
        }
        const ordenados = Object.values(grupos).sort((a, b) => b.peso - a.peso);
        setMateriais(lista);
        setMateriaisAgrupados(ordenados);
        setTopMateriais(ordenados.slice(0, 3));
        setTotalPeso(peso);
        setTotalValor(valor);
        setTotalRegistros(lista.length);
      }

      /* ---------- Indicadores manuais + metas ---------- */
      if (dash.error) {
        falhas++;
        console.log("ERRO DASHBOARD:", dash.error);
      } else if (dash.data) {
        const d = dash.data as Record<string, unknown>;
        setFamiliasImpactadas(num(d.familias_impactadas));
        setEmpresasParceiras(num(d.empresas_parceiras));
        setCo2(num(d.co2_evitado));
        setArvores(num(d.arvores_preservadas));
        setEnergia(num(d.energia_economizada));
        setAgua(num(d.agua_economizada));
        setMetas({
          residuos: num(d.meta_residuos_kg) || METAS_PADRAO.residuos,
          co2: num(d.meta_co2_kg) || METAS_PADRAO.co2,
          familias: num(d.meta_familias) || METAS_PADRAO.familias,
          arvores: num(d.meta_arvores) || METAS_PADRAO.arvores,
        });
        ultima = maisRecente(ultima, d.updated_at as string | undefined);
      }

      setAtualizadoEm(ultima);
      if (falhas === 2) setErro("Não foi possível carregar os indicadores agora.");
    } catch (e) {
      console.log("ERRO GERAL:", e);
      setErro("Não foi possível carregar os indicadores agora.");
    } finally {
      clearTimeout(limite);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    loading,
    erro,
    atualizadoEm,
    metas,
    totalPeso,
    totalValor,
    totalRegistros,
    co2,
    arvores,
    energia,
    agua,
    familiasImpactadas,
    empresasParceiras,
    materiais,
    materiaisAgrupados,
    topMateriais,
    atualizar: carregar,
  };
}
