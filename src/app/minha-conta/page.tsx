/**
 * /minha-conta — dados de contato do visitante logado
 */

import type { Metadata } from "next";
import PaginaInterna from "@/components/layout/PaginaInterna";
import MinhaConta from "@/components/conta/MinhaConta";

export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false },
};

export default function MinhaContaPage() {
  return (
    <PaginaInterna etiqueta="Área do visitante" titulo="Minha conta">
      <MinhaConta />
    </PaginaInterna>
  );
}
