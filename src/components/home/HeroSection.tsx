"use client";

import { motion } from "framer-motion";
import { ArrowRight, Leaf, Recycle, ShieldCheck } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">

      {/* BACKGROUND */}

      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />

      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-3xl" />

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl" />

      {/* CONTENT */}

      <div className="container-custom relative z-10">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >

            {/* TAG */}

            <div className="section-tag mb-8">
              Associação de Catadores • ESG • Sustentabilidade
            </div>

            {/* TITLE */}

            <h1 className="text-[2.7rem] md:text-[4.8rem] font-black leading-[0.95] tracking-[-0.05em] text-zinc-900">

              Transformando resíduos em
              <span className="text-emerald-700"> impacto ambiental </span>
              e inclusão social.
            </h1>

            {/* DESCRIPTION */}

            <p className="mt-8 text-zinc-600 text-lg leading-8 max-w-2xl">

              A ACMRB atua na coleta seletiva, logística reversa e educação ambiental,
              promovendo sustentabilidade, geração de renda e fortalecimento da economia circular
              em Baturité e região.

            </p>

            {/* BUTTONS */}

            <div className="flex flex-col sm:flex-row gap-4 mt-10">

              <a
                href="#quem-somos"
                className="primary-button"
              >
                Conheça a associação
                <ArrowRight size={18} />
              </a>

              <a
                href="#contato"
                className="px-6 py-4 rounded-2xl border border-zinc-300 text-zinc-700 font-semibold hover:bg-zinc-100 transition-all"
              >
                Seja parceiro
              </a>

            </div>

            {/* METRICS */}

            <div className="grid grid-cols-3 gap-6 mt-14">

              <div>
                <h3 className="text-3xl md:text-4xl font-black text-emerald-700">
                  +120t
                </h3>

                <p className="text-sm text-zinc-500 mt-2">
                  resíduos reciclados
                </p>
              </div>

              <div>
                <h3 className="text-3xl md:text-4xl font-black text-emerald-700">
                  +45
                </h3>

                <p className="text-sm text-zinc-500 mt-2">
                  famílias impactadas
                </p>
              </div>

              <div>
                <h3 className="text-3xl md:text-4xl font-black text-emerald-700">
                  ESG
                </h3>

                <p className="text-sm text-zinc-500 mt-2">
                  impacto sustentável
                </p>
              </div>

            </div>

          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >

            <div className="glass-card rounded-[2rem] p-8 md:p-10">

              <div className="grid gap-6">

                {/* CARD 1 */}

                <div className="flex gap-5 items-start">

                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Recycle size={28} />
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-zinc-900">
                      Logística Reversa
                    </h3>

                    <p className="text-zinc-600 mt-2 leading-7">
                      Soluções ambientais para empresas, instituições e órgãos públicos.
                    </p>
                  </div>

                </div>

                {/* CARD 2 */}

                <div className="flex gap-5 items-start">

                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
                    <Leaf size={28} />
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-zinc-900">
                      Educação Ambiental
                    </h3>

                    <p className="text-zinc-600 mt-2 leading-7">
                      Ações educativas e conscientização sobre reciclagem e sustentabilidade.
                    </p>
                  </div>

                </div>

                {/* CARD 3 */}

                <div className="flex gap-5 items-start">

                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <ShieldCheck size={28} />
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-zinc-900">
                      Transparência ESG
                    </h3>

                    <p className="text-zinc-600 mt-2 leading-7">
                      Indicadores ambientais, impacto social e resultados públicos.
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