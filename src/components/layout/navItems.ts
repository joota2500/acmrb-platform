export interface NavItem {
  id: string;
  name: string;
  href: string;
}

export const navigation: NavItem[] = [
  { id: "inicio", name: "Início", href: "/" },
  { id: "quem-somos", name: "Quem Somos", href: "#quem-somos" },
  { id: "acoes", name: "Nossas Ações", href: "#projetos" },
  { id: "transparencia", name: "Transparência", href: "#transparencia" },
  { id: "noticias", name: "Notícias", href: "#noticias" },
  { id: "denuncias", name: "Denúncias", href: "#denuncias" }, // rola até a seção de denúncia ambiental
  { id: "contato", name: "Contato", href: "#contato" },
];
