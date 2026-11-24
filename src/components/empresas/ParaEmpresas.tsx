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

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Award, BadgeCheck, Briefcase, CalendarCheck, CalendarDays, Handshake, Leaf, Mail, MapPin, MessageCircle, PackageOpen, Recycle, ShieldCheck, Truck,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import TituloSecao from "@/components/home/TituloSecao";
import { CONTATO, linkEmail, linkWhatsApp } from "@/constants/contato";
import { useAparecer } from "@/hooks/useAparecer";

const SECAO = "py-14 sm:py-20 lg:py-24";

// mensagens prontas dos botões
const MSG_WHATS = "Olá! Sou de uma empresa e gostaria de ajudar a ACMRB (doar recicláveis / agendar coleta / ser parceira).";
const ASSUNTO_EMAIL = "Minha empresa quer ser parceira da ACMRB";

const AJUDAS = [
  { icone: PackageOpen, titulo: "Doar material reciclável", texto: "Papelão, plástico, metal e outros recicláveis da sua empresa viram renda para as catadoras e catadores da associação." },
  { icone: CalendarCheck, titulo: "Agendar coleta", texto: "Combinamos dia e horário para buscar o material na sua empresa, de forma organizada e sem custo." },
  { icone: Handshake, titulo: "Virar parceira", texto: "Parcerias de logística reversa, apoio em campanhas e divulgação do trabalho da associação." },
];

const BENEFICIOS = [
  { icone: Award, titulo: "Selo de parceiro", texto: "Selo digital de empresa parceira da ACMRB para usar no seu site e nas redes sociais." },
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
      <Button href={linkWhatsApp(MSG_WHATS)} target="_blank" variante="destaque" tamanho="grande" className="w-full shadow-pop sm:w-auto">
        <MessageCircle size={20} aria-hidden="true" /> Chamar no WhatsApp
      </Button>
      <Button href={linkEmail(ASSUNTO_EMAIL)} variante={claro ? "contornoClaro" : "secundario"} tamanho="grande" className="w-full sm:w-auto">
        <Mail size={20} aria-hidden="true" /> Enviar e-mail
      </Button>
    </div>
  );
}

// selos do topo: só dados que já estão no projeto (constants/contato.ts)
const SELOS = [
  { icone: MapPin, texto: "Baturité – CE" },
  { icone: CalendarDays, texto: `Fundada em ${CONTATO.fundacao}` },
  { icone: ShieldCheck, texto: `CNPJ ${CONTATO.cnpj}` },
  { icone: Truck, texto: "Coleta sem custo" },
];

// cor de cada cartão de "como ajudar" (círculo do ícone + faixa de cima)
const CORES = [
  { circulo: "bg-emerald-100 text-emerald-700", faixa: "from-emerald-400 to-emerald-600" },
  { circulo: "bg-amber-100 text-amber-700", faixa: "from-amber-300 to-amber-500" },
  { circulo: "bg-sky-100 text-sky-700", faixa: "from-sky-400 to-sky-600" },
];

