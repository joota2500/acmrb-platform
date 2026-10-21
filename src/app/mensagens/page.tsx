/**
 * /mensagens — chat do visitante com a equipe ACMRB
 */

import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MensagensVisitante from "@/components/chat/MensagensVisitante";
import "@/styles/paginas-coleta.css";

export const metadata: Metadata = {
  title: "Mensagens",
  robots: { index: false },
};

export default function MensagensPage() {
  return (
    <>
      <Header />
      <main className="pcol">
        <div className="pcol__container pcol__container--estreito">
          <header className="pcol__topo">
            <p className="pcol__selo">Área do visitante</p>
            <h1 className="pcol__titulo">Mensagens</h1>
          </header>
          <MensagensVisitante />
        </div>
      </main>
      <Footer />
    </>
  );
}
