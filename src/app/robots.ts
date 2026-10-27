/**
 * robots.txt — o que o Google pode ou não visitar
 * ------------------------------------------------------------
 * Bloqueamos só o painel (/admin) e as rotas internas (/api).
 * Login, conta, mensagens etc. ficam FORA do Google por "noindex"
 * dentro das próprias páginas (o Google precisa conseguir abrir a
 * página para enxergar o noindex; bloquear aqui impediria isso).
 */
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
