"use client";

import { motion } from "framer-motion";

import {
  ArrowRight,
  Recycle,
} from "lucide-react";

import { useESGMetrics } from "@/hooks/useESGMetrics";

export default function HeroSection() {

  const {
    loading,
    totalPeso,
    familiasImpactadas,
    co2,
  } = useESGMetrics();

  return (

    <section
      className="
        relative
        overflow-hidden
        min-h-screen
        bg-[#F4F8F5]
      "
    >

      {/* BACKGROUND IMAGE */}

      <div
        className="
          absolute
          inset-0
        "
      >

        <img
          src="/images/hero-reciclagem.jpg"
          alt="ACMRB Reciclagem"
          className="
            w-full
            h-full
            object-cover
            object-center
          "
        />

        {/* DARK OVERLAY */}

        <div
          className="
            absolute
            inset-0
            bg-black/45
          "
        />

        {/* GREEN GRADIENT */}

        <div
          className="
            absolute
            inset-0
            bg-linear-to-r
            from-[#0F1720]/92
            via-[#18392E]/78
            to-transparent
          "
        />

      </div>

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          container-custom
          min-h-screen
          flex
          items-center
          py-32
          md:py-40
        "
      >

        <div
          className="
            w-full
            max-w-4xl
          "
        >

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
            }}
          >

            {/* BADGE */}

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-5
                py-3
                rounded-full
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
                text-white
                text-xs
                md:text-sm
                font-black
                mb-8
              "
            >

              ♻ Plataforma Dos Catadores De Materiais Reciclaveis • Baturité CE

            </div>

            {/* TITLE */}

            <h1
              className="
                text-[2.8rem]
                sm:text-[4rem]
                md:text-[5.5rem]
                xl:text-[6.5rem]
                leading-[0.92]
                tracking-[-3px]
                font-black
                text-white
                max-w-5xl
              "
            >

              Gestão moderna
              de resíduos com
              <span className="text-[#7EE7B3]">

                {" "}impacto social

              </span>
              {" "}e sustentabilidade.

            </h1>

            {/* DESCRIPTION */}

            <p
              className="
                mt-8
                text-sm
                sm:text-base
                md:text-lg
                xl:text-xl
                text-zinc-200
                leading-7
                md:leading-9
                max-w-2xl
              "
            >

              A ACMRB atua na coleta seletiva,
              logística reversa e rastreabilidade
              ambiental de resíduos recicláveis,
              promovendo geração de renda,
              sustentabilidade urbana e métricas ESG
              para empresas, instituições e sociedade.

            </p>

            {/* BUTTONS */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-4
                mt-10
              "
            >

              <a
                href="#quem-somos"
                className="
                  h-14
                  px-8
                  rounded-2xl
                  bg-[#2E5E4E]
                  hover:bg-[#21463A]
                  transition-all
                  text-white
                  font-black
                  flex
                  items-center
                  justify-center
                  gap-3
                  shadow-2xl
                "
              >

                Conheça a ACMRB

                <ArrowRight size={20} />

              </a>

              <a
                href="/transparencia"
                className="
                  h-14
                  px-8
                  rounded-2xl
                  border
                  border-white/20
                  bg-white/10
                  backdrop-blur-xl
                  hover:bg-white/15
                  transition-all
                  text-white
                  font-bold
                  flex
                  items-center
                  justify-center
                "
              >

                Ver transparência ESG

              </a>

            </div>

            {/* METRICS */}

            <div
              className="
                grid
                grid-cols-3
                gap-4
                md:gap-8
                mt-14
                pt-10
                border-t
                border-white/10
                max-w-3xl
              "
            >

              {/* PESO */}

              <div>

                <h3
                  className="
                    text-2xl
                    md:text-4xl
                    font-black
                    text-[#7EE7B3]
                  "
                >

                  {loading
                    ? "--"
                    : `${totalPeso.toFixed(0)}kg`}

                </h3>

                <p
                  className="
                    text-xs
                    md:text-sm
                    text-zinc-300
                    mt-2
                    leading-5
                  "
                >

                  resíduos reciclados

                </p>

              </div>

              {/* FAMILIAS */}

              <div>

                <h3
                  className="
                    text-2xl
                    md:text-4xl
                    font-black
                    text-[#7EE7B3]
                  "
                >

                  {loading
                    ? "--"
                    : `${familiasImpactadas}+`}

                </h3>

                <p
                  className="
                    text-xs
                    md:text-sm
                    text-zinc-300
                    mt-2
                    leading-5
                  "
                >

                  famílias impactadas

                </p>

              </div>

              {/* CO2 */}

              <div>

                <h3
                  className="
                    text-2xl
                    md:text-4xl
                    font-black
                    text-[#7EE7B3]
                  "
                >

                  {loading
                    ? "--"
                    : `${co2.toFixed(0)}kg`}

                </h3>

                <p
                  className="
                    text-xs
                    md:text-sm
                    text-zinc-300
                    mt-2
                    leading-5
                  "
                >

                  CO₂ evitado

                </p>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

      {/* FLOATING ESG CARD */}

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 1,
        }}
        className="
          hidden
          xl:flex
          absolute
          bottom-14
          right-14
          z-20
        "
      >

        <div
          className="
            bg-white/10
            backdrop-blur-2xl
            border
            border-white/10
            shadow-2xl
            rounded-4xl
            p-7
            max-w-sm
          "
        >

          <div
            className="
              flex
              items-start
              gap-5
            "
          >

            <div
              className="
                w-16
                h-16
                rounded-3xl
                bg-[#7EE7B3]/20
                text-[#7EE7B3]
                flex
                items-center
                justify-center
                shrink-0
              "
            >

              <Recycle size={30} />

            </div>

            <div>

              <h3
                className="
                  text-xl
                  font-black
                  text-white
                "
              >

                Plataforma ESG

              </h3>

              <p
                className="
                  text-sm
                  text-zinc-200
                  leading-7
                  mt-3
                "
              >

                Indicadores ambientais,
                transparência pública
                e rastreabilidade
                operacional em tempo real.

              </p>

            </div>

          </div>

        </div>

      </motion.div>

    </section>

  );

}