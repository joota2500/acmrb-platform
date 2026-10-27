/**
 * /agendar-coleta — pedido de coleta (somente visitantes logados)
 */

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { jsonLdMigalhas, metaPagina } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FormAgendarColeta from "@/components/coletas/FormAgendarColeta";
import "@/styles/paginas-coleta.css";

export const metadata: Metadata = metaPagina({
  titulo: "Agende a coleta seletiva em Baturité",
  descricao:
    "Peça a coleta de materiais recicláveis no seu endereço em Baturité – CE e acompanhe o pedido com a equipe da ACMRB (Reciclaê).",
  caminho: "/agendar-coleta",
});

export default function AgendarColetaPage() {
  return (
    <>
      <Header />
      <JsonLd dados={jsonLdMigalhas([{ nome: "Agendar coleta", caminho: "/agendar-coleta" }])} />
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
