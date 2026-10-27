/**
 * Layout de /projetos — só para SEO (a página é componente cliente e não pode
 * exportar metadata). Define título, descrição, canonical e a trilha
 * de navegação (BreadcrumbList) que o Google usa.
 */
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { jsonLdMigalhas, metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Projetos e campanhas de educação ambiental",
  descricao:
    "Projetos e campanhas de educação ambiental e reciclagem da ACMRB (Reciclaê) em Baturité – CE.",
  caminho: "/projetos",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd dados={jsonLdMigalhas([{ nome: "Projetos", caminho: "/projetos" }])} />
      {children}
    </>
  );
}
