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

/** Selinho vermelho de mensagens não lidas */
export const SELO_NAO_LIDAS =
  "inline-flex items-center justify-center rounded-full bg-red-600 font-extrabold leading-none text-white";
