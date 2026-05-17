"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  RefreshCcw,
  BarChart3,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import DashboardStatsCards from "@/components/admin/dashboard/DashboardStatsCards";

import DashboardImpactCard from "@/components/admin/dashboard/DashboardImpactCard";

import DashboardMaterialsCard from "@/components/admin/dashboard/DashboardMaterialsCard";

type DashboardMetricas = {

  id?: string;

  residuos_reciclados: number;

  co2_evitado: number;

  familias_impactadas: number;

  catadores_ativos: number;

  renda_gerada: number;

  empresas_parceiras: number;

  coletas_realizadas: number;

  bairros_atendidos: number;

  residuos_desviados_aterro: number;

  educacao_ambiental_acoes: number;

  pessoas_impactadas: number;

  toneladas_papelao: number;

  toneladas_plastico: number;

  toneladas_vidro: number;

  toneladas_metal: number;

  toneladas_eletronicos: number;

  arvores_preservadas: number;

  agua_economizada: number;

  energia_economizada: number;
};

export default function DashboardSection() {

  const [
    dados,
    setDados,
  ] = useState<DashboardMetricas | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    atualizando,
    setAtualizando,
  ] = useState(false);

  async function carregarDados() {

    try {

      setAtualizando(true);

      const { data, error } =
        await supabase
          .from("dashboard_metricas")
          .select("*")
          .limit(1)
          .maybeSingle();

      console.log("DATA:", data);

      console.log("ERROR:", error);

      if (error) {

        console.log(error);

        return;

      }

      setDados(data);

    } finally {

      setLoading(false);

      setAtualizando(false);

    }

  }

  useEffect(() => {

    carregarDados();

  }, []);

  /* LOADING */

  if (loading) {

    return (

      <div
        className="
          bg-white
          rounded-4xl
          border
          border-black/5
          p-16
          text-center
        "
      >

        <div
          className="
            w-16
            h-16
            border-4
            border-zinc-200
            border-t-[#2E5E4E]
            rounded-full
            animate-spin
            mx-auto
          "
        />

        <p
          className="
            text-zinc-500
            mt-6
            text-lg
          "
        >

          Carregando indicadores ESG...

        </p>

      </div>

    );

  }

  /* EMPTY */

  if (!dados) {

    return (

      <div
        className="
          bg-white
          rounded-4xl
          border
          border-red-100
          p-16
          text-center
        "
      >

        <h2
          className="
            text-4xl
            font-black
            text-red-500
          "
        >

          Nenhum dado encontrado

        </h2>

        <p
          className="
            text-zinc-500
            mt-4
          "
        >

          Cadastre métricas ESG
          no banco de dados.

        </p>

      </div>

    );

  }

  return (

    <div className="space-y-8">

      {/* HERO */}

      <div
        className="
          relative
          overflow-hidden
          rounded-4xl
          bg-linear-to-br
          from-[#1E3A34]
          via-[#24463E]
          to-[#2E5E4E]
          p-10
          text-white
        "
      >

        {/* BG EFFECT */}

        <div
          className="
            absolute
            inset-0
            opacity-10
            bg-[radial-gradient(circle_at_top_right,white,transparent_40%)]
          "
        />

        <div
          className="
            relative
            z-10
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-8
          "
        >

          {/* LEFT */}

          <div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-5
                py-3
                rounded-full
                bg-white/10
                backdrop-blur-md
                text-sm
                font-black
                mb-6
              "
            >

              ♻ Plataforma ESG

            </div>

            <h1
              className="
                text-5xl
                font-black
                leading-tight
              "
            >

              Dashboard
              Ambiental ACMRB

            </h1>

            <p
              className="
                text-white/70
                mt-5
                max-w-3xl
                leading-8
                text-lg
              "
            >

              Gestão estratégica
              de indicadores ESG,
              impacto ambiental,
              logística reversa
              e métricas da Política
              Nacional de Resíduos Sólidos.

            </p>

          </div>

          {/* RIGHT */}

          <div
            className="
              flex
              flex-col
              md:flex-row
              gap-4
            "
          >

            <button
              onClick={carregarDados}
              disabled={atualizando}
              className="
                h-16
                px-8
                rounded-3xl
                bg-white/10
                hover:bg-white/20
                transition
                backdrop-blur-md
                font-black
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <RefreshCcw
                size={20}
                className={
                  atualizando
                    ? "animate-spin"
                    : ""
                }
              />

              Atualizar dados

            </button>

            <div
              className="
                h-16
                px-8
                rounded-3xl
                bg-white
                text-[#1E3A34]
                font-black
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <BarChart3 size={22} />

              Painel ESG Ativo

            </div>

          </div>

        </div>

      </div>

      {/* STATS */}

      <DashboardStatsCards
        dados={dados}
      />

      {/* DETAILS */}

      <div
        className="
          grid
          xl:grid-cols-2
          gap-6
        "
      >

        <DashboardImpactCard
          dados={dados}
        />

        <DashboardMaterialsCard
          dados={dados}
        />

      </div>

    </div>

  );

}