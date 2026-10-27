/**
 * prazo — duração de um bloqueio, suspensão ou impedimento de retorno
 * ------------------------------------------------------------
 * O deus escolhe: indeterminado, daqui a N minutos/horas/dias, ou uma
 * data e hora exatas. Funções puras, usadas pelo painel (prévia) e pela
 * rota /api/admin/dispositivos (valor oficial, calculado no servidor).
 */

export type ModoPrazo = "indeterminado" | "relativo" | "data";
export type UnidadePrazo = "minutos" | "horas" | "dias";

export interface PrazoEntrada {
  modo: ModoPrazo;
  quantidade?: number;
  unidade?: UnidadePrazo;
  /** data e hora exatas (ISO 8601), quando modo = "data" */
  ate?: string;
}

const MIN_MS = 60_000;
const MULT: Record<UnidadePrazo, number> = { minutos: MIN_MS, horas: 60 * MIN_MS, dias: 24 * 60 * MIN_MS };
export const PRAZO_MAXIMO_DIAS = 3650;

/** Devolve o instante final (ISO) ou null = indeterminado; ou { erro } em português */
export function calcularAte(p: PrazoEntrada | undefined | null, agora = Date.now()): { ate: string | null } | { erro: string } {
  if (!p || p.modo === "indeterminado") return { ate: null };
  const maximo = agora + PRAZO_MAXIMO_DIAS * MULT.dias;

  if (p.modo === "relativo") {
    const q = Math.floor(Number(p.quantidade));
    const mult = p.unidade ? MULT[p.unidade] : undefined;
    if (!mult || !(q >= 1)) return { erro: "Informe uma duração válida (número maior que zero)." };
    const fim = agora + q * mult;
    if (fim > maximo) return { erro: "A duração máxima é de 10 anos. Para sem prazo, escolha “Indeterminado”." };
    return { ate: new Date(fim).toISOString() };
  }

  if (p.modo === "data") {
    const t = Date.parse(String(p.ate ?? ""));
    if (Number.isNaN(t)) return { erro: "Escolha uma data e hora válidas." };
    if (t < agora + MIN_MS) return { erro: "A data e hora de término precisam estar no futuro." };
    if (t > maximo) return { erro: "A data de término está longe demais (máximo 10 anos)." };
    return { ate: new Date(t).toISOString() };
  }

  return { erro: "Tipo de prazo inválido." };
}

/** "27/10/2026 14:38" no horário de Fortaleza */
export const dataFortaleza = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Fortaleza" });

/** 8130 → "2h 15min 30s" (contagem regressiva) */
export function contagem(ms: number): string {
  if (ms <= 0) return "0s";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  if (d) return `${d}d ${h}h ${m}min`;
  if (h) return `${h}h ${String(m).padStart(2, "0")}min ${String(seg).padStart(2, "0")}s`;
  if (m) return `${m}min ${String(seg).padStart(2, "0")}s`;
  return `${seg}s`;
}
