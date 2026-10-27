/**
 * /calendario-coleta — dias e horários da coleta seletiva por bairro
 * Server component só para o SEO; o conteúdo é cliente (CalendarioBairros).
 */

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { jsonLdMigalhas, metaPagina } from "@/lib/seo";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CalendarioBairros from "@/components/calendario/CalendarioBairros";
import "@/styles/paginas-coleta.css";

export const metadata: Metadata = metaPagina({
  titulo: "Calendário de coleta seletiva por bairro em Baturité",
  descricao:
    "Consulte os dias e horários da coleta seletiva da ACMRB (Reciclaê) no seu bairro em Baturité – CE.",
  caminho: "/calendario-coleta",
});

export default function CalendarioColetaPage() {
  return (
    <>
      <Header />
      <JsonLd dados={jsonLdMigalhas([{ nome: "Calendário de coleta", caminho: "/calendario-coleta" }])} />
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
