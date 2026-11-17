/**
 * Formatadores compartilhados (padrão brasileiro)
 * ------------------------------------------------------------
 * Usados no Hero da home e na página /quem-somos para que os números
 * de impacto apareçam iguais nas duas páginas.
 */

/** Peso total em KG → "850 kg", "1,5 t", "12 t". */
export function formatarPeso(kg: number): string {
  if (kg < 1000) {
    return `${kg.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kg`;
  }
  const t = kg / 1000;
  return `${t.toLocaleString("pt-BR", {
    maximumFractionDigits: t < 10 ? 1 : 0,
  })} t`;
}

/** Número com separador brasileiro (ex.: 1.250). */
export const formatarNumero = (n: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
