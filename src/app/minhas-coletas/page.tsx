/**
 * /minhas-coletas — pedidos de coleta do visitante + chat com a equipe
 */

import type { Metadata } from "next";
import PaginaInterna from "@/components/layout/PaginaInterna";
import MinhasColetas from "@/components/coletas/MinhasColetas";

export const metadata: Metadata = {
  title: "Minhas coletas",
  robots: { index: false },
};

export default function MinhasColetasPage() {
  return (
    <PaginaInterna etiqueta="Área do visitante" titulo="Minhas coletas" largo>
      <MinhasColetas />
    </PaginaInterna>
  );
}
