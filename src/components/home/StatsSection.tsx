"use client";

import {
  motion,
} from "framer-motion";

import Link from "next/link";

import {
  ShieldCheck,
  ArrowRight,
  FileText,
  Leaf,
  BarChart3,
  Globe2,
} from "lucide-react";

export default function StatsSection() {

  return (

    <section
      className="
        relative
        overflow-hidden
        py-24
        md:py-32
        bg-linear-to-b
        from-[#F5F7F4]
        via-white
        to-[#F5F7F4]
      "
    >

      {/* BACKGROUND */}

      <div className="absolute inset-0 overflow-hidden">

        <div
          className="
            absolute
            -top-32
            -left-32
            w-125
            h-125
            rounded-full
            bg-emerald-200/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-0
            right-0
            w-112.5
            h-112.5
            rounded-full
            bg-cyan-200/20
            blur-3xl
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

        {/* HERO */}

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
            max-w-6xl
            mx-auto
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
              bg-[#E8F3EE]
              border
              border-[#CFE7DA]
              text-[#2E5E4E]
              font-black
              text-xs
              sm:text-sm
            "
          >

            <ShieldCheck size={18} />

            Transparência • ESG • Impacto Ambiental

          </div>

          <h2
            className="
              mt-8
              text-4xl
              sm:text-5xl
              md:text-6xl
              font-black
              leading-none
              tracking-[-0.04em]
              text-[#111827]
            "
          >

            Transparência pública
            e responsabilidade
            socioambiental.

          </h2>

          <p
            className="
              mt-8
              max-w-4xl
              mx-auto
              text-zinc-600
              text-base
              sm:text-lg
              md:text-xl
              leading-8
              md:leading-9
              text-justify
            "
          >

            A ACMRB disponibiliza uma central
            institucional de transparência ESG
            voltada para indicadores ambientais,
            impacto social, dados operacionais,
            relatórios institucionais e métricas
            públicas relacionadas às ações de
            reciclagem e sustentabilidade
            desenvolvidas em Baturité.

          </p>

        </motion.div>

        {/* MINI FEATURES */}

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
            duration: 0.6,
            delay: 0.1,
          }}
          viewport={{
            once: true,
          }}
          className="
            mt-16
            grid
            sm:grid-cols-2
            xl:grid-cols-4
            gap-5
          "
        >

          <div
            className="
              bg-white/80
              backdrop-blur-xl
              border
              border-black/5
              rounded-3xl
              p-6
              flex
              items-start
              gap-4
              hover:shadow-xl
              transition-all
            "
          >

            <BarChart3
              size={28}
              className="text-[#2E5E4E]"
            />

            <div>

              <h3
                className="
                  font-black
                  text-[#111827]
                "
              >
                Indicadores ESG
              </h3>

              <p
                className="
                  text-sm
                  text-zinc-500
                  mt-1
                  leading-6
                "
              >
                Dados ambientais integrados ao sistema.
              </p>

            </div>

          </div>

          <div
            className="
              bg-white/80
              backdrop-blur-xl
              border
              border-black/5
              rounded-3xl
              p-6
              flex
              items-start
              gap-4
              hover:shadow-xl
              transition-all
            "
          >

            <Leaf
              size={28}
              className="text-[#2E5E4E]"
            />

            <div>

              <h3
                className="
                  font-black
                  text-[#111827]
                "
              >
                Sustentabilidade
              </h3>

              <p
                className="
                  text-sm
                  text-zinc-500
                  mt-1
                  leading-6
                "
              >
                Ações ambientais e economia circular.
              </p>

            </div>

          </div>

          <div
            className="
              bg-white/80
              backdrop-blur-xl
              border
              border-black/5
              rounded-3xl
              p-6
              flex
              items-start
              gap-4
              hover:shadow-xl
              transition-all
            "
          >

            <Globe2
              size={28}
              className="text-[#2E5E4E]"
            />

            <div>

              <h3
                className="
                  font-black
                  text-[#111827]
                "
              >
                Transparência pública
              </h3>

              <p
                className="
                  text-sm
                  text-zinc-500
                  mt-1
                  leading-6
                "
              >
                Informações acessíveis e atualizadas.
              </p>

            </div>

          </div>

          <div
            className="
              bg-white/80
              backdrop-blur-xl
              border
              border-black/5
              rounded-3xl
              p-6
              flex
              items-start
              gap-4
              hover:shadow-xl
              transition-all
            "
          >

            <FileText
              size={28}
              className="text-[#2E5E4E]"
            />

            <div>

              <h3
                className="
                  font-black
                  text-[#111827]
                "
              >
                Relatórios institucionais
              </h3>

              <p
                className="
                  text-sm
                  text-zinc-500
                  mt-1
                  leading-6
                "
              >
                Central ESG detalhada da associação.
              </p>

            </div>

          </div>

        </motion.div>

        {/* CTA CENTRAL */}

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
          "
        >

          <div
            className="
              relative
              overflow-hidden
              bg-linear-to-r
              from-[#111827]
              via-[#172033]
              to-[#2E5E4E]
              rounded-[42px]
              p-8
              md:p-14
              text-white
              shadow-2xl
            "
          >

            {/* BG */}

            <div
              className="
                absolute
                top-0
                right-0
                w-80
                h-80
                rounded-full
                bg-emerald-400/10
                blur-3xl
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
                gap-10
              "
            >

              <div className="max-w-4xl">

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-full
                    bg-white/10
                    border
                    border-white/10
                    text-sm
                    font-bold
                  "
                >

                  📊 Central ESG Institucional

                </div>

                <h3
                  className="
                    mt-6
                    text-3xl
                    md:text-5xl
                    font-black
                    leading-tight
                  "
                >

                  Consulte os relatórios
                  completos da ACMRB.

                </h3>

                <p
                  className="
                    mt-6
                    text-zinc-300
                    text-base
                    md:text-lg
                    leading-8
                    text-justify
                  "
                >

                  Acesse a central completa de
                  transparência para visualizar
                  métricas ambientais, impacto
                  social, indicadores ESG,
                  operações de reciclagem,
                  resultados institucionais,
                  relatórios públicos e futuras
                  iniciativas sustentáveis da ACMRB.

                </p>

              </div>

              {/* BUTTONS */}

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  gap-4
                  shrink-0
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
                    bg-white
                    hover:bg-zinc-100
                    transition-all
                    text-[#111827]
                    font-black
                    shadow-xl
                  "
                >

                  Ver transparência

                  <ArrowRight size={20} />

                </Link>

                <Link
                  href="/projetos"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    h-14
                    px-8
                    rounded-2xl
                    bg-white/10
                    border
                    border-white/10
                    hover:bg-white/15
                    transition-all
                    text-white
                    font-black
                  "
                >

                  Projetos ambientais

                </Link>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>

  );

}