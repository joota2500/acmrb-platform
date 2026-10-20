"use client";

/**
 * Notícias no painel — salvar, enviar imagens, checar slug
 * ------------------------------------------------------------
 * Só o ADM DEUS chega aqui (permissions.ts + RLS no banco).
 * salvarNoticia tenta gravar com todas as colunas; se o banco
 * ainda não tiver as colunas novas (migration 20261020220000 não
 * rodada), grava só as antigas e avisa (semColunasNovas = true).
 */

import { supabase } from "@/lib/supabase";
import { gerarSlug, type ItemGaleria, type StatusNoticia } from "@/lib/noticias";

export const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const TAMANHO_MAX_MB = 5;

export interface DadosNoticia {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  tags: string[];
  imagem_url: string;
  imagem_alt: string;
  imagem_legenda: string;
  imagem_credito: string;
  galeria: ItemGaleria[];
  status: StatusNoticia;
  publicado_em: string | null; // ISO
  destaque: boolean;
  ordem_destaque: number | null;
  autor_nome: string;
  tempo_leitura: number;
  fonte_url: string;
  seo_titulo: string;
  seo_descricao: string;
}

const COLUNAS_ANTIGAS = [
  "titulo", "slug", "resumo", "conteudo", "categoria", "imagem_url", "banner_alt", "destaque",
  "publicado", "autor_nome", "tempo_leitura", "published_at", "seo_title", "seo_description", "seo_keywords",
];

function paraBanco(d: DadosNoticia): Record<string, unknown> {
  const publicado = d.status === "publicado" || d.status === "agendado";
  return {
    titulo: d.titulo.trim(),
    slug: d.slug.trim(),
    resumo: d.resumo.trim() || null,
    conteudo: d.conteudo,
    categoria: d.categoria || null,
    tags: d.tags,
    imagem_url: d.imagem_url || null,
    banner_alt: d.imagem_alt || null,
    imagem_legenda: d.imagem_legenda || null,
    imagem_credito: d.imagem_credito || null,
    galeria: d.galeria,
    status: d.status,
    publicado,
    published_at: d.publicado_em ?? (publicado ? new Date().toISOString() : null),
    destaque: d.destaque,
    ordem_destaque: d.destaque ? d.ordem_destaque : null,
    autor_nome: d.autor_nome.trim() || "ACMRB",
    tempo_leitura: d.tempo_leitura,
    fonte_url: d.fonte_url.trim() || null,
    seo_title: d.seo_titulo.trim() || null,
    seo_description: d.seo_descricao.trim() || null,
    seo_keywords: d.tags.join(", ") || null,
  };
}

const ehColunaFaltando = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42703" || e.code === "PGRST204" || /column/i.test(e.message ?? ""));

export async function salvarNoticia(dados: DadosNoticia, id?: string | null) {
  const completo = paraBanco(dados);
  const gravar = (payload: Record<string, unknown>) =>
    id
      ? supabase.from("noticias").update(payload).eq("id", id).select("id, slug").single()
      : supabase.from("noticias").insert(payload).select("id, slug").single();

  let { data, error } = await gravar(completo);
  let semColunasNovas = false;

  if (ehColunaFaltando(error)) {
    const antigo = Object.fromEntries(Object.entries(completo).filter(([k]) => COLUNAS_ANTIGAS.includes(k)));
    ({ data, error } = await gravar(antigo));
    semColunasNovas = true;
  }
  return { data, error, semColunasNovas };
}

/** Atualização parcial (publicar, destacar...) com a mesma tolerância a colunas */
export async function atualizarCampos(id: string, campos: Record<string, unknown>) {
  let { error } = await supabase.from("noticias").update(campos).eq("id", id);
  if (ehColunaFaltando(error)) {
    const antigo = Object.fromEntries(Object.entries(campos).filter(([k]) => COLUNAS_ANTIGAS.includes(k)));
    if (Object.keys(antigo).length) ({ error } = await supabase.from("noticias").update(antigo).eq("id", id));
  }
  return error;
}

/** true se outro registro já usa esse slug */
export async function slugEmUso(slug: string, ignorarId?: string | null) {
  let q = supabase.from("noticias").select("id").eq("slug", slug).limit(1);
  if (ignorarId) q = q.neq("id", ignorarId);
  const { data } = await q;
  return (data?.length ?? 0) > 0;
}

/** Valida tipo/tamanho; devolve a mensagem de erro ou null */
export function validarImagem(arquivo: File): string | null {
  if (!TIPOS_IMAGEM.includes(arquivo.type)) return "Formato não aceito. Use JPG, PNG, WEBP ou GIF.";
  if (arquivo.size > TAMANHO_MAX_MB * 1024 * 1024) return `A imagem passa de ${TAMANHO_MAX_MB} MB. Reduza o tamanho e tente de novo.`;
  return null;
}

/** Envia para o bucket "noticias" e devolve a URL pública */
export async function enviarImagem(arquivo: File, pasta: "capas" | "galeria") {
  const ext = (arquivo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = gerarSlug(arquivo.name.replace(/\.[^.]+$/, "")) || "imagem";
  const caminho = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${base}.${ext}`;
  const { error } = await supabase.storage
    .from("noticias")
    .upload(caminho, arquivo, { cacheControl: "31536000", upsert: false, contentType: arquivo.type });
  if (error) throw new Error(error.message || "Falha ao enviar a imagem.");
  return supabase.storage.from("noticias").getPublicUrl(caminho).data.publicUrl;
}
