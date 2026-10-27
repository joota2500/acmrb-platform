"use client";

/**
 * AboutSection — "Nossa História" (âncora #quem-somos da página inicial)
 * ------------------------------------------------------------
 * O que mostra: selo, título, texto de apresentação da ACMRB, 3 cards de
 * valores (Sustentabilidade, Inclusão Social, Impacto Local) e um bloco de
 * chamada (CTA) com 2 botões.
 *
 * Dados: conteúdo fixo (não consulta o Supabase).
 *
 * Links (verificados):
 *  - "Quero colaborar"        → #contato (ContactSection), com rolagem suave
 *    que desconta a altura do Header fixo.
 *  - "Conheça nossa história" → página /quem-somos (existe em src/app).
 *
 * Responsividade (estilos em src/styles/about-section.css):
 *  - Celular (<640px): textos menores, cards em 1 coluna, botões h-12
 *    empilhados e com largura total.
 *  - Tablet (640–1023px): cards em 2 colunas (o 3º ocupa a linha inteira),
 *    botões lado a lado.
 *  - Desktop (>=1024px): cards em 3 colunas com a mesma altura.
 *  - Parágrafos justificados em todas as telas (pedido do Artur), com
 *    hifenização automática (lang="pt-BR") para evitar buracos entre palavras.
 *    Títulos continuam sem justificar.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Users2, Building2 } from "lucide-react";

import { smoothScrollTo } from "@/lib/scroll";

import "@/styles/about-section.css";

/** Cards de valores: editar aqui para mudar textos/ícones. */
const valores = [
  {
    titulo: "Sustentabilidade",
    icone: Leaf,
    cor: "green",
    texto:
      "Reduzimos o impacto ambiental com coleta seletiva, reciclagem e educação da população sobre o descarte correto dos resíduos.",
  },
  {
    titulo: "Inclusão Social",
    icone: Users2,
    cor: "teal",
    texto:
      "Geramos renda digna, valorizamos o trabalho dos catadores e promovemos capacitação, garantindo direitos e qualidade de vida.",
  },
  {
    titulo: "Impacto Local",
    icone: Building2,
    cor: "green",
    texto:
      "Atuamos em parceria com prefeituras, empresas e instituições para construir um modelo sustentável de gestão de resíduos na região.",
  },
];

export default function AboutSection() {
  return (
    <section id="quem-somos" className="about">
      <div className="about__container">
        {/* ===== Cabeçalho: selo + título + apresentação ===== */}
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

          <p className="about__description" lang="pt-BR">
            A ACMRB (Associação dos Catadores de Materiais Recicláveis de
            Baturité), conhecida como Reciclaê, nasceu da necessidade de organizar, valorizar e dar
            dignidade ao trabalho dos catadores, promovendo sustentabilidade,
            inclusão social e economia circular em nossa região.
          </p>
        </motion.div>

        {/* ===== Cards de valores (entrada escalonada) ===== */}
        <div className="about__grid">
          {valores.map((v, i) => {
            const Icone = v.icone;
            return (
              <motion.div
                key={v.titulo}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * (i + 1) }}
                className="about__card"
              >
                <div className={`about__icon about__icon--${v.cor}`} aria-hidden="true">
                  <Icone size={26} />
                </div>
                <h3>{v.titulo}</h3>
                <p lang="pt-BR">{v.texto}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ===== Chamada para colaborar ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="about__cta"
        >
          <div className="about__cta-text">
            <h3>Faça parte dessa transformação</h3>
            <p lang="pt-BR">
              Seja parceiro, voluntário, doador ou apoiador. Juntos, podemos
              construir uma cidade mais limpa, justa e sustentável.
            </p>
          </div>

          <div className="about__cta-buttons">
            {/* Rolagem suave até o formulário de contato (se o JS falhar,
                o href="#contato" continua funcionando normalmente) */}
            <a
              href="#contato"
              onClick={(e) => {
                if (document.getElementById("contato")) {
                  e.preventDefault();
                  smoothScrollTo("contato");
                }
              }}
              className="about__btn-primary"
            >
              Quero colaborar
            </a>
            <Link href="/quem-somos" className="about__btn-secondary">
              Conheça nossa história
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
