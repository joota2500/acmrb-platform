export interface NavItem {
  id: string;
  name: string;
  href: string;
}

export const navigation: NavItem[] = [
  { id: "inicio", name: "Início", href: "/" },
  { id: "quem-somos", name: "Quem Somos", href: "#quem-somos" },
  // "Nossas Ações" removido: não levava a nenhuma seção existente
  { id: "transparencia", name: "Transparência", href: "#transparencia" },
  // Mapa de apoiadores da home (ApoiadoresMapaSection, id="parceiros").
  // Fora da home o Header/MobileMenu levam para "/#parceiros".
  { id: "mapa", name: "Mapa", href: "#parceiros" },
  { id: "noticias", name: "Notícias", href: "#noticias" },
  { id: "denuncias", name: "Denúncias", href: "#denuncias" }, // rola até a seção de denúncia ambiental
  { id: "contato", name: "Contato", href: "#contato" },
];
