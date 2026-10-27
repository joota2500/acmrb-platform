/**
 * seo — dados e atalhos de SEO (fonte única)
 * ------------------------------------------------------------
 * Nomes, descrição, palavras-chave e construtores de metadata e de
 * JSON-LD (dados estruturados que o Google lê). Os dados de contato
 * vêm de contatoInstitucional.ts, então nada é repetido nem inventado.
 */

import type { Metadata } from "next";
import { CONTATO, SEDE_COORDENADA, linkInstagram } from "@/lib/contatoInstitucional";
import { siteUrl } from "@/lib/siteUrl";

/** Nome oficial e nomes pelos quais as pessoas procuram a associação */
export const NOME_OFICIAL = "Associação dos Catadores de Materiais Recicláveis de Baturité";
export const SIGLA = "ACMRB";
export const NOME_MARCA = "Reciclaê";
export const NOMES_ALTERNATIVOS = [SIGLA, "Reciclaê", "Reciclae", "Associação Reciclaê", "Associação Reciclae"];

/** Título completo (página inicial) e descrição padrão do site */
export const TITULO_PADRAO = "ACMRB Reciclaê | Associação de Catadores de Baturité – CE";
export const DESCRICAO_PADRAO =
  "Associação Reciclaê (ACMRB): catadores de materiais recicláveis de Baturité – CE. Coleta seletiva, reciclagem, educação ambiental e transparência. Agende sua coleta.";

export const PALAVRAS_CHAVE = [
  "reciclae",
  "reciclaê",
  "associação reciclae",
  "associação reciclaê",
  "ACMRB",
  "associação de catadores Baturité",
  "catadores de materiais recicláveis Baturité",
  "reciclagem Baturité",
  "coleta seletiva Baturité",
  "reciclagem Ceará",
  "logística reversa",
  "educação ambiental",
];

/** Imagem padrão das prévias de link (WhatsApp, Facebook, Google) */
export const IMAGEM_PADRAO = {
  url: "/images/hero-reciclagem.jpg",
  width: 1587,
  height: 991,
  alt: "Catadores de materiais recicláveis separando garrafas plásticas em um galpão de reciclagem",
};

/** Endereço absoluto de um caminho do site (ex.: "/quem-somos") */
export const urlAbsoluta = (caminho = "/") => `${siteUrl()}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;

type OpcoesPagina = {
  titulo: string;
  descricao: string;
  /** caminho da página, começando com "/" (vira o canonical) */
  caminho: string;
  /** true = não aparece no Google (páginas de conta, login etc.) */
  semIndexar?: boolean;
  palavrasChave?: string[];
};

/**
 * Metadata padrão de uma página pública: título, descrição, canonical,
 * Open Graph e Twitter. Páginas privadas usam semIndexar.
 */
export function metaPagina({ titulo, descricao, caminho, semIndexar, palavrasChave }: OpcoesPagina): Metadata {
  const tituloSocial = `${titulo} | ${SIGLA} ${NOME_MARCA}`;
  return {
    title: titulo,
    description: descricao,
    keywords: palavrasChave,
    alternates: { canonical: caminho },
    openGraph: {
      type: "website",
      url: caminho,
      locale: "pt_BR",
      siteName: `${SIGLA} ${NOME_MARCA}`,
      title: tituloSocial,
      description: descricao,
      images: [IMAGEM_PADRAO],
    },
    twitter: { card: "summary_large_image", title: tituloSocial, description: descricao, images: [IMAGEM_PADRAO.url] },
    ...(semIndexar ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Metadata de páginas que NÃO devem aparecer no Google */
export const semIndexar: Metadata = { robots: { index: false, follow: false, nocache: true } };

/* ------------------------------------------------------------
 * JSON-LD (dados estruturados)
 * ---------------------------------------------------------- */

const telefoneInternacional = `+${CONTATO.whatsappNumero}`;

/** Organização (ONG) + negócio local, com os dados reais do código */
export function jsonLdOrganizacao() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": ["NGO", "LocalBusiness"],
    "@id": `${base}/#organizacao`,
    name: `${NOME_MARCA} – ${SIGLA}`,
    legalName: NOME_OFICIAL,
    alternateName: NOMES_ALTERNATIVOS,
    description: DESCRICAO_PADRAO,
    url: base,
    logo: `${base}/icons/icon-512.png`,
    image: `${base}${IMAGEM_PADRAO.url}`,
    foundingDate: "2025-07-10",
    taxID: CONTATO.cnpj,
    email: CONTATO.email,
    telephone: telefoneInternacional,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rua Kaolim, 252 – Manga",
      addressLocality: "Baturité",
      addressRegion: "CE",
      addressCountry: "BR",
    },
    // coordenada aproximada (bairro Manga) — ajustar em contatoInstitucional.ts
    geo: { "@type": "GeoCoordinates", latitude: SEDE_COORDENADA[0], longitude: SEDE_COORDENADA[1] },
    areaServed: { "@type": "City", name: "Baturité" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "atendimento",
      telephone: telefoneInternacional,
      email: CONTATO.email,
      availableLanguage: "pt-BR",
    },
    sameAs: [linkInstagram()],
  };
}

/** Site (ajuda o Google a mostrar o nome "ACMRB Reciclaê" nos resultados) */
export function jsonLdSite() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#site`,
    url: base,
    name: `${SIGLA} ${NOME_MARCA}`,
    alternateName: NOMES_ALTERNATIVOS,
    inLanguage: "pt-BR",
    publisher: { "@id": `${base}/#organizacao` },
  };
}

/** Trilha de navegação: itens em ordem, o último é a página atual */
export function jsonLdMigalhas(itens: { nome: string; caminho: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ nome: "Início", caminho: "/" }, ...itens].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nome,
      item: urlAbsoluta(item.caminho),
    })),
  };
}
