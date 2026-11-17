/**
 * mapaPopup — cartão compacto usado em TODOS os popups do Leaflet
 * (home/parceiros, painel "Visão do mapa", coletas e mapa do contato).
 * ------------------------------------------------------------
 * Gera HTML em texto (o Leaflet recebe string). Todo texto passa por
 * escaparHtml. O visual é feito com classes Tailwind escritas aqui mesmo
 * (o Leaflet recebe só texto). Como o leaflet.css não está em @layer e
 * ganha dos utilitários, margens e cores que ele define usam "!" (important).
 * A moldura do popup (.mapa-popup) é ajustada em src/app/globals.css.
 */

import { escaparHtml } from "@/services/apoiadores";

export type AcaoPopup = { tipo: "whatsapp" | "instagram" | "rota" | "site"; href: string };

export interface CartaoPopup {
  nome: string;
  categoria?: string | null; // texto do selo colorido
  cor?: string; // cor do selo
  info?: (string | null | undefined)[]; // linha discreta (tipo · bairro …)
  descricao?: string | null; // até 2 linhas
  nota?: string | null; // aviso em itálico (ex.: "Localização aproximada")
  logoUrl?: string | null;
  acoes?: (AcaoPopup | null)[];
}

// Ícones SVG pequenos (traço, 14px) — sem depender de React no popup
const ICONES: Record<AcaoPopup["tipo"], string> = {
  whatsapp:
    '<path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20l1.3-5.2A8.4 8.4 0 1 1 21 11.5z"/>',
  instagram:
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
  rota: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  site: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
};
const ROTULO: Record<AcaoPopup["tipo"], string> = { whatsapp: "WhatsApp", instagram: "Instagram", rota: "Rota", site: "Site" };

/** Link do WhatsApp a partir de um telefone brasileiro (ou null) */
export function linkWhatsapp(tel?: string | null): string | null {
  const d = (tel ?? "").replace(/\D/g, "");
  if (d.length < 10) return null;
  return `https://wa.me/${d.length <= 11 ? "55" + d : d}`;
}

/** Rota no Google Maps até a coordenada */
export function linkRotaGoogle(lat?: number | null, lng?: number | null): string | null {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// Classes do cartão. O "!" (important) vence as regras do leaflet.css
// (".leaflet-popup-content p" e ".leaflet-container a") e as globais
// (hifenização, overflow-wrap: anywhere).
const T = "text-left! hyphens-none! wrap-normal! break-normal! tracking-normal!";
const CLASSE = {
  cartao: "flex flex-col gap-1.5 pr-3.5",
  topo: "flex min-w-0 items-center gap-2.5",
  logo: "size-9 flex-none rounded-lg border border-line bg-white object-contain p-0.5",
  cabecalho: "flex min-w-0 flex-1 flex-col items-start gap-1",
  selo:
    "inline-flex max-w-full items-center gap-1.5 truncate rounded-full px-2 py-0.5 text-[10.5px] font-bold leading-snug text-(--cor) bg-[color-mix(in_srgb,var(--cor)_12%,white)] " + T,
  bolinha: "size-1.5 flex-none rounded-full bg-(--cor)",
  nome: "m-0! line-clamp-2 text-[0.95rem] font-extrabold leading-tight text-brand-dark " + T,
  info: "m-0! truncate text-xs leading-snug text-ink-muted " + T,
  desc: "m-0! line-clamp-2 text-xs leading-snug text-ink-soft " + T,
  nota: "m-0! text-[11px] italic leading-tight text-zinc-400 " + T,
  acoes: "mt-0.5 flex flex-wrap gap-1.5",
  acao:
    "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-brand-mint bg-brand-soft px-2.5 py-1 text-[11.5px] font-bold leading-snug text-brand! no-underline! " +
    "transition-colors hover:bg-brand-mint hover:text-brand-dark! focus-visible:bg-brand-mint focus-visible:text-brand-dark! " + T,
  acaoWhatsapp: "text-[#128c4a]!",
};

/** Monta o HTML do cartão do popup */
export function cartaoPopup(c: CartaoPopup): string {
  const cor = c.cor ?? "#2E5E4E";
  const e = escaparHtml;
  const logo = c.logoUrl
    ? `<img class="${CLASSE.logo}" src="${e(c.logoUrl)}" alt="" loading="lazy" />`
    : "";
  const selo = c.categoria
    ? `<span class="${CLASSE.selo}" style="--cor:${e(cor)}"><i class="${CLASSE.bolinha}" aria-hidden="true"></i>${e(c.categoria)}</span>`
    : "";
  const info = (c.info ?? []).filter((x): x is string => !!x && !!x.trim());
  const acoes = (c.acoes ?? []).filter((a): a is AcaoPopup => !!a && !!a.href);
  return `<div class="${CLASSE.cartao}">
  <div class="${CLASSE.topo}">${logo}<div class="${CLASSE.cabecalho}">${selo}<p class="${CLASSE.nome}" title="${e(c.nome)}">${e(c.nome)}</p></div></div>
  ${info.length ? `<p class="${CLASSE.info}">${info.map(e).join(" · ")}</p>` : ""}
  ${c.descricao ? `<p class="${CLASSE.desc}">${e(c.descricao)}</p>` : ""}
  ${c.nota ? `<p class="${CLASSE.nota}">${e(c.nota)}</p>` : ""}
  ${
    acoes.length
      ? `<div class="${CLASSE.acoes}">${acoes
          .map(
            (a) =>
              `<a class="${CLASSE.acao}${a.tipo === "whatsapp" ? " " + CLASSE.acaoWhatsapp : ""}" href="${e(a.href)}" target="_blank" rel="noopener noreferrer" aria-label="${ROTULO[a.tipo]} (abre em nova aba)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-none" aria-hidden="true">${ICONES[a.tipo]}</svg>${ROTULO[a.tipo]}</a>`,
          )
          .join("")}</div>`
      : ""
  }
</div>`;
}
