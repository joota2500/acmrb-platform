/**
 * cn — junta classes do Tailwind sem conflito
 * ------------------------------------------------------------
 * Aceita strings, undefined e false. Se duas classes brigarem
 * (ex.: "p-2" e "p-4"), a última vence (tailwind-merge).
 *   cn("px-4 py-2", ativo && "bg-brand", className)
 */
import { extendTailwindMerge } from "tailwind-merge";

// Ensina o tailwind-merge sobre os tamanhos de título da marca (text-display e
// text-headline, definidos em globals.css). Sem isso ele achava que eram cores
// e apagava o tamanho quando havia outra classe text-... na mesma lista.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "headline"] }],
    },
  },
});

export function cn(...classes: Array<string | false | null | undefined>) {
  return twMerge(classes.filter(Boolean).join(" "));
}
