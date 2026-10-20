/**
 * Cliente Supabase público (chave anon) para Server Components
 * ------------------------------------------------------------
 * Usado em páginas renderizadas no servidor (ex.: /noticias/[slug]
 * com generateMetadata). Não guarda sessão e respeita a RLS, então
 * só enxerga o que é público. Não use a service role aqui.
 */

import { createClient } from "@supabase/supabase-js";

export function clientePublico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return null;
  return createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
