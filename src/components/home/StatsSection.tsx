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

export default function StatsSection() {
  return (
    <section
      id="transparencia"
      className="py-24 md:py-32 bg-linear-to-b from-[#F5F7F4] via-white to-[#F5F7F4] relative overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-teal-200/30 blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm mb-8">
            <ShieldCheck size={20} />
            TRANSPARÊNCIA • ESG • IMPACTO AMBIENTAL
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-zinc-900">
            Transparência pública e responsabilidade socioambiental.
          </h2>

          <p className="mt-8 text-lg md:text-xl text-zinc-600 max-w-3xl mx-auto leading-relaxed">
            A ACMRB disponibiliza uma central institucional de transparência ESG
            voltada para indicadores ambientais, impacto social, dados
            operacionais e relatórios públicos.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
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
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-3xl p-8 hover:shadow-xl transition-all group"
            >
              <feature.icon
                size={36}
                className="text-emerald-600 mb-6 group-hover:scale-110 transition"
              />
              <h3 className="text-2xl font-bold text-zinc-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-zinc-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Central */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <div className="bg-linear-to-r from-emerald-800 to-teal-700 rounded-4xl p-10 md:p-16 text-white shadow-2xl">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-4xl md:text-5xl font-black leading-tight">
                Consulte a Central Completa de Transparência ESG
              </h3>
              <p className="mt-6 text-emerald-100 text-lg">
                Acompanhe em tempo real todos os indicadores ambientais,
                relatórios e ações da ACMRB.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Link
                  href="/transparencia"
                  className="h-16 px-10 rounded-3xl bg-white text-emerald-800 font-bold text-lg flex items-center justify-center hover:bg-emerald-50 transition-all"
                >
                  Ver Transparência
                  <ArrowRight className="ml-3" />
                </Link>

                <Link
                  href="/projetos"
                  className="h-16 px-10 rounded-3xl border-2 border-white/30 hover:bg-white/10 text-white font-bold text-lg flex items-center justify-center transition-all"
                >
                  Conheça Nossos Projetos
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
