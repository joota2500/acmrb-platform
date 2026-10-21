/**
 * /agendar-coleta — pedido de coleta (somente visitantes logados)
 */

import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FormAgendarColeta from "@/components/coletas/FormAgendarColeta";
import "@/styles/paginas-coleta.css";

export const metadata: Metadata = {
  title: "Agendar coleta",
  description: "Peça a coleta de recicláveis no seu endereço em Baturité – CE e acompanhe o pedido com a equipe da ACMRB.",
  alternates: { canonical: "/agendar-coleta" },
};

export default function AgendarColetaPage() {
  return (
    <>
      <Header />
      <main className="pcol">
        <div className="pcol__container pcol__container--estreito">
          <header className="pcol__topo">
            <p className="pcol__selo">Coleta seletiva</p>
            <h1 className="pcol__titulo">Agende sua coleta</h1>
            <p className="pcol__sub">Conte onde e o que vamos recolher. A equipe da ACMRB confirma a data e você acompanha tudo em “Minhas coletas”.</p>
          </header>
          <FormAgendarColeta />
        </div>
      </main>
      <Footer />
    </>
  );
}
