/**
 * 404 amigável para notícia inexistente, despublicada ou agendada
 */

import Link from "next/link";
import { Newspaper } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import "@/styles/noticia-detalhe.css";

export default function NoticiaNaoEncontrada() {
  return (
    <>
      <Header />
      <main className="nd nd--404" lang="pt-BR">
        <div className="nd__404">
          <Newspaper size={40} aria-hidden="true" />
          <h1>Notícia não encontrada</h1>
          <p>
            O endereço pode estar errado, ou a notícia foi retirada do ar ou ainda não foi publicada.
          </p>
          <div className="nd__404-acoes">
            <Link href="/noticias" className="nd__btn">Ver todas as notícias</Link>
            <Link href="/" className="nd__btn nd__btn--claro">Voltar ao início</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
