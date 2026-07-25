"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Users2, Building2 } from "lucide-react";

import "@/styles/about-section.css";

export default function AboutSection() {
  return (
    <section id="quem-somos" className="about">
      <div className="about__container">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="about__header"
        >
          <span className="about__tag">Nossa História</span>

          <h2 className="about__title">
            Comprometidos com o meio ambiente,
            <span> as pessoas</span> e o futuro de Baturité
          </h2>

          <p className="about__description">
            A ACMRB — Associação dos Catadores de Materiais Recicláveis de
            Baturité — nasceu da necessidade de organizar, valorizar e dar
            dignidade ao trabalho dos catadores, promovendo sustentabilidade,
            inclusão social e economia circular na nossa região.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="about__grid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="about__card"
          >
            <div className="about__icon about__icon--green">
              <Leaf size={26} />
            </div>
            <h3>Sustentabilidade</h3>
            <p>
              Reduzimos o impacto ambiental através da coleta seletiva,
              reciclagem e educação da população sobre o descarte correto de
              resíduos.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="about__card"
          >
            <div className="about__icon about__icon--teal">
              <Users2 size={26} />
            </div>
            <h3>Inclusão Social</h3>
            <p>
              Geramos renda digna, valorizamos o trabalho dos catadores e
              promovemos capacitação, garantindo direitos e qualidade de vida.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="about__card"
          >
            <div className="about__icon about__icon--green">
              <Building2 size={26} />
            </div>
            <h3>Impacto Local</h3>
            <p>
              Trabalhamos em parceria com prefeituras, empresas e instituições
              para construir um modelo sustentável de gestão de resíduos na
              região.
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="about__cta"
        >
          <div className="about__cta-text">
            <h3>Faça parte dessa transformação</h3>
            <p>
              Seja um parceiro, voluntário, doador ou apoiador. Juntos podemos
              construir uma cidade mais limpa, justa e sustentável.
            </p>
          </div>

          <div className="about__cta-buttons">
            <a href="#contato" className="about__btn-primary">
              Quero Colaborar
            </a>
            <Link href="/quem-somos" className="about__btn-secondary">
              Conheça Nossa História
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
