/**
 * /parceiros — empresas de logística reversa, parceiros e apoiadores
 * ------------------------------------------------------------
 * Server component só para o SEO (generateMetadata). O conteúdo é o
 * componente cliente ParceirosPagina, que lê as views públicas.
 */

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { jsonLdMigalhas, metaPagina } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ParceirosPagina from "@/components/parceiros/ParceirosPagina";

export async function generateMetadata(): Promise<Metadata> {
  const descricao =
    "Empresas de logística reversa, parceiros institucionais e apoiadores da ACMRB (Reciclaê) em Baturité – CE, com o histórico público dos materiais repassados para reciclagem.";
  return metaPagina({ titulo: "Parceiros e apoiadores da reciclagem em Baturité", descricao: descricao, caminho: "/parceiros" });
}

export default function ParceirosPage() {
  return (
    <>
      <Header />
      <JsonLd dados={jsonLdMigalhas([{ nome: "Parceiros", caminho: "/parceiros" }])} />
      <ParceirosPagina />
      <Footer />
    </>
  );
}
