/**
 * 404 amigável para notícia inexistente, despublicada ou agendada
 */

import { Newspaper } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import Button from "@/components/ui/Button";

export default function NoticiaNaoEncontrada() {
  return (
    <>
      <Header />
      <main className="grid min-h-[70vh] place-items-center bg-surface-alt px-4 pb-16 pt-32" lang="pt-BR">
        <div className="flex max-w-lg flex-col items-center gap-3 rounded-card border border-dashed border-brand-line bg-white p-8 text-center shadow-card sm:p-10">
          <span className="grid size-16 place-items-center rounded-2xl bg-brand-mint text-brand">
            <Newspaper size={32} aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-black text-ink">Notícia não encontrada</h1>
          <p className="leading-relaxed text-ink-soft">
            O endereço pode estar errado, ou a notícia foi retirada do ar ou ainda não foi publicada.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button href="/noticias">Ver todas as notícias</Button>
            <Button href="/" variante="secundario">Voltar ao início</Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
