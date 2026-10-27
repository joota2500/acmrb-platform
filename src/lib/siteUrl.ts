/**
 * siteUrl — endereço público do site (para metadados Open Graph/canonical)
 * ------------------------------------------------------------
 * Ordem: NEXT_PUBLIC_SITE_URL (defina na Vercel com o domínio final)
 * → domínio de produção da Vercel → URL do deploy → localhost.
 */
export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
