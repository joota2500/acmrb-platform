/**
 * Layout de /associados — só para SEO (a página é componente cliente e não pode
 * exportar metadata). Define título, descrição, canonical e a trilha
 * de navegação (BreadcrumbList) que o Google usa.
 */
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { jsonLdMigalhas, metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Equipe e associados",
  descricao:
    "Conheça a equipe e os catadores associados da ACMRB (Reciclaê), associação de catadores de materiais recicláveis de Baturité – CE.",
  caminho: "/associados",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd dados={jsonLdMigalhas([{ nome: "Equipe", caminho: "/associados" }])} />
      {children}
    </>
  );
}
