/**
 * Layout do login do ADM DEUS — só SEO: noindex, nofollow, sem cache.
 * Fica fora do sitemap. O endereço NÃO entra no robots.txt de propósito:
 * uma linha "Disallow" mostraria o endereço secreto para qualquer pessoa.
 */
import type { Metadata } from "next";
import { semIndexar } from "@/lib/seo";

export const metadata: Metadata = { ...semIndexar, title: "Acesso restrito" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
