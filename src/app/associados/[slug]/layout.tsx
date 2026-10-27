/**
 * Layout de /associados/[slug] — SEO do perfil público de um associado.
 * Só usa campos públicos (nome, cargo, bio) da view associados_publicos.
 * Se não achar o associado, a página mostra o aviso e não é indexada.
 */
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { clientePublico } from "@/lib/supabasePublico";
import { jsonLdMigalhas, metaPagina, semIndexar } from "@/lib/seo";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

async function buscar(slug: string) {
  try {
    const sb = clientePublico();
    if (!sb) return null;
    const { data, error } = await sb.from("associados_publicos").select("nome, cargo, bio").eq("slug", slug).maybeSingle();
    return error ? null : data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await buscar(decodeURIComponent(slug));
  if (!a) return { ...semIndexar, title: "Associado" };
  const bio = (a.bio ?? "").replace(/\s+/g, " ").trim();
  const descricao = bio
    ? bio.slice(0, 155)
    : `${a.nome}${a.cargo ? `, ${a.cargo}` : ""} na ACMRB (Reciclaê), associação de catadores de Baturité – CE.`;
  return metaPagina({ titulo: `${a.nome}${a.cargo ? ` – ${a.cargo}` : ""}`, descricao, caminho: `/associados/${slug}` });
}

export default async function Layout({ children, params }: Props) {
  const { slug } = await params;
  const a = await buscar(decodeURIComponent(slug));
  return (
    <>
      {a && (
        <JsonLd
          dados={jsonLdMigalhas([
            { nome: "Equipe", caminho: "/associados" },
            { nome: a.nome, caminho: `/associados/${slug}` },
          ])}
        />
      )}
      {children}
    </>
  );
}
