/**
 * /noticias — portal de notícias estilo jornal
 * ------------------------------------------------------------
 * Server component só para o SEO (metadata). A página em si é o
 * componente cliente NoticiasJornal, que lê os filtros da URL
 * (?q=, ?categoria=, ?ano=, ?mes=, ?tag=, ?ordem=).
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { jsonLdMigalhas, metaPagina } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NoticiasJornal from "@/components/noticias/NoticiasJornal";

export const metadata: Metadata = metaPagina({
  titulo: "Notícias da associação de catadores de Baturité",
  descricao:
    "Notícias e atualizações da ACMRB (Reciclaê): projetos, ações sociais, educação ambiental, parcerias e coleta seletiva em Baturité – CE.",
  caminho: "/noticias",
});

export default function NoticiasPage() {
  return (
    <>
      <Header />
      <JsonLd dados={jsonLdMigalhas([{ nome: "Notícias", caminho: "/noticias" }])} />
      <Suspense fallback={<main className="nj" aria-busy="true" />}>
        <NoticiasJornal />
      </Suspense>
      <Footer />
    </>
  );
}
