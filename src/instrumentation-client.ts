/**
 * Sentry no navegador — avisa quando der erro no site em produção
 * ------------------------------------------------------------
 * Só liga se NEXT_PUBLIC_SENTRY_DSN estiver preenchida (Vercel → Environment
 * Variables). Sem a variável, fica totalmente desligado.
 * Versão mínima: sem envio de source maps e sem token de autenticação.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: dsn || undefined,
  enabled: !!dsn,
  // só erros (sem medir desempenho: isso fica com o Speed Insights da Vercel)
  tracesSampleRate: 0,
});

// avisa o Sentry quando a página muda (exigido pela biblioteca)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
