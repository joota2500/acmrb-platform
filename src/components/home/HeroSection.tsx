"use client";

/**
 * HeroSection (primeira dobra da página inicial)
 * ------------------------------------------------------------
 * O que mostra: selo, título, subtítulo, 2 botões de ação e 4 números
 * de impacto, sobre uma foto de fundo com degradê esmeralda.
 *
 * De onde vêm os dados (hook useESGMetrics → Supabase):
 *  - Resíduos reciclados: soma de materiais_registros.peso (em KG,
 *    coluna "unidade" padrão 'kg'). Antes era exibido como "t" sem
 *    converter (1.500 kg aparecia como "1500t"). Agora formatarPeso()
 *    mostra "kg" abaixo de 1.000 kg e "t" (toneladas) acima.
 *  - Famílias beneficiadas: dashboard_metricas.familias_impactadas.
 *  - CO₂ evitado: dashboard_metricas.co2_evitado (preenchido à mão no
 *    admin; tratado como TONELADAS — o schema não define a unidade).
 *  - Enquanto carrega: "—". Ao terminar (com ou sem dados / erro): mostra
 *    o valor, que é 0 quando o banco não retorna nada.
 *
 * Responsividade (mobile-first):
 *  - Celular (<640px): título text-4xl, subtítulo text-base alinhado à
 *    esquerda, botões h-12 em coluna e largura total, números em 2 colunas.
 *  - Tablet (640–1023px): título 5xl/6xl, botões lado a lado, 4 colunas a
 *    partir de md (768px).
 *  - Desktop (>=1024px): título 7xl, subtítulo text-2xl, botões h-16.
 *  - Espaço do topo acompanha a altura do Header fixo (64/72/80px).
 */

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import { useESGMetrics } from "@/hooks/useESGMetrics";

/** Converte o peso total (kg) em texto: "850 kg", "1,5 t", "12 t". */
function formatarPeso(kg: number): string {
  if (kg < 1000) {
    return `${kg.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kg`;
  }
  const t = kg / 1000;
  return `${t.toLocaleString("pt-BR", {
    maximumFractionDigits: t < 10 ? 1 : 0,
  })} t`;
}

/** Formata números com separador brasileiro (ex.: 1.250). */
const formatarNumero = (n: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

export default function HeroSection() {
  // Métricas do Supabase (veja o hook para os detalhes de cada tabela)
  const { loading, totalPeso, familiasImpactadas, co2 } = useESGMetrics();

  // Lista dos 4 indicadores (evita repetir o mesmo JSX 4 vezes)
  const stats = [
    { valor: loading ? "—" : formatarPeso(totalPeso), rotulo: "Resíduos reciclados" },
    { valor: loading ? "—" : formatarNumero(familiasImpactadas), rotulo: "Famílias beneficiadas" },
    { valor: loading ? "—" : `${formatarNumero(co2)} t`, rotulo: "CO₂ evitado" },
    { valor: "100%", rotulo: "Transparência" },
  ];

  return (
    <section className="relative min-h-dvh flex items-center overflow-hidden bg-emerald-950 pt-16 sm:pt-18 lg:pt-20">
      {/* ===== Fundo: foto otimizada (next/image) + degradê para leitura ===== */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-reciclagem.jpg"
          alt="" /* decorativa: o texto já descreve a seção */
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/90 via-emerald-900/80 to-transparent" />
      </div>

      <div className="relative z-10 container-custom py-10 sm:py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-left">
          {/* ===== Selo (menor no celular) ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 mb-6 sm:mb-8"
          >
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" aria-hidden="true" />
            <span className="text-emerald-100 text-[11px] sm:text-sm font-bold tracking-wider sm:tracking-widest">
              EDUCAÇÃO AMBIENTAL • AÇÃO COLETIVA
            </span>
          </motion.div>

          {/* ===== Título: cresce de 4xl (celular) até 7xl (desktop).
               O {" "} garante o espaço entre as linhas ao copiar o texto. ===== */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight sm:tracking-[-2px] lg:tracking-[-3px] leading-[1.05] text-white text-balance"
          >
            Aprenda, recicle e construa o futuro.{" "}
            <span className="block mt-1 text-emerald-300">Transforme Baturité.</span>
          </motion.h1>

          {/* ===== Subtítulo: alinhado à esquerda (justificado criava
               "rios" de espaço em telas estreitas) ===== */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 sm:mt-8 text-base sm:text-lg md:text-xl lg:text-2xl text-emerald-100 max-w-3xl leading-relaxed text-pretty"
          >
            A ACMRB une coleta seletiva, educação ambiental e transparência para
            gerar renda, proteger o meio ambiente e construir um futuro
            sustentável para a nossa cidade.
          </motion.p>

          {/* ===== Botões: coluna e largura total no celular; lado a lado
               a partir de 640px ===== */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-12"
          >
            <a
              href="#quem-somos"
              className="group w-full sm:w-auto h-12 md:h-14 lg:h-16 px-6 md:px-10 rounded-2xl md:rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base lg:text-lg font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all active:scale-95 shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
            >
              Saiba como participar
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" aria-hidden="true" />
            </a>

            {/* Antes apontava para "#educacao", que não existe. A página
                /projetos apresenta os projetos e campanhas educativas. */}
            <Link
              href="/projetos"
              className="w-full sm:w-auto h-12 md:h-14 lg:h-16 px-6 md:px-10 rounded-2xl md:rounded-3xl border-2 border-white/40 hover:bg-white/10 text-white text-sm sm:text-base lg:text-lg font-medium flex items-center justify-center text-center transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
            >
              Conheça nossos projetos educativos
            </Link>
          </motion.div>

          {/* ===== Indicadores: 2 colunas no celular, 4 a partir de md ===== */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 sm:mt-14 lg:mt-20 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 sm:gap-8 max-w-3xl md:mx-auto"
            aria-busy={loading}
          >
            {stats.map((s) => (
              <div key={s.rotulo} className="text-center flex flex-col-reverse">
                <dt className="text-emerald-100/80 text-[11px] sm:text-sm mt-1 sm:mt-2 uppercase tracking-wide">
                  {s.rotulo}
                </dt>
                <dd className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-300 whitespace-nowrap">
                  {s.valor}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
