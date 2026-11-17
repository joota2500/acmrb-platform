/**
 * Telas de login do painel não entram nas estatísticas de visita.
 * Como o endereço delas é secreto (não dá pra testar pelo caminho),
 * a própria página marca o HTML com data-sem-rastreio.
 */
export function paginaSemRastreio(): boolean {
  return typeof document !== "undefined" && !!document.querySelector("[data-sem-rastreio]");
}
