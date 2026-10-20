// NÃO UTILIZADO: substituído por TransparencySummarySection na home. Mantido para uso futuro.
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Recycle, Cloud, Users, Trees, ArrowRight, Award } from "lucide-react";
import { useESGMetrics } from "@/hooks/useESGMetrics";

import "@/styles/esg-metrics.css";

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
      color: "esg-metric__icon--emerald",
      bar: "esg-metric__bar--emerald",
    },
    {
      title: "CO₂ Evitado",
      value: formatPeso(co2),
      progress: percentual(co2, metaCo2),
      description: "Emissões de carbono evitadas graças à reciclagem.",
      icon: Cloud,
      color: "esg-metric__icon--sky",
      bar: "esg-metric__bar--sky",
    },
    {
      title: "Famílias Impactadas",
      value: `${familiasImpactadas}+`,
      progress: percentual(familiasImpactadas, metaFamilias),
      description:
        "Famílias que tiveram sua renda e qualidade de vida melhoradas.",
      icon: Users,
      color: "esg-metric__icon--violet",
      bar: "esg-metric__bar--violet",
    },
    {
      title: "Árvores Preservadas",
      value: arvores.toFixed(0),
      progress: percentual(arvores, metaArvores),
      description: "Equivalente ambiental gerado pelas nossas ações.",
      icon: Trees,
      color: "esg-metric__icon--green",
      bar: "esg-metric__bar--green",
    },
  ];

  return (
    <section className="esg-metrics">
      <div className="esg-metrics__container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="esg-metrics__header"
        >
          <div className="esg-metrics__tag">
            <Award size={18} />
            DASHBOARD ESG AO VIVO
          </div>

          <h2 className="esg-metrics__title">Transparência em números</h2>

          <p className="esg-metrics__description">
            Resultados reais da nossa atuação em coleta seletiva, impacto social
            e preservação ambiental.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="esg-metrics__grid">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="esg-metric"
              >
                <div className="esg-metric__top">
                  <div>
                    <p className="esg-metric__label">{metric.title}</p>
                    <h3 className="esg-metric__value">
                      {loading ? "—" : metric.value}
                    </h3>
                  </div>

                  <div className={`esg-metric__icon ${metric.color}`}>
                    <Icon size={24} />
                  </div>
                </div>

                <p className="esg-metric__desc">{metric.description}</p>

                <div className="esg-metric__progress">
                  <div className="esg-metric__progress-info">
                    <span>Progresso da Meta</span>
                    <strong>{metric.progress}</strong>
                  </div>
                  <div className="esg-metric__track">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: metric.progress }}
                      transition={{ duration: 1.1 }}
                      viewport={{ once: true }}
                      className={`esg-metric__bar ${metric.bar}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="esg-metrics__cta"
        >
          <Link href="/transparencia" className="esg-metrics__btn">
            Ver Todos os Relatórios ESG
            <ArrowRight size={18} />
          </Link>
          <p>Dados atualizados em tempo real • Transparência total</p>
        </motion.div>
      </div>
    </section>
  );
}
