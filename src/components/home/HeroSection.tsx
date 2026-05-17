"use client";

import { motion } from "framer-motion";

import {
  ArrowRight,
  Leaf,
  Recycle,
  ShieldCheck,
  TrendingUp,
  Factory,
} from "lucide-react";

export default function HeroSection() {

  return (

    <section
      className="
        relative
        overflow-hidden
        min-h-screen
        flex
        items-center
        pt-36
        md:pt-40
        bg-[#F5F7F4]
      "
    >

      {/* BACKGROUND */}

      <div className="absolute inset-0">

        <div className="absolute top-0 left-0 w-150 h-150 bg-emerald-200/20 blur-3xl rounded-full" />

        <div className="absolute bottom-0 right-0 w-125 h-125 bg-cyan-200/20 blur-3xl rounded-full" />

      </div>

      {/* GRID */}

      <div className="container-custom relative z-10">

        <div
          className="
            grid
            lg:grid-cols-2
            gap-20
            items-center
          "
        >

          {/* LEFT */}

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

            {/* TAG */}

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-5
                py-3
                rounded-full
                bg-emerald-100
                text-emerald-800
                text-sm
                font-black
                mb-8
              "
            >

              ♻ Plataforma ESG • ACMRB • Baturité CE

            </div>

            {/* TITLE */}

            <h1
              className="
                text-[3rem]
                md:text-[5.5rem]
                leading-[0.92]
                tracking-tighter
                font-black
                text-[#111827]
              "
            >

              Gestão inteligente
              de resíduos com
              <span className="text-[#2E5E4E]">
                {" "}
                impacto ambiental
              </span>
              {" "}
              e inclusão social.

            </h1>

            {/* DESC */}

            <p
              className="
                mt-8
                text-xl
                text-zinc-600
                leading-9
                max-w-2xl
              "
            >

              A ACMRB atua na coleta seletiva,
              logística reversa e rastreabilidade
              ambiental de resíduos recicláveis,
              promovendo geração de renda,
              sustentabilidade urbana e indicadores ESG
              para empresas, instituições e sociedade.

            </p>

            {/* BUTTONS */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-5
                mt-12
              "
            >

              <a
                href="#quem-somos"
                className="
                  h-15
                  px-8
                  rounded-2xl
                  bg-[#2E5E4E]
                  hover:bg-[#23473A]
                  transition-all
                  text-white
                  font-black
                  flex
                  items-center
                  justify-center
                  gap-3
                  shadow-xl
                "
              >

                Conheça a ACMRB

                <ArrowRight size={20} />

              </a>

              <a
                href="#contato"
                className="
                  h-15
                  px-8
                  rounded-2xl
                  border
                  border-zinc-300
                  bg-white/80
                  hover:bg-white
                  transition-all
                  text-zinc-700
                  font-bold
                  flex
                  items-center
                  justify-center
                "
              >

                Seja parceiro ESG

              </a>

            </div>

            {/* METRICS */}

            <div
              className="
                grid
                grid-cols-3
                gap-8
                mt-16
                pt-10
                border-t
                border-zinc-200
              "
            >

              <div>

                <h3
                  className="
                    text-4xl
                    font-black
                    text-[#2E5E4E]
                  "
                >

                  434kg

                </h3>

                <p
                  className="
                    text-sm
                    text-zinc-500
                    mt-2
                  "
                >

                  resíduos reciclados

                </p>

              </div>

              <div>

                <h3
                  className="
                    text-4xl
                    font-black
                    text-[#2E5E4E]
                  "
                >

                  50+

                </h3>

                <p
                  className="
                    text-sm
                    text-zinc-500
                    mt-2
                  "
                >

                  famílias impactadas

                </p>

              </div>

              <div>

                <h3
                  className="
                    text-4xl
                    font-black
                    text-[#2E5E4E]
                  "
                >

                  ESG

                </h3>

                <p
                  className="
                    text-sm
                    text-zinc-500
                    mt-2
                  "
                >

                  métricas ambientais

                </p>

              </div>

            </div>

          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 1,
            }}
            className="relative"
          >

            <div
              className="
                bg-white/80
                backdrop-blur-xl
                border
                border-white/50
                shadow-2xl
                rounded-4xl
                p-8
              "
            >

              <div className="space-y-7">

                {/* CARD */}

                <div className="flex gap-5">

                  <div
                    className="
                      w-16
                      h-16
                      rounded-3xl
                      bg-emerald-100
                      flex
                      items-center
                      justify-center
                      text-emerald-700
                    "
                  >

                    <Recycle size={30} />

                  </div>

                  <div>

                    <h3
                      className="
                        text-xl
                        font-black
                        text-zinc-900
                      "
                    >

                      Logística Reversa

                    </h3>

                    <p
                      className="
                        text-zinc-600
                        mt-2
                        leading-7
                      "
                    >

                      Gestão operacional e rastreabilidade
                      de resíduos sólidos recicláveis.

                    </p>

                  </div>

                </div>

                {/* CARD */}

                <div className="flex gap-5">

                  <div
                    className="
                      w-16
                      h-16
                      rounded-3xl
                      bg-cyan-100
                      flex
                      items-center
                      justify-center
                      text-cyan-700
                    "
                  >

                    <TrendingUp size={30} />

                  </div>

                  <div>

                    <h3
                      className="
                        text-xl
                        font-black
                        text-zinc-900
                      "
                    >

                      Indicadores ESG

                    </h3>

                    <p
                      className="
                        text-zinc-600
                        mt-2
                        leading-7
                      "
                    >

                      Transparência pública com métricas
                      ambientais e sociais em tempo real.

                    </p>

                  </div>

                </div>

                {/* CARD */}

                <div className="flex gap-5">

                  <div
                    className="
                      w-16
                      h-16
                      rounded-3xl
                      bg-orange-100
                      flex
                      items-center
                      justify-center
                      text-orange-700
                    "
                  >

                    <Factory size={30} />

                  </div>

                  <div>

                    <h3
                      className="
                        text-xl
                        font-black
                        text-zinc-900
                      "
                    >

                      Parcerias Sustentáveis

                    </h3>

                    <p
                      className="
                        text-zinc-600
                        mt-2
                        leading-7
                      "
                    >

                      Soluções ESG para empresas,
                      instituições e setor público.

                    </p>

                  </div>

                </div>

                {/* CARD */}

                <div className="flex gap-5">

                  <div
                    className="
                      w-16
                      h-16
                      rounded-3xl
                      bg-emerald-100
                      flex
                      items-center
                      justify-center
                      text-emerald-700
                    "
                  >

                    <ShieldCheck size={30} />

                  </div>

                  <div>

                    <h3
                      className="
                        text-xl
                        font-black
                        text-zinc-900
                      "
                    >

                      Impacto Ambiental

                    </h3>

                    <p
                      className="
                        text-zinc-600
                        mt-2
                        leading-7
                      "
                    >

                      Redução de resíduos,
                      preservação ambiental
                      e fortalecimento social.

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </section>

  );

}