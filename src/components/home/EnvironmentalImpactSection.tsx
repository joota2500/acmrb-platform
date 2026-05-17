"use client";

import { motion } from "framer-motion";

import {
  Leaf,
  Trees,
  Zap,
  Recycle,
  Wallet,
  Cloud,
  Users,
  Factory,
} from "lucide-react";

import { useESGMetrics } from "@/hooks/useESGMetrics";

export default function EnvironmentalImpactSection() {

  const {

    loading,

    totalPeso,

    totalValor,

    co2,

    arvores,

    familiasImpactadas,

    empresasParceiras,

  } = useESGMetrics();

  /* =========================
     ESG CALCULATIONS
  ========================= */

  const energiaEconomizada =
    totalPeso * 95;

  const aguaPreservada =
    totalPeso * 26;

  /* =========================
     FORMAT
  ========================= */

  function formatKg(
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
      },
    );

  }

  /* =========================
     METRICS
  ========================= */

  const metricas = [

    {
      titulo:
        "Resíduos reciclados",

      valor:
        formatKg(
          totalPeso,
        ),

      descricao:
        "Materiais desviados do descarte irregular através da coleta seletiva.",

      icon: Recycle,

      bg: "from-[#2E5E4E] to-[#5C9B80]",
    },

    {
      titulo:
        "CO₂ evitado",

      valor:
        formatKg(co2),

      descricao:
        "Estimativa de emissões evitadas através da reciclagem.",

      icon: Cloud,

      bg: "from-cyan-500 to-blue-500",
    },

    {
      titulo:
        "Energia economizada",

      valor:
        `${energiaEconomizada.toFixed(0)}kWh`,

      descricao:
        "Economia energética gerada pela reutilização de materiais.",

      icon: Zap,

      bg: "from-yellow-400 to-orange-500",
    },

    {
      titulo:
        "Árvores preservadas",

      valor:
        `${arvores.toFixed(0)}`,

      descricao:
        "Estimativa ambiental equivalente de preservação florestal.",

      icon: Trees,

      bg: "from-green-500 to-emerald-400",
    },

    {
      titulo:
        "Água preservada",

      valor:
        `${aguaPreservada.toFixed(0)}L`,

      descricao:
        "Redução do consumo hídrico através da reciclagem.",

      icon: Leaf,

      bg: "from-teal-400 to-cyan-400",
    },

    {
      titulo:
        "Renda gerada",

      valor:
        formatMoney(
          totalValor,
        ),

      descricao:
        "Movimentação econômica gerada pelos materiais recicláveis.",

      icon: Wallet,

      bg: "from-violet-500 to-fuchsia-500",
    },

    {
      titulo:
        "Famílias impactadas",

      valor:
        `${familiasImpactadas || 0}+`,

      descricao:
        "Famílias beneficiadas direta e indiretamente pelas operações da associação.",

      icon: Users,

      bg: "from-orange-500 to-red-500",
    },

    {
      titulo:
        "Parcerias ESG",

      valor:
        `${empresasParceiras || 0}+`,

      descricao:
        "Empresas e instituições apoiando iniciativas sustentáveis.",

      icon: Factory,

      bg: "from-indigo-500 to-violet-500",
    },

  ];

  return (

    <section
      className="
        py-32
        bg-[#F5F7F4]
        relative
        overflow-hidden
      "
    >

      {/* BACKGROUND */}

      <div className="absolute inset-0">

        <div
          className="
            absolute
            top-0
            left-0
            w-150
            h-150
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
            w-125
            h-125
            bg-cyan-200/20
            blur-3xl
            rounded-full
          "
        />

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
            mb-24
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

            🌎 Indicadores ESG

          </div>

          <h2
            className="
              text-5xl
              md:text-7xl
              font-black
              text-[#111827]
              leading-[0.95]
              tracking-[-0.04em]
            "
          >

            Transparência ambiental
            em tempo real

          </h2>

          <p
            className="
              text-zinc-600
              text-xl
              leading-9
              mt-10
              max-w-4xl
              mx-auto
            "
          >

            A ACMRB monitora indicadores
            ambientais, sociais e operacionais
            derivados das atividades de
            reciclagem, logística reversa
            e impacto socioambiental.

          </p>

        </motion.div>

        {/* GRID */}

        <div
          className="
            grid
            sm:grid-cols-2
            xl:grid-cols-4
            gap-8
          "
        >

          {metricas.map(
            (
              item,
              index,
            ) => {

              const Icon =
                item.icon;

              return (

                <motion.div
                  key={item.titulo}
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
                      index * 0.05,
                  }}
                  viewport={{
                    once: true,
                  }}
                  className={`
                    relative
                    overflow-hidden
                    rounded-4xl
                    p-8
                    text-white
                    shadow-2xl
                    bg-linear-to-br
                    ${item.bg}
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
                      w-18
                      h-18
                      rounded-3xl
                      bg-white/15
                      backdrop-blur-xl
                      border
                      border-white/10
                      flex
                      items-center
                      justify-center
                      mb-8
                    "
                  >

                    <Icon size={34} />

                  </div>

                  {/* CONTENT */}

                  <div className="relative z-10">

                    <p className="text-white/80">

                      {item.titulo}

                    </p>

                    <h3
                      className="
                        text-5xl
                        font-black
                        mt-4
                        wrap-break-word
                        leading-none
                      "
                    >

                      {loading
                        ? "--"
                        : item.valor}

                    </h3>

                    <p
                      className="
                        mt-6
                        text-white/80
                        leading-7
                      "
                    >

                      {item.descricao}

                    </p>

                  </div>

                </motion.div>

              );

            },
          )}

        </div>

      </div>

    </section>

  );

}