"use client";

/**
 * OperationsSection — "Operação Integrada" (página inicial)
 * ------------------------------------------------------------
 * O que mostra:
 *  1. Cabeçalho com título e texto de apresentação.
 *  2. Públicos atendidos (Empresas, Comunidade, Poder Público, Escolas),
 *     cada um com uma lista curta de benefícios.
 *  3. Fluxo de trabalho em 4 etapas (linha do tempo numerada).
 *  4. Compromissos da associação, em um painel verde escuro.
 *  5. Faixa de chamada (CTA) para parceria → #contato e /transparencia.
 *
 * Dados: conteúdo fixo (não consulta o Supabase). Não há números
 * inventados aqui: os indicadores reais ficam na seção de transparência.
 *
 * Responsivo: 1 coluna no celular, 2 no tablet e 4 no desktop.
 * As animações respeitam "reduzir movimento" (hook useAparecer).
 */

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ClipboardCheck,
  Eye,
  Factory,
  FileBarChart,
  GraduationCap,
  HandHeart,
  Recycle,
  Route,
  Scale,
  Users,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useAparecer } from "@/hooks/useAparecer";
import FaixaCta from "./FaixaCta";
import TituloSecao from "./TituloSecao";

/** Públicos atendidos: editar aqui para mudar textos/benefícios. */
const publicos = [
  {
    titulo: "Empresas",
    icone: Factory,
    texto:
      "Destinação adequada de resíduos recicláveis e apoio ao cumprimento de obrigações ambientais.",
    beneficios: [
      "Logística reversa de embalagens",
      "Comprovação de destinação",
      "Apoio a metas ESG",
    ],
  },
  {
    titulo: "Comunidade",
    icone: Users,
    texto:
      "Participação ativa na separação dos resíduos e fortalecimento da reciclagem no município.",
    beneficios: [
      "Orientação sobre descarte correto",
      "Cidade mais limpa",
      "Geração de renda local",
    ],
  },
  {
    titulo: "Poder Público",
    icone: Building2,
    texto:
      "Parceria na gestão dos resíduos sólidos urbanos, em sintonia com a Política Nacional de Resíduos Sólidos.",
    beneficios: [
      "Apoio à coleta seletiva municipal",
      "Inclusão dos catadores",
      "Dados para prestação de contas",
    ],
  },
  {
    titulo: "Escolas",
    icone: GraduationCap,
    texto:
      "Ações de educação ambiental que aproximam estudantes do ciclo da reciclagem.",
    beneficios: [
      "Palestras e visitas orientadas",
      "Campanhas de arrecadação",
      "Projetos pedagógicos",
    ],
  },
];

/** Etapas do fluxo de trabalho (linha do tempo). */
const etapas = [
  {
    numero: "01",
    titulo: "Diagnóstico",
    icone: ClipboardCheck,
    texto:
      "Levantamos os pontos de geração, os tipos e o volume de resíduos para definir a rotina de coleta mais adequada a cada parceiro.",
  },
  {
    numero: "02",
    titulo: "Coleta Seletiva",
    icone: Route,
    texto:
      "Organizamos o recebimento dos materiais com registro de cada entrega, garantindo regularidade e acompanhamento operacional.",
  },
  {
    numero: "03",
    titulo: "Triagem e Valorização",
    icone: Scale,
    texto:
      "Os materiais são separados por tipo, pesados e preparados para comercialização, com destino ambientalmente correto.",
  },
  {
    numero: "04",
    titulo: "Relatório de Impacto",
    icone: FileBarChart,
    texto:
      "Consolidamos os dados em indicadores públicos que apoiam a transparência, as parcerias e a prestação de contas.",
  },
];

