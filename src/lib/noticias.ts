/**
 * Notícias — tipos, constantes e utilitários compartilhados
 * ------------------------------------------------------------
 * Usado pela home (NewsSection), pela página /noticias, pela página
 * da notícia e pelo painel. Pode ser importado no servidor e no
 * navegador (não importa nenhum cliente Supabase).
 *
 * Compatibilidade: se a migration 20261020220000_noticias_completo.sql
 * ainda não rodou, as colunas novas (status, tags, galeria...) não
 * existem. Por isso as consultas usam select("*") e tudo passa por
 * normalizarNoticia(), que preenche valores padrão.
 */

export type StatusNoticia = "rascunho" | "publicado" | "agendado" | "arquivado";

export interface ItemGaleria {
  url: string;
  legenda?: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  imagem_url: string;
  imagem_alt: string;
  imagem_legenda: string;
  imagem_credito: string;
  tags: string[];
  destaque: boolean;
  ordem_destaque: number | null;
  status: StatusNoticia;
  publicado_em: string; // published_at ou created_at
  autor_nome: string;
  tempo_leitura: number;
  visualizacoes: number;
  fonte_url: string;
  galeria: ItemGaleria[];
  seo_titulo: string;
  seo_descricao: string;
  created_at: string;
  updated_at: string;
}

export const CATEGORIAS_NOTICIA = [
  "Projetos",
  "Meio Ambiente",
  "Ações Sociais",
  "Educação Ambiental",
  "Parcerias ESG",
  "Logística Reversa",
  "Institucional",
] as const;

export const ROTULO_STATUS: Record<StatusNoticia, string> = {
  rascunho: "Rascunho",
  publicado: "Publicada",
  agendado: "Agendada",
  arquivado: "Arquivada",
};

export const LIMITE_RESUMO = 280;
export const LIMITE_SEO_TITULO = 60;
export const LIMITE_SEO_DESCRICAO = 160;

const STATUS_VALIDOS: StatusNoticia[] = ["rascunho", "publicado", "agendado", "arquivado"];

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Converte a linha do banco (com ou sem colunas novas) em Noticia */
export function normalizarNoticia(r: any): Noticia {
  const status: StatusNoticia = STATUS_VALIDOS.includes(r?.status)
    ? r.status
    : r?.publicado === false
      ? "rascunho"
      : "publicado";

  let galeria: ItemGaleria[] = [];
  if (Array.isArray(r?.galeria)) {
    galeria = r.galeria
      .map((g: any) => (typeof g === "string" ? { url: g } : { url: g?.url, legenda: g?.legenda }))
      .filter((g: ItemGaleria) => typeof g.url === "string" && g.url);
  }

  const conteudo = String(r?.conteudo ?? "");

  return {
    id: String(r?.id ?? ""),
    titulo: String(r?.titulo ?? "Sem título"),
    slug: String(r?.slug || r?.id || ""),
    resumo: String(r?.resumo ?? ""),
    conteudo,
    categoria: String(r?.categoria ?? ""),
    imagem_url: String(r?.imagem_url ?? ""),
    imagem_alt: String(r?.banner_alt || r?.titulo || ""),
    imagem_legenda: String(r?.imagem_legenda ?? ""),
    imagem_credito: String(r?.imagem_credito ?? ""),
    tags: Array.isArray(r?.tags) ? r.tags.filter(Boolean).map(String) : [],
    destaque: r?.destaque === true,
    ordem_destaque: typeof r?.ordem_destaque === "number" ? r.ordem_destaque : null,
    status,
    publicado_em: String(r?.published_at || r?.created_at || new Date().toISOString()),
    autor_nome: String(r?.autor_nome || "ACMRB"),
    tempo_leitura: Number(r?.tempo_leitura) > 0 ? Number(r.tempo_leitura) : calcularTempoLeitura(conteudo),
    visualizacoes: Number(r?.visualizacoes) || 0,
    fonte_url: String(r?.fonte_url ?? ""),
    galeria,
    seo_titulo: String(r?.seo_title ?? ""),
    seo_descricao: String(r?.seo_description ?? ""),
    created_at: String(r?.created_at ?? ""),
    updated_at: String(r?.updated_at || r?.created_at || ""),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** A notícia pode aparecer no site agora? (publicada/agendada com data já passada) */
export function visivelAoPublico(n: Noticia, agora = Date.now()): boolean {
  return (n.status === "publicado" || n.status === "agendado") && new Date(n.publicado_em).getTime() <= agora;
}

/** Ordena da mais recente para a mais antiga */
export function ordenarRecentes(lista: Noticia[]): Noticia[] {
  return [...lista].sort((a, b) => +new Date(b.publicado_em) - +new Date(a.publicado_em));
}

/**
 * Notícias da home: no MÁXIMO `max` (3).
 * 1º os destaques (por ordem_destaque); se faltarem, completa com as
 * mais recentes publicadas, sem repetir (dedup por id).
 */
export function selecionarHome(lista: Noticia[], max = 3): Noticia[] {
  const recentes = ordenarRecentes(lista);
  const destaques = recentes
    .filter((n) => n.destaque)
    .sort((a, b) => (a.ordem_destaque ?? 999) - (b.ordem_destaque ?? 999));
  const vistos = new Set<string>();
  const saida: Noticia[] = [];
  for (const n of [...destaques, ...recentes]) {
    if (saida.length >= max) break;
    if (vistos.has(n.id)) continue;
    vistos.add(n.id);
    saida.push(n);
  }
  return saida;
}

/** Gera slug a partir do título (sem acentos, minúsculo, com hífens) */
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/** Minutos de leitura (≈200 palavras/min, mínimo 1) */
export function calcularTempoLeitura(texto: string): number {
  const palavras = texto.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
}

export function formatarData(iso: string, longo = false): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", longo
    ? { day: "2-digit", month: "long", year: "numeric" }
    : { day: "2-digit", month: "short", year: "numeric" });
}

export function pareceUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

/** Texto puro do conteúdo (sem marcações) — usado em resumos automáticos */
export function textoPuro(conteudo: string): string {
  return conteudo
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s*(#{1,3}|>|-)\s+/gm, " ")
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
