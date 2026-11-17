"use client";

/**
 * ReverseLogisticsSection — "Logística Reversa" (página inicial)
 * ------------------------------------------------------------
 * O que mostra:
 *  1. Cabeçalho com texto e uma foto do centro de reciclagem.
 *  2. Com quem fazemos parceria (indústrias, operadores, empresas, poder
 *     público), cada um com uma lista curta de benefícios.
 *  3. Passo a passo em 5 etapas (linha do tempo vertical) ao lado do
 *     que a parceria entrega.
 *  4. Faixa de chamada (CTA) para solicitar parceria.
 *
 * Dados: conteúdo fixo (não consulta o Supabase).
 * Responsivo: 1 coluna no celular, 2 no tablet e passo a passo + entregas
 * lado a lado no desktop.
 */

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ClipboardList,
  Factory,
  FileCheck2,
  FileText,
  HandHeart,
  PackageCheck,
  Recycle,
  Scale,
  ScanSearch,
  Store,
  Truck,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useAparecer } from "@/hooks/useAparecer";
import FaixaCta from "./FaixaCta";
import TituloSecao from "./TituloSecao";

/** Parceiros: editar aqui para mudar textos/benefícios. */
const parceiros = [
  {
    titulo: "Indústrias",
    icone: Factory,
    texto:
      "Recebem material reciclável já identificado e classificado, pronto para retornar ao ciclo produtivo.",
    beneficios: [
      "Matéria-prima separada por tipo",
      "Origem do material registrada",
      "Fornecimento organizado",
    ],
  },
  {
    titulo: "Operadores de logística reversa",
    icone: Truck,
    texto:
      "Contam com a associação como ponto de recebimento, triagem e repasse dos resíduos recicláveis.",
    beneficios: [
      "Triagem feita por catadores",
      "Pesagem e registro das cargas",
      "Apoio à comprovação de metas",
    ],
  },
  {
    titulo: "Empresas e comércio",
    icone: Store,
    texto:
      "Destinam corretamente embalagens e resíduos recicláveis gerados na sua operação.",
    beneficios: [
      "Coleta ou entrega programada",
      "Comprovação de destinação",
      "Apoio a metas ESG",
    ],
  },
  {
    titulo: "Instituições e poder público",
    icone: Building2,
    texto:
      "Fortalecem a coleta seletiva e a inclusão dos catadores na gestão dos resíduos sólidos.",
    beneficios: [
      "Sintonia com a PNRS",
      "Inclusão socioprodutiva",
      "Dados para prestação de contas",
    ],
  },
];

/** Etapas do fluxo da parceria (linha do tempo). */
const etapas = [
  {
    numero: "01",
    titulo: "Recebimento e coleta",
    icone: PackageCheck,
    texto:
      "O material chega à associação por entrega do parceiro ou por coleta combinada, conforme a rotina acordada.",
  },
  {
    numero: "02",
    titulo: "Identificação e triagem",
    icone: ScanSearch,
    texto:
      "Os catadores reconhecem e separam os recicláveis por tipo, retirando rejeitos e contaminações.",
  },
  {
    numero: "03",
    titulo: "Pesagem e registro",
    icone: Scale,
    texto:
      "Cada lote é pesado e registrado no sistema da ACMRB, garantindo o controle do que entrou e do que saiu.",
  },
  {
    numero: "04",
    titulo: "Repasse e destinação",
    icone: Recycle,
    texto:
      "Os materiais classificados são repassados à indústria recicladora ou à destinação ambientalmente adequada.",
  },
  {
    numero: "05",
    titulo: "Comprovação e relatório",
    icone: FileCheck2,
    texto:
      "Os registros viram informação para o parceiro comprovar a destinação e acompanhar os resultados.",
  },
];

/** O que a parceria entrega. */
const entregas = [
  {
    titulo: "Rastreabilidade",
    icone: BadgeCheck,
    texto: "Registro de cada lote, do recebimento ao repasse do material.",
  },
  {
    titulo: "Documentação ESG e PNRS",
    icone: FileText,
    texto:
      "Informações que apoiam metas ESG e a Política Nacional de Resíduos Sólidos (Lei 12.305/2010).",
  },
  {
    titulo: "Impacto social",
    icone: HandHeart,
    texto: "Geração de trabalho e renda para os catadores associados.",
  },
  {
    titulo: "Destinação correta",
    icone: ClipboardList,
    texto: "Recicláveis de volta à cadeia produtiva, longe de lixões e do meio ambiente.",
  },
];

