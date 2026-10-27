/**
 * Layout de /quem-somos — só para SEO (a página é componente cliente e não pode
 * exportar metadata). Define título, descrição, canonical e a trilha
 * de navegação (BreadcrumbList) que o Google usa.
 */
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { jsonLdMigalhas, metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Quem somos: a Associação Reciclaê (ACMRB) de Baturité",
  descricao:
    "Conheça a história, a equipe e os valores da Associação dos Catadores de Materiais Recicláveis de Baturité (ACMRB / Reciclaê), fundada em 10/07/2025 em Baturité – CE.",
  caminho: "/quem-somos",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd dados={jsonLdMigalhas([{ nome: "Quem somos", caminho: "/quem-somos" }])} />
      {children}
    </>
  );
}
