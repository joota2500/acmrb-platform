/**
 * /mensagens — chat do visitante com a equipe ACMRB
 */

import type { Metadata } from "next";
import PaginaInterna from "@/components/layout/PaginaInterna";
import MensagensVisitante from "@/components/chat/MensagensVisitante";

export const metadata: Metadata = {
  title: "Mensagens",
  robots: { index: false },
};

export default function MensagensPage() {
  return (
    <PaginaInterna etiqueta="Área do visitante" titulo="Mensagens">
      <MensagensVisitante />
    </PaginaInterna>
  );
}
