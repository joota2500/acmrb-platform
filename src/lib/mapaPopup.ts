/**
 * mapaPopup — cartão compacto usado em TODOS os popups do Leaflet
 * (home/parceiros, painel "Visão do mapa", coletas e mapa do contato).
 * ------------------------------------------------------------
 * Gera HTML em texto (o Leaflet recebe string). Todo texto passa por
 * escaparHtml. O visual fica em src/styles/mapa.css, no namespace
 * ".mapa-popup .mpc…", com tamanhos/margens explícitos para que regras
 * globais (h1–h6, overflow-wrap: anywhere, hyphens, justify) não vazem.
 */

import { escaparHtml } from "@/lib/apoiadores";

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

/** Monta o HTML do cartão do popup */
export function cartaoPopup(c: CartaoPopup): string {
  const cor = c.cor ?? "#2E5E4E";
  const e = escaparHtml;
  const logo = c.logoUrl
    ? `<img class="mpc__logo" src="${e(c.logoUrl)}" alt="" loading="lazy" />`
    : "";
  const selo = c.categoria
    ? `<span class="mpc__selo" style="--mpc-cor:${e(cor)}"><i aria-hidden="true"></i>${e(c.categoria)}</span>`
    : "";
  const info = (c.info ?? []).filter((x): x is string => !!x && !!x.trim());
  const acoes = (c.acoes ?? []).filter((a): a is AcaoPopup => !!a && !!a.href);
  return `<div class="mpc">
  <div class="mpc__topo">${logo}<div class="mpc__cab">${selo}<p class="mpc__nome" title="${e(c.nome)}">${e(c.nome)}</p></div></div>
  ${info.length ? `<p class="mpc__info">${info.map(e).join(" · ")}</p>` : ""}
  ${c.descricao ? `<p class="mpc__desc">${e(c.descricao)}</p>` : ""}
  ${c.nota ? `<p class="mpc__nota">${e(c.nota)}</p>` : ""}
  ${
    acoes.length
      ? `<div class="mpc__acoes">${acoes
          .map(
            (a) =>
              `<a class="mpc__acao mpc__acao--${a.tipo}" href="${e(a.href)}" target="_blank" rel="noopener noreferrer" aria-label="${ROTULO[a.tipo]} (abre em nova aba)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[a.tipo]}</svg>${ROTULO[a.tipo]}</a>`,
          )
          .join("")}</div>`
      : ""
  }
</div>`;
}
