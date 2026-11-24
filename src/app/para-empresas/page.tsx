/**
 * /para-empresas — como uma empresa pode ajudar a ACMRB (item 13)
 * ------------------------------------------------------------
 * Server component só para o SEO. O conteúdo (com animações) fica no
 * componente cliente ParaEmpresas. Sem formulário de cotação: os botões
 * abrem o WhatsApp e o e-mail da associação (src/constants/contato.ts).
 */

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { jsonLdMigalhas, metaPagina } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ParaEmpresas from "@/components/empresas/ParaEmpresas";

export async function generateMetadata(): Promise<Metadata> {
  return metaPagina({
    titulo: "Para empresas: doe recicláveis e seja parceira da ACMRB",
    descricao:
      "Sua empresa pode doar material reciclável, agendar coleta e virar parceira da ACMRB (Reciclaê) em Baturité – CE: logística reversa, responsabilidade ambiental e destaque na página de parceiros.",
    caminho: "/para-empresas",
  });
}

export default function ParaEmpresasPage() {
  return (
    <>
      <Header />
      <JsonLd dados={jsonLdMigalhas([{ nome: "Para empresas", caminho: "/para-empresas" }])} />
      <ParaEmpresas />
      <Footer />
    </>
  );
}
