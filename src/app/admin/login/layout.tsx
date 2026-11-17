/**
 * Layout de /admin/login — só SEO: fora do Google (noindex, nofollow).
 * O /admin já é bloqueado no robots.txt e fica fora do sitemap.
 */
import type { Metadata } from "next";
import { semIndexar } from "@/lib/seo";

export const metadata: Metadata = { ...semIndexar, title: "Acesso administrativo" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