/** Compromissos da associação. */
const compromissos = [
  {
    titulo: "Transparência",
    icone: Eye,
    texto: "Indicadores e informações institucionais disponíveis ao público.",
  },
  {
    titulo: "Rastreabilidade",
    icone: BadgeCheck,
    texto: "Registro das entradas de materiais do recebimento à destinação.",
  },
  {
    titulo: "Trabalho digno",
    icone: HandHeart,
    texto: "Valorização, segurança e renda justa para os catadores associados.",
  },
  {
    titulo: "Destinação correta",
    icone: Recycle,
    texto: "Materiais encaminhados à reciclagem, longe de lixões e do meio ambiente.",
  },
];

export default function OperationsSection() {
  const aparecer = useAparecer();

  return (
    <section id="operacao" className="bg-surface-alt py-16 sm:py-20 lg:py-24" aria-labelledby="operations-title">
      <Container>
        {/* ===== 1. Cabeçalho ===== */}
        <motion.div {...aparecer()}>
          <TituloSecao
            id="operations-title"
            etiqueta="Operação Integrada"
            titulo={
              <>
                Do resíduo ao indicador: <span>uma operação transparente</span> do início ao fim
              </>
            }
            descricao="A ACMRB integra coleta seletiva, triagem, controle de materiais e valorização do trabalho dos catadores em um processo organizado e fácil de acompanhar. Cada etapa gera informação que fortalece parcerias e a prestação de contas à sociedade."
          />
        </motion.div>

        {/* ===== 2. Públicos atendidos ===== */}
        <h3 className="mb-6 text-xl font-black text-ink sm:text-2xl">Para quem trabalhamos</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {publicos.map((p, i) => {
            const Icone = p.icone;
            return (
              <motion.article
                key={p.titulo}
                {...aparecer(0.08 * i)}
                className="flex flex-col rounded-card border border-black/5 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-leaf" aria-hidden="true">
                  <Icone size={24} />
                </span>
                <h4 className="mt-4 text-lg font-black text-ink">{p.titulo}</h4>
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

        {/* ===== 3. Linha do tempo das etapas ===== */}
        <h3 className="mb-8 mt-16 text-xl font-black text-ink sm:text-2xl">Como funciona</h3>
        <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* linha que liga as etapas (só no desktop) */}
          <span aria-hidden="true" className="absolute left-[12%] right-[12%] top-8 hidden h-0.5 bg-linear-to-r from-leaf-bright/20 via-leaf-bright to-leaf-bright/20 lg:block" />
          {etapas.map((e, i) => {
            const Icone = e.icone;
            return (
              <motion.li key={e.numero} {...aparecer(0.1 * i)} className="relative text-center sm:text-left lg:text-center">
                <span className="relative mx-auto grid size-16 place-items-center rounded-full border-4 border-surface-alt bg-brand text-white shadow-lg sm:mx-0 lg:mx-auto" aria-hidden="true">
                  <Icone size={26} />
                  <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-sun text-[11px] font-black text-ink">
                    {e.numero}
                  </span>
                </span>
                <h4 className="mt-4 text-lg font-black text-ink">{e.titulo}</h4>
                <p lang="pt-BR" className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {e.texto}
                </p>
              </motion.li>
            );
          })}
        </ol>

        {/* ===== 4. Compromissos ===== */}
        <motion.div {...aparecer()} className="mt-16 rounded-3xl bg-emerald-950 p-6 sm:p-10">
          <h3 className="text-xl font-black text-white sm:text-2xl">Nossos compromissos</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {compromissos.map((c) => {
              const Icone = c.icone;
              return (
                <div key={c.titulo} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300" aria-hidden="true">
                    <Icone size={22} />
                  </span>
                  <div>
                    <h4 className="font-black text-white">{c.titulo}</h4>
                    <p lang="pt-BR" className="mt-1 text-sm leading-relaxed text-emerald-100/80">
                      {c.texto}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ===== 5. Chamada para parceria ===== */}
        <motion.div {...aparecer(0.1)}>
          <FaixaCta
            titulo="Quer levar a coleta seletiva para sua organização?"
            texto="Fale com a ACMRB e construa uma parceria sob medida para a realidade da sua empresa, escola ou instituição."
          >
            <Button href="#contato" variante="claro" tamanho="grande">
              Seja parceiro
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
