"use client";

/**
 * Erro inesperado numa página (error boundary do Next)
 * ------------------------------------------------------------
 * - Para a pessoa: só uma mensagem amigável e o botão "Tentar de novo".
 * - Para nós: o erro completo vai para o console (log), nunca para a tela.
 *   Em produção o Next já esconde a mensagem técnica; o "digest" é só um
 *   código curto que ajuda a achar o erro nos logs da Vercel.
 * Não usa o Header aqui de propósito: se o erro vier dele, a página de
 * erro também quebraria.
 */

import { useEffect } from "react";
import { Home, RefreshCw, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Erro({ error, reset }: Props) {
  // detalhes só no log
  useEffect(() => {
    console.error("[erro na página]", error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-surface-alt px-4 py-16" lang="pt-BR">
      <div className="w-full max-w-lg rounded-card border border-black/5 bg-white p-7 text-center shadow-card sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-warning-soft text-warning">
          <TriangleAlert size={32} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-black text-ink sm:text-3xl">Ops, algo deu errado</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Tivemos um problema ao abrir esta página. Tente de novo em alguns segundos. Se continuar, fale com a
          associação.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => reset()}>
            <RefreshCw size={18} aria-hidden="true" /> Tentar de novo
          </Button>
          <Button href="/" variante="secundario">
            <Home size={18} aria-hidden="true" /> Voltar ao início
          </Button>
        </div>

        {/* código curto para o suporte (não mostra nada do código do site) */}
        {error.digest && (
          <p className="mt-6 text-xs text-ink-muted">
            Código do erro: <code className="rounded bg-surface-alt px-1.5 py-0.5 font-mono">{error.digest}</code>
          </p>
        )}
      </div>
    </main>
  );
}
