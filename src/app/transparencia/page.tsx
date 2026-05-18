"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Recycle,
  Trees,
  Users,
  Wallet,
  Leaf,
  BarChart3,
  ShieldCheck,
  Building2,
  TrendingUp,
  FileBarChart2,
  Globe2,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
  Activity,
  Factory,
  Landmark,
  Boxes,
  MapPinned,
  Truck,
  Cpu,
  Waves,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Indicadores = {

  residuos_reciclados?: number;

  co2_evitado?: number;

  familias_impactadas?: number;

  catadores_ativos?: number;

  renda_gerada?: number;

  empresas_parceiras?: number;

  coletas_realizadas?: number;

  bairros_atendidos?: number;

  residuos_desviados_aterro?: number;

  educacao_ambiental_acoes?: number;

  pessoas_impactadas?: number;

  toneladas_papelao?: number;

  toneladas_plastico?: number;

  toneladas_vidro?: number;

  toneladas_metal?: number;

  toneladas_eletronicos?: number;

  arvores_preservadas?: number;

  agua_economizada?: number;

  energia_economizada?: number;

};

type Material = {

  id: string;

  nome: string;

  peso_total: number;

};

export default function RelatorioPage() {

  const [loading, setLoading] =
    useState(true);

  const [dados, setDados] =
    useState<Indicadores>({});

  const [materiais, setMateriais] =
    useState<Material[]>([]);

  async function carregarDados() {

    setLoading(true);

    /* =========================
       DASHBOARD MÉTRICAS
    ========================= */

    const {
      data: metricas,
    } = await supabase
      .from("dashboard_metricas")
      .select("*")
      .single();

    if (metricas) {

      setDados(metricas);

    }

    /* =========================
       MATERIAIS
    ========================= */

    const {
      data: materiaisData,
    } = await supabase
      .from("materiais_registros")
      .select(`
        peso,
        material_id,
        materiais_tipos (
          id,
          nome
        )
      `);

    if (materiaisData) {

      const agrupados: Record<
        string,
        Material
      > = {};

      materiaisData.forEach(
        (item: any) => {

          const nome =
            item.materiais_tipos?.nome ||
            "Material";

          const id =
            item.materiais_tipos?.id;

          if (!agrupados[id]) {

            agrupados[id] = {

              id,

              nome,

              peso_total: 0,

            };

          }

          agrupados[id]
            .peso_total += Number(
            item.peso || 0,
          );

        },
      );

      setMateriais(
        Object.values(
          agrupados,
        ),
      );

    }

    setLoading(false);

  }

  useEffect(() => {

    carregarDados();

  }, []);

  /* =========================
     FORMATADORES
  ========================= */

  function formatPeso(
    value: number = 0,
  ) {

    if (value >= 1000) {

      return `${(
        value / 1000
      ).toFixed(1)}t`;

    }

    return `${value.toFixed(0)}kg`;

  }

  function formatMoney(
    value: number = 0,
  ) {

    return value.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      },
    );

  }

  return (

    <main className="bg-[#F4F7F3] min-h-screen overflow-hidden">

      {/* HERO */}

      <section
        className="
          relative
          pt-28
          pb-24
        "
      >

        <div
          className="
            absolute
            inset-0
            overflow-hidden
          "
        >

          <div
            className="
              absolute
              -top-40
              -left-40
              w-[500px]
              h-[500px]
              rounded-full
              bg-emerald-200/30
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-0
              right-0
              w-[450px]
              h-[450px]
              rounded-full
              bg-cyan-200/20
              blur-3xl
            "
          />

        </div>

        <div
          className="
            relative
            z-10
            max-w-7xl
            mx-auto
            px-4
            md:px-5
          "
        >

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-3
              h-12
              px-5
              rounded-2xl
              bg-white
              border
              border-black/5
              shadow-sm
              hover:shadow-lg
              transition-all
              text-[#111827]
              font-semibold
            "
          >

            <ArrowLeft size={18} />

            Voltar para início

          </Link>

          <div
            className="
              mt-8
              bg-white/90
              backdrop-blur-xl
              rounded-[42px]
              border
              border-black/5
              overflow-hidden
              shadow-2xl
            "
          >

            <div
              className="
                grid
                xl:grid-cols-2
              "
            >

              {/* LEFT */}

              <div
                className="
                  p-8
                  md:p-14
                  xl:p-16
                "
              >

                <div
                  className="
                    inline-flex
                    items-center
                    gap-3
                    px-5
                    py-3
                    rounded-full
                    bg-[#DDF5EC]
                    text-[#2E5E4E]
                    font-black
                    text-sm
                  "
                >

                  <FileBarChart2 size={18} />

                  Central ESG • Transparência Pública

                </div>

                <h1
                  className="
                    mt-8
                    text-4xl
                    md:text-6xl
                    font-black
                    leading-[1]
                    tracking-[-0.04em]
                    text-[#111827]
                  "
                >

                  Indicadores públicos,
                  métricas ambientais
                  e impacto social
                  da ACMRB.

                </h1>

                <p
                  className="
                    mt-8
                    text-base
                    md:text-xl
                    leading-8
                    md:leading-9
                    text-zinc-600
                    text-justify
                  "
                >

                  Todos os dados exibidos nesta
                  central são integrados
                  diretamente ao banco de dados
                  institucional da plataforma
                  ACMRB, garantindo atualização
                  dinâmica, rastreabilidade
                  operacional e transparência
                  pública em tempo real.

                </p>

              </div>

              {/* RIGHT */}

              <div
                className="
                  relative
                  overflow-hidden
                  bg-linear-to-br
                  from-[#111827]
                  via-[#182132]
                  to-[#2E5E4E]
                  text-white
                  p-10
                  md:p-14
                "
              >

                <div
                  className="
                    absolute
                    top-10
                    right-10
                    w-80
                    h-80
                    rounded-full
                    bg-emerald-500/20
                    blur-3xl
                  "
                />

                <div className="relative z-10">

                  <div
                    className="
                      w-24
                      h-24
                      rounded-[30px]
                      bg-white/10
                      border
                      border-white/10
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <BarChart3 size={50} />

                  </div>

                  <h2
                    className="
                      mt-10
                      text-6xl
                      font-black
                    "
                  >

                    ESG

                  </h2>

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-5
                      mt-10
                    "
                  >

                    <div
                      className="
                        rounded-3xl
                        bg-white/10
                        border
                        border-white/10
                        p-5
                      "
                    >

                      <Users size={28} />

                      <h3
                        className="
                          mt-4
                          text-4xl
                          font-black
                        "
                      >

                        {loading
                          ? "--"
                          : dados.catadores_ativos}

                      </h3>

                      <p className="text-zinc-300 mt-2">
                        Catadores ativos
                      </p>

                    </div>

                    <div
                      className="
                        rounded-3xl
                        bg-white/10
                        border
                        border-white/10
                        p-5
                      "
                    >

                      <Truck size={28} />

                      <h3
                        className="
                          mt-4
                          text-4xl
                          font-black
                        "
                      >

                        {loading
                          ? "--"
                          : dados.coletas_realizadas}

                      </h3>

                      <p className="text-zinc-300 mt-2">
                        Coletas realizadas
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CARDS PRINCIPAIS */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-4
          md:px-5
          pb-24
        "
      >

        <div
          className="
            grid
            md:grid-cols-2
            xl:grid-cols-5
            gap-6
          "
        >

          {[
            {
              icon: Recycle,
              value: formatPeso(
                dados.residuos_reciclados,
              ),
              title:
                "Resíduos reciclados",
              color:
                "from-[#1D4E5F] to-[#3B82F6]",
            },

            {
              icon: Leaf,
              value: formatPeso(
                dados.co2_evitado,
              ),
              title:
                "CO₂ evitado",
              color:
                "from-[#059669] to-[#10B981]",
            },

            {
              icon: Trees,
              value:
                dados.arvores_preservadas,
              title:
                "Árvores preservadas",
              color:
                "from-[#16A34A] to-[#22C55E]",
            },

            {
              icon: Users,
              value:
                `${dados.familias_impactadas}+`,
              title:
                "Famílias impactadas",
              color:
                "from-[#7C3AED] to-[#A855F7]",
            },

            {
              icon: Wallet,
              value: formatMoney(
                dados.renda_gerada,
              ),
              title:
                "Renda gerada",
              color:
                "from-[#0891B2] to-[#06B6D4]",
            },

          ].map(
            (
              item,
              index,
            ) => {

              const Icon =
                item.icon;

              return (

                <div
                  key={index}
                  className={`
                    rounded-[36px]
                    bg-linear-to-br
                    ${item.color}
                    p-8
                    text-white
                    shadow-2xl
                  `}
                >

                  <Icon size={42} />

                  <h2
                    className="
                      mt-8
                      text-5xl
                      font-black
                    "
                  >

                    {loading
                      ? "--"
                      : item.value}

                  </h2>

                  <h3
                    className="
                      mt-4
                      text-2xl
                      font-black
                    "
                  >

                    {item.title}

                  </h3>

                </div>

              );

            },
          )}

        </div>

      </section>

      {/* MÉTRICAS OPERACIONAIS */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-4
          md:px-5
          pb-24
        "
      >

        <div
          className="
            bg-white
            rounded-[42px]
            border
            border-black/5
            shadow-xl
            p-8
            md:p-14
          "
        >

          <div
            className="
              flex
              flex-col
              xl:flex-row
              xl:items-end
              xl:justify-between
              gap-8
            "
          >

            <div>

              <div
                className="
                  inline-flex
                  items-center
                  gap-3
                  px-5
                  py-3
                  rounded-full
                  bg-[#E8F3EE]
                  text-[#2E5E4E]
                  font-black
                  text-sm
                "
              >

                📊 Métricas operacionais

              </div>

              <h2
                className="
                  mt-8
                  text-4xl
                  md:text-5xl
                  font-black
                  text-[#111827]
                "
              >

                Dados institucionais
                e ambientais integrados.

              </h2>

            </div>

          </div>

          <div
            className="
              grid
              md:grid-cols-2
              xl:grid-cols-4
              gap-6
              mt-14
            "
          >

            <div className="bg-[#F5F7F4] rounded-3xl p-6">

              <Factory
                size={34}
                className="text-[#2E5E4E]"
              />

              <h3 className="mt-5 text-5xl font-black text-[#111827]">
                {dados.empresas_parceiras}
              </h3>

              <p className="mt-3 text-zinc-500 leading-7">
                Empresas parceiras vinculadas.
              </p>

            </div>

            <div className="bg-[#F5F7F4] rounded-3xl p-6">

              <MapPinned
                size={34}
                className="text-[#2E5E4E]"
              />

              <h3 className="mt-5 text-5xl font-black text-[#111827]">
                {dados.bairros_atendidos}
              </h3>

              <p className="mt-3 text-zinc-500 leading-7">
                Bairros atendidos pela coleta.
              </p>

            </div>

            <div className="bg-[#F5F7F4] rounded-3xl p-6">

              <Sparkles
                size={34}
                className="text-[#2E5E4E]"
              />

              <h3 className="mt-5 text-5xl font-black text-[#111827]">
                {dados.educacao_ambiental_acoes}
              </h3>

              <p className="mt-3 text-zinc-500 leading-7">
                Ações de educação ambiental.
              </p>

            </div>

            <div className="bg-[#F5F7F4] rounded-3xl p-6">

              <Activity
                size={34}
                className="text-[#2E5E4E]"
              />

              <h3 className="mt-5 text-5xl font-black text-[#111827]">
                {dados.pessoas_impactadas}
              </h3>

              <p className="mt-3 text-zinc-500 leading-7">
                Pessoas impactadas pelas ações.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* MATERIAIS */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-4
          md:px-5
          pb-24
        "
      >

        <div
          className="
            bg-[#111827]
            rounded-[42px]
            p-8
            md:p-14
            text-white
            overflow-hidden
            relative
          "
        >

          <div
            className="
              absolute
              top-0
              right-0
              w-[400px]
              h-[400px]
              bg-emerald-500/10
              rounded-full
              blur-3xl
            "
          />

          <div className="relative z-10">

            <div
              className="
                inline-flex
                items-center
                gap-3
                px-5
                py-3
                rounded-full
                bg-white/10
                border
                border-white/10
                text-white
                font-black
                text-sm
              "
            >

              <Boxes size={18} />

              Materiais recicláveis monitorados

            </div>

            <h2
              className="
                mt-8
                text-4xl
                md:text-5xl
                font-black
              "
            >

              Volume total
              por categoria
              de material.

            </h2>

            <div
              className="
                grid
                md:grid-cols-2
                xl:grid-cols-5
                gap-6
                mt-14
              "
            >

              {materiais.map(
                (
                  item,
                ) => (

                  <div
                    key={item.id}
                    className="
                      rounded-3xl
                      bg-white/5
                      border
                      border-white/10
                      p-6
                    "
                  >

                    <Recycle size={34} />

                    <h3
                      className="
                        mt-6
                        text-4xl
                        font-black
                      "
                    >

                      {formatPeso(
                        item.peso_total,
                      )}

                    </h3>

                    <p
                      className="
                        mt-3
                        text-zinc-300
                        text-lg
                        font-semibold
                      "
                    >

                      {item.nome}

                    </p>

                  </div>

                ),
              )}

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}