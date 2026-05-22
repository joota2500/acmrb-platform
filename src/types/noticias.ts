export type NoticiaDB = {

  id: string;

  titulo: string;

  resumo: string;

  conteudo: string;

  categoria: string;

  imagem_url: string;

  destaque: boolean;

  publicado: boolean;

  fixada: boolean;

  visualizacoes: number;

  created_at: string;

  seo_title: string;

  seo_description: string;

  seo_keywords: string;

  autor_nome: string;

  banner_alt: string;

};