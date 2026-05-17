"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

export function useESGMetrics() {

  const [
    loading,
    setLoading,
  ] = useState(true);

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

  const [
    materiais,
    setMateriais,
  ] = useState<any[]>([]);

  const [
    dashboardMetricas,
    setDashboardMetricas,
  ] = useState<any[]>([]);

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
      } = await supabase
        .from(
          "materiais_registros",
        )
        .select(`
          *,
          materiais_tipos (
            nome,
            cor
          )
        `);

      /* =========================
         DASHBOARD
      ========================= */

      const {
        data: dashboard,
      } = await supabase
        .from(
          "dashboard_metricas",
        )
        .select("*");

      const materiais =
        materiaisData || [];

      const peso =
        materiais.reduce(
          (
            acc,
            item,
          ) =>
            acc +
            Number(
              item.peso || 0,
            ),
          0,
        );

      const valor =
        materiais.reduce(
          (
            acc,
            item,
          ) =>
            acc +
            Number(
              item.subtotal || 0,
            ),
          0,
        );

      setTotalPeso(peso);

      setTotalValor(valor);

      setTotalRegistros(
        materiais.length,
      );

      setMateriais(
        materiais,
      );

      setDashboardMetricas(
        dashboard || [],
      );

    } finally {

      setLoading(false);

    }

  }

  /* =========================
     ESG CALCULATIONS
  ========================= */

  const co2 =
    totalPeso * 1.8;

  const arvores =
    totalPeso * 0.12;

  /* =========================
     METRIC VALUE
  ========================= */

  function getMetric(
    titulo: string,
  ) {

    const item =
      dashboardMetricas.find(
        (m) =>
          m.titulo ===
          titulo,
      );

    return (
      item?.valor || 0
    );

  }

  /* =========================
     MATERIAIS AGRUPADOS
  ========================= */

  const materiaisAgrupados =
    materiais.reduce(
      (acc, item) => {

        const nome =
          item
            ?.materiais_tipos
            ?.nome ||
          "Sem nome";

        if (!acc[nome]) {

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
      {} as Record<
        string,
        any
      >,
    );

  return {

    loading,

    totalPeso,

    totalValor,

    totalRegistros,

    co2,

    arvores,

    materiais,

    dashboardMetricas,

    materiaisAgrupados:
      Object.values(
        materiaisAgrupados,
      ),

    familiasImpactadas:
      getMetric(
        "Famílias Impactadas",
      ),

    empresasParceiras:
      getMetric(
        "Empresas Parceiras",
      ),

  };

}