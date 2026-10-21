/**
 * /minha-conta — dados de contato do visitante logado
 */

import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MinhaConta from "@/components/conta/MinhaConta";
import "@/styles/paginas-coleta.css";

export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false },
};

export default function MinhaContaPage() {
  return (
    <>
      <Header />
      <main className="pcol">
        <div className="pcol__container pcol__container--estreito">
          <header className="pcol__topo">
            <p className="pcol__selo">Área do visitante</p>
            <h1 className="pcol__titulo">Minha conta</h1>
          </header>
          <MinhaConta />
        </div>
      </main>
      <Footer />
    </>
  );
}
