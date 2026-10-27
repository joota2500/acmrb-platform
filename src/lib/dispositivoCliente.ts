/**
 * Id do aparelho no NAVEGADOR (cookie "acmrb_did" + cópia em localStorage)
 * ------------------------------------------------------------
 * O middleware cria o cookie na primeira visita. Aqui o navegador o lê e
 * mantém a cópia em localStorage (a chave antiga "acmrb_anon_id" continua
 * valendo, então quem já tinha um id não vira "novo aparelho").
 * "Expulsar" (pelo ADM DEUS) apaga os dois e, no próximo carregamento,
 * nasce um id novo.
 */

import { COOKIE_DISPOSITIVO, COOKIE_VALIDADE_SEG, UUID_RE } from "@/lib/dispositivo";
import { CHAVE_ANON } from "@/lib/privacidade";

function lerCookie(): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_DISPOSITIVO}=([^;]+)`));
  const v = m?.[1]?.trim().toLowerCase();
  return v && UUID_RE.test(v) ? v : null;
}

function gravarCookie(id: string) {
  const seguro = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_DISPOSITIVO}=${id}; Path=/; Max-Age=${COOKIE_VALIDADE_SEG}; SameSite=Lax${seguro}`;
}

/** Devolve o id do aparelho (cookie primeiro, depois localStorage) e mantém os dois iguais */
export function idDoAparelho(): string | null {
  try {
    const doCookie = lerCookie();
    let id = doCookie ?? localStorage.getItem(CHAVE_ANON);
    if (!id || !UUID_RE.test(id)) id = crypto.randomUUID();
    if (doCookie !== id) gravarCookie(id);
    if (localStorage.getItem(CHAVE_ANON) !== id) localStorage.setItem(CHAVE_ANON, id);
    return id;
  } catch {
    return null;
  }
}

/** Esquece o aparelho: apaga cookie, cópia local e a visita em andamento */
export function esquecerAparelho() {
  try {
    document.cookie = `${COOKIE_DISPOSITIVO}=; Path=/; Max-Age=0; SameSite=Lax`;
    localStorage.removeItem(CHAVE_ANON);
    sessionStorage.removeItem("acmrb_acesso_sessao");
  } catch {
    /* navegador sem armazenamento: ignora */
  }
}
