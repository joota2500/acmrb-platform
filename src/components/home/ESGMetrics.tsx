"use client";

import { motion } from "framer-motion";

const metrics = [
  {
    title: "Resíduos reciclados",
    value: "+1t",
    progress: "20%",
    description:
      "Materiais destinados corretamente através da coleta seletiva.",
  },

  {
    title: "CO₂ evitado",
    value: "10t",
    progress: "50%",
    description:
      "Estimativa de redução de emissões ambientais.",
  },

  {
    title: "Famílias impactadas",
    value: "+45",
    progress: "45%",
    description:
      "Catadores e famílias beneficiadas pelas ações da associação.",
  },

  {
    title: "Parcerias ESG",
    value: "+5",
    progress: "5%",
    description:
      "Instituições e empresas apoiando ações sustentáveis.",
  },
];

export default function ESGMetrics() {
  return (
    <section className="section-spacing relative overflow-hidden">

      {/* BACKGROUND */}

      <div className="absolute inset-0 bg-linear-to-b from-emerald-50/40 to-white" />

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
          className="max-w-4xl"
        >

          <div className="section-tag mb-6">
            Dashboard ESG
          </div>

          <h2 className="section-title">

            Transparência ambiental
            e impacto sustentável.

          </h2>

          <p className="section-description mt-8">

            Indicadores ambientais, sociais e institucionais
            monitorados para fortalecer transparência,
            responsabilidade socioambiental e metas ESG.

          </p>

        </motion.div>

        {/* GRID */}

        <div className="grid lg:grid-cols-2 gap-8 mt-20">

          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
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
                delay: index * 0.1,
              }}
              viewport={{ once: true }}
              className="glass-card rounded-4xl p-8 md:p-10"
            >

              {/* TOP */}

              <div className="flex items-start justify-between gap-6">

                <div>

                  <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">

                    {metric.title}

                  </p>

                  <h3 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter mt-4">

                    {metric.value}

                  </h3>

                </div>

                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">

                  ESG

                </div>

              </div>

              {/* DESCRIPTION */}

              <p className="text-zinc-600 leading-8 mt-8">

                {metric.description}

              </p>

              {/* PROGRESS */}

              <div className="mt-10">

                <div className="flex items-center justify-between mb-4">

                  <span className="text-sm font-medium text-zinc-500">
                    Meta anual
                  </span>

                  <span className="text-sm font-bold text-emerald-700">
                    {metric.progress}
                  </span>

                </div>

                <div className="w-full h-3 rounded-full bg-zinc-200 overflow-hidden">

                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    whileInView={{
                      width: metric.progress,
                    }}
                    transition={{
                      duration: 1,
                    }}
                    viewport={{ once: true }}
                    className="h-full rounded-full bg-linear-to-r from-emerald-600 to-teal-500"
                  />

                </div>

              </div>

            </motion.div>
          ))}

        </div>

        {/* BOTTOM */}

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
          className="mt-20"
        >

          <div className="glass-card rounded-4xl p-10 md:p-14">

            <div className="grid lg:grid-cols-2 gap-10 items-center">

              <div>

                <div className="section-tag mb-6">
                  Sustentabilidade
                </div>

                <h3 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.04em] text-zinc-900">

                  Indicadores alinhados
                  às práticas ESG.

                </h3>

              </div>

              <div>

                <p className="text-zinc-600 leading-8 text-lg">

                  Os indicadores ambientais e sociais da ACMRB
                  fortalecem ações sustentáveis, inclusão social,
                  transparência institucional e responsabilidade ambiental.

                </p>

                <button className="primary-button mt-8">

                  Ver relatório ESG

                </button>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}