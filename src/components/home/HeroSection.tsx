"use client";

/**
 * HeroSection — primeira dobra da página inicial (visual novo)
 * ------------------------------------------------------------
 * O que mostra:
 *  1. Foto de fundo (next/image) com degradê verde escuro para leitura.
 *  2. Selo, título forte, texto, 2 botões (Agendar coleta / Conheça) e
 *     selos de confiança.
 *  3. No desktop, um cartão de vidro com o atalho da coleta seletiva.
 *  4. Uma faixa de números de impacto que "sobe" por cima da foto.
 *
 * De onde vêm os números (hook useESGMetrics → Supabase):
 *  - Resíduos reciclados: soma de materiais_registros.peso (em kg).
 *  - Famílias beneficiadas: dashboard_metricas.familias_impactadas.
 *  - CO₂ evitado: dashboard_metricas.co2_evitado (em kg; vira t acima de 1000).
 *  - Enquanto carrega mostra "—"; quando termina, o número conta de 0 até o valor.
 *
 * Responsivo: celular (360px) com botões em largura total e números em
 * 2 colunas; tablet (768px) botões lado a lado; desktop (1280px) texto +
 * cartão de coleta e 4 números em linha.
 */

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Cloud,
  Leaf,
  MapPin,
  Recycle,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Contador from "@/components/ui/Contador";
import { useESGMetrics } from "@/hooks/useESGMetrics";
// Formatação kg/t compartilhada com a página /quem-somos
import { formatarNumero, formatarPeso } from "@/utils/formatadores";

/** Selos de confiança que aparecem embaixo dos botões */
const selos = [
  { icone: BadgeCheck, texto: "Associação formal com CNPJ" },
  { icone: ShieldCheck, texto: "Dados públicos e transparentes" },
  { icone: Users, texto: "Catadores associados" },
  { icone: MapPin, texto: "Maciço de Baturité – CE" },
];

export default function HeroSection() {
  // Métricas do Supabase (veja o hook para os detalhes de cada tabela)
  const { loading, totalPeso, familiasImpactadas, co2 } = useESGMetrics();
  const reduzir = useReducedMotion();

  // Entrada ao carregar a página (sobe e aparece), com atraso opcional
  const subir = (atraso = 0) =>
    reduzir
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: atraso },
        };

  // Os 4 números da faixa de impacto (evita repetir o JSX 4 vezes)
  const numeros = [
    { icone: Recycle, valor: totalPeso, formatar: formatarPeso, rotulo: "Resíduos reciclados" },
    { icone: Users, valor: familiasImpactadas, formatar: (n: number) => formatarNumero(Math.round(n)), rotulo: "Famílias beneficiadas" },
    { icone: Cloud, valor: co2, formatar: formatarPeso, rotulo: "CO₂ evitado" },
    { icone: ShieldCheck, valor: 100, formatar: (n: number) => `${Math.round(n)}%`, rotulo: "Transparência" },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-emerald-950 pt-16 sm:pt-18 lg:pt-20">
        {/* ===== Fundo: foto + degradês (esquerda escura para o texto ler bem) ===== */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero-reciclagem.jpg"
            alt="Catadores de materiais recicláveis separando garrafas plásticas em um galpão de reciclagem"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center]"
          />
          <div className="absolute inset-0 bg-linear-to-r from-emerald-950 via-emerald-950/85 to-emerald-950/30 max-lg:from-emerald-950/95 max-lg:via-emerald-950/85 max-lg:to-emerald-950/70" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-emerald-950 to-transparent" />
        </div>

        <Container className="grid items-center gap-12 pb-32 pt-12 sm:pb-36 sm:pt-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:pb-44 lg:pt-28">
          {/* ===== Coluna do texto ===== */}
          <div>
            <motion.span
              {...subir()}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-md sm:text-xs"
            >
              <Leaf size={15} className="text-emerald-300" aria-hidden="true" />
              Educação ambiental • Ação coletiva
            </motion.span>

            {/* O {" "} garante o espaço entre as linhas ao copiar o texto */}
            <motion.h1
              {...subir(0.1)}
              className="mt-6 text-balance text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Aprenda, recicle e construa o futuro.{" "}
              <span className="mt-1 block bg-linear-to-r from-emerald-300 to-emerald-100 bg-clip-text text-transparent">
                Transforme Baturité.
              </span>
            </motion.h1>

            <motion.p
              {...subir(0.2)}
              lang="pt-BR"
              className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-emerald-100 sm:text-lg lg:text-xl"
            >
              A ACMRB, a Associação Reciclaê de catadores de Baturité, une coleta seletiva, educação ambiental e
              transparência para gerar renda, proteger o meio ambiente e construir um futuro sustentável para a nossa
              cidade.
            </motion.p>

            {/* Botões: coluna e largura total no celular, lado a lado a partir de 640px */}
            <motion.div {...subir(0.3)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button href="/agendar-coleta" variante="destaque" tamanho="grande" className="w-full shadow-pop sm:w-auto">
                Agendar coleta
                <ArrowRight size={19} aria-hidden="true" />
              </Button>
              <Button href="#quem-somos" variante="contornoClaro" tamanho="grande" className="w-full sm:w-auto">
                Conheça a ACMRB
              </Button>
            </motion.div>

            {/* Selos de confiança */}
            <motion.ul {...subir(0.4)} className="mt-8 flex flex-wrap gap-2" aria-label="Por que confiar na ACMRB">
              {selos.map(({ icone: Icone, texto }) => (
                <li
                  key={texto}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-50 backdrop-blur-md"
                >
                  <Icone size={14} className="text-emerald-300" aria-hidden="true" />
                  {texto}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ===== Cartão de vidro com o atalho da coleta (só no desktop) ===== */}
          <motion.aside
            {...subir(0.35)}
            aria-label="Coleta seletiva"
            className="hidden rounded-3xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-xl lg:block"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg">
              <Truck size={24} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl font-black leading-tight text-white">Coleta seletiva na sua porta</h2>
            <p lang="pt-BR" className="mt-3 text-sm leading-relaxed text-emerald-100">
              Peça a coleta no seu endereço, acompanhe o pedido e converse com a equipe pelo próprio site.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button href="/agendar-coleta" variante="claro" larguraTotal>
                Pedir uma coleta
              </Button>
              <Button href="/calendario-coleta" variante="contornoClaro" larguraTotal>
                <CalendarDays size={17} aria-hidden="true" />
                Ver calendário por bairro
              </Button>
            </div>
          </motion.aside>
        </Container>
      </section>

      {/* ===== Faixa de números: sobe por cima da foto ===== */}
      <section aria-label="Números de impacto" className="relative z-10 -mt-20 sm:-mt-24 lg:-mt-28">
        <Container>
          <motion.dl
            {...subir(0.5)}
            aria-busy={loading}
            className="grid grid-cols-2 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-pop md:grid-cols-4"
          >
            {numeros.map(({ icone: Icone, valor, formatar, rotulo }, i) => (
              <div
                key={rotulo}
                className={`flex flex-col items-center gap-2 px-3 py-6 text-center sm:px-6 sm:py-8 ${
                  i % 2 === 0 ? "border-r border-line" : ""
                } ${i < 2 ? "border-b border-line md:border-b-0" : ""} ${i === 1 ? "md:border-r" : ""}`}
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-brand-mint text-leaf" aria-hidden="true">
                  <Icone size={22} />
                </span>
                {/* dd vem antes do dt só no visual (flex-col-reverse), mas o leitor de tela lê o rótulo primeiro */}
                <div className="flex flex-col-reverse items-center gap-1">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted sm:text-sm">{rotulo}</dt>
                  <dd className="text-3xl font-black tracking-tight text-brand sm:text-4xl">
                    {loading ? "—" : <Contador valor={valor} formatar={formatar} />}
                  </dd>
                </div>
              </div>
            ))}
          </motion.dl>
        </Container>
      </section>
    </>
  );
}
