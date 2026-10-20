// NÃO UTILIZADO: substituído por TransparencySummarySection na home. Mantido para uso futuro.
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  FileText,
  Leaf,
  BarChart3,
  Globe2,
  Award,
  Users,
} from "lucide-react";

import "@/styles/stats-section.css";

const features = [
  {
    icon: BarChart3,
    title: "Indicadores ESG",
    desc: "Dados ambientais integrados e atualizados em tempo real.",
  },
  {
    icon: Leaf,
    title: "Sustentabilidade",
    desc: "Ações ambientais, economia circular e redução de resíduos.",
  },
  {
    icon: Globe2,
    title: "Transparência Pública",
    desc: "Informações acessíveis, relatórios e prestação de contas.",
  },
  {
    icon: FileText,
    title: "Relatórios Institucionais",
    desc: "Central ESG completa com histórico e métricas anuais.",
  },
  {
    icon: Award,
    title: "Certificações",
    desc: "Selo Verde Municipal e compliance com normas ambientais.",
  },
  {
    icon: Users,
    title: "Impacto Social",
    desc: "Geração de renda e inclusão dos catadores.",
  },
];

export default function StatsSection() {
  return (
    <section id="transparencia" className="stats">
      <div className="stats__bg">
        <div className="stats__blob stats__blob--1" />
        <div className="stats__blob stats__blob--2" />
      </div>

      <div className="stats__container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="stats__header"
        >
          <div className="stats__tag">
            <ShieldCheck size={18} />
            TRANSPARÊNCIA • ESG • IMPACTO
          </div>

          <h2 className="stats__title">
            Transparência pública e responsabilidade socioambiental.
          </h2>

          <p className="stats__description">
            A ACMRB disponibiliza uma central institucional de transparência ESG
            voltada para indicadores ambientais, impacto social, dados
            operacionais e relatórios públicos.
          </p>
        </motion.div>

        {/* Grid de features */}
        <div className="stats__grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="stats__card"
              >
                <div className="stats__card-icon">
                  <Icon size={26} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="stats__cta"
        >
          <h3>Consulte a Central Completa de Transparência ESG</h3>
          <p>
            Acompanhe em tempo real todos os indicadores ambientais, relatórios
            e ações da ACMRB.
          </p>

          <div className="stats__cta-buttons">
            <Link href="/transparencia" className="stats__btn-primary">
              Ver Transparência
              <ArrowRight size={18} />
            </Link>

            <Link href="/projetos" className="stats__btn-secondary">
              Conheça Nossos Projetos
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
