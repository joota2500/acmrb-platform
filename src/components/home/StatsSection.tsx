"use client";

import { motion } from "framer-motion";
import {
  Recycle,
  Trees,
  Users,
  Factory,
} from "lucide-react";

const stats = [
  {
    icon: Recycle,
    value: "+1t",
    title: "Materiais Reciclados",
    description:
      "Resíduos desviados do descarte inadequado através da coleta seletiva.",
  },

  {
    icon: Trees,
    value: "+10t",
    title: "CO₂ evitado",
    description:
      "Estimativa de emissões reduzidas através da reciclagem e reaproveitamento.",
  },

  {
    icon: Users,
    value: "+45",
    title: "Famílias impactadas",
    description:
      "Catadores e famílias beneficiadas diretamente pelas atividades da associação.",
  },

  {
    icon: Factory,
    value: "+5",
    title: "Parcerias institucionais",
    description:
      "Empresas, instituições e organizações apoiando ações sustentáveis.",
  },
];

export default function StatsSection() {
  return (
    <section className="section-spacing relative overflow-hidden">

      {/* BG */}

      <div className="absolute inset-0 bg-linear-to-b from-emerald-50/50 to-white" />

      <div className="container-custom relative z-10">

        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >

          <div className="section-tag mb-6">
            Indicadores ESG
          </div>

          <h2 className="section-title">

            Impacto ambiental e social
            gerando transformação real.

          </h2>

          <p className="section-description mx-auto mt-8">

            Acompanhamos indicadores ambientais, sociais e institucionais
            para garantir transparência, impacto positivo e fortalecimento
            das ações sustentáveis desenvolvidas pela associação.

          </p>

        </motion.div>

        {/* GRID */}

        <div className="auto-grid mt-20">

          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
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

                {/* ICON */}

                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-8">

                  <Icon size={30} />

                </div>

                {/* VALUE */}

                <div className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter">

                  {item.value}

                </div>

                {/* TITLE */}

                <h3 className="text-2xl font-bold text-zinc-900 mt-6">

                  {item.title}

                </h3>

                {/* DESCRIPTION */}

                <p className="text-zinc-600 leading-8 mt-5">

                  {item.description}

                </p>

              </motion.div>
            );
          })}

        </div>

      </div>

    </section>
  );
}