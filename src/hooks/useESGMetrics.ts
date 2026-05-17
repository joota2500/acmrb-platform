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
    materiaisAgrupados,
    setMateriaisAgrupados,
  ] = useState<any[]>([]);

  const [
    familiasImpactadas,
    setFamiliasImpactadas,
  ] = useState(0);

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
         ASSOCIADOS
      ========================= */

      const {
        count,
      } = await supabase
        .from("associados")
        .select("*", {
          count: "exact",
          head: true,
        });

      const materiais =
        materiaisData || [];

      /* =========================
         PESO TOTAL
      ========================= */

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

      /* =========================
         VALOR TOTAL
      ========================= */

      const valor =
        materiais.reduce(
          (
            acc,
            item,
          ) => {

            const peso =
              Number(
                item.peso || 0,
              );

            const valorKg =
              Number(
                item.valor_kg || 0,
              );

            return (
              acc +
              peso * valorKg
            );

          },
          0,
        );

      /* =========================
         AGRUPAMENTO
      ========================= */

      const agrupados =
        materiais.reduce(
          (
            acc,
            item,
          ) => {

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

            const peso =
              Number(
                item.peso || 0,
              );

            const valorKg =
              Number(
                item.valor_kg || 0,
              );

            acc[nome].peso +=
              peso;

            acc[nome].valor +=
              peso * valorKg;

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

      setTotalPeso(peso);

      setTotalValor(valor);

      setTotalRegistros(
        materiais.length,
      );

      setMateriais(
        materiais,
      );

      setMateriaisAgrupados(
        Object.values(
          agrupados,
        ),
      );

      setFamiliasImpactadas(
        count || 0,
      );

    } finally {

      setLoading(false);

    }

  }

  /* =========================
     ESG
  ========================= */

  const co2 =
    totalPeso * 1.8;

  const arvores =
    totalPeso * 0.12;

  const energia =
    totalPeso * 95;

  return {

    loading,

    totalPeso,

    totalValor,

    totalRegistros,

    materiais,

    materiaisAgrupados,

    familiasImpactadas,

    co2,

    arvores,

    energia,

  };

}