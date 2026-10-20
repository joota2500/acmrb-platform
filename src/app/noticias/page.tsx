/**
 * /noticias — portal de notícias estilo jornal
 * ------------------------------------------------------------
 * Server component só para o SEO (metadata). A página em si é o
 * componente cliente NoticiasJornal, que lê os filtros da URL
 * (?q=, ?categoria=, ?ano=, ?mes=, ?tag=, ?ordem=).
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NoticiasJornal from "@/components/noticias/NoticiasJornal";

export const metadata: Metadata = {
  title: "Notícias",
  description:
    "Notícias e atualizações da ACMRB: projetos, ações sociais, educação ambiental, parcerias e coleta seletiva em Baturité – CE.",
  openGraph: {
    title: "Notícias | ACMRB",
    description: "Projetos, ações sociais, educação ambiental e parcerias da ACMRB.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function NoticiasPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="nj" aria-busy="true" />}>
        <NoticiasJornal />
      </Suspense>
      <Footer />
    </>
  );
}
