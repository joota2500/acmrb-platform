"use client";

/**
 * AssociadoCard — cartão público de um associado
 * ------------------------------------------------------------
 * Usado em /associados. Leva ao perfil /associados/[slug] (ou à lista,
 * se o associado ainda não tiver slug). Sem foto, mostra a inicial.
 * Variantes:
 *  - "diretoria": maior, horizontal no celular (estilos .as-card--diretoria)
 *  - "destaque":  borda verde (membros da diretoria na grade geral)
 *  - "padrao"
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AssociadoPublico } from "@/types/associados";

interface Props {
  associado: AssociadoPublico;
  variante?: "diretoria" | "destaque" | "padrao";
}

export default function AssociadoCard({ associado: a, variante = "padrao" }: Props) {
  return (
    <Link
      href={a.slug ? `/associados/${a.slug}` : "/associados"}
      className={`as-card as-card--${variante}`}
      aria-label={`Ver perfil de ${a.nome}${a.cargo ? `, ${a.cargo}` : ""}`}
    >
      <div className="as-card__foto">
        {a.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.foto_url} alt="" loading="lazy" />
        ) : (
          <span aria-hidden="true">{a.nome.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="as-card__corpo">
        <h3 className="as-card__nome">{a.nome}</h3>
        {a.cargo && <p className="as-card__cargo">{a.cargo}</p>}
        {a.tipo_associado && <p className="as-card__tipo">{a.tipo_associado}</p>}
        <span className="as-card__link" aria-hidden="true">
          Ver perfil <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
