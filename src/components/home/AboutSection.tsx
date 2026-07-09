"use client";

import { motion } from "framer-motion";
import { ArrowRight, Leaf, Users2, Building2 } from "lucide-react";

export default function AboutSection() {
  return (
    <section
      id="quem-somos"
      className="section-spacing relative overflow-hidden bg-white"
    >
      <div className="container-custom relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <div className="section-tag mx-auto mb-6">Nossa História</div>

          <h2 className="section-title text-balance">
            Comprometidos com o meio ambiente,
            <span className="text-emerald-700">as pessoas</span> e o futuro de
            Baturité
          </h2>

          <p className="section-description mt-8 max-w-3xl mx-auto">
            A ACMRB — Associação dos Catadores de Materiais Recicláveis de
            Baturité — nasceu da necessidade de organizar, valorizar e dar
            dignidade ao trabalho dos catadores, promovendo sustentabilidade,
            inclusão social e economia circular na nossa região.
          </p>
        </motion.div>

        {/* Grid de Valores */}
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-4xl p-8 md:p-10 group hover:-translate-y-2 transition-all"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-8 group-hover:scale-110 transition">
              <Leaf size={32} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-zinc-900">
              Sustentabilidade
            </h3>
            <p className="text-zinc-600 mt-6 leading-relaxed text-base md:text-[17px]">
              Reduzimos o impacto ambiental através da coleta seletiva,
              reciclagem e educação da população sobre o descarte correto de
              resíduos.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-4xl p-8 md:p-10 group hover:-translate-y-2 transition-all"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-teal-100 flex items-center justify-center text-teal-700 mb-8 group-hover:scale-110 transition">
              <Users2 size={32} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-zinc-900">
              Inclusão Social
            </h3>
            <p className="text-zinc-600 mt-6 leading-relaxed text-base md:text-[17px]">
              Geramos renda digna, valorizamos o trabalho dos catadores e
              promovemos capacitação, garantindo direitos e qualidade de vida.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-4xl p-8 md:p-10 group hover:-translate-y-2 transition-all"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-8 group-hover:scale-110 transition">
              <Building2 size={32} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-zinc-900">
              Impacto Local
            </h3>
            <p className="text-zinc-600 mt-6 leading-relaxed text-base md:text-[17px]">
              Trabalhamos em parceria com prefeituras, empresas e instituições
              para construir um modelo sustentável de gestão de resíduos na
              região.
            </p>
          </motion.div>
        </div>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 glass-card rounded-4xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-12"
        >
          <div className="flex-1">
            <h3 className="text-3xl md:text-4xl font-black text-zinc-900">
              Faça parte dessa transformação
            </h3>
            <p className="mt-6 text-zinc-600 text-base md:text-lg leading-relaxed">
              Seja um parceiro, voluntário, doador ou apoiador. Juntos podemos
              construir uma cidade mais limpa, justa e sustentável.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <a
              href="#contato"
              className="primary-button whitespace-nowrap px-8 md:px-12 py-3 md:py-4 text-base md:text-lg"
            >
              Quero Colaborar
            </a>
            <a
              href="/quem-somos"
              className="h-12 md:h-14 px-8 md:px-10 border border-emerald-200 rounded-3xl font-bold flex items-center justify-center text-emerald-700 hover:bg-emerald-50 transition text-base md:text-lg"
            >
              Conheça Nossa História
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
