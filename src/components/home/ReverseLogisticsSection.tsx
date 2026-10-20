"use client";

/**
 * ReverseLogisticsSection — "Logística Reversa" (página inicial)
 * ------------------------------------------------------------
 * Contexto: a ACMRB faz parcerias com indústrias e empresas que operam
 * a logística reversa. A associação recebe/recolhe o material, identifica
 * e classifica os recicláveis e repassa corretamente para a destinação
 * adequada, com registro e comprovação.
 *
 * O que mostra:
 *  1. Cabeçalho: selo, título (parte em verde) e apresentação.
 *  2. Parceiros (Indústrias, Operadores de logística reversa, Empresas e
 *     comércio, Instituições e poder público) com benefícios curtos.
 *  3. Fluxo da parceria em 5 etapas (linha do tempo).
 *  4. O que a parceria entrega (rastreabilidade, documentação ESG/PNRS,
 *     impacto social, destinação correta).
 *  5. CTA "Solicitar parceria" → #contato e link para /transparencia.
 *
 * Dados: conteúdo fixo, sem números ou nomes de empresas inventados.
 * Classes com prefixo "revlog__" para não conflitar com outras seções.
 *
 * Responsividade (src/styles/reverse-logistics.css):
 *  - Celular (≤480px): 1 coluna, fontes menores, linha do tempo vertical.
 *  - Tablet (481–1024px): 2 colunas.
 *  - Desktop (>1024px): 4 colunas; etapas em linha com 5 colunas.
 * Animações: Framer Motion leve, desligadas com "reduzir movimento".
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
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

import { smoothScrollTo } from "@/lib/scroll";

import "@/styles/reverse-logistics.css";

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
    <section
      id="logistica-reversa"
      className="revlog"
      aria-labelledby="revlog-title"
    >
      <div className="revlog__container">
        {/* ===== 1. Cabeçalho ===== */}
        <motion.header {...entrada()} className="revlog__header">
          <span className="revlog__tag">Logística Reversa</span>
          <h2 id="revlog-title" className="revlog__title">
            O elo entre quem gera o resíduo e{" "}
            <span>quem o transforma em matéria-prima</span>
          </h2>
          <p className="revlog__description" lang="pt-BR">
            A ACMRB atua em parceria com indústrias e empresas de logística
            reversa: recebemos e recolhemos os materiais, identificamos e
            classificamos cada tipo de reciclável e fazemos o repasse correto
            para a destinação adequada, com registro, rastreabilidade e
            comprovação para todos os envolvidos.
          </p>
        </motion.header>

        {/* ===== 2. Parceiros ===== */}
        <h3 className="revlog__subtitle">Com quem fazemos parceria</h3>
        <div className="revlog__partners">
          {parceiros.map((p, i) => {
            const Icone = p.icone;
            return (
              <motion.article key={p.titulo} {...entrada(0.08 * i)} className="revlog__partner">
                <div className="revlog__partner-head">
                  <div className="revlog__icon" aria-hidden="true">
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

        {/* ===== 3. Fluxo da parceria ===== */}
        <h3 className="revlog__subtitle">Como funciona a parceria</h3>
        <ol className="revlog__timeline">
          {etapas.map((e, i) => {
            const Icone = e.icone;
            return (
              <motion.li key={e.numero} {...entrada(0.1 * i)} className="revlog__step">
                <div className="revlog__step-marker" aria-hidden="true">
                  <Icone size={24} />
                  <span>{e.numero}</span>
                </div>
                <div className="revlog__step-body">
                  <h4>{e.titulo}</h4>
                  <p lang="pt-BR">{e.texto}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>

        {/* ===== 4. Entregas ===== */}
        <h3 className="revlog__subtitle">O que a parceria entrega</h3>
        <div className="revlog__deliverables">
          {entregas.map((c, i) => {
            const Icone = c.icone;
            return (
              <motion.div key={c.titulo} {...entrada(0.08 * i)} className="revlog__deliverable">
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
        <motion.div {...entrada(0.1)} className="revlog__cta">
          <div className="revlog__cta-text">
            <h3>Sua empresa precisa destinar recicláveis corretamente?</h3>
            <p lang="pt-BR">
              Converse com a ACMRB e estruture uma parceria de logística reversa
              com recebimento, triagem, repasse e comprovação dos materiais.
            </p>
          </div>
          <div className="revlog__cta-buttons">
            {/* Rolagem suave até o contato (href funciona sem JS) */}
            <a
              href="/#contato"
              onClick={(ev) => {
                if (document.getElementById("contato")) {
                  ev.preventDefault();
                  smoothScrollTo("contato");
                }
              }}
              className="revlog__btn-primary"
            >
              Solicitar parceria
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <Link href="/transparencia" className="revlog__btn-secondary">
              Ver transparência
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
