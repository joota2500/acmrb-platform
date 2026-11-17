"use client";

/**
 * AssociadoCard — cartão público de um associado
 * ------------------------------------------------------------
 * Usado em /associados. Leva ao perfil /associados/[slug] (ou à lista,
 * se o associado ainda não tiver slug). Sem foto, mostra a inicial.
 * Variantes:
 *  - "diretoria": maior, com selo do cargo (Presidente, Secretário...)
 *  - "destaque":  anel verde (membros da diretoria na grade geral)
 *  - "padrao"
 * Só usa campos públicos (nada de CPF, telefone ou endereço).
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AssociadoPublico } from "@/types/associados";
import { cn } from "@/utils/cn";

interface Props {
  associado: AssociadoPublico;
  variante?: "diretoria" | "destaque" | "padrao";
}

export default function AssociadoCard({ associado: a, variante = "padrao" }: Props) {
  const grande = variante === "diretoria";

  return (
    <Link
      href={a.slug ? `/associados/${a.slug}` : "/associados"}
      aria-label={`Ver perfil de ${a.nome}${a.cargo ? `, ${a.cargo}` : ""}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-card border bg-white shadow-card no-underline",
        "transition duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        variante === "padrao" ? "border-black/5 hover:border-brand-line" : "border-leaf-bright/40 hover:border-leaf-bright",
      )}
    >
      {/* Foto (ou inicial do nome) */}
      <div className={cn("relative overflow-hidden bg-brand-mint", grande ? "aspect-4/3" : "aspect-square")}>
        {a.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.foto_url}
            alt=""
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              "grid size-full place-items-center bg-linear-to-br from-brand-mint to-brand-line font-black text-leaf",
              grande ? "text-7xl" : "text-5xl sm:text-6xl",
            )}
          >
            {a.nome.charAt(0).toUpperCase()}
          </span>
        )}

        {/* Selo do cargo da diretoria sobre a foto */}
        {variante !== "padrao" && a.cargo && (
          <span className="absolute left-3 top-3 rounded-full bg-leaf px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-white shadow-card">
            {a.cargo}
          </span>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col gap-1 p-3.5", grande ? "sm:p-5" : "sm:p-4")}>
        <h3 className={cn("text-balance font-black leading-tight text-ink", grande ? "text-lg sm:text-xl" : "text-[0.95rem] sm:text-base")}>
          {a.nome}
        </h3>
        {/* Na diretoria o cargo já aparece no selo da foto */}
        {a.cargo && variante === "padrao" && <p className="text-sm font-bold text-leaf">{a.cargo}</p>}
        {a.tipo_associado && <p className="text-xs text-ink-soft sm:text-sm">{a.tipo_associado}</p>}
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-bold text-leaf group-hover:underline"
        >
          Ver perfil <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </span>
      </div>
    </Link>
  );
}
