"use client";

import {
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Recycle,
  Cloud,
  Users,
  Factory,
  Trees,
  Wallet,
  TrendingUp,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function ESGMetrics() {

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
    metricas,
    setMetricas,
  ] = useState<any[]>([]);

  useEffect(() => {

    carregarDados();

  }, []);

  async function carregarDados() {

    try {

      setLoading(true);

      /* =========================
         MATERIAIS
      ========================= */

      const {
        data: materiais,
      } = await supabase
        .from("materiais_registros")
        .select(`
          peso,
          subtotal
        `);

      const peso =
        materiais?.reduce(
          (
            acc,
            item,
          ) =>
            acc +
            Number(
              item.peso || 0,
            ),
          0,
        ) || 0;

      const valor =
        materiais?.reduce(
          (
            acc,
            item,
          ) =>
            acc +
            Number(
              item.subtotal || 0,
            ),
          0,
        ) || 0;

      setTotalPeso(peso);

      setTotalValor(valor);

      /* =========================
         DASHBOARD
      ========================= */

      const {
        data: dashboard,
      } = await supabase
        .from("dashboard_metricas")
        .select("*");

      setMetricas(
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

  const metaPeso =
    2000;

  const metaCo2 =
    5000;

  const metaArvores =
    300;

  function percentual(
    atual: number,
    meta: number,
  ) {

    const valor =
      (atual / meta) * 100;

    return `${Math.min(
      valor,
      100,
    ).toFixed(0)}%`;

  }

  function getMetricValue(
    titulo: string,
  ) {

    const item =
      metricas.find(
        (metrica) =>
          metrica.titulo ===
          titulo,
      );

    return (
      item?.valor || 0
    );

  }

  const familias =
    Number(
      getMetricValue(
        "Famílias Impactadas",
      ),
    );

  const parceiros =
    Number(
      getMetricValue(
        "Empresas Parceiras",
      ),
    );

  const metrics = [

    {
      title:
        "Resíduos reciclados",

      value:
        `${totalPeso.toFixed(0)}kg`,

      progress:
        percentual(
          totalPeso,
          metaPeso,
        ),

      description:
        "Materiais destinados corretamente através da coleta seletiva e logística reversa.",

      icon: Recycle,

      gradient:
        "from-[#2E5E4E] to-[#5C9B80]",
    },

    {
      title:
        "CO₂ evitado",

      value:
        `${co2.toFixed(0)}kg`,

      progress:
        percentual(
          co2,
          metaCo2,
        ),

      description:
        "Estimativa de emissões reduzidas através da reciclagem e reaproveitamento.",

      icon: Cloud,

      gradient:
        "from-cyan-500 to-blue-500",
    },

    {
      title:
        "Famílias impactadas",

      value:
        `${familias}`,

      progress:
        percentual(
          familias,
          100,
        ),

      description:
        "Catadores e famílias beneficiadas pelas operações sustentáveis da associação.",

      icon: Users,

      gradient:
        "from-violet-500 to-fuchsia-500",
    },

    {
      title:
        "Parcerias ESG",

      value:
        `${parceiros}`,

      progress:
        percentual(
          parceiros,
          20,
        ),

      description:
        "Instituições e empresas conectadas às ações ambientais da ACMRB.",

      icon: Factory,

      gradient:
        "from-orange-500 to-yellow-400",
    },

    {
      title:
        "Árvores preservadas",

      value:
        `${arvores.toFixed(0)}`,

      progress:
        percentual(
          arvores,
          metaArvores,
        ),

      description:
        "Estimativa equivalente de preservação ambiental gerada pela reciclagem.",

      icon: Trees,

      gradient:
        "from-emerald-500 to-green-500",
    },

    {
      title:
        "Renda gerada",

      value:
        `R$ ${totalValor.toFixed(2)}`,

      progress:
        percentual(
          totalValor,
          10000,
        ),

      description:
        "Movimentação financeira gerada pelos materiais recicláveis recebidos.",

      icon: Wallet,

      gradient:
        "from-teal-500 to-cyan-400",
    },

  ];

  return (

    <section
      className="
        py-32
        relative
        overflow-hidden
        bg-linear-to-b
        from-[#F5F7F4]
        to-white
      "
    >

      {/* BACKGROUND */}

      <div className="absolute inset-0">

        <div className="absolute top-0 left-0 w-125 h-125 bg-emerald-200/20 blur-3xl rounded-full" />

        <div className="absolute bottom-0 right-0 w-112.5 h-112.5 bg-cyan-200/20 blur-3xl rounded-full" />

      </div>

      <div className="container-custom relative z-10">

        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          viewport={{
            once: true,
          }}
          className="
            max-w-5xl
          "
        >

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-5
              py-3
              rounded-full
              bg-[#E8F3EE]
              text-[#2E5E4E]
              font-black
              text-sm
              mb-8
            "
          >

            📊 Dashboard ESG

          </div>

          <h2
            className="
              text-5xl
              md:text-6xl
              font-black
              leading-tight
              tracking-tighter
              text-[#111827]
            "
          >

            Transparência ambiental,
            impacto social e
            métricas operacionais.

          </h2>

          <p
            className="
              text-zinc-600
              text-xl
              leading-9
              mt-8
              max-w-4xl
            "
          >

            Indicadores ESG monitorados
            em tempo real para fortalecer
            responsabilidade socioambiental,
            rastreabilidade operacional
            e transparência institucional.

          </p>

        </motion.div>

        {/* GRID */}

        <div
          className="
            grid
            lg:grid-cols-2
            gap-8
            mt-24
          "
        >

          {metrics.map(
            (
              metric,
              index,
            ) => {

              const Icon =
                metric.icon;

              return (

                <motion.div
                  key={metric.title}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay:
                      index * 0.08,
                  }}
                  viewport={{
                    once: true,
                  }}
                  className="
                    bg-white/80
                    backdrop-blur-xl
                    border
                    border-white/50
                    shadow-xl
                    rounded-4xl
                    p-8
                    md:p-10
                  "
                >

                  {/* TOP */}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-6
                    "
                  >

                    <div>

                      <p
                        className="
                          text-sm
                          font-bold
                          uppercase
                          tracking-widest
                          text-zinc-500
                        "
                      >

                        {metric.title}

                      </p>

                      <h3
                        className="
                          text-5xl
                          md:text-6xl
                          font-black
                          text-[#111827]
                          tracking-tighter
                          mt-4
                          wrap-break-word
                        "
                      >

                        {loading
                          ? "--"
                          : metric.value}

                      </h3>

                    </div>

                    <div
                      className={`
                        w-16
                        h-16
                        rounded-3xl
                        flex
                        items-center
                        justify-center
                        text-white
                        bg-linear-to-br
                        ${metric.gradient}
                      `}
                    >

                      <Icon size={30} />

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      text-zinc-600
                      leading-8
                      mt-8
                    "
                  >

                    {metric.description}

                  </p>

                  {/* PROGRESS */}

                  <div className="mt-10">

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        mb-4
                      "
                    >

                      <span
                        className="
                          text-sm
                          font-medium
                          text-zinc-500
                        "
                      >

                        Meta ESG

                      </span>

                      <span
                        className="
                          text-sm
                          font-black
                          text-[#2E5E4E]
                        "
                      >

                        {metric.progress}

                      </span>

                    </div>

                    <div
                      className="
                        w-full
                        h-3
                        rounded-full
                        bg-zinc-200
                        overflow-hidden
                      "
                    >

                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        whileInView={{
                          width:
                            metric.progress,
                        }}
                        transition={{
                          duration: 1,
                        }}
                        viewport={{
                          once: true,
                        }}
                        className={`
                          h-full
                          rounded-full
                          bg-linear-to-r
                          ${metric.gradient}
                        `}
                      />

                    </div>

                  </div>

                </motion.div>

              );

            },
          )}

        </div>

        {/* BOTTOM */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          viewport={{
            once: true,
          }}
          className="mt-24"
        >

          <div
            className="
              rounded-4xl
              bg-linear-to-br
              from-[#2E5E4E]
              to-[#5C9B80]
              p-12
              md:p-16
              text-white
              shadow-2xl
            "
          >

            <div
              className="
                grid
                lg:grid-cols-2
                gap-12
                items-center
              "
            >

              <div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-5
                    py-3
                    rounded-full
                    bg-white/20
                    text-sm
                    font-black
                    mb-8
                  "
                >

                  🌱 Sustentabilidade

                </div>

                <h3
                  className="
                    text-4xl
                    md:text-5xl
                    font-black
                    leading-tight
                  "
                >

                  Indicadores alinhados
                  às práticas ESG
                  e economia circular.

                </h3>

              </div>

              <div>

                <p
                  className="
                    text-white/85
                    leading-9
                    text-lg
                  "
                >

                  Os indicadores ambientais
                  e sociais da ACMRB fortalecem
                  transparência institucional,
                  inclusão social, rastreabilidade
                  operacional e responsabilidade
                  ambiental em Baturité e região.

                </p>

                <button
                  className="
                    mt-10
                    h-14
                    px-8
                    rounded-2xl
                    bg-white
                    hover:bg-zinc-100
                    transition-all
                    text-[#2E5E4E]
                    font-black
                    flex
                    items-center
                    gap-3
                  "
                >

                  <TrendingUp size={20} />

                  Ver relatório ESG

                </button>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>

  );

}