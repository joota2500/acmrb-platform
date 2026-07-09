"use client";

import { motion } from "framer-motion";
import { ArrowRight, Leaf, Users, Award, PlayCircle } from "lucide-react";
import { useESGMetrics } from "@/hooks/useESGMetrics";

export default function HeroSection() {
  const { loading, totalPeso, familiasImpactadas, co2 } = useESGMetrics();

  return (
    <section className="relative min-h-dvh flex items-center overflow-hidden bg-emerald-950 pt-20">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-reciclagem.jpg"
          alt="Educação Ambiental"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/90 via-emerald-900/80 to-transparent" />
      </div>

      <div className="relative z-10 container-custom py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center md:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 mb-8 mx-auto md:mx-0"
          >
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-100 text-sm font-bold tracking-widest">
              EDUCAÇÃO AMBIENTAL • AÇÃO COLETIVA
            </span>
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-[-3px] leading-none text-white"
          >
            Aprenda, Recicle e Construa Futuro
            <span className="block text-emerald-300">Transforme Baturité</span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-lg md:text-2xl text-emerald-100 max-w-3xl mx-auto md:mx-0 leading-relaxed text-balance"
          >
            A ACMRB une coleta seletiva, educação ambiental e transparência para
            gerar renda, proteger o meio ambiente e construir um futuro
            sustentável para nossa cidade.
          </motion.p>

          {/* Botões CTA - Responsivos */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mt-12 justify-center md:justify-start"
          >
            <a
              href="#quem-somos"
              className="group h-14 md:h-16 px-8 md:px-10 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white text-base md:text-lg font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl"
            >
              Saiba Como Participar
              <ArrowRight className="group-hover:translate-x-1 transition" />
            </a>

            <a
              href="#educacao"
              className="h-14 md:h-16 px-8 md:px-10 rounded-3xl border-2 border-white/40 hover:bg-white/10 text-white text-base md:text-lg font-medium flex items-center justify-center transition-all"
            >
              Conheça Nossos Projetos Educativos
            </a>
          </motion.div>

          {/* Stats Educativos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-5xl font-black text-emerald-300">
                {loading ? "—" : `${totalPeso.toFixed(0)}t`}
              </div>
              <div className="text-emerald-100/80 text-sm mt-2">
                RESÍDUOS RECICLADOS
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-black text-emerald-300">
                {loading ? "—" : familiasImpactadas}
              </div>
              <div className="text-emerald-100/80 text-sm mt-2">
                FAMÍLIAS BENEFICIADAS
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-black text-emerald-300">
                {loading ? "—" : `${co2.toFixed(0)}t`}
              </div>
              <div className="text-emerald-100/80 text-sm mt-2">
                CO₂ EVITADO
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-black text-emerald-300">100%</div>
              <div className="text-emerald-100/80 text-sm mt-2">
                TRANSPARÊNCIA
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
