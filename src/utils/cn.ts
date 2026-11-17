/**
 * cn — junta classes do Tailwind sem conflito
 * ------------------------------------------------------------
 * Aceita strings, undefined e false. Se duas classes brigarem
 * (ex.: "p-2" e "p-4"), a última vence (tailwind-merge).
 *   cn("px-4 py-2", ativo && "bg-brand", className)
 */
import { twMerge } from "tailwind-merge";

export function cn(...classes: Array<string | false | null | undefined>) {
  return twMerge(classes.filter(Boolean).join(" "));
}
