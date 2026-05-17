"use client";

import Link from "next/link";

import { motion } from "framer-motion";

import {
  BarChart3,
  Leaf,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Recycle,
} from "lucide-react";

export default function ESGHighlightsSection() {

  const indicadores = [

    {
      icon: Recycle,
      titulo: "Rastreabilidade operacional",
      descricao:
        "Controle público dos materiais recicláveis recebidos pela associação.",
    },

    {
      icon: Leaf,
      titulo: "Impacto ambiental",
      descricao:
        "Indicadores ESG derivados da reciclagem e logística reversa.",
    },

    {
      icon: TrendingUp,
      titulo: "Métricas em tempo real",
      descricao:
        "Atualização dinâmica baseada nos registros operacionais do sistema.",
    },

    {
      icon: ShieldCheck,
      titulo: "Transparência institucional",
      descricao:
        "Dados públicos para fortalecer credibilidade e responsabilidade ambiental.",
    },

  ];

  return (

    <section
      className="
        py-32
        px-6
        relative
        overflow-hidden
        bg-white
      "
    >

      {/* BG */}

      <div className="absolute inset-0">

        <div className="absolute top-0 left-0 w-125 h-125 bg-emerald-100/40 blur-3xl rounded-full" />

        <div className="absolute bottom-0 right-0 w-112.5 h-112.5 bg-cyan-100/40 blur-3xl rounded-full" />

      </div>

      <div
        className="
          max-w-7xl
          mx-auto
          relative
          z-10
        "
      >

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
            rounded-[40px]
            overflow-hidden
            bg-linear-to-br
            from-[#1F2937]
            via-[#111827]
            to-[#0F172A]
            shadow-2xl
            p-10
            md:p-16
            text-white
          "
        >

          {/* HEADER */}

          <div
            className="
              flex
              flex-col
              xl:flex-row
              xl:items-center
              xl:justify-between
              gap-12
            "
          >

            <div className="max-w-4xl">

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
                  text-white
                  font-black
                  text-sm
                  mb-8
                "
              >

                📊 ESG & Transparência

              </div>

              <h2
                className="
                  text-5xl
                  md:text-6xl
                  font-black
                  leading-tight
                  tracking-tighter
                "
              >

                Inteligência ESG
                aplicada à reciclagem
                e impacto ambiental.

              </h2>

              <p
                className="
                  mt-8
                  text-zinc-300
                  text-xl
                  leading-9
                  max-w-3xl
                "
              >

                Plataforma pública
                desenvolvida para ampliar
                transparência operacional,
                rastreabilidade ambiental
                e indicadores ESG da ACMRB
                em Baturité e região.

              </p>

            </div>

            {/* CTA */}

            <div
              className="
                flex
                flex-col
                gap-5
                min-w-70
              "
            >

              <Link
                href="/transparencia"
                className="
                  h-15
                  px-8
                  rounded-2xl
                  bg-white
                  hover:bg-zinc-100
                  transition-all
                  text-[#111827]
                  font-black
                  flex
                  items-center
                  justify-center
                  gap-3
                  shadow-xl
                "
              >

                <BarChart3 size={20} />

                Ver transparência

              </Link>

              <Link
                href="/impacto-ambiental"
                className="
                  h-15
                  px-8
                  rounded-2xl
                  border
                  border-white/15
                  bg-white/5
                  hover:bg-white/10
                  transition-all
                  text-white
                  font-black
                  flex
                  items-center
                  justify-center
                  gap-3
                "
              >

                Ver impacto ESG

                <ArrowRight size={20} />

              </Link>

            </div>

          </div>

          {/* GRID */}

          <div
            className="
              grid
              md:grid-cols-2
              xl:grid-cols-4
              gap-8
              mt-20
            "
          >

            {indicadores.map(
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
                      y: 30,
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
                    whileHover={{
                      y: -5,
                    }}
                    className="
                      rounded-4xl
                      border
                      border-white/10
                      bg-white/5
                      backdrop-blur-xl
                      p-8
                    "
                  >

                    <div
                      className="
                        w-16
                        h-16
                        rounded-3xl
                        bg-white/10
                        flex
                        items-center
                        justify-center
                        text-emerald-300
                        mb-8
                      "
                    >

                      <Icon size={30} />

                    </div>

                    <h3
                      className="
                        text-2xl
                        font-black
                        leading-tight
                      "
                    >

                      {item.titulo}

                    </h3>

                    <p
                      className="
                        mt-5
                        text-zinc-300
                        leading-8
                      "
                    >

                      {item.descricao}

                    </p>

                  </motion.div>

                );

              },
            )}

          </div>

        </motion.div>

      </div>

    </section>

  );

}