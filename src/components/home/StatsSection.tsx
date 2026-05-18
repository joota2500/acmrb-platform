"use client";

import {
  motion,
} from "framer-motion";

import Link from "next/link";

import {
  Recycle,
  Trees,
  Users,
  Wallet,
  Cloud,
  ArrowRight,
} from "lucide-react";

import {
  useESGMetrics,
} from "@/hooks/useESGMetrics";

export default function StatsSection() {

  const {

    loading,

    totalPeso,

    totalValor,

    co2,

    arvores,

    familiasImpactadas,

  } = useESGMetrics();

  /* =========================
     FORMATTERS
  ========================= */

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

  function formatMoney(
    value: number,
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

  /* =========================
     STATS
  ========================= */

  const stats = [

    {
      icon: Recycle,

      value:
        formatPeso(
          totalPeso,
        ),

      title:
        "Resíduos coletados",

      description:
        "Total consolidado de materiais recicláveis recuperados pela ACMRB.",

      color:
        "from-[#2E5E4E] to-[#5C9B80]",
    },

    {
      icon: Cloud,

      value:
        formatPeso(
          co2,
        ),

      title:
        "CO₂ evitado",

      description:
        "Estimativa ambiental de emissões reduzidas através da reciclagem.",

      color:
        "from-cyan-500 to-blue-500",
    },

    {
      icon: Trees,

      value:
        `${arvores.toFixed(0)}`,

      title:
        "Árvores preservadas",

      description:
        "Impacto ambiental equivalente gerado pelas ações de reciclagem.",

      color:
        "from-emerald-500 to-green-500",
    },

    {
      icon: Users,

      value:
        `${familiasImpactadas}+`,

      title:
        "Famílias impactadas",

      description:
        "Famílias beneficiadas direta e indiretamente pelas operações da associação.",

      color:
        "from-violet-500 to-fuchsia-500",
    },

    {
      icon: Wallet,

      value:
        formatMoney(
          totalValor,
        ),

      title:
        "Renda gerada",

      description:
        "Movimentação econômica proveniente da logística reversa e reciclagem.",

      color:
        "from-teal-500 to-cyan-400",
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

      {/* BACKGROUND */}

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
          className="
            text-center
            max-w-5xl
            mx-auto
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

            📊 Indicadores ESG

          </div>

          <h2
            className="
              text-4xl
              sm:text-5xl
              md:text-6xl
              font-black
              text-[#111827]
              leading-none
              tracking-[-0.04em]
            "
          >

            Transparência,
            impacto ambiental
            e responsabilidade social

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
              mx-auto
            "
          >

            Dados públicos derivados
            das operações de reciclagem,
            logística reversa e impacto
            socioambiental da ACMRB.

          </p>

        </motion.div>

        {/* GRID */}

        <div
          className="
            grid
            sm:grid-cols-2
            xl:grid-cols-5
            gap-6
            md:gap-8
            mt-20
          "
        >

          {stats.map(
            (
              item,
              index,
            ) => {

              const Icon =
                item.icon;

              return (

                <motion.div
                  key={item.title}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    delay:
                      index * 0.08,
                  }}
                  viewport={{
                    once: true,
                  }}
                  className={`
                    relative
                    overflow-hidden
                    rounded-4xl
                    p-6
                    md:p-8
                    text-white
                    shadow-2xl
                    bg-linear-to-br
                    ${item.color}
                  `}
                >

                  {/* GLOW */}

                  <div
                    className="
                      absolute
                      -top-10
                      -right-10
                      w-40
                      h-40
                      bg-white/10
                      rounded-full
                      blur-3xl
                    "
                  />

                  {/* ICON */}

                  <div
                    className="
                      relative
                      z-10
                      w-16
                      h-16
                      md:w-18
                      md:h-18
                      rounded-3xl
                      bg-white/20
                      backdrop-blur-md
                      flex
                      items-center
                      justify-center
                      mb-8
                    "
                  >

                    <Icon size={30} />

                  </div>

                  {/* VALUE */}

                  <h3
                    className="
                      relative
                      z-10
                      text-4xl
                      md:text-5xl
                      font-black
                      wrap-break-word
                      leading-none
                    "
                  >

                    {loading
                      ? "--"
                      : item.value}

                  </h3>

                  {/* TITLE */}

                  <h4
                    className="
                      relative
                      z-10
                      text-xl
                      md:text-2xl
                      font-black
                      mt-5
                    "
                  >

                    {item.title}

                  </h4>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      relative
                      z-10
                      text-white/80
                      leading-7
                      mt-4
                      text-sm
                      md:text-base
                    "
                  >

                    {item.description}

                  </p>

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
          className="
            mt-20
            text-center
          "
        >

          <Link
            href="/transparencia"
            className="
              inline-flex
              items-center
              justify-center
              gap-3
              h-14
              px-8
              rounded-2xl
              bg-[#2E5E4E]
              hover:bg-[#23473A]
              transition-all
              text-white
              font-black
              shadow-xl
              hover:scale-[1.02]
            "
          >

            Ver relatório completo

            <ArrowRight size={20} />

          </Link>

          <p
            className="
              text-zinc-400
              text-sm
              mt-5
            "
          >

            Página detalhada em desenvolvimento.

          </p>

        </motion.div>

      </div>

    </section>

  );

}