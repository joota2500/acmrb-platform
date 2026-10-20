/**
 * /parceiros — empresas de logística reversa, parceiros e apoiadores
 * ------------------------------------------------------------
 * Server component só para o SEO (generateMetadata). O conteúdo é o
 * componente cliente ParceirosPagina, que lê as views públicas.
 */

import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ParceirosPagina from "@/components/parceiros/ParceirosPagina";

export async function generateMetadata(): Promise<Metadata> {
  const descricao =
    "Empresas de logística reversa, parceiros institucionais e apoiadores da ACMRB em Baturité – CE, com o histórico público dos materiais repassados para reciclagem.";
  return {
    title: "Parceiros e Apoiadores",
    description: descricao,
    alternates: { canonical: "/parceiros" },
    openGraph: { title: "Parceiros e Apoiadores | ACMRB", description: descricao, type: "website", locale: "pt_BR" },
  };
}

export default function ParceirosPage() {
  return (
    <>
      <Header />
      <ParceirosPagina />
      <Footer />
    </>
  );
}
