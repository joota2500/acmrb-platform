/**
 * Itens do menu principal (desktop + MobileMenu)
 * ------------------------------------------------------------
 * - href "#id" = âncora da home (fora da home vira "/#id").
 * - children = submenu: dropdown no desktop (hover + teclado) e
 *   submenu expansível no celular. O href do pai é o destino padrão.
 */

export interface NavItem {
  id: string;
  name: string;
  href: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  { id: "inicio", name: "Início", href: "/" },
  { id: "quem-somos", name: "Quem Somos", href: "#quem-somos" },
  // "Nossas Ações" removido: não levava a nenhuma seção existente
  {
    id: "coleta",
    name: "Coleta",
    href: "/agendar-coleta",
    children: [
      { id: "agendar-coleta", name: "Agendar coleta", href: "/agendar-coleta" },
      { id: "calendario-coleta", name: "Calendário", href: "/calendario-coleta" },
    ],
  },
  { id: "transparencia", name: "Transparência", href: "#transparencia" },
  // Mapa de apoiadores da home (ApoiadoresMapaSection, id="parceiros").
  { id: "mapa", name: "Mapa", href: "#parceiros" },
  { id: "noticias", name: "Notícias", href: "#noticias" },
  {
    id: "contato",
    name: "Contato",
    href: "#contato",
    children: [
      { id: "fale-conosco", name: "Fale conosco", href: "#contato" },
      { id: "denuncias", name: "Denúncias", href: "#denuncias" }, // seção de denúncia ambiental
    ],
  },
];

/** Âncoras viram "/#id" para funcionar em qualquer página (e no clique do meio) */
export const hrefReal = (href: string) => (href.startsWith("#") ? `/${href}` : href);
