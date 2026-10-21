/**
 * /em-breve — recursos planejados (página só de front-end)
 */

import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EmBreve from "@/components/em-breve/EmBreve";

export const metadata: Metadata = {
  title: "Em breve",
  description: "Recursos que a ACMRB está preparando: Onde descarto?, Ranking verde e Certificado digital.",
  alternates: { canonical: "/em-breve" },
};

export default function EmBrevePage() {
  return (
    <>
      <Header />
      <main>
        <EmBreve />
      </main>
      <Footer />
    </>
  );
}
