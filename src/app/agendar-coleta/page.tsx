/**
 * /agendar-coleta — pedido de coleta (somente visitantes logados)
 */

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { jsonLdMigalhas, metaPagina } from "@/lib/seo";
import PaginaInterna from "@/components/layout/PaginaInterna";
import FormAgendarColeta from "@/components/coletas/FormAgendarColeta";

export const metadata: Metadata = metaPagina({
  titulo: "Agende a coleta seletiva em Baturité",
  descricao:
    "Peça a coleta de materiais recicláveis no seu endereço em Baturité – CE e acompanhe o pedido com a equipe da ACMRB (Reciclaê).",
  caminho: "/agendar-coleta",
});

export default function AgendarColetaPage() {
  return (
    <PaginaInterna
      etiqueta="Coleta seletiva"
      titulo="Agende sua coleta"
      descricao="Conte onde e o que vamos recolher. A equipe da ACMRB confirma a data e você acompanha tudo em “Minhas coletas”."
    >
      <JsonLd dados={jsonLdMigalhas([{ nome: "Agendar coleta", caminho: "/agendar-coleta" }])} />
      <FormAgendarColeta />
    </PaginaInterna>
  );
}
