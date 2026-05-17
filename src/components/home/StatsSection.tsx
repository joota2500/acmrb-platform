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

  const stats = [

    {
      icon: Recycle,

      value:
        `${totalPeso.toFixed(0)}kg`,

      title:
        "Resíduos reciclados",

      description:
        "Total acumulado de materiais recicláveis recuperados pela ACMRB.",

      color:
        "from-[#2E5E4E] to-[#5C9B80]",
    },

    {
      icon: Cloud,

      value:
        `${co2.toFixed(0)}kg`,

      title:
        "CO₂ evitado",

      description:
        "Estimativa de emissões reduzidas através da reciclagem.",

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
        "Estimativa equivalente de preservação ambiental.",

      color:
        "from-emerald-500 to-green-500",
    },

    {
      icon: Users,

      value:
        `${familiasImpactadas}`,

      title:
        "Famílias impactadas",

      description:
        "Famílias beneficiadas diretamente pelas atividades da associação.",

      color:
        "from-violet-500 to-fuchsia-500",
    },

    {
      icon: Wallet,

      value:
        `R$ ${totalValor.toFixed(2)}`,

      title:
        "Renda gerada",

      description:
        "Movimentação financeira gerada pelos materiais recicláveis.",

      color:
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

      {/* BG */}

      <div className="absolute inset-0">

        <div className="absolute top-0 left-0 w-125 h-125 bg-emerald-200/20 blur-3xl rounded-full" />

        <div className="absolute bottom-0 right-0 w-md h-112 bg-cyan-200/20 blur-3xl rounded-full" />

      </div>

      <div className="container-custom relative z-10">

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
              text-sm
              mb-8
            "
          >

            📊 Indicadores ESG

          </div>

          <h2
            className="
              text-5xl
              md:text-6xl
              font-black
              text-[#111827]
              leading-tight
              tracking-tighter
            "
          >

            Transparência,
            impacto ambiental
            e responsabilidade social.

          </h2>

          <p
            className="
              text-zinc-600
              text-xl
              leading-9
              mt-8
              max-w-4xl
              mx-auto
            "
          >

            Indicadores ambientais e operacionais
            gerados automaticamente a partir
            das atividades de reciclagem
            e logística reversa da ACMRB.

          </p>

        </motion.div>

        {/* GRID */}

        <div
          className="
            grid
            sm:grid-cols-2
            xl:grid-cols-5
            gap-8
            mt-24
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
                    rounded-4xl
                    p-8
                    text-white
                    shadow-2xl
                    bg-linear-to-br
                    ${item.color}
                  `}
                >

                  {/* ICON */}

                  <div
                    className="
                      w-18
                      h-18
                      rounded-3xl
                      bg-white/20
                      backdrop-blur-md
                      flex
                      items-center
                      justify-center
                      mb-8
                    "
                  >

                    <Icon size={34} />

                  </div>

                  {/* VALUE */}

                  <h3
                    className="
                      text-5xl
                      font-black
                      wrap-break-word
                    "
                  >

                    {loading
                      ? "--"
                      : item.value}

                  </h3>

                  {/* TITLE */}

                  <h4
                    className="
                      text-2xl
                      font-black
                      mt-6
                    "
                  >

                    {item.title}

                  </h4>

                  {/* DESC */}

                  <p
                    className="
                      text-white/80
                      leading-8
                      mt-5
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
            mt-24
            text-center
          "
        >

          <Link
            href="/transparencia"
            className="
              inline-flex
              items-center
              gap-3
              h-15
              px-8
              rounded-2xl
              bg-[#2E5E4E]
              hover:bg-[#23473A]
              transition-all
              text-white
              font-black
              shadow-xl
            "
          >

            Ver relatório completo

            <ArrowRight size={20} />

          </Link>

        </motion.div>

      </div>

    </section>

  );

}