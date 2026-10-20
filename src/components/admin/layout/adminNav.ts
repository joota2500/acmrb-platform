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
  LayoutDashboard,
  Map as MapaIcone,
  MapPinned,
  Leaf,
  Newspaper,
  PackageSearch,
  Settings,
  Truck,
  ShieldAlert,
  UserCog,
  UserRound,
  UserSearch,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SecaoId =
  | "dashboard"
  | "noticias"
  | "projetos"
  | "visao-mapa"
  | "apoiadores"
  | "logistica"
  | "associados"
  | "visitantes"
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
      { id: "dashboard", rotulo: "Visão geral", icone: LayoutDashboard, pronto: true, rapido: true, descricao: "Indicadores, gráficos, pendências e atalhos" },
    ],
  },
  {
    titulo: "Conteúdo",
    itens: [
      { id: "noticias", rotulo: "Notícias", icone: Newspaper, pronto: true, rapido: true, descricao: "Publicações do site (somente ADM DEUS)" },
      { id: "projetos", rotulo: "Projetos", icone: FolderKanban, pronto: false, descricao: "Projetos e campanhas" },
      { id: "apoiadores", rotulo: "Apoiadores e Mapa", icone: MapPinned, pronto: true, descricao: "Apoiadores e pontos no mapa de Baturité (somente ADM DEUS)" },
      { id: "logistica", rotulo: "Logística Reversa", icone: Truck, pronto: true, descricao: "Empresas parceiras e repasses de material (somente ADM DEUS)" },
      // substitui a antiga tela "Parceiros" (redundante com Apoiadores)
      { id: "visao-mapa", rotulo: "Visão do Mapa", icone: MapaIcone, pronto: true, descricao: "Mapa geral, estatísticas, pendentes de localização e exportação (somente ADM DEUS)" },
    ],
  },
  {
    titulo: "Pessoas",
    itens: [
      { id: "associados", rotulo: "Associados", icone: Users, pronto: true, rapido: true, descricao: "Cadastro e gestão de associados" },
      { id: "visitantes", rotulo: "Usuários / Visitantes", icone: UserSearch, pronto: true, descricao: "Visitantes cadastrados, atividade e gestão (somente ADM DEUS)" },
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
