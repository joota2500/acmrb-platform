"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, Users2, Leaf } from "lucide-react";

export default function AboutSection() {
  return (
    <section
      id="quem-somos"
      className="section-spacing relative overflow-hidden"
    >

      {/* BG */}

      <div className="absolute inset-0 bg-linear-to-b from-white to-emerald-50/40" />

      <div className="container-custom relative z-10">

        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-4xl"
        >

          <div className="section-tag mb-6">
            Quem Somos
          </div>

          <h2 className="section-title">

            Associação comprometida com
            sustentabilidade, inclusão social
            e economia circular.

          </h2>

          <p className="section-description mt-8">

            A ACMRB — Associação dos Catadores de Materiais Recicláveis de Baturité —
            atua no fortalecimento da coleta seletiva, logística reversa e geração de renda
            através da reciclagem, promovendo impacto ambiental positivo e desenvolvimento social.

          </p>

        </motion.div>

        {/* GRID */}

        <div className="grid lg:grid-cols-3 gap-8 mt-20">

          {/* CARD 1 */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="glass-card rounded-4xl p-8"
          >

            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-6">
              <Leaf size={30} />
            </div>

            <h3 className="text-2xl font-bold text-zinc-900">
              Sustentabilidade
            </h3>

            <p className="text-zinc-600 leading-8 mt-5">

              Incentivamos práticas sustentáveis através da reciclagem,
              redução de resíduos e fortalecimento da economia circular.

            </p>

          </motion.div>

          {/* CARD 2 */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
            viewport={{ once: true }}
            className="glass-card rounded-4xl p-8"
          >

            <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 mb-6">
              <Users2 size={30} />
            </div>

            <h3 className="text-2xl font-bold text-zinc-900">
              Inclusão Social
            </h3>

            <p className="text-zinc-600 leading-8 mt-5">

              Promovemos geração de renda, valorização profissional
              e fortalecimento dos catadores associados.

            </p>

          </motion.div>

          {/* CARD 3 */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
            }}
            viewport={{ once: true }}
            className="glass-card rounded-4xl p-8"
          >

            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-6">
              <Building2 size={30} />
            </div>

            <h3 className="text-2xl font-bold text-zinc-900">
              Impacto Institucional
            </h3>

            <p className="text-zinc-600 leading-8 mt-5">

              Desenvolvemos soluções ambientais para empresas,
              instituições e parcerias públicas e privadas.

            </p>

          </motion.div>

        </div>

        {/* CTA */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
          }}
          viewport={{ once: true }}
          className="mt-20"
        >

          <div className="glass-card rounded-4xl p-10 md:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">

            <div className="max-w-3xl">

              <h3 className="text-3xl md:text-4xl font-black text-zinc-900 leading-tight">

                Conheça mais sobre a história,
                atuação e impacto da ACMRB.

              </h3>

              <p className="text-zinc-600 mt-6 leading-8 text-lg">

                Explore nossa trajetória, projetos ambientais,
                ações sociais, parceiros e iniciativas sustentáveis
                desenvolvidas em Baturité e região.

              </p>

            </div>

            <a
              href="/quem-somos"
              className="primary-button whitespace-nowrap"
            >
              Saiba mais
              <ArrowRight size={18} />
            </a>

          </div>

        </motion.div>

      </div>

    </section>
  );
} 