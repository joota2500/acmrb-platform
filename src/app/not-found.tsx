/**
 * 404 — página não encontrada (vale para o site todo)
 * ------------------------------------------------------------
 * Aparece quando o endereço não existe (ou quando o middleware esconde
 * um endereço que não deve ser público). Mostra o cabeçalho e o rodapé
 * do site, um botão para voltar ao início e atalhos para as páginas
 * mais procuradas. Não é indexada pelo Google (noindex).
 */

import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, FileText, Home, Mail, Newspaper, Truck, Users } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: true },
};

// Atalhos úteis (as páginas que as pessoas mais procuram)
const LINKS_UTEIS = [
  { href: "/quem-somos", rotulo: "Quem somos", icone: Users },
  { href: "/agendar-coleta", rotulo: "Agendar coleta", icone: Truck },
  { href: "/calendario-coleta", rotulo: "Dias de coleta", icone: CalendarDays },
  { href: "/noticias", rotulo: "Notícias", icone: Newspaper },
  { href: "/transparencia", rotulo: "Transparência", icone: FileText },
  { href: "/#contato", rotulo: "Contato", icone: Mail },
];

export default function NaoEncontrado() {
  return (
    <>
      <Header />
      <main className="relative overflow-hidden bg-surface-alt px-4 pb-16 pt-32 sm:pb-24 sm:pt-36" lang="pt-BR">
        {/* manchas verdes de fundo (só decoração) */}
        <span className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" aria-hidden="true" />
        <span className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-brand-mint blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
          {/* número grande com o verde da marca */}
          <p className="bg-linear-to-br from-brand to-leaf-bright bg-clip-text text-8xl font-black leading-none tracking-tighter text-transparent sm:text-9xl" aria-hidden="true">
            404
          </p>
          <span className="mt-4 rounded-full bg-brand-mint px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
            Página não encontrada
          </span>
          <h1 className="mt-4 text-headline font-black text-ink">Esse caminho não leva a lugar nenhum</h1>
          <p className="mt-3 max-w-lg leading-relaxed text-ink-soft">
            O endereço pode estar errado ou a página mudou de lugar. Mas não se preocupe: daqui você volta rapidinho
            para o que procura.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button href="/" tamanho="grande">
              <Home size={18} aria-hidden="true" /> Voltar ao início
            </Button>
            <Button href="/#contato" tamanho="grande" variante="contorno">
              Falar com a associação
            </Button>
          </div>

          {/* atalhos */}
          <nav aria-label="Páginas úteis" className="mt-12 w-full">
            <p className="mb-3 text-sm font-semibold text-ink-muted">Talvez você esteja procurando:</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {LINKS_UTEIS.map(({ href, rotulo, icone: Icone }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex h-full items-center gap-3 rounded-card border border-black/5 bg-white p-3.5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-brand-line hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-mint text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                      <Icone size={20} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold text-ink">{rotulo}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
