"use client";

import { motion } from "framer-motion";

const institutionalLinks = [
  {
    title: "Quem Somos",
    items: [
      "História da associação",
      "Missão e visão",
      "Equipe e associados",
      "Atuação institucional",
    ],
  },

  {
    title: "Sustentabilidade",
    items: [
      "Logística reversa",
      "Educação ambiental",
      "Economia circular",
      "Impacto ESG",
    ],
  },

  {
    title: "Transparência",
    items: [
      "Relatórios institucionais",
      "Projetos e ações",
      "Prestação de contas",
      "Documentos públicos",
    ],
  },

  {
    title: "Parcerias",
    items: [
      "Empresas parceiras",
      "Projetos ambientais",
      "Apoiadores",
      "Parcerias ESG",
    ],
  },
];

export default function InstitutionalSection() {
  return (
    <section className="section-spacing relative overflow-hidden">

      {/* BG */}

      <div className="absolute inset-0 bg-linear-to-b from-emerald-50/40 to-white" />

      <div className="container-custom relative z-10">

        {/* TOP */}

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
          viewport={{ once: true }}
          className="max-w-5xl"
        >

          <div className="section-tag mb-6">
            Plataforma Institucional
          </div>

          <h2 className="section-title">

            Transparência,
            sustentabilidade
            e impacto social.

          </h2>

          <p className="section-description mt-8">

            A ACMRB desenvolve ações ambientais, inclusão social,
            logística reversa e iniciativas sustentáveis voltadas
            para transformação ambiental e fortalecimento institucional.

          </p>

        </motion.div>

        {/* GRID */}

        <div className="grid lg:grid-cols-4 gap-8 mt-20">

          {institutionalLinks.map((group, index) => (
            <motion.div
              key={group.title}
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
                delay: index * 0.08,
              }}
              viewport={{ once: true }}
              className="glass-card rounded-4xl p-8"
            >

              <h3 className="text-2xl font-bold text-zinc-900">

                {group.title}

              </h3>

              <div className="mt-8 space-y-5">

                {group.items.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-zinc-600 hover:text-emerald-700 transition-all leading-7"
                  >

                    {item}

                  </a>
                ))}

              </div>

            </motion.div>
          ))}

        </div>

        {/* LARGE CTA */}

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

          <div className="glass-card rounded-4xl p-10 md:p-16 overflow-hidden relative">

            {/* DECORATION */}

            <div className="absolute top-0 right-0 w-75 h-75 bg-emerald-200/20 rounded-full blur-3xl" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">

              {/* LEFT */}

              <div>

                <div className="section-tag mb-6">
                  Impacto Ambiental
                </div>

                <h3 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.04em] text-zinc-900">

                  Construindo uma
                  plataforma sustentável
                  para o futuro.

                </h3>

              </div>

              {/* RIGHT */}

              <div>

                <p className="text-zinc-600 leading-8 text-lg">

                  A ACMRB fortalece ações ambientais,
                  educação sustentável, logística reversa,
                  inclusão social e desenvolvimento regional
                  através da reciclagem e economia circular.

                </p>

                <div className="flex flex-wrap gap-4 mt-10">

                  <div className="px-5 py-3 rounded-2xl bg-emerald-100 text-emerald-700 font-semibold">
                    ESG
                  </div>

                  <div className="px-5 py-3 rounded-2xl bg-teal-100 text-teal-700 font-semibold">
                    Sustentabilidade
                  </div>

                  <div className="px-5 py-3 rounded-2xl bg-emerald-100 text-emerald-700 font-semibold">
                    Economia Circular
                  </div>

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}