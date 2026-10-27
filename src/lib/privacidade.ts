/**
 * Preferência de privacidade do visitante (guardada só no navegador)
 * ------------------------------------------------------------
 * "aceito"   → o site conta a visita de forma anônima (id aleatório).
 * "recusado" → nada é medido e o id anônimo é apagado.
 * Sem escolha ainda: a medição anônima funciona e o aviso aparece
 * para o visitante poder recusar. O navegador com "Do Not Track" ligado
 * também desliga a medição.
 */

export const CHAVE_PRIVACIDADE = "acmrb_privacidade";
export const CHAVE_ANON = "acmrb_anon_id";
export const EVENTO_PRIVACIDADE = "acmrb:privacidade";

export type EscolhaPrivacidade = "aceito" | "recusado" | null;

export function lerPrivacidade(): EscolhaPrivacidade {
  try {
    const v = localStorage.getItem(CHAVE_PRIVACIDADE);
    return v === "aceito" || v === "recusado" ? v : null;
  } catch {
    return null;
  }
}

export function medicaoPermitida(): boolean {
  if (typeof navigator !== "undefined" && (navigator.doNotTrack === "1" || (window as unknown as { doNotTrack?: string }).doNotTrack === "1")) return false;
  return lerPrivacidade() !== "recusado";
}

export function salvarPrivacidade(valor: Exclude<EscolhaPrivacidade, null>) {
  try {
    localStorage.setItem(CHAVE_PRIVACIDADE, valor);
    if (valor === "recusado") {
      localStorage.removeItem(CHAVE_ANON);
      sessionStorage.removeItem("acmrb_acesso_sessao");
    }
  } catch {
    /* navegador sem armazenamento: ignora */
  }
  window.dispatchEvent(new Event(EVENTO_PRIVACIDADE));
}
