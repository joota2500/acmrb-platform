/**
 * /acesso-bloqueado — tela mostrada a aparelhos bloqueados ou suspensos
 * pelo ADM DEUS (o middleware reescreve qualquer rota para cá, com status
 * 403). Mostra o motivo e o prazo escolhidos pelo administrador.
 * Fora do Google (noindex) e sem Header/Footer do site.
 */

import type { Metadata } from "next";
import { headers } from "next/headers";
import TelaBloqueioComRecarga from "@/components/bloqueio/TelaBloqueioComRecarga";
import { dispositivoDoCookie } from "@/lib/dispositivo";

export const metadata: Metadata = {
  title: "Aparelho bloqueado",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function AcessoBloqueadoPage() {
  const h = await headers();
  const tipo = h.get("x-acmrb-bloqueio-tipo") === "suspensao" ? "suspensao" : "bloqueio";
  const ate = h.get("x-acmrb-bloqueio-ate") || null;
  let motivo = "";
  try {
    motivo = decodeURIComponent(h.get("x-acmrb-bloqueio-motivo") ?? "");
  } catch {
    /* motivo ilegível: não mostra */
  }
  const codigo = dispositivoDoCookie(h.get("cookie"))?.slice(0, 8) ?? null;

  return (
    <main className="ab" data-pagina-bloqueio>
      <TelaBloqueioComRecarga tipo={tipo} motivo={motivo} ate={ate} codigo={codigo} />
    </main>
  );
}

