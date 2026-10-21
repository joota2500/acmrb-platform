/**
 * /calendario-coleta — dias e horários da coleta seletiva por bairro
 * Server component só para o SEO; o conteúdo é cliente (CalendarioBairros).
 */

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CalendarioBairros from "@/components/calendario/CalendarioBairros";
import "@/styles/paginas-coleta.css";

export const metadata: Metadata = {
  title: "Calendário de coleta por bairro",
  description: "Consulte os dias e horários da coleta seletiva da ACMRB no seu bairro em Baturité – CE.",
  alternates: { canonical: "/calendario-coleta" },
};

export default function CalendarioColetaPage() {
  return (
    <>
      <Header />
      <main className="pcol">
        <div className="pcol__container pcol__container--estreito">
          <header className="pcol__topo">
            <p className="pcol__selo">Coleta seletiva</p>
            <h1 className="pcol__titulo">Calendário de coleta por bairro</h1>
            <p className="pcol__sub">Escolha seu bairro para ver os dias, horários e materiais recolhidos. Precisa de uma coleta fora desses dias? Faça um pedido.</p>
            <Link href="/agendar-coleta" className="pcol__btn">Agendar uma coleta</Link>
          </header>
          <CalendarioBairros />
        </div>
      </main>
      <Footer />
    </>
  );
}
