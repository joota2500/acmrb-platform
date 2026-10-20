/**
 * Tipos da página /quem-somos
 * ------------------------------------------------------------
 * QuemSomosBloco  → linha da tabela quem_somos_conteudo (Supabase).
 * AssociadoPublico → somente os campos PÚBLICOS de "associados"
 *   (telefone, e-mail e endereço não são buscados nesta página).
 * ParceiroPublico → campos exibidos da tabela "parceiros".
 */

export type QuemSomosSecao =
  | "hero"
  | "citacao"
  | "historia"
  | "timeline"
  | "missao"
  | "visao"
  | "valor"
  | "atuacao"
  | "futuro";

export interface QuemSomosBloco {
  secao: QuemSomosSecao;
  ordem: number;
  /** Período/data na linha do tempo ou selo de seção */
  rotulo: string | null;
  titulo: string | null;
  subtitulo: string | null;
  texto: string | null;
  /** Nome de um ícone do lucide-react (ex.: "Leaf") */
  icone: string | null;
}

export interface AssociadoPublico {
  id: string;
  nome: string;
  slug: string | null;
  cargo: string | null;
  tipo_associado: string | null;
  foto_url: string | null;
  destaque: boolean;
}

export interface ParceiroPublico {
  id: string;
  nome: string;
  categoria: string | null;
  logo_url: string | null;
  site_url: string | null;
}

/** De onde veio o conteúdo institucional exibido */
export type OrigemConteudo = "banco" | "local";
