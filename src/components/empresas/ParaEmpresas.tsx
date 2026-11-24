"use client";

/**
 * ParaEmpresas — conteúdo da página /para-empresas
 * ------------------------------------------------------------
 * 1. Topo com chamada e botões (WhatsApp / e-mail)
 * 2. Como a empresa pode ajudar (3 cartões)
 * 3. Benefícios para a empresa
 * 4. Como funciona (passo a passo)
 * 5. Chamada final com os contatos
 * Animações: useAparecer (Framer Motion), que respeita "reduzir movimento".
 */

import { motion } from "framer-motion";
import {
  Award, BadgeCheck, CalendarCheck, Handshake, Leaf, Mail, MessageCircle, PackageOpen, Recycle, Truck,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import TituloSecao from "@/components/home/TituloSecao";
import { CONTATO, linkEmail, linkWhatsApp } from "@/constants/contato";
import { useAparecer } from "@/hooks/useAparecer";

const SECAO = "py-14 sm:py-20 lg:py-24";
const CARTAO = "flex h-full flex-col gap-3 rounded-card border border-black/5 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover";
const ICONE = "grid size-12 place-items-center rounded-2xl bg-brand-mint text-brand";

// mensagens prontas dos botões
const MSG_WHATS = "Olá! Sou de uma empresa e gostaria de ajudar a ACMRB (doar recicláveis / agendar coleta / ser parceira).";
const ASSUNTO_EMAIL = "Minha empresa quer ser parceira da ACMRB";

const AJUDAS = [
  { icone: PackageOpen, titulo: "Doar material reciclável", texto: "Papelão, plástico, metal e outros recicláveis da sua empresa viram renda para as catadoras e catadores da associação." },
  { icone: CalendarCheck, titulo: "Agendar coleta", texto: "Combinamos dia e horário para buscar o material na sua empresa, de forma organizada e sem custo." },
  { icone: Handshake, titulo: "Virar parceira", texto: "Parcerias de logística reversa, apoio em campanhas e divulgação do trabalho da associação." },
];

const BENEFICIOS = [
  { icone: Award, titulo: "Selo de parceiro", texto: "Em breve: selo digital de empresa parceira da ACMRB para usar no seu site e redes.", breve: true },
  { icone: BadgeCheck, titulo: "Destaque em Parceiros", texto: "Sua empresa aparece na página de parceiros e no mapa de apoiadores do site." },
  { icone: Leaf, titulo: "Responsabilidade ambiental", texto: "Destinação correta dos resíduos e apoio à inclusão social de quem vive da reciclagem." },
  { icone: Truck, titulo: "Logística reversa", texto: "Registro público do material repassado para reciclagem, útil para relatórios ambientais (ESG)." },
];

const PASSOS = [
  { titulo: "Fale com a gente", texto: "Chame no WhatsApp ou mande um e-mail contando o tipo e a quantidade aproximada de material." },
  { titulo: "Combinamos a coleta", texto: "A equipe define com você o melhor dia, horário e forma de separar o material." },
  { titulo: "Coletamos e registramos", texto: "Buscamos os recicláveis e o repasse entra na transparência da associação." },
  { titulo: "Parceria divulgada", texto: "Com sua autorização, sua empresa aparece como parceira no site da ACMRB." },
];

function Botoes({ claro = false }: { claro?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button href={linkWhatsApp(MSG_WHATS)} target="_blank" variante="destaque" tamanho="grande" className="w-full sm:w-auto">
        <MessageCircle size={20} aria-hidden="true" /> Chamar no WhatsApp
      </Button>
      <Button href={linkEmail(ASSUNTO_EMAIL)} variante={claro ? "contornoClaro" : "secundario"} tamanho="grande" className="w-full sm:w-auto">
        <Mail size={20} aria-hidden="true" /> Enviar e-mail
      </Button>
    </div>
  );
}

export default function ParaEmpresas() {
  const aparecer = useAparecer();

  return (
    <main id="conteudo" className="overflow-x-clip">
      {/* ===== 1. Topo ===== */}
      <section className="bg-linear-to-br from-brand-dark via-brand to-emerald-700 pt-28 pb-16 text-white sm:pt-32 sm:pb-20">
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <motion.div {...aparecer()} className="flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <Recycle size={14} aria-hidden="true" /> Para empresas
            </span>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-balance sm:text-5xl">
              Sua empresa pode transformar resíduo em renda e cuidado com Baturité
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-emerald-50/90 sm:text-lg">
              Doe seus recicláveis, agende uma coleta ou seja parceira da ACMRB (Reciclaê). É simples, sem custo e ajuda catadoras e catadores da cidade.
            </p>
            <Botoes claro />
          </motion.div>
          <motion.ul {...aparecer(0.15)} className="grid grid-cols-2 gap-3" aria-label="Resumo">
            {[["Coleta", "sem custo"], ["Material", "com destino certo"], ["Parceria", "divulgada no site"], ["Impacto", "social e ambiental"]].map(([a, b]) => (
              <li key={a} className="rounded-card bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                <p className="text-lg font-black">{a}</p>
                <p className="text-sm text-emerald-50/80">{b}</p>
              </li>
            ))}
          </motion.ul>
        </Container>
      </section>

      {/* ===== 2. Como ajudar ===== */}
      <section className={SECAO} aria-labelledby="pe-ajudar">
        <Container>
          <motion.div {...aparecer()}>
            <TituloSecao id="pe-ajudar" etiqueta="Como ajudar" titulo="Três jeitos de a sua empresa participar" />
          </motion.div>
          <ul className="grid gap-5 md:grid-cols-3">
            {AJUDAS.map((a, i) => (
              <motion.li key={a.titulo} {...aparecer(i * 0.1)}>
                <div className={CARTAO}>
                  <span className={ICONE}><a.icone size={24} aria-hidden="true" /></span>
                  <h3 className="text-lg font-extrabold text-ink">{a.titulo}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{a.texto}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ===== 3. Benefícios ===== */}
      <section className={`${SECAO} bg-surface-alt`} aria-labelledby="pe-beneficios">
        <Container>
          <motion.div {...aparecer()}>
            <TituloSecao id="pe-beneficios" etiqueta="Benefícios" titulo="O que a sua empresa ganha" />
          </motion.div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFICIOS.map((b, i) => (
              <motion.li key={b.titulo} {...aparecer(i * 0.08)}>
                <div className={CARTAO}>
                  <span className={ICONE}><b.icone size={24} aria-hidden="true" /></span>
                  <h3 className="flex flex-wrap items-center gap-2 text-base font-extrabold text-ink">
                    {b.titulo}
                    {b.breve && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">em breve</span>}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{b.texto}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ===== 4. Como funciona ===== */}
      <section className={SECAO} aria-labelledby="pe-passos">
        <Container>
          <motion.div {...aparecer()}>
            <TituloSecao id="pe-passos" etiqueta="Como funciona" titulo="Do primeiro contato à coleta" />
          </motion.div>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PASSOS.map((p, i) => (
              <motion.li key={p.titulo} {...aparecer(i * 0.1)} className="relative rounded-card border border-black/5 bg-white p-6 shadow-card">
                <span className="mb-3 grid size-10 place-items-center rounded-full bg-brand text-lg font-black text-white" aria-hidden="true">{i + 1}</span>
                <h3 className="text-base font-extrabold text-ink">{p.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{p.texto}</p>
              </motion.li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ===== 5. Chamada final ===== */}
      <section className="pb-16 sm:pb-24" aria-labelledby="pe-contato">
        <Container>
          <motion.div {...aparecer()} className="flex flex-col gap-6 rounded-card bg-brand-dark p-6 text-white shadow-pop sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 id="pe-contato" className="text-2xl font-black sm:text-3xl">Vamos conversar?</h2>
              <p className="mt-2 text-emerald-50/85">
                WhatsApp {CONTATO.whatsappExibicao} · <span className="break-all">{CONTATO.email}</span>
              </p>
            </div>
            <Botoes claro />
          </motion.div>
        </Container>
      </section>
    </main>
  );
}
