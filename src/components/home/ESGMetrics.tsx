"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Recycle,
  Cloud,
  Users,
  Trees,
  TrendingUp,
  ArrowRight,
  Award,
} from "lucide-react";
import { useESGMetrics } from "@/hooks/useESGMetrics";

export default function ESGMetrics() {
  const { loading, totalPeso, co2, arvores, familiasImpactadas } =
    useESGMetrics();

  const metaPeso = 5000;
  const metaCo2 = 10000;
  const metaArvores = 500;
  const metaFamilias = 300;

  const percentual = (atual: number, meta: number) => {
    const valor = (atual / meta) * 100;
    return `${Math.min(valor, 100).toFixed(0)}%`;
  };

  const formatPeso = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}t`;
    return `${value.toFixed(0)}kg`;
  };

  const metrics = [
    {
      title: "Resíduos Coletados",
      value: formatPeso(totalPeso),
      progress: percentual(totalPeso, metaPeso),
      description:
        "Total acumulado de materiais recicláveis processados pela ACMRB.",
      icon: Recycle,
      color: "from-emerald-600 to-teal-600",
    },
    {
      title: "CO₂ Evitado",
      value: formatPeso(co2),
      progress: percentual(co2, metaCo2),
      description: "Emissões de carbono evitadas graças à reciclagem.",
      icon: Cloud,
      color: "from-sky-500 to-blue-600",
    },
    {
      title: "Famílias Impactadas",
      value: `${familiasImpactadas}+`,
      progress: percentual(familiasImpactadas, metaFamilias),
      description:
        "Famílias que tiveram sua renda e qualidade de vida melhoradas.",
      icon: Users,
      color: "from-violet-600 to-fuchsia-600",
    },
    {
      title: "Árvores Preservadas",
      value: arvores.toFixed(0),
      progress: percentual(arvores, metaArvores),
      description: "Equivalente ambiental gerado pelas nossas ações.",
      icon: Trees,
      color: "from-emerald-500 to-green-600",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-linear-to-b from-[#F5F7F4] to-white relative overflow-hidden">
      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm mb-6">
            <Award size={20} /> DASHBOARD ESG AO VIVO
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-zinc-900">
            Transparência em números
          </h2>

          <p className="mt-6 text-lg text-zinc-600 max-w-2xl mx-auto">
            Resultados reais da nossa atuação em coleta seletiva, impacto social
            e preservação ambiental.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-4xl p-8 md:p-10 group hover:shadow-2xl transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                      {metric.title}
                    </p>
                    <h3 className="text-5xl md:text-6xl font-black text-zinc-900 mt-4">
                      {loading ? "—" : metric.value}
                    </h3>
                  </div>

                  <div
                    className={`w-16 h-16 rounded-3xl bg-linear-to-br ${metric.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition`}
                  >
                    <Icon size={32} />
                  </div>
                </div>

                <p className="text-zinc-600 mt-8 leading-relaxed">
                  {metric.description}
                </p>

                <div className="mt-10">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-zinc-500">Progresso da Meta</span>
                    <span className="font-bold text-emerald-700">
                      {metric.progress}
                    </span>
                  </div>
                  <div className="h-2.5 bg-zinc-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: metric.progress }}
                      transition={{ duration: 1.2 }}
                      viewport={{ once: true }}
                      className={`h-full bg-linear-to-r ${metric.color}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <Link
            href="/transparencia"
            className="inline-flex items-center gap-3 h-16 px-12 rounded-3xl bg-emerald-700 hover:bg-emerald-800 text-white text-lg font-bold transition-all active:scale-95 shadow-xl"
          >
            Ver Todos os Relatórios ESG
            <ArrowRight />
          </Link>
          <p className="text-zinc-500 text-sm mt-6">
            Dados atualizados em tempo real • Transparência total
          </p>
        </motion.div>
      </div>
    </section>
  );
}
