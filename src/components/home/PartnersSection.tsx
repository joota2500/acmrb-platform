"use client";

import { motion } from "framer-motion";

const partners = [
  "Prefeitura Municipal",
  "Instituição Parceira",
  "Empresa Sustentável",
  "Projeto Ambiental",
  "Cooperativa Regional",
  "Parceiro ESG",
];

export default function PartnersSection() {
  return (
    <section
      id="parceiros"
      className="section-spacing relative overflow-hidden"
    >

      {/* BG */}

      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/40 to-white" />

      <div className="container-custom relative z-10">

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
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >

          <div className="section-tag mb-6">
            Parceiros e Apoiadores
          </div>

          <h2 className="section-title">

            Instituições e organizações
            conectadas ao impacto sustentável.

          </h2>

          <p className="section-description mx-auto mt-8">

            Parcerias institucionais fortalecem ações ambientais,
            inclusão social, educação ambiental e logística reversa.

          </p>

        </motion.div>

        {/* LOGOS GRID */}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-20">

          {partners.map((partner, index) => (
            <motion.div
              key={partner}
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
              }}
              viewport={{ once: true }}
              className="glass-card rounded-[1.8rem] h-[140px] flex items-center justify-center p-6 text-center"
            >

              <div>

                {/* LOGO PLACEHOLDER */}

                <div className="w-14 h-14 rounded-2xl bg-emerald-100 mx-auto mb-4 flex items-center justify-center text-emerald-700 font-black text-lg">

                  ESG

                </div>

                {/* NAME */}

                <p className="text-sm font-semibold text-zinc-700 leading-6">

                  {partner}

                </p>

              </div>

            </motion.div>
          ))}

        </div>

        {/* BOTTOM CTA */}

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
            delay: 0.2,
          }}
          viewport={{ once: true }}
          className="mt-20"
        >

          <div className="glass-card rounded-[2rem] p-10 md:p-14 text-center">

            <div className="max-w-4xl mx-auto">

              <div className="section-tag mb-6">
                Parcerias Institucionais
              </div>

              <h3 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.04em] text-zinc-900">

                Conectando organizações
                ao desenvolvimento sustentável.

              </h3>

              <p className="text-zinc-600 leading-8 text-lg mt-8">

                Empresas, instituições e organizações podem apoiar
                iniciativas sustentáveis, logística reversa e ações
                socioambientais desenvolvidas pela ACMRB.

              </p>

              <a
                href="#contato"
                className="primary-button mt-10"
              >
                Tornar-se parceiro
              </a>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}