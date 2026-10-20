/**
 * Formatadores e pequenos componentes compartilhados da página
 * /transparencia (números em pt-BR, peso em kg/t, moeda e contador).
 */

export const fmtNum = (n: number, casas = 0) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: casas });

/** Até 999 kg mostra em kg; acima, em toneladas */
export const fmtPeso = (kg: number) =>
  kg >= 1000 ? `${fmtNum(kg / 1000, 2)} t` : `${fmtNum(kg, 1)} kg`;

export const fmtMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtData = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

export const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
