"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

/* =========================
   TYPES
========================= */

type MaterialTipo = {

  nome?: string;

  cor?: string;

};

type MaterialRegistro = {

  peso: number | string;

  subtotal: number | string;

  materiais_tipos?: MaterialTipo | null;

};

type MaterialAgrupado = {

  nome: string;

  peso: number;

  valor: number;

  quantidade: number;

};

/* =========================
   HOOK
========================= */

export function useESGMetrics() {

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =========================
     TOTAIS AUTOMÁTICOS
  ========================= */

  const [
    totalPeso,
    setTotalPeso,
  ] = useState(0);

  const [
    totalValor,
    setTotalValor,
  ] = useState(0);

  const [
    totalRegistros,
    setTotalRegistros,
  ] = useState(0);

  /* =========================
     ESG MANUAL
  ========================= */

  const [
    familiasImpactadas,
    setFamiliasImpactadas,
  ] = useState(0);

  const [
    empresasParceiras,
    setEmpresasParceiras,
  ] = useState(0);

  const [
    co2,
    setCo2,
  ] = useState(0);

  const [
    arvores,
    setArvores,
  ] = useState(0);

  const [
    energia,
    setEnergia,
  ] = useState(0);

  const [
    agua,
    setAgua,
  ] = useState(0);

  /* =========================
     MATERIAIS
  ========================= */

  const [
    materiais,
    setMateriais,
  ] = useState<
    MaterialRegistro[]
  >([]);

  const [
    materiaisAgrupados,
    setMateriaisAgrupados,
  ] = useState<
    MaterialAgrupado[]
  >([]);

  const [
    topMateriais,
    setTopMateriais,
  ] = useState<
    MaterialAgrupado[]
  >([]);

  /* =========================
     LOAD
  ========================= */

  useEffect(() => {

    carregar();

  }, []);

  async function carregar() {

    try {

      setLoading(true);

      /* =========================
         MATERIAIS
      ========================= */

      const {
        data: materiaisData,
        error: materiaisError,
      } = await supabase
        .from(
          "materiais_registros",
        )
        .select(`
          peso,
          subtotal,
          materiais_tipos (
            nome,
            cor
          )
        `);

      if (materiaisError) {

        console.log(
          "ERRO MATERIAIS:",
          materiaisError,
        );

        return;

      }

      /* =========================
         DASHBOARD
      ========================= */

      const {
        data: dashboard,
        error: dashboardError,
      } = await supabase
        .from(
          "dashboard_metricas",
        )
        .select(`
          familias_impactadas,
          empresas_parceiras,
          co2_evitado,
          arvores_preservadas,
          energia_economizada,
          agua_economizada
        `)
        .limit(1)
        .maybeSingle();

      if (dashboardError) {

        console.log(
          "ERRO DASHBOARD:",
          dashboardError,
        );

      }

      const materiais =
        (
          materiaisData || []
        ) as MaterialRegistro[];

      /* =========================
         TOTAIS
      ========================= */

      const pesoTotal =
        materiais.reduce(
          (
            acc,
            item,
          ) => {

            return (
              acc +
              Number(
                item.peso || 0,
              )
            );

          },
          0,
        );

      const valorTotal =
        materiais.reduce(
          (
            acc,
            item,
          ) => {

            return (
              acc +
              Number(
                item.subtotal || 0,
              )
            );

          },
          0,
        );

      /* =========================
         AGRUPAMENTO
      ========================= */

      const agrupados =
        materiais.reduce<
          Record<
            string,
            MaterialAgrupado
          >
        >(
          (
            acc,
            item,
          ) => {

            const nome =
              item
                ?.materiais_tipos
                ?.nome ||
              "Sem nome";

            if (
              !acc[nome]
            ) {

              acc[nome] = {

                nome,

                peso: 0,

                valor: 0,

                quantidade: 0,

              };

            }

            acc[nome].peso +=
              Number(
                item.peso || 0,
              );

            acc[nome].valor +=
              Number(
                item.subtotal || 0,
              );

            acc[
              nome
            ].quantidade += 1;

            return acc;

          },

          {},
        );

      const lista:
        MaterialAgrupado[] =
          Object.values(
            agrupados,
          ).sort(
            (
              a,
              b,
            ) =>
              b.peso -
              a.peso,
          );

      /* =========================
         STATES
      ========================= */

      setMateriais(
        materiais,
      );

      setMateriaisAgrupados(
        lista,
      );

      setTopMateriais(
        lista.slice(0, 3),
      );

      setTotalPeso(
        pesoTotal,
      );

      setTotalValor(
        valorTotal,
      );

      setTotalRegistros(
        materiais.length,
      );

      /* ESG MANUAL */

      setFamiliasImpactadas(
        Number(
          dashboard?.familias_impactadas || 0,
        ),
      );

      setEmpresasParceiras(
        Number(
          dashboard?.empresas_parceiras || 0,
        ),
      );

      setCo2(
        Number(
          dashboard?.co2_evitado || 0,
        ),
      );

      setArvores(
        Number(
          dashboard?.arvores_preservadas || 0,
        ),
      );

      setEnergia(
        Number(
          dashboard?.energia_economizada || 0,
        ),
      );

      setAgua(
        Number(
          dashboard?.agua_economizada || 0,
        ),
      );

    } catch (error) {

      console.log(
        "ERRO GERAL:",
        error,
      );

    } finally {

      setLoading(false);

    }

  }

  return {

    loading,

    /* AUTOMÁTICOS */

    totalPeso,

    totalValor,

    totalRegistros,

    /* ESG MANUAL */

    co2,

    arvores,

    energia,

    agua,

    familiasImpactadas,

    empresasParceiras,

    /* MATERIAIS */

    materiais,

    materiaisAgrupados,

    topMateriais,

    atualizar:
      carregar,

  };

}