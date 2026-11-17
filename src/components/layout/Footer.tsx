"use client";

/**
 * Rodapé institucional da ACMRB
 * ------------------------------------------------------------
 * Compacto, no padrão das seções recentes. Dados de contato vêm de
 * src/constants/contato.ts. No celular, as colunas de links
 * viram acordeão (<details>) para economizar espaço.
 * Visual: Tailwind (verdes escuros do rodapé em valores fixos).
 */

import Link from "next/link";
import { ArrowUp, AtSign, FileText, Mail, MapPin, MessageCircle } from "lucide-react";

import {
  CONTATO,
  linkEmail,
  linkInstagram,
  linkMapaBusca,
  linkWhatsApp,
} from "@/constants/contato";
import { cn } from "@/utils/cn";

// Classes que se repetem no rodapé
const LINK = "text-green-200 no-underline transition-colors hover:text-green-400";
const ITEM_CONTATO =
  "flex items-start gap-1.5 break-words text-[0.82rem] text-green-200 no-underline transition-colors max-[480px]:text-[0.78rem] [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg]:text-green-400";
const TITULO_COLUNA = "mb-2 block list-none text-[0.8rem] font-bold uppercase tracking-wider text-white";

type Item = { rotulo: string; href: string };

const COLUNAS: { titulo: string; itens: Item[] }[] = [
  {
    titulo: "Institucional",
    itens: [
      { rotulo: "Quem Somos", href: "/quem-somos" },
      { rotulo: "Associados", href: "/associados" },
      { rotulo: "Projetos", href: "/projetos" },
      { rotulo: "Notícias", href: "/noticias" },
      { rotulo: "Transparência", href: "/transparencia" },
    ],
  },
  {
    titulo: "Sustentabilidade",
    itens: [
      { rotulo: "Logística Reversa", href: "/#logistica-reversa" },
      { rotulo: "Educação Ambiental", href: "/#operacao" },
      { rotulo: "Economia Circular", href: "/#logistica-reversa" },
      { rotulo: "Indicadores ESG", href: "/transparencia#indicadores" },
    ],
  },
  {
    titulo: "Participe",
    itens: [
      { rotulo: "Agendar coleta", href: "/agendar-coleta" },
      { rotulo: "Calendário de coleta", href: "/calendario-coleta" },
      { rotulo: "Mapa de apoiadores", href: "/#parceiros" },
      { rotulo: "Parceiros", href: "/parceiros" },
      { rotulo: "Denúncia ambiental", href: "/#denuncias" },
      { rotulo: "Contato", href: "/#contato" },
    ],
  },
];

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer
      className="bg-linear-to-b from-[#14532d] to-[#0b3d20] text-sm leading-normal text-green-100 max-[480px]:text-[0.8rem] motion-reduce:[&_*]:transition-none [&_a:focus-visible]:rounded-sm [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-green-400 [&_button:focus-visible]:rounded-sm [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-green-400 [&_summary:focus-visible]:rounded-sm [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-offset-2 [&_summary:focus-visible]:outline-green-400"
      lang="pt-BR"
    >
      <div className="mx-auto max-w-[1200px] px-6 pb-4 pt-9 max-[768px]:px-4.5 max-[768px]:pb-3.5 max-[768px]:pt-7 max-[480px]:px-3.5 max-[480px]:pb-3 max-[480px]:pt-5.5">
        <div className="grid grid-cols-[1.3fr_2fr_1.3fr] gap-7 max-[1024px]:grid-cols-2 max-[1024px]:gap-6 max-[768px]:grid-cols-1 max-[768px]:gap-5">
          {/* Marca */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-white no-underline" aria-label="ACMRB — página inicial">
              <span className="grid size-9 place-items-center rounded-[0.6rem] bg-green-400/15 text-xl text-green-400" aria-hidden>♻</span>
              <span>
                <strong className="block text-[1.05rem] tracking-wide">ACMRB</strong>
                <span className="block text-[0.72rem] text-green-300">Associação dos Catadores</span>
              </span>
            </Link>
            <p className="texto-justo mb-3 mt-3 text-[0.82rem] text-green-200 hyphens-auto max-[480px]:text-[0.78rem]">
              Associação dos Catadores de Materiais Recicláveis de Baturité, atuando em
              sustentabilidade, inclusão social e logística reversa.
            </p>
            <div className="flex gap-2">
              {[
                { href: linkInstagram(), externo: true, rotulo: `Instagram @${CONTATO.instagramUsuario} (abre em nova aba)`, icone: <AtSign size={16} aria-hidden /> },
                { href: linkWhatsApp(), externo: true, rotulo: "WhatsApp (abre em nova aba)", icone: <MessageCircle size={16} aria-hidden /> },
                { href: linkEmail(), externo: false, rotulo: `E-mail ${CONTATO.email}`, icone: <Mail size={16} aria-hidden /> },
              ].map((s) => (
                <a
                  key={s.rotulo}
                  href={s.href}
                  {...(s.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={s.rotulo}
                  className="grid size-8 place-items-center rounded-full bg-white/8 text-green-100 transition hover:-translate-y-0.5 hover:bg-green-400 hover:text-[#14532d] motion-reduce:hover:translate-y-0"
                >
                  {s.icone}
                </a>
              ))}
            </div>
          </div>

          {/* Colunas de links: no celular viram acordeão */}
          <nav
            className="grid grid-cols-3 gap-5 max-[1024px]:order-last max-[1024px]:col-span-full max-[768px]:order-none max-[480px]:grid-cols-1 max-[480px]:gap-0"
            aria-label="Links do rodapé"
          >
            {COLUNAS.map((col) => (
              <details key={col.titulo} className="group max-[480px]:border-b max-[480px]:border-white/10" open>
                <summary
                  className={cn(
                    TITULO_COLUNA,
                    "pointer-events-none cursor-default [&::-webkit-details-marker]:hidden",
                    "max-[480px]:pointer-events-auto max-[480px]:m-0 max-[480px]:flex max-[480px]:cursor-pointer max-[480px]:justify-between max-[480px]:py-2.5",
                    "max-[480px]:after:text-base max-[480px]:after:leading-none max-[480px]:after:text-green-400 max-[480px]:after:content-['+'] max-[480px]:group-open:after:content-['−']",
                  )}
                >
                  {col.titulo}
                </summary>
                <ul className="m-0 grid list-none gap-1.5 p-0 max-[480px]:gap-1.5 max-[480px]:pb-2.5">
                  {col.itens.map((i) => (
                    <li key={i.rotulo}>
                      <Link href={i.href} className={LINK}>{i.rotulo}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </nav>

          {/* Contato */}
          <address className="grid content-start gap-1.5 not-italic">
            <span className={TITULO_COLUNA}>Contato</span>
            <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" className={cn(ITEM_CONTATO, "hover:text-green-400")}>
              <MessageCircle size={15} aria-hidden /> {CONTATO.whatsappExibicao}
            </a>
            <a href={linkEmail()} className={cn(ITEM_CONTATO, "hover:text-green-400")}>
              <Mail size={15} aria-hidden /> {CONTATO.email}
            </a>
            <a href={linkMapaBusca()} target="_blank" rel="noopener noreferrer" className={cn(ITEM_CONTATO, "hover:text-green-400")}>
              <MapPin size={15} aria-hidden /> {CONTATO.endereco}
            </a>
            <span className={ITEM_CONTATO}>
              <FileText size={15} aria-hidden /> CNPJ {CONTATO.cnpj}
            </span>
          </address>
        </div>

        {/* Faixa inferior: em linha no desktop, empilhada e centralizada no celular */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-t border-white/12 pt-3.5 text-xs text-green-300 max-[768px]:grid max-[768px]:justify-items-center max-[768px]:gap-1.5 max-[768px]:py-4 max-[768px]:text-center max-[480px]:text-[0.72rem]">
          <p className="m-0 flex-[1_1_320px] max-[768px]:max-w-136 max-[768px]:flex-none max-[768px]:text-center max-[768px]:leading-snug [text-align-last:auto]">
            © {ano} ACMRB — Associação dos Catadores de Materiais Recicláveis de Baturité.
            Todos os direitos reservados.
          </p>
          <p className="m-0 max-[768px]:text-center max-[768px]:leading-snug">
            Desenvolvido por{" "}
            <a href="https://github.com/joota2500" target="_blank" rel="noopener noreferrer" className="font-bold text-white no-underline transition-colors hover:text-green-400">
              DevJ-2500
            </a>
            {/* Links discretos para páginas secundárias */}
            <span aria-hidden="true"> · </span>
            <Link href="/em-breve" className="font-bold text-white no-underline opacity-75 hover:underline hover:opacity-100 focus-visible:underline focus-visible:opacity-100">
              Em breve
            </Link>
            <span aria-hidden="true"> · </span>
            <Link href="/privacidade" className="font-bold text-white no-underline opacity-75 hover:underline hover:opacity-100 focus-visible:underline focus-visible:opacity-100">
              Privacidade
            </Link>
          </p>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-green-400/40 bg-transparent px-3 py-1.5 text-xs text-green-100 transition-colors hover:bg-green-400 hover:text-[#14532d]"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Voltar ao topo da página"
          >
            <ArrowUp size={15} aria-hidden />
            <span>Topo</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
