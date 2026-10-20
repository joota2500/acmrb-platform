/**
 * Cliente Supabase com a service role — SOMENTE no servidor
 * ------------------------------------------------------------
 * Usado pelas rotas /api/admin/* para criar/excluir usuários do Auth.
 * NUNCA importe este arquivo em componentes "use client": a chave
 * SUPABASE_SERVICE_ROLE_KEY ignora todas as regras de segurança (RLS).
 * Ela não tem o prefixo NEXT_PUBLIC_, então o Next não a envia ao
 * navegador.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const MSG_SEM_CHAVE =
  "A chave SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor. " +
  "Pegue em Supabase → Project Settings → API → service_role, adicione " +
  "SUPABASE_SERVICE_ROLE_KEY=... no arquivo .env.local e reinicie o npm run dev.";

/** Retorna o cliente admin ou null se a chave não estiver configurada */
export function clienteServidor(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) return null;
  return createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
