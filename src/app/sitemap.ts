/**
 * sitemap.xml dinâmico
 * ------------------------------------------------------------
 * Lista as páginas públicas fixas + cada notícia publicada + cada
 * associado ativo. As notícias vêm do Supabase (chave anon, só o que
 * é público). Se o banco estiver fora do ar, o sitemap sai só com as
 * páginas fixas (nunca quebra). Atualiza no máximo a cada 1 hora.
 */
import type { MetadataRoute } from "next";
import { clientePublico } from "@/lib/supabasePublico";
import { normalizarNoticia, visivelAoPublico } from "@/lib/noticias";
import { siteUrl } from "@/lib/siteUrl";

export const revalidate = 3600;

/** Páginas fixas públicas (as privadas — admin, login, conta — ficam de fora) */
const PAGINAS: { caminho: string; prioridade: number; frequencia: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { caminho: "/", prioridade: 1, frequencia: "weekly" },
  { caminho: "/quem-somos", prioridade: 0.9, frequencia: "monthly" },
  { caminho: "/noticias", prioridade: 0.8, frequencia: "daily" },
  { caminho: "/agendar-coleta", prioridade: 0.8, frequencia: "monthly" },
  { caminho: "/calendario-coleta", prioridade: 0.8, frequencia: "monthly" },
  { caminho: "/transparencia", prioridade: 0.7, frequencia: "weekly" },
  { caminho: "/projetos", prioridade: 0.7, frequencia: "monthly" },
  { caminho: "/parceiros", prioridade: 0.6, frequencia: "monthly" },
  { caminho: "/associados", prioridade: 0.6, frequencia: "monthly" },
  { caminho: "/privacidade", prioridade: 0.2, frequencia: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const agora = new Date();

  const fixas: MetadataRoute.Sitemap = PAGINAS.map((p) => ({
    url: `${base}${p.caminho}`,
    lastModified: agora,
    changeFrequency: p.frequencia,
    priority: p.prioridade,
  }));

  const sb = clientePublico();
  if (!sb) return fixas;

  // ----- Notícias publicadas -----
  let noticias: MetadataRoute.Sitemap = [];
  try {
    const { data } = await sb.from("noticias").select("*").eq("publicado", true).order("created_at", { ascending: false }).limit(1000);
    noticias = (data ?? [])
      .map(normalizarNoticia)
      .filter((n) => n.slug && visivelAoPublico(n))
      .map((n) => ({
        url: `${base}/noticias/${n.slug}`,
        lastModified: new Date(n.updated_at || n.publicado_em),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
  } catch {
    /* sem notícias no sitemap desta vez */
  }

  // ----- Associados ativos (página pública de cada um) -----
  let associados: MetadataRoute.Sitemap = [];
  try {
    const { data, error } = await sb.from("associados_publicos").select("slug");
    if (!error) {
      associados = (data ?? [])
        .filter((a: { slug: string | null }) => !!a.slug)
        .map((a: { slug: string | null }) => ({
          url: `${base}/associados/${a.slug}`,
          changeFrequency: "yearly" as const,
          priority: 0.4,
        }));
    }
  } catch {
    /* sem associados no sitemap desta vez */
  }

  return [...fixas, ...noticias, ...associados];
}
