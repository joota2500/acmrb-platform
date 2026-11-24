"use client";

/**
 * Erro grave (quando até o layout principal quebra)
 * ------------------------------------------------------------
 * Substitui o layout inteiro, por isso precisa ter <html> e <body> e
 * importar o CSS de novo. Mesma regra do error.tsx: mensagem simples
 * para a pessoa e detalhes só no log.
 * Usa <a> comum (e não o Button/Link) para depender do mínimo possível.
 */

import "@/app/globals.css";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErroGeral({ error, reset }: Props) {
  useEffect(() => {
    console.error("[erro geral do site]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="bg-surface-alt font-sans text-ink antialiased">
        <main className="grid min-h-dvh place-items-center px-4 py-16">
          <div className="w-full max-w-lg rounded-card border border-black/5 bg-white p-7 text-center shadow-card sm:p-10">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-mint text-4xl" aria-hidden="true">
              ♻
            </span>
            <h1 className="mt-5 text-2xl font-black sm:text-3xl">O site está com um problema</h1>
            <p className="mt-3 leading-relaxed text-ink-soft">
              Já estamos cientes. Tente de novo em instantes ou volte para a página inicial.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex h-11 items-center justify-center rounded-control bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Tentar de novo
              </button>
              <a
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-control bg-brand-soft px-5 text-sm font-semibold text-brand transition hover:bg-brand-mint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Voltar ao início
              </a>
            </div>
            {error.digest && (
              <p className="mt-6 text-xs text-ink-muted">
                Código do erro: <code className="font-mono">{error.digest}</code>
              </p>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
