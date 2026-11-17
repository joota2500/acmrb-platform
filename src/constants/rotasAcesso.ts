/**
 * Rotas das telas de login do painel
 * ------------------------------------------------------------
 * O repositório é público, então os endereços secretos de login NÃO
 * ficam no código: eles vêm das variáveis de ambiente (só do servidor)
 *   ROTA_SECRETA_ADMIN → login dos administradores (admin ou deus)
 *   ROTA_SECRETA_DEUS  → login só do ADM DEUS
 * (coloque no .env.local e na Vercel, ex.: ROTA_SECRETA_ADMIN=painel-x7k2q9)
 * O middleware (src/middleware.ts) leva esses endereços para as páginas
 * internas abaixo, que dão 404 se alguém digitar direto.
 * Nenhuma página do site mostra link para estas telas.
 * VISITANTE: /login (rejeita contas de administrador).
 */

/** Páginas que de fato existem em src/app (não são digitadas por ninguém) */
export const ROTA_INTERNA_ADMIN = "/admin/login";
export const ROTA_INTERNA_DEUS = "/acesso-interno-deus";

/** Lê o endereço secreto da env (só no servidor). Vazio = login desligado */
export function rotaSecreta(valor: string | undefined): string | null {
  const limpo = (valor ?? "").trim().replace(/^\/+|\/+$/g, "");
  return /^[a-z0-9-]{6,60}$/i.test(limpo) ? `/${limpo}` : null;
}
