"use client";

import {
  motion,
} from "framer-motion";

import Link from "next/link";

import {
  Recycle,
  Cloud,
  Users,
  Trees,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

import {
  useESGMetrics,
} from "@/hooks/useESGMetrics";

export default function ESGMetrics() {

  const {

    loading,

    totalPeso,

    co2,

    arvores,

    familiasImpactadas,

  } = useESGMetrics();

  /* =========================
     METAS
  ========================= */

  const metaPeso = 5000;

  const metaCo2 = 10000;

  const metaArvores = 500;

  const metaFamilias = 300;

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

  function formatPeso(
    value: number,
  ) {

    if (value >= 1000) {

      return `${(
        value / 1000
      ).toFixed(1)}t`;

    }

    return `${value.toFixed(0)}kg`;

  }

  /* =========================
     MÉTRICAS HOME
  ========================= */

  const metrics = [

    {
      title:
        "Resíduos coletados",

      value:
        formatPeso(
          totalPeso,
        ),

      progress:
        percentual(
          totalPeso,
          metaPeso,
        ),

      description:
        "Total acumulado de resíduos recicláveis coletados pela ACMRB.",

      icon: Recycle,

      gradient:
        "from-[#2E5E4E] to-[#5C9B80]",
    },

    {
      title:
        "CO₂ evitado",

      value:
        formatPeso(
          co2,
        ),

      progress:
        percentual(
          co2,
          metaCo2,
        ),

      description:
        "Estimativa de emissões reduzidas através da reciclagem.",

      icon: Cloud,

      gradient:
        "from-cyan-500 to-blue-500",
    },

    {
      title:
        "Famílias impactadas",

      value:
        `${familiasImpactadas}+`,

      progress:
        percentual(
          familiasImpactadas,
          metaFamilias,
        ),

      description:
        "Famílias beneficiadas direta e indiretamente pelas ações da associação.",

      icon: Users,

      gradient:
        "from-violet-500 to-fuchsia-500",
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
        "Impacto ambiental equivalente gerado pelas operações sustentáveis.",

      icon: Trees,

      gradient:
        "from-emerald-500 to-green-500",
    },

  ];

  return (

    <section
      className="
        py-24
        md:py-32
        relative
        overflow-hidden
        bg-linear-to-b
        from-[#F5F7F4]
        to-white
      "
    >

      {/* BG */}

      <div className="absolute inset-0">

        <div
          className="
            absolute
            top-0
            left-0
            w-96
            h-96
            bg-emerald-200/20
            blur-3xl
            rounded-full
          "
        />

        <div
          className="
            absolute
            bottom-0
            right-0
            w-96
            h-96
            bg-cyan-200/20
            blur-3xl
            rounded-full
          "
        />

      </div>

      <div
        className="
          container-custom
          relative
          z-10
        "
      >

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
              text-xs
              sm:text-sm
              mb-8
            "
          >

            🌎 Dashboard ESG

          </div>

          <h2
            className="
              text-4xl
              sm:text-5xl
              md:text-6xl
              font-black
              leading-none
              tracking-[-0.04em]
              text-[#111827]
            "
          >

            Transparência ambiental,
            impacto social e
            métricas ESG

          </h2>

          <p
            className="
              text-zinc-600
              text-base
              sm:text-lg
              md:text-xl
              leading-8
              mt-8
              max-w-4xl
            "
          >

            Indicadores públicos derivados
            das operações de reciclagem,
            logística reversa e impacto
            socioambiental da ACMRB.

          </p>

        </motion.div>

        {/* GRID */}

        <div
          className="
            grid
            lg:grid-cols-2
            gap-6
            md:gap-8
            mt-20
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
                    relative
                    overflow-hidden
                    bg-white/80
                    backdrop-blur-xl
                    border
                    border-white/50
                    shadow-xl
                    rounded-4xl
                    p-6
                    md:p-10
                  "
                >

                  {/* GLOW */}

                  <div
                    className="
                      absolute
                      -top-10
                      -right-10
                      w-40
                      h-40
                      bg-emerald-100/40
                      rounded-full
                      blur-3xl
                    "
                  />

                  {/* TOP */}

                  <div
                    className="
                      relative
                      z-10
                      flex
                      items-start
                      justify-between
                      gap-6
                    "
                  >

                    <div className="flex-1">

                      <p
                        className="
                          text-xs
                          sm:text-sm
                          font-black
                          uppercase
                          tracking-widest
                          text-zinc-500
                        "
                      >

                        {metric.title}

                      </p>

                      <h3
                        className="
                          text-4xl
                          md:text-6xl
                          font-black
                          text-[#111827]
                          tracking-[-0.04em]
                          mt-4
                          wrap-break-word
                          leading-none
                        "
                      >

                        {loading
                          ? "--"
                          : metric.value}

                      </h3>

                    </div>

                    <div
                      className={`
                        shrink-0
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

                      <Icon size={28} />

                    </div>

                  </div>

                  {/* DESC */}

                  <p
                    className="
                      relative
                      z-10
                      text-zinc-600
                      leading-7
                      mt-8
                    "
                  >

                    {metric.description}

                  </p>

                  {/* PROGRESS */}

                  <div
                    className="
                      relative
                      z-10
                      mt-10
                    "
                  >

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

        {/* CTA */}

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
          className="mt-20"
        >

          <div
            className="
              rounded-4xl
              bg-linear-to-br
              from-[#2E5E4E]
              to-[#5C9B80]
              p-10
              md:p-16
              text-white
              shadow-2xl
              overflow-hidden
              relative
            "
          >

            {/* EFFECT */}

            <div
              className="
                absolute
                top-0
                right-0
                w-80
                h-80
                bg-white/10
                rounded-full
                blur-3xl
              "
            />

            <div
              className="
                relative
                z-10
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
                    text-xs
                    sm:text-sm
                    font-black
                    mb-8
                  "
                >

                  🌱 Transparência Pública

                </div>

                <h3
                  className="
                    text-3xl
                    md:text-5xl
                    font-black
                    leading-tight
                  "
                >

                  Relatórios completos
                  de impacto ambiental
                  e operacional

                </h3>

              </div>

              <div>

                <p
                  className="
                    text-white/85
                    leading-8
                    text-base
                    md:text-lg
                  "
                >

                  Consulte indicadores completos,
                  dados ambientais, materiais
                  recicláveis, métricas ESG,
                  logística reversa e impacto
                  socioambiental da ACMRB.

                </p>

                <Link
                  href="/transparencia"
                  className="
                    mt-10
                    inline-flex
                    items-center
                    gap-3
                    h-14
                    px-8
                    rounded-2xl
                    bg-white
                    hover:bg-zinc-100
                    transition-all
                    text-[#2E5E4E]
                    font-black
                    shadow-lg
                  "
                >

                  <TrendingUp size={20} />

                  Ver informações completas

                  <ArrowRight size={18} />

                </Link>

                <p
                  className="
                    text-white/60
                    text-sm
                    mt-5
                  "
                >

                  Página pública detalhada em desenvolvimento.

                </p>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>

  );

}