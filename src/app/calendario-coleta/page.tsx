/**
 * /calendario-coleta — dias e horários da coleta seletiva por bairro
 * Server component só para o SEO; o conteúdo é cliente (CalendarioBairros).
 */

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { jsonLdMigalhas, metaPagina } from "@/lib/seo";
import PaginaInterna from "@/components/layout/PaginaInterna";
import Button from "@/components/ui/Button";
import CalendarioBairros from "@/components/calendario/CalendarioBairros";

export const metadata: Metadata = metaPagina({
  titulo: "Calendário de coleta seletiva por bairro em Baturité",
  descricao:
    "Consulte os dias e horários da coleta seletiva da ACMRB (Reciclaê) no seu bairro em Baturité – CE.",
  caminho: "/calendario-coleta",
});

export default function CalendarioColetaPage() {
  return (
    <PaginaInterna
      etiqueta="Coleta seletiva"
      titulo="Calendário de coleta por bairro"
      descricao="Escolha seu bairro para ver os dias, horários e materiais recolhidos. Precisa de uma coleta fora desses dias? Faça um pedido."
      acao={<Button href="/agendar-coleta">Agendar uma coleta</Button>}
    >
      <JsonLd dados={jsonLdMigalhas([{ nome: "Calendário de coleta", caminho: "/calendario-coleta" }])} />
      <CalendarioBairros />
    </PaginaInterna>
  );
}
