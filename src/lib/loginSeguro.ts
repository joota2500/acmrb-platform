/**
 * Proteção de login/cadastro/recuperação (lado do navegador)
 * ------------------------------------------------------------
 * Fala com /api/seguranca/login:
 *   podeTentar()        → pergunta ANTES se a pessoa/rede está bloqueada
 *                         (várias senhas erradas, muitos cadastros...).
 *   registrarResultado()→ avisa DEPOIS se deu certo ou errado (vai para o
 *                         log do painel; sucesso é provado com o token).
 * Se a rota estiver fora do ar, NÃO impede o login (falha aberta).
 */

import { supabase } from "@/lib/supabase";

export type TipoTentativa = "login" | "cadastro" | "recuperar";

export async function podeTentar(tipo: TipoTentativa, email: string): Promise<{ ok: boolean; mensagem?: string }> {
  try {
    const r = await fetch("/api/seguranca/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "verificar", tipo, email: email.trim().toLowerCase() }),
    });
    if (r.status === 429) {
      const j = await r.json().catch(() => ({}));
      return { ok: false, mensagem: j.mensagem ?? "Muitas tentativas. Aguarde alguns minutos." };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function registrarResultado(tipo: TipoTentativa, email: string, sucesso: boolean, motivo?: string) {
  try {
    const token = sucesso ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
    await fetch("/api/seguranca/login", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ acao: "resultado", tipo, email: email.trim().toLowerCase(), sucesso, motivo }),
    });
  } catch {
    /* o log nunca atrapalha o login */
  }
}
