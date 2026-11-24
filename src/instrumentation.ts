/**
 * Sentry no servidor (rotas /api, páginas e middleware)
 * ------------------------------------------------------------
 * Usa SENTRY_DSN e, se não tiver, NEXT_PUBLIC_SENTRY_DSN.
 * Sem nenhuma das duas, o Sentry fica desligado (não quebra nada).
 */

import * as Sentry from "@sentry/nextjs";

export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return; // sem DSN: desligado

  // mesmo jeito no Node e no edge (middleware)
  Sentry.init({
    dsn,
    tracesSampleRate: 0,
  });
}

// erros das rotas e páginas do servidor vão para o Sentry (sem DSN não faz nada)
export const onRequestError = Sentry.captureRequestError;
