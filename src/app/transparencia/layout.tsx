/**
 * Layout de /transparencia — só para SEO (a página é componente cliente e não pode
 * exportar metadata). Define título, descrição, canonical e a trilha
 * de navegação (BreadcrumbList) que o Google usa.
 */
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { jsonLdMigalhas, metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Transparência e indicadores da reciclagem em Baturité",
  descricao:
    "Indicadores, materiais reciclados, documentos e prestação de contas da ACMRB (Reciclaê), a associação de catadores de Baturité – CE.",
  caminho: "/transparencia",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd dados={jsonLdMigalhas([{ nome: "Transparência", caminho: "/transparencia" }])} />
      {children}
    </>
  );
}
