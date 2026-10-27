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
import { siteUrl } from "@/lib/siteUrl";
import JsonLd from "@/components/seo/JsonLd";
import { IMAGEM_PADRAO, NOME_OFICIAL, SIGLA, NOME_MARCA, jsonLdMigalhas } from "@/lib/seo";
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
  const base = siteUrl();
  const titulo = n.seo_titulo || n.titulo;
  // prévia do link (WhatsApp, Facebook, X…): resumo da notícia, sem marcações
  const descricao = (n.seo_descricao || n.resumo || textoPuro(n.conteudo)).slice(0, 200);
  const endereco = `${base}/noticias/${n.slug}`;
  // imagem de capa (ou a imagem padrão do site) sempre com endereço absoluto
  const capa = n.imagem_url ? new URL(n.imagem_url, base).toString() : `${base}${IMAGEM_PADRAO.url}`;
  return {
    metadataBase: new URL(base),
    title: titulo,
    description: descricao,
    keywords: n.tags,
    authors: [{ name: n.autor_nome }],
    alternates: { canonical: endereco },
    openGraph: {
      type: "article",
      url: endereco,
      locale: "pt_BR",
      siteName: `${SIGLA} ${NOME_MARCA}`,
      title: titulo,
      description: descricao,
      publishedTime: n.publicado_em,
      modifiedTime: n.updated_at || undefined,
      authors: [n.autor_nome],
      section: n.categoria || undefined,
      tags: n.tags,
      images: [{ url: capa, alt: n.imagem_alt || n.titulo }],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricao,
      images: [capa],
    },
  };
}

export default async function NoticiaPage({ params }: Props) {
  const { slug } = await params;
  const r = await carregar(slug);
  if (!r) notFound();

  // ----- Dados estruturados: NewsArticle + trilha de navegação -----
  const n = r.noticia;
  const base = siteUrl();
  const endereco = `${base}/noticias/${n.slug}`;
  const capa = n.imagem_url ? new URL(n.imagem_url, base).toString() : `${base}${IMAGEM_PADRAO.url}`;
  const artigo = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": endereco },
    headline: (n.seo_titulo || n.titulo).slice(0, 110),
    description: (n.seo_descricao || n.resumo || textoPuro(n.conteudo)).slice(0, 200),
    image: [capa],
    datePublished: n.publicado_em,
    dateModified: n.updated_at || n.publicado_em,
    inLanguage: "pt-BR",
    articleSection: n.categoria || undefined,
    keywords: n.tags.length ? n.tags.join(", ") : undefined,
    // autor institucional (ACMRB/Reciclaê) vira Organization; nome de pessoa vira Person
    author:
      !n.autor_nome || /acmrb|recicla/i.test(n.autor_nome)
        ? { "@type": "Organization", name: SIGLA, url: base }
        : { "@type": "Person", name: n.autor_nome },
    publisher: {
      "@type": "Organization",
      name: NOME_OFICIAL,
      alternateName: `${SIGLA} ${NOME_MARCA}`,
      logo: { "@type": "ImageObject", url: `${base}/icons/icon-512.png` },
    },
  };

  return (
    <>
      <Header />
      <JsonLd
        dados={[
          artigo,
          jsonLdMigalhas([
            { nome: "Notícias", caminho: "/noticias" },
            { nome: n.titulo, caminho: `/noticias/${n.slug}` },
          ]),
        ]}
      />
      <NoticiaDetalhe {...r} />
      <Footer />
    </>
  );
}
