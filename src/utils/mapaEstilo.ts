/**
 * mapaEstilo — classes Tailwind dos mapas (Leaflet)
 * ------------------------------------------------------------
 * O Leaflet cria parte do HTML sozinho (marcadores, popups), então as
 * classes ficam aqui, em texto, para o Tailwind encontrar e gerar.
 * Os "ganchos" mapa-wrap e mapa-canvas continuam nos elementos porque
 * o CSS do painel (admin-*.css) usa esses nomes para ajustar a altura.
 * Os ajustes dos elementos internos do Leaflet (popup, controles)
 * ficam em src/app/globals.css, na seção "MAPAS (Leaflet)".
 */

/** Moldura do mapa: bordas arredondadas, altura mínima e fundo verde claro */
export const MAPA_MOLDURA =
  "mapa-wrap relative isolate h-full min-h-75 w-full overflow-hidden rounded-2xl bg-emerald-50 sm:min-h-80 sm:rounded-card";

/** Moldura do seletor do painel (altura fixa e borda) */
export const MAPA_MOLDURA_SELETOR = "h-70 border border-brand-line sm:h-80";

/** Área onde o Leaflet desenha (ocupa toda a moldura) */
export const MAPA_AREA = "mapa-canvas absolute inset-0 z-0";

/** Botão "Toque para mover o mapa" (telas de toque) */
export const MAPA_BOTAO_ATIVAR =
  "absolute bottom-4 left-1/2 z-500 -translate-x-1/2 cursor-pointer rounded-full bg-brand-dark/90 px-5 py-2.5 text-sm font-bold text-white " +
  "shadow-pop backdrop-blur-sm transition hover:bg-brand focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-line";

/** Classe do contêiner do marcador (o "group" deixa o foco do teclado aparecer na gota) */
export const MAPA_PIN_CONTEINER = "group";

interface OpcoesPin {
  /** marcador maior (selecionado / sendo arrastado) */
  ativo?: boolean;
  /** item que não aparece no site (visão do painel): apagado e tracejado */
  oculto?: boolean;
}

/** HTML do marcador em forma de gota, na cor da categoria */
export function htmlPin(cor: string, { ativo = false, oculto = false }: OpcoesPin = {}): string {
  const gota = [
    "relative block size-7.5 -rotate-45 rounded-[50%_50%_50%_0] border-[3px] border-white bg-(--pin)",
    "shadow-[0_4px_10px_rgb(0_0_0/0.3)] transition-transform duration-200 motion-reduce:transition-none",
    "group-focus-visible:outline-3 group-focus-visible:outline-offset-2 group-focus-visible:outline-ink",
    ativo ? "scale-115" : "",
    oculto ? "opacity-55 grayscale-[.4] outline-2 -outline-offset-4 outline-dashed outline-white" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const ponto = "absolute left-1/2 top-1/2 -ml-1 -mt-1 size-2 rounded-full bg-white";
  return `<span class="${gota}" style="--pin:${cor}"><span class="${ponto}"></span></span>`;
}
