/**
 * /noticias/[slug] — notícia completa
 * ------------------------------------------------------------
 * Server component: busca a notícia no servidor (chave anon, respeita
 * a RLS) para gerar o SEO/OpenGraph com generateMetadata. A parte
 * interativa (compartilhar, barra de leitura, galeria, contagem de
 * visualização) fica em NoticiaDetalhe (cliente).
 * Compatível com links antigos por id: se o slug não existir e o
 * valor parecer um uuid, procura pelo id.
 */

import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NoticiaDetalhe from "@/components/noticias/NoticiaDetalhe";
import { clientePublico } from "@/lib/supabasePublico";
import {
  normalizarNoticia,
  ordenarRecentes,
  pareceUuid,
  textoPuro,
  visivelAoPublico,
  type Noticia,
} from "@/lib/noticias";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/** Carrega a notícia e a lista de publicadas (para relacionadas e anterior/próxima) */
const carregar = cache(async (slugBruto: string) => {
  const slug = decodeURIComponent(slugBruto);
  const sb = clientePublico();
  if (!sb) return null;

  let { data } = await sb.from("noticias").select("*").eq("slug", slug).maybeSingle();
  if (!data && pareceUuid(slug)) {
    ({ data } = await sb.from("noticias").select("*").eq("id", slug).maybeSingle());
  }
  if (!data) return null;

  const noticia = normalizarNoticia(data);
  if (!visivelAoPublico(noticia)) return null;

  const { data: todas } = await sb
    .from("noticias")
    .select("*")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
    .limit(300);

  const lista = ordenarRecentes((todas ?? []).map(normalizarNoticia).filter((n) => visivelAoPublico(n)));
  const i = lista.findIndex((n) => n.id === noticia.id);
  // lista vai da mais nova para a mais antiga
  const proxima: Noticia | null = i > 0 ? lista[i - 1] : null;
  const anterior: Noticia | null = i >= 0 && i < lista.length - 1 ? lista[i + 1] : null;

  const outras = lista.filter((n) => n.id !== noticia.id);
  const mesmas = outras.filter((n) => noticia.categoria && n.categoria === noticia.categoria);
  const porTag = outras.filter((n) => !mesmas.includes(n) && n.tags.some((t) => noticia.tags.includes(t)));
  const relacionadas = [...mesmas, ...porTag, ...outras.filter((n) => !mesmas.includes(n) && !porTag.includes(n))].slice(0, 3);

  return { noticia, anterior, proxima, relacionadas };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await carregar(slug);
  if (!r) return { title: "Notícia não encontrada" };
  const n = r.noticia;
  const descricao = (n.seo_descricao || n.resumo || textoPuro(n.conteudo)).slice(0, 160);
  return {
    title: n.seo_titulo || n.titulo,
    description: descricao,
    keywords: n.tags,
    authors: [{ name: n.autor_nome }],
    alternates: { canonical: `/noticias/${n.slug}` },
    openGraph: {
      type: "article",
      locale: "pt_BR",
      siteName: "ACMRB",
      title: n.seo_titulo || n.titulo,
      description: descricao,
      publishedTime: n.publicado_em,
      modifiedTime: n.updated_at || undefined,
      section: n.categoria || undefined,
      tags: n.tags,
      images: n.imagem_url ? [{ url: n.imagem_url, alt: n.imagem_alt }] : undefined,
    },
    twitter: {
      card: n.imagem_url ? "summary_large_image" : "summary",
      title: n.seo_titulo || n.titulo,
      description: descricao,
      images: n.imagem_url ? [n.imagem_url] : undefined,
    },
  };
}

export default async function NoticiaPage({ params }: Props) {
  const { slug } = await params;
  const r = await carregar(slug);
  if (!r) notFound();

  return (
    <>
      <Header />
      <NoticiaDetalhe {...r} />
      <Footer />
    </>
  );
}
