/**
 * /acesso-bloqueado — página simples mostrada a aparelhos bloqueados ou
 * suspensos pelo ADM DEUS (o middleware reescreve qualquer rota para cá).
 * Não mostra o motivo (é interno); só diz até quando, se for suspensão.
 * Fora do Google (noindex) e sem Header/Footer do site.
 */

import type { Metadata } from "next";
import { headers } from "next/headers";
import { ShieldAlert } from "lucide-react";
import { CONTATO, linkEmail } from "@/lib/contatoInstitucional";
import "@/styles/acesso-bloqueado.css";

export const metadata: Metadata = {
  title: "Acesso bloqueado",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function AcessoBloqueadoPage() {
  const h = await headers();
  const tipo = h.get("x-acmrb-bloqueio-tipo");
  const ate = h.get("x-acmrb-bloqueio-ate");
  const quando =
    tipo === "suspensao" && ate && !Number.isNaN(Date.parse(ate))
      ? new Date(ate).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Fortaleza" })
      : null;

  return (
    <main className="ab">
      <section className="ab__cartao" aria-labelledby="ab-titulo">
        <span className="ab__icone" aria-hidden="true"><ShieldAlert size={34} /></span>
        <h1 id="ab-titulo" className="ab__titulo">Acesso bloqueado</h1>
        <p className="ab__texto">
          {quando
            ? `O acesso a este site foi suspenso temporariamente neste aparelho. Ele será liberado em ${quando} (horário de Fortaleza).`
            : "O acesso a este site foi bloqueado neste aparelho por motivos de segurança."}
        </p>
        <p className="ab__texto">
          Se você acha que isso foi um engano, fale com a Associação:{" "}
          <a href={linkEmail("Acesso bloqueado ao site")}>{CONTATO.email}</a> ou WhatsApp {CONTATO.whatsappExibicao}.
        </p>
      </section>
    </main>
  );
}
