/**
 * Navegação do painel admin (fonte única)
 * ------------------------------------------------------------
 * Cada item tem um "id" que vai na URL (?secao=associados), o rótulo,
 * o ícone (lucide) e se a seção já está implementada. Itens com
 * pronto = false mostram o selo "em breve".
 * "rapido" = aparece na barra inferior do celular.
 */

import {
  CalendarDays,
  FileText,
  FolderKanban,
  Handshake,
  LayoutDashboard,
  Leaf,
  Newspaper,
  PackageSearch,
  Settings,
  ShieldAlert,
  UserCog,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SecaoId =
  | "dashboard"
  | "noticias"
  | "projetos"
  | "parceiros"
  | "associados"
  | "denuncias"
  | "materiais"
  | "coletas"
  | "esg"
  | "relatorios"
  | "administradores"
  | "configuracoes"
  | "minha-conta";

export interface ItemNav {
  id: SecaoId;
  rotulo: string;
  icone: LucideIcon;
  pronto: boolean;
  rapido?: boolean;
  descricao: string;
}

export interface GrupoNav {
  titulo: string;
  itens: ItemNav[];
}

export const GRUPOS_NAV: GrupoNav[] = [
  {
    titulo: "Visão geral",
    itens: [
      { id: "dashboard", rotulo: "Dashboard", icone: LayoutDashboard, pronto: true, rapido: true, descricao: "Resumo da operação e indicadores" },
    ],
  },
  {
    titulo: "Conteúdo",
    itens: [
      { id: "noticias", rotulo: "Notícias", icone: Newspaper, pronto: true, rapido: true, descricao: "Publicações do site (somente ADM DEUS)" },
      { id: "projetos", rotulo: "Projetos", icone: FolderKanban, pronto: false, descricao: "Projetos e campanhas" },
      { id: "parceiros", rotulo: "Parceiros", icone: Handshake, pronto: true, descricao: "Empresas e instituições parceiras" },
    ],
  },
  {
    titulo: "Pessoas",
    itens: [
      { id: "associados", rotulo: "Associados", icone: Users, pronto: true, rapido: true, descricao: "Cadastro e gestão de associados" },
      { id: "denuncias", rotulo: "Denúncias", icone: ShieldAlert, pronto: false, descricao: "Denúncias ambientais recebidas" },
    ],
  },
  {
    titulo: "Operação",
    itens: [
      { id: "materiais", rotulo: "Materiais", icone: PackageSearch, pronto: true, rapido: true, descricao: "Registros de materiais recicláveis" },
      { id: "coletas", rotulo: "Coletas", icone: CalendarDays, pronto: false, descricao: "Agenda de coletas" },
      { id: "esg", rotulo: "Indicadores ESG", icone: Leaf, pronto: true, descricao: "Métricas ambientais e sociais" },
    ],
  },
  {
    titulo: "Sistema",
    itens: [
      { id: "relatorios", rotulo: "Relatórios", icone: FileText, pronto: true, descricao: "Documentos públicos da transparência" },
      { id: "administradores", rotulo: "Administradores", icone: UserCog, pronto: true, descricao: "Quem pode acessar o painel (máx. 2)" },
      { id: "configuracoes", rotulo: "Configurações", icone: Settings, pronto: false, descricao: "Configurações do sistema" },
      { id: "minha-conta", rotulo: "Minha conta", icone: UserRound, pronto: true, descricao: "Seu perfil, foto e senha" },
    ],
  },
];

export const ITENS_NAV: ItemNav[] = GRUPOS_NAV.flatMap((g) => g.itens);

export const SECAO_PADRAO: SecaoId = "dashboard";

/** Converte o valor da URL em uma seção válida (ou a padrão). */
export function secaoValida(valor: string | null): SecaoId {
  return (ITENS_NAV.find((i) => i.id === valor)?.id ?? SECAO_PADRAO) as SecaoId;
}

export const itemPorId = (id: SecaoId) => ITENS_NAV.find((i) => i.id === id)!;
