/**
 * compartilharNoticia — utilidades do botão "Compartilhar" das notícias
 * ------------------------------------------------------------
 * - endereço público da notícia
 * - imagem de capa como File (para o compartilhamento nativo do celular)
 * - links de WhatsApp, Facebook, X (Twitter) e Telegram
 */

import { textoPuro } from "@/lib/noticias";

export interface DadosCompartilhar {
  titulo: string;
  resumo: string;
  slug: string;
  imagemUrl?: string | null;
}

/** Endereço público da notícia (usa NEXT_PUBLIC_SITE_URL quando existir) */
export function urlDaNoticia(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
  return `${base}/noticias/${encodeURIComponent(slug)}`;
}

/** Resumo curto para a mensagem (usa o resumo; se faltar, o começo do texto) */
export function resumoCurto(resumo: string, max = 200, conteudo = ""): string {
  const t = (resumo || textoPuro(conteudo)).trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

/** Mensagem completa: título, resumo e link */
export const mensagemCompleta = (d: DadosCompartilhar, url: string) =>
  [d.titulo, d.resumo && resumoCurto(d.resumo), url].filter(Boolean).join("\n\n");

export function linksRedes(d: DadosCompartilhar, url: string) {
  const u = encodeURIComponent(url);
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(mensagemCompleta(d, url))}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(d.titulo)}&url=${u}`,
    telegram: `https://t.me/share/url?url=${u}&text=${encodeURIComponent(d.titulo)}`,
  };
}

/** Converte qualquer imagem (ex.: WebP) em JPEG, formato aceito por todos os apps */
async function paraJpeg(blob: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(blob);
  const maxLado = 1600;
  const escala = Math.min(1, maxLado / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * escala);
  canvas.height = Math.round(bmp.height * escala);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((ok, erro) => canvas.toBlob((b) => (b ? ok(b) : erro(new Error("toBlob"))), "image/jpeg", 0.88));
}

/** Baixa a imagem de capa e devolve como arquivo (ou null se não for possível) */
export async function imagemComoArquivo(url: string, slug: string): Promise<File | null> {
  try {
    const r = await fetch(url, { mode: "cors" });
    if (!r.ok) return null;
    let blob = await r.blob();
    if (!/^image\/(jpeg|png)$/.test(blob.type)) blob = await paraJpeg(blob);
    const ext = blob.type === "image/png" ? "png" : "jpg";
    return new File([blob], `${slug.slice(0, 60) || "noticia"}.${ext}`, { type: blob.type });
  } catch {
    return null; // sem CORS ou sem rede: compartilha sem a imagem
  }
}
