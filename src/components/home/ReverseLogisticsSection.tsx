"use client";

import { motion } from "framer-motion";

import {
  ArrowRight,
  Building2,
  Recycle,
  Truck,
  ShieldCheck,
} from "lucide-react";

const services = [
  {
    icon: Truck,
    title: "Coleta Programada",
    description:
      "Planejamento e execução de coleta seletiva para empresas, órgãos públicos e instituições.",
  },

  {
    icon: Recycle,
    title: "Destinação Correta",
    description:
      "Encaminhamento ambientalmente adequado de resíduos recicláveis e reaproveitáveis.",
  },

  {
    icon: Building2,
    title: "Parcerias Institucionais",
    description:
      "Soluções sustentáveis voltadas para responsabilidade socioambiental corporativa.",
  },

  {
    icon: ShieldCheck,
    title: "Indicadores ESG",
    description:
      "Relatórios de impacto ambiental e apoio às metas de sustentabilidade organizacional.",
  },
];

export default function ReverseLogisticsSection() {
  return (
    <section className="section-spacing relative overflow-hidden">

      {/* BG */}

      <div className="absolute inset-0 bg-gradient-to-b from-white to-emerald-50/40" />

      <div className="container-custom relative z-10">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >

            <div className="section-tag mb-6">
              Logística Reversa
            </div>

            <h2 className="section-title">

              Soluções ambientais
              para empresas,
              instituições e parceiros.

            </h2>

            <p className="section-description mt-8">

              A ACMRB atua no desenvolvimento de ações de logística reversa,
              coleta seletiva e destinação ambientalmente adequada de resíduos,
              fortalecendo práticas sustentáveis e metas ESG.

            </p>

            {/* FEATURES */}

            <div className="grid gap-6 mt-12">

              <div className="glass-card rounded-[1.5rem] p-6">

                <h3 className="text-xl font-bold text-zinc-900">
                  Gestão Sustentável
                </h3>

                <p className="text-zinc-600 mt-3 leading-7">

                  Estruturação de processos sustentáveis
                  para descarte e reaproveitamento de materiais recicláveis.

                </p>

              </div>

              <div className="glass-card rounded-[1.5rem] p-6">

                <h3 className="text-xl font-bold text-zinc-900">
                  Responsabilidade Ambiental
                </h3>

                <p className="text-zinc-600 mt-3 leading-7">

                  Apoio a organizações que buscam fortalecer
                  ações ambientais e indicadores ESG.

                </p>

              </div>

            </div>

            {/* BUTTON */}

            <div className="mt-10">

              <a
                href="#contato"
                className="primary-button"
              >
                Solicitar parceria
                <ArrowRight size={18} />
              </a>

            </div>

          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >

            <div className="grid gap-6">

              {services.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
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
                      delay: index * 0.1,
                    }}
                    viewport={{ once: true }}
                    className="glass-card rounded-[2rem] p-8"
                  >

                    <div className="flex gap-5 items-start">

                      {/* ICON */}

                      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">

                        <Icon size={30} />

                      </div>

                      {/* CONTENT */}

                      <div>

                        <h3 className="text-2xl font-bold text-zinc-900">

                          {item.title}

                        </h3>

                        <p className="text-zinc-600 leading-8 mt-4">

                          {item.description}

                        </p>

                      </div>

                    </div>

                  </motion.div>
                );
              })}

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}