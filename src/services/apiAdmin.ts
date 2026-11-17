"use client";

/**
 * Chamada às rotas /api/admin/* enviando o token da sessão atual.
 * Lança Error com a mensagem em português vinda do servidor.
 */

import { supabase } from "@/lib/supabase";

export async function chamarApi(metodo: "POST" | "PATCH" | "DELETE", url: string, corpo?: unknown) {
  const { data } = await supabase.auth.getSession();
  const resp = await fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session?.access_token ?? ""}`,
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json.erro ?? "Erro inesperado no servidor.");
  return json;
}

/** Endereço para onde o link de redefinição de senha leva */
export const urlRedefinir = () => `${window.location.origin}/redefinir-senha`;

/** Espera entre envios de e-mail de redefinição (o SMTP padrão do Supabase é limitado) */
export const ESPERA_EMAIL_SEG = 60;
