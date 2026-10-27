/**
 * Identificação do aparelho (compartilhada: navegador, servidor e middleware)
 * ------------------------------------------------------------
 * Cada navegador recebe um id aleatório no cookie "acmrb_did" (criado pelo
 * middleware na primeira visita; o navegador também o guarda em localStorage
 * como cópia). Esse id é o mesmo "anon_id" das estatísticas de acesso e é
 * ele que o ADM DEUS bloqueia/suspende/expulsa. Não identifica a pessoa.
 * Não importe módulos de servidor aqui (o middleware roda no "edge").
 */

export const COOKIE_DISPOSITIVO = "acmrb_did";
/** Validade do cookie: ~13 meses (o máximo que os navegadores aceitam hoje é 400 dias) */
export const COOKIE_VALIDADE_SEG = 400 * 24 * 3600;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lê o id do aparelho de um cabeçalho "cookie" (servidor) */
export function dispositivoDoCookie(cabecalho: string | null | undefined): string | null {
  if (!cabecalho) return null;
  const m = cabecalho.match(new RegExp(`(?:^|;\\s*)${COOKIE_DISPOSITIVO}=([^;]+)`));
  const v = m?.[1]?.trim().toLowerCase();
  return v && UUID_RE.test(v) ? v : null;
}

/** Robôs de busca que nunca devem ser bloqueados (para o site continuar no Google) */
export const ROBOS_LIBERADOS = /googlebot|google-inspectiontool|googleother|adsbot-google|mediapartners-google|apis-google|storebot-google|bingbot|duckduckbot|facebookexternalhit|whatsapp|twitterbot|linkedinbot|telegrambot/i;
