/**
 * Hash da rede (IP) para o middleware (runtime "edge", sem módulo "crypto")
 * ------------------------------------------------------------
 * Gera EXATAMENTE o mesmo valor de hashar() em segurancaServidor.ts
 * (HMAC-SHA256 com HASH_SECRET ou a chave do servidor, primeiros 40
 * caracteres em hexadecimal), para comparar com ip_hash gravado no banco.
 */

export async function hashEdge(valor: string): Promise<string> {
  const segredo = process.env.HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "acmrb";
  const enc = new TextEncoder();
  const chave = await crypto.subtle.importKey("raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const assinatura = await crypto.subtle.sign("HMAC", chave, enc.encode(valor.trim().toLowerCase()));
  const hex = Array.from(new Uint8Array(assinatura)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex.slice(0, 40);
}

/** Mesmo cálculo de hashDoIp(): hash de "ip:<endereço>" */
export const hashDoIpEdge = (ip: string) => hashEdge(`ip:${ip}`);
