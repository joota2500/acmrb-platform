/**
 * Itens do menu principal (desktop + MobileMenu)
 * ------------------------------------------------------------
 * - href "#id" = âncora da home (fora da home vira "/#id").
 * - href "/rota" = página própria do site.
 * - children = submenu: dropdown no desktop (hover + teclado) e
 *   submenu expansível no celular. O href do pai é o destino padrão.
 * - icone e descricao aparecem só nos submenus (cartões do dropdown).
 * - soMobile = o item só aparece na gaveta do celular (no desktop a
 *   logo já leva para o início).
 *
 * Estrutura do menu:
 *   Início (só celular)
 *   A Associação ▾  → Quem somos · Associados
 *   Coleta ▾        → Agendar coleta · Calendário de coleta · Denúncia ambiental
 *   Parceiros ▾     → Nossos parceiros · Mapa de apoiadores
 *   Transparência
 *   Notícias
 *   Contato
 *   [Agendar coleta]  ← botão de destaque (CTA_MENU)
 *
 * "Projetos" ainda está "em desenvolvimento", então não aparece no menu
 * (só no rodapé). Quando a página ficar pronta, é só incluir em "A Associação".
 */

import { CalendarDays, Handshake, MapPin, Megaphone, MessageCircle, Recycle, Users, Building2, type LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  name: string;
  href: string;
  children?: NavItem[];
  icone?: LucideIcon;
  descricao?: string;
  soMobile?: boolean;
}

export const navigation: NavItem[] = [
  { id: "inicio", name: "Início", href: "/", soMobile: true },
  {
    id: "associacao",
    name: "Associação",
    href: "/quem-somos",
    descricao: "Conheça a ACMRB",
    children: [
      { id: "quem-somos", name: "Quem somos", href: "/quem-somos", icone: Building2, descricao: "Nossa história, missão e diretoria" },
      { id: "associados", name: "Associados", href: "/associados", icone: Users, descricao: "Catadoras e catadores da associação" },
    ],
  },
  {
    id: "coleta",
    name: "Coleta",
    href: "/agendar-coleta",
    descricao: "Serviços de coleta",
    children: [
      { id: "agendar-coleta", name: "Agendar coleta", href: "/agendar-coleta", icone: Recycle, descricao: "Peça a retirada dos seus recicláveis" },
      { id: "calendario-coleta", name: "Calendário de coleta", href: "/calendario-coleta", icone: CalendarDays, descricao: "Dias de coleta no seu bairro" },
    ],
  },
  {
    id: "parceiros",
    name: "Parceiros",
    href: "/parceiros",
    descricao: "Quem caminha com a gente",
    children: [
      { id: "nossos-parceiros", name: "Nossos parceiros", href: "/parceiros", icone: Handshake, descricao: "Logística reversa e apoiadores" },
      // Mapa de apoiadores da home (ApoiadoresMapaSection, id="parceiros").
      { id: "mapa", name: "Mapa de apoiadores", href: "#parceiros", icone: MapPin, descricao: "Pontos de entrega e apoio no mapa" },
    ],
  },
  { id: "transparencia", name: "Transparência", href: "/transparencia" },
  { id: "noticias", name: "Notícias", href: "/noticias" },
  {
    id: "contato",
    name: "Contato",
    href: "#contato",
    descricao: "Fale com a associação",
    children: [
      // seções da home: "contato" e "denuncias"
      { id: "fale-conosco", name: "Fale conosco", href: "#contato", icone: MessageCircle, descricao: "Dúvidas, sugestões e mensagens" },
      { id: "denuncias", name: "Denúncia ambiental", href: "#denuncias", icone: Megaphone, descricao: "Descarte irregular? Avise a associação" },
    ],
  },
];

/** Botão de destaque do cabeçalho e da gaveta do celular */
export const CTA_MENU = { name: "Agendar coleta", href: "/agendar-coleta" };

/** Âncoras viram "/#id" para funcionar em qualquer página (e no clique do meio) */
export const hrefReal = (href: string) => (href.startsWith("#") ? `/${href}` : href);

/** O link aponta para a página atual? ("/" só vale na home; "/noticias" vale também em "/noticias/abc") */
export function linkAtivo(href: string, pathname: string): boolean {
  if (href.startsWith("#")) return false; // âncora da home não marca "ativo"
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** O item (ou algum filho) aponta para a página atual? */
export function itemAtivo(item: NavItem, pathname: string): boolean {
  return linkAtivo(item.href, pathname) || !!item.children?.some((f) => linkAtivo(f.href, pathname));
}