export default function ReverseLogisticsSection() {
  const aparecer = useAparecer();

  return (
    <section id="logistica-reversa" className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="revlog-title">
      <Container>
        {/* ===== 1. Cabeçalho com foto ===== */}
        <div className="mb-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div {...aparecer()}>
            <TituloSecao
              id="revlog-title"
              etiqueta="Logística Reversa"
              alinhamento="esquerda"
              className="mb-0 max-w-none sm:mb-0"
              titulo={
                <>
                  O elo entre quem gera o resíduo e <span>quem o transforma em matéria-prima</span>
                </>
              }
              descricao="A ACMRB atua em parceria com indústrias e empresas de logística reversa: recebemos e recolhemos os materiais, identificamos e classificamos cada tipo de reciclável e fazemos o repasse correto para a destinação adequada, com registro, rastreabilidade e comprovação para todos os envolvidos."
            />
          </motion.div>
          <motion.div {...aparecer(0.1)} className="relative aspect-16/10 overflow-hidden rounded-3xl shadow-pop">
            <Image
              src="/images/reciclagem.jpg"
              alt="Centro de reciclagem da ACMRB com equipe, contêineres de papel e plástico e empilhadeira"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* ===== 2. Parceiros ===== */}
        <h3 className="mb-6 text-xl font-black text-ink sm:text-2xl">Com quem fazemos parceria</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {parceiros.map((p, i) => {
            const Icone = p.icone;
            return (
              <motion.article
                key={p.titulo}
                {...aparecer(0.08 * i)}
                className="flex flex-col rounded-card border border-black/5 border-t-4 border-t-leaf-bright bg-surface-alt p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card-hover"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-white text-leaf shadow-card" aria-hidden="true">
                  <Icone size={24} />
                </span>
                <h4 className="mt-4 text-lg font-black leading-snug text-ink">{p.titulo}</h4>
                <p lang="pt-BR" className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {p.texto}
                </p>
                <ul className="mt-4 space-y-2 border-t border-line pt-4">
                  {p.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm font-medium text-ink">
                      <Check size={16} className="mt-0.5 shrink-0 text-leaf-bright" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>

        {/* ===== 3. Passo a passo + entregas ===== */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <h3 className="mb-8 text-xl font-black text-ink sm:text-2xl">Como funciona, passo a passo</h3>
            <ol className="relative space-y-8 border-l-2 border-leaf-bright/30 pl-8 sm:pl-10">
              {etapas.map((e, i) => {
                const Icone = e.icone;
                return (
                  <motion.li key={e.numero} {...aparecer(0.08 * i)} className="relative">
                    {/* bolinha numerada sobre a linha */}
                    <span className="absolute -left-13.25 top-0 grid size-10 place-items-center rounded-full border-4 border-white bg-brand text-sm font-black text-white shadow-md sm:-left-15.25" aria-hidden="true">
                      {e.numero}
                    </span>
                    <div className="flex items-center gap-2">
                      <Icone size={20} className="text-leaf" aria-hidden="true" />
                      <h4 className="text-lg font-black text-ink">{e.titulo}</h4>
                    </div>
                    <p lang="pt-BR" className="mt-1.5 leading-relaxed text-ink-soft">
                      {e.texto}
                    </p>
                  </motion.li>
                );
              })}
            </ol>
          </div>

          <div>
            <h3 className="mb-8 text-xl font-black text-ink sm:text-2xl">O que a parceria entrega</h3>
            <div className="space-y-4">
              {entregas.map((c, i) => {
                const Icone = c.icone;
                return (
                  <motion.div
                    key={c.titulo}
                    {...aparecer(0.08 * i)}
                    className="flex gap-4 rounded-card bg-brand-soft p-5"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-white" aria-hidden="true">
                      <Icone size={20} />
                    </span>
                    <div>
                      <h4 className="font-black text-ink">{c.titulo}</h4>
                      <p lang="pt-BR" className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {c.texto}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== 4. Chamada para parceria ===== */}
        <motion.div {...aparecer(0.1)}>
          <FaixaCta
            titulo="Sua empresa precisa destinar recicláveis corretamente?"
            texto="Converse com a ACMRB e estruture uma parceria de logística reversa com recebimento, triagem, repasse e comprovação dos materiais."
          >
            <Button href="/#contato" variante="claro" tamanho="grande">
              Solicitar parceria
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <Button href="/transparencia" variante="contornoClaro" tamanho="grande">
              Ver transparência
            </Button>
          </FaixaCta>
        </motion.div>
      </Container>
    </section>
  );
}
