"use client";

/**
 * AboutSection — "Nossa História" (âncora #quem-somos da página inicial)
 * ------------------------------------------------------------
 * O que mostra:
 *  - Foto da equipe com um selo flutuante (fundação) e, ao lado, o texto
 *    de apresentação da ACMRB.
 *  - 3 cards de valores: Sustentabilidade, Inclusão Social e Impacto Local.
 *  - Faixa de chamada (CTA) com 2 botões.
 *
 * Dados: conteúdo fixo (não consulta o Supabase).
 * Links: "Quero colaborar" → #contato · "Conheça nossa história" → /quem-somos
 */

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Building2, CalendarDays, Leaf, Users2 } from "lucide-react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useAparecer } from "@/hooks/useAparecer";
import FaixaCta from "./FaixaCta";
import TituloSecao from "./TituloSecao";

/** Cards de valores: editar aqui para mudar textos/ícones. */
const valores = [
  {
    titulo: "Sustentabilidade",
    icone: Leaf,
    texto:
      "Reduzimos o impacto ambiental com coleta seletiva, reciclagem e educação da população sobre o descarte correto dos resíduos.",
  },
  {
    titulo: "Inclusão Social",
    icone: Users2,
    texto:
      "Geramos renda digna, valorizamos o trabalho dos catadores e promovemos capacitação, garantindo direitos e qualidade de vida.",
  },
  {
    titulo: "Impacto Local",
    icone: Building2,
    texto:
      "Atuamos em parceria com prefeituras, empresas e instituições para construir um modelo sustentável de gestão de resíduos na região.",
  },
];

export default function AboutSection() {
  const aparecer = useAparecer();

  return (
    <section id="quem-somos" className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="about-titulo">
      <Container>
        {/* ===== Foto + apresentação ===== */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div {...aparecer()} className="relative">
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-pop">
              <Image
                src="/images/acmrb-hero.jpg"
                alt="Catadoras e catadores da ACMRB uniformizados separando materiais recicláveis"
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
            {/* Selo flutuante sobre a foto */}
            <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-card-hover sm:left-auto sm:-right-4">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-mint text-leaf" aria-hidden="true">
                <CalendarDays size={20} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Fundada em</p>
                <p className="font-black text-brand">10 de julho de 2025</p>
              </div>
            </div>
          </motion.div>

          <motion.div {...aparecer(0.1)}>
            <TituloSecao
              id="about-titulo"
              etiqueta="Nossa História"
              alinhamento="esquerda"
              className="mb-0 max-w-none sm:mb-0"
              titulo={
                <>
                  Comprometidos com o meio ambiente, <span>as pessoas</span> e o futuro de Baturité
                </>
              }
              descricao="A ACMRB (Associação dos Catadores de Materiais Recicláveis de Baturité), conhecida como Reciclaê, nasceu da necessidade de organizar, valorizar e dar dignidade ao trabalho dos catadores, promovendo sustentabilidade, inclusão social e economia circular em nossa região."
            />
            <Button href="/quem-somos" variante="contorno" className="mt-7">
              Conheça nossa história
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </motion.div>
        </div>

        {/* ===== Cards de valores (entrada escalonada) ===== */}
        <div className="mt-16 grid gap-5 md:grid-cols-3 lg:mt-20">
          {valores.map((v, i) => {
            const Icone = v.icone;
            return (
              <motion.article
                key={v.titulo}
                {...aparecer(0.08 * i)}
                className="group rounded-card border border-black/5 bg-surface-alt p-6 transition duration-300 hover:-translate-y-1 hover:border-leaf-bright/30 hover:bg-white hover:shadow-card-hover sm:p-8"
              >
                <span
                  className="grid size-14 place-items-center rounded-2xl bg-brand text-white shadow-md transition group-hover:bg-leaf"
                  aria-hidden="true"
                >
                  <Icone size={26} />
                </span>
                <h3 className="mt-5 text-xl font-black text-ink">{v.titulo}</h3>
                <p lang="pt-BR" className="mt-3 leading-relaxed text-ink-soft">
                  {v.texto}
                </p>
              </motion.article>
            );
          })}
        </div>

        {/* ===== Chamada para colaborar ===== */}
        <motion.div {...aparecer(0.1)}>
          <FaixaCta
            titulo="Faça parte dessa transformação"
            texto="Seja parceiro, voluntário, doador ou apoiador. Juntos, podemos construir uma cidade mais limpa, justa e sustentável."
          >
            <Button href="#contato" variante="claro" tamanho="grande">
              Quero colaborar
            </Button>
            <Button href="/projetos" variante="contornoClaro" tamanho="grande">
              Ver projetos
            </Button>
          </FaixaCta>
        </motion.div>
      </Container>
    </section>
  );
}