export default function ParaEmpresas() {
  const aparecer = useAparecer();

  return (
    <main id="conteudo" className="overflow-x-clip">
      {/* ===== 1. Topo: degradê verde + foto ===== */}
      <section className="relative overflow-hidden bg-linear-to-br from-brand-dark via-brand to-emerald-700 pt-28 pb-16 text-white sm:pt-32 sm:pb-24">
        {/* bolhas de luz no fundo (só enfeite) */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-emerald-300/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-amber-300/10 blur-3xl" aria-hidden="true" />

        <Container className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <motion.div {...aparecer()} className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider ring-1 ring-white/20">
              <Briefcase size={14} aria-hidden="true" /> Para empresas
            </span>
            <h1 className="text-[2rem] font-black leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
              Sua empresa transforma resíduo em <span className="text-amber-300">renda</span> e cuidado com Baturité
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-emerald-50/90 sm:text-lg">
              Doe seus recicláveis, agende uma coleta ou seja parceira da ACMRB (Reciclaê). É simples, sem custo e ajuda as catadoras e catadores da cidade.
            </p>
            <Botoes claro />
            <ul className="flex flex-wrap gap-2" aria-label="Sobre a ACMRB">
              {SELOS.map((x) => (
                <li key={x.texto} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50 ring-1 ring-white/15">
                  <x.icone size={14} aria-hidden="true" /> {x.texto}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...aparecer(0.15)} className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_rgb(0_0_0/0.35)] ring-4 ring-white/15">
              <Image src="/images/reciclagem.jpg" alt="Material reciclável separado pela associação" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" priority />
              <div className="absolute inset-0 bg-linear-to-t from-brand-dark/60 via-transparent to-transparent" aria-hidden="true" />
            </div>
            {/* cartão flutuante em cima da foto */}
            <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 text-ink shadow-pop sm:left-6">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-mint text-brand"><Recycle size={22} aria-hidden="true" /></span>
              <span className="leading-tight">
                <b className="block text-sm font-extrabold">Logística reversa</b>
                <span className="text-xs text-ink-muted">com registro público</span>
              </span>
            </div>
          </motion.div>
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
                <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-card border border-black/5 bg-white p-6 pt-7 shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-card-hover sm:p-7 sm:pt-8 motion-reduce:hover:translate-y-0">
                  <span className={`absolute inset-x-0 top-0 h-1.5 bg-linear-to-r ${CORES[i].faixa}`} aria-hidden="true" />
                  <span className={`grid size-14 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 ${CORES[i].circulo}`}>
                    <a.icone size={26} aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-extrabold text-ink">{a.titulo}</h3>
                  <p className="leading-relaxed text-ink-soft">{a.texto}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ===== 3. Benefícios: um grande + três menores ===== */}
      <section className={`${SECAO} bg-surface-alt`} aria-labelledby="pe-beneficios">
        <Container>
          <motion.div {...aparecer()}>
            <TituloSecao id="pe-beneficios" etiqueta="Benefícios" titulo="O que a sua empresa ganha" />
          </motion.div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            {/* destaque: selo de parceiro */}
            <motion.div {...aparecer()} className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-card bg-linear-to-br from-brand to-brand-dark p-7 text-white shadow-pop sm:p-9">
              <div className="pointer-events-none absolute -right-10 -bottom-10 size-48 rounded-full bg-white/10" aria-hidden="true" />
              <span className="grid size-16 place-items-center rounded-full bg-amber-300 text-brand-dark shadow-lg"><Award size={32} aria-hidden="true" /></span>
              <div className="relative">
                <span className="rounded-full bg-amber-300 px-2.5 py-0.5 text-[11px] font-black uppercase text-brand-dark">em breve</span>
                <h3 className="mt-3 text-2xl font-black sm:text-3xl">{BENEFICIOS[0].titulo}</h3>
                <p className="mt-2 leading-relaxed text-emerald-50/90">{BENEFICIOS[0].texto}</p>
              </div>
            </motion.div>
            <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {BENEFICIOS.slice(1).map((b, i) => (
                <motion.li key={b.titulo} {...aparecer(0.1 + i * 0.08)} className="flex gap-4 rounded-card border border-black/5 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover max-lg:flex-col motion-reduce:hover:translate-y-0">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-mint text-brand"><b.icone size={24} aria-hidden="true" /></span>
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-ink">{b.titulo}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{b.texto}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ===== 4. Como funciona: linha do tempo (vertical no celular, deitada no computador) ===== */}
      <section className={SECAO} aria-labelledby="pe-passos">
        <Container>
          <motion.div {...aparecer()}>
            <TituloSecao id="pe-passos" etiqueta="Como funciona" titulo="Do primeiro contato à coleta" />
          </motion.div>
          <ol className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
            {/* linha que liga os passos */}
            <span className="absolute top-6 bottom-6 left-6 w-0.5 bg-linear-to-b from-brand-line via-emerald-300 to-brand-line lg:top-6 lg:right-[12.5%] lg:bottom-auto lg:left-[12.5%] lg:h-0.5 lg:w-auto lg:bg-linear-to-r" aria-hidden="true" />
            {PASSOS.map((p, i) => (
              <motion.li key={p.titulo} {...aparecer(i * 0.12)} className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center">
                <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-brand text-lg font-black text-white shadow-lg ring-4 ring-white" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-1 lg:pt-0">
                  <h3 className="text-lg font-extrabold text-ink">{p.titulo}</h3>
                  <p className="mt-1.5 leading-relaxed text-ink-soft">{p.texto}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ===== 5. Chamada final ===== */}
      <section className="pb-16 sm:pb-24" aria-labelledby="pe-contato">
        <Container>
          <motion.div {...aparecer()} className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-dark via-brand to-emerald-700 p-7 text-white shadow-pop sm:p-12">
            <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-emerald-300/20 blur-2xl" aria-hidden="true" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <span className="grid size-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20"><Handshake size={28} aria-hidden="true" /></span>
                <h2 id="pe-contato" className="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl">Vamos fazer essa parceria?</h2>
                <p className="mt-3 max-w-xl text-emerald-50/90">Conte o tipo e a quantidade aproximada de material. A equipe responde e combina a coleta com você.</p>
                <ul className="mt-5 flex flex-col gap-2 text-sm font-semibold text-emerald-50 sm:flex-row sm:gap-6">
                  <li className="inline-flex items-center gap-2"><MessageCircle size={16} aria-hidden="true" /> {CONTATO.whatsappExibicao}</li>
                  <li className="inline-flex min-w-0 items-center gap-2"><Mail size={16} className="shrink-0" aria-hidden="true" /> <span className="break-all">{CONTATO.email}</span></li>
                </ul>
              </div>
              <Botoes claro />
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}
