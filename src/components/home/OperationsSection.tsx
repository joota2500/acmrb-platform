"use client";

/**
 * OperationsSection — "Operação Integrada" (página inicial)
 * ------------------------------------------------------------
 * O que mostra:
 *  1. Cabeçalho: selo, título e texto de apresentação.
 *  2. Públicos atendidos (Empresas, Comunidade, Poder Público, Escolas),
 *     cada um com uma lista curta de benefícios.
 *  3. Fluxo de trabalho em 4 etapas (linha do tempo com ícones e
 *     conectores entre as etapas).
 *  4. Compromissos da associação (transparência, rastreabilidade,
 *     trabalho digno, destinação correta).
 *  5. Chamada (CTA) para parceria → #contato e /transparencia.
 *
 * Dados: conteúdo fixo (não consulta o Supabase). Não há números
 * inventados aqui — indicadores reais ficam na seção ESGMetrics.
 *
 * Responsividade (estilos em src/styles/operations-section.css):
 *  - Celular (≤480px): fontes menores, espaçamento compacto, 1 coluna;
 *    a linha do tempo fica vertical com conector à esquerda.
 *  - Tablet (481–1024px): públicos, etapas e compromissos em 2 colunas.
 *  - Desktop (>1024px): públicos e compromissos em 4 colunas; etapas em
 *    linha horizontal com conectores entre os ícones.
 *  - Parágrafos justificados (com hifenização, lang="pt-BR"); títulos não.
 *
 * Animações: Framer Motion leve; desligadas quando o usuário ativa
 * "reduzir movimento" no sistema (useReducedMotion).
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
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

import { smoothScrollTo } from "@/lib/scroll";

import "@/styles/operations-section.css";

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
  // Se o usuário pediu "reduzir movimento", as animações viram estáticas.
  const reduzir = useReducedMotion();

  /** Animação padrão de entrada (sobe e aparece), com atraso opcional. */
  const entrada = (atraso = 0) =>
    reduzir
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay: atraso },
        };

  return (
    <section id="operacao" className="operations" aria-labelledby="operations-title">
      <div className="operations__container">
        {/* ===== 1. Cabeçalho ===== */}
        <motion.header {...entrada()} className="operations__header">
          <span className="operations__tag">Operação Integrada</span>
          <h2 id="operations-title" className="operations__title">
            Do resíduo ao indicador: <span>uma operação transparente</span> do
            início ao fim
          </h2>
          <p className="operations__description" lang="pt-BR">
            A ACMRB integra coleta seletiva, triagem, controle de materiais e
            valorização do trabalho dos catadores em um processo organizado e
            fácil de acompanhar. Cada etapa gera informação que fortalece
            parcerias e a prestação de contas à sociedade.
          </p>
        </motion.header>

        {/* ===== 2. Públicos atendidos ===== */}
        <h3 className="operations__subtitle">Para quem trabalhamos</h3>
        <div className="operations__audiences">
          {publicos.map((p, i) => {
            const Icone = p.icone;
            return (
              <motion.article key={p.titulo} {...entrada(0.08 * i)} className="operations__audience">
                <div className="operations__audience-head">
                  <div className="operations__icon" aria-hidden="true">
                    <Icone size={22} />
                  </div>
                  <h4>{p.titulo}</h4>
                </div>
                <p lang="pt-BR">{p.texto}</p>
                <ul>
                  {p.beneficios.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>

        {/* ===== 3. Linha do tempo das etapas ===== */}
        <h3 className="operations__subtitle">Como funciona</h3>
        <ol className="operations__timeline">
          {etapas.map((e, i) => {
            const Icone = e.icone;
            return (
              <motion.li key={e.numero} {...entrada(0.1 * i)} className="operations__step">
                {/* Marcador: ícone + número; o conector é desenhado no CSS */}
                <div className="operations__step-marker" aria-hidden="true">
                  <Icone size={24} />
                  <span>{e.numero}</span>
                </div>
                <div className="operations__step-body">
                  <h4>{e.titulo}</h4>
                  <p lang="pt-BR">{e.texto}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>

        {/* ===== 4. Compromissos ===== */}
        <h3 className="operations__subtitle">Nossos compromissos</h3>
        <div className="operations__commitments">
          {compromissos.map((c, i) => {
            const Icone = c.icone;
            return (
              <motion.div key={c.titulo} {...entrada(0.08 * i)} className="operations__commitment">
                <Icone size={20} aria-hidden="true" />
                <div>
                  <h4>{c.titulo}</h4>
                  <p lang="pt-BR">{c.texto}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ===== 5. Chamada para parceria ===== */}
        <motion.div {...entrada(0.1)} className="operations__cta">
          <div className="operations__cta-text">
            <h3>Quer levar a coleta seletiva para sua organização?</h3>
            <p lang="pt-BR">
              Fale com a ACMRB e construa uma parceria sob medida para a
              realidade da sua empresa, escola ou instituição.
            </p>
          </div>
          <div className="operations__cta-buttons">
            {/* Rolagem suave até o formulário de contato (href funciona sem JS) */}
            <a
              href="#contato"
              onClick={(ev) => {
                if (document.getElementById("contato")) {
                  ev.preventDefault();
                  smoothScrollTo("contato");
                }
              }}
              className="operations__btn-primary"
            >
              Seja parceiro
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <Link href="/transparencia" className="operations__btn-secondary">
              Ver transparência
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
