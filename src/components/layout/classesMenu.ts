/**
 * Classes Tailwind repetidas nos menus do cabeçalho
 * (Header, NavDropdown, UserMenu e MobileMenu usam o mesmo verde esmeralda).
 */

/** Anel de foco para quem navega pelo teclado */
export const FOCO_MENU =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200";

/** Link do menu horizontal (desktop) com sublinhado animado no hover */
export const LINK_NAV = [
  "relative inline-flex min-h-11 items-center whitespace-nowrap rounded-md text-emerald-50",
  "transition-colors duration-300 hover:text-emerald-200 focus-visible:text-emerald-200",
  FOCO_MENU,
  "after:absolute after:bottom-2 after:left-0 after:h-[2.5px] after:w-0",
  "after:bg-linear-to-r after:from-emerald-400 after:to-emerald-200",
  "after:transition-[width] after:duration-400 after:ease-[cubic-bezier(0.34,1.56,0.64,1)]",
  "hover:after:w-full focus-visible:after:w-full",
].join(" ");

/** Página atual: texto claro e sublinhado sempre visível */
export const LINK_NAV_ATIVO = "text-emerald-200 after:w-full";

/** Botão de destaque do cabeçalho ("Agendar coleta") */
export const BOTAO_CTA = [
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-sun px-5 text-[0.9rem] font-bold text-emerald-950 no-underline",
  "shadow-[0_6px_18px_rgb(234_179_8/0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 motion-reduce:hover:translate-y-0",
  FOCO_MENU,
].join(" ");

/** Selinho vermelho de mensagens não lidas */
export const SELO_NAO_LIDAS =
  "inline-flex items-center justify-center rounded-full bg-red-600 font-extrabold leading-none text-white";
