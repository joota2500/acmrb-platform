/**
 * Rotas das telas de login do painel
 * ------------------------------------------------------------
 * ADM DEUS: o endereço público é só o texto abaixo. Para trocar de
 * endereço basta mudar SLUG_ACESSO_DEUS (ex.: "entrada-x7k2"): o
 * middleware (src/middleware.ts) leva esse endereço para a página
 * interna ROTA_INTERNA_DEUS, que não abre se alguém digitar direto.
 * Nenhuma página do site mostra link para estas telas.
 *
 * ADMIN comum: /admin/login (admin ou deus podem entrar por ela).
 * VISITANTE: /login (rejeita contas de administrador).
 */

/** Único lugar para trocar o endereço do login do ADM DEUS */
export const SLUG_ACESSO_DEUS = "acesso-deus";

export const ROTA_LOGIN_DEUS = `/${SLUG_ACESSO_DEUS}`;
export const ROTA_LOGIN_ADMIN = "/admin/login";

/** Página que de fato existe em src/app (não é digitada por ninguém) */
export const ROTA_INTERNA_DEUS = "/acesso-interno-deus";
