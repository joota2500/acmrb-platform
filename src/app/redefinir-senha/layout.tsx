/**
 * Layout de /redefinir-senha — só para SEO: esta página NÃO deve aparecer no Google
 * (noindex). A página em si é componente cliente.
 */
import type { Metadata } from "next";
import { semIndexar } from "@/lib/seo";

export const metadata: Metadata = { ...semIndexar, title: "Acesso" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
