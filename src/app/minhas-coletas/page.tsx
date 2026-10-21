/**
 * /minhas-coletas — pedidos de coleta do visitante + chat com a equipe
 */

import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MinhasColetas from "@/components/coletas/MinhasColetas";
import "@/styles/paginas-coleta.css";

export const metadata: Metadata = {
  title: "Minhas coletas",
  robots: { index: false },
};

export default function MinhasColetasPage() {
  return (
    <>
      <Header />
      <main className="pcol">
        <div className="pcol__container">
          <header className="pcol__topo">
            <p className="pcol__selo">Área do visitante</p>
            <h1 className="pcol__titulo">Minhas coletas</h1>
          </header>
          <MinhasColetas />
        </div>
      </main>
      <Footer />
    </>
  );
}
