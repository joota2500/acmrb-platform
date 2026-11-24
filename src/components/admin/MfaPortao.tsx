"use client";

/**
 * Portão de verificação em duas etapas (TOTP) do painel
 * ------------------------------------------------------------
 * Se o admin ativou o app autenticador em "Minha conta", a sessão
 * precisa estar em nível aal2. Logo após o login com senha ela está
 * em aal1: mostramos esta tela pedindo o código de 6 dígitos.
 * Quem não ativou passa direto.
 */

import { useCallback, useEffect, useState } from "react";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export default function MfaPortao({ children, onSair }: { children: React.ReactNode; onSair: () => void }) {
  const [estado, setEstado] = useState<"verificando" | "pedir" | "ok">("verificando");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const checar = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    // Erro aqui não deve trancar o painel: segue sem exigir
    if (error || !data) return setEstado("ok");
    setEstado(data.nextLevel === "aal2" && data.currentLevel !== "aal2" ? "pedir" : "ok");
  }, []);

  useEffect(() => {
    checar();
  }, [checar]);

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const { data: fatores } = await supabase.auth.mfa.listFactors();
      const fator = fatores?.totp.find((f) => f.status === "verified");
      if (!fator) return setEstado("ok");
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: fator.id, code: codigo.trim() });
      if (error) throw error;
      setEstado("ok");
    } catch {
      setErro("Código inválido ou expirado. Confira o app autenticador.");
    } finally {
      setEnviando(false);
    }
  }

  if (estado === "ok") return <>{children}</>;

  // mesmo fundo escuro do login do painel; cartão compacto que cabe sem rolagem
  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-emerald-950 px-3 py-4 sm:p-6">
      <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 -z-10 size-80 rounded-full bg-emerald-500/20 blur-3xl" />
      {estado === "verificando" ? (
        <Loader2 className="animate-spin text-emerald-300" aria-label="Verificando segurança" />
      ) : (
        <form
          onSubmit={verificar}
          className="flex w-full max-w-[24rem] flex-col gap-3.5 rounded-3xl border border-black/5 bg-white p-5 text-center shadow-pop sm:p-7"
        >
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-mint text-leaf">
            <ShieldCheck size={24} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-[1.3rem] font-black leading-tight tracking-tight text-ink">Verificação em duas etapas</h1>
            <p className="mt-1 text-[0.85rem] leading-snug text-ink-soft">Digite o código de 6 dígitos do seu app autenticador.</p>
          </div>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            aria-label="Código de verificação"
            aria-invalid={erro ? true : undefined}
            placeholder="000000"
            className={cn(
              "h-14 w-full rounded-control border bg-white pl-[0.5em] text-center text-2xl font-black tracking-[0.5em] text-ink outline-none transition placeholder:text-zinc-300 focus:border-brand focus:shadow-focus",
              erro ? "border-danger" : "border-line",
            )}
          />
          {erro && (
            <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-[0.82rem] font-medium text-danger">
              {erro}
            </p>
          )}
          <Button type="submit" tamanho="grande" larguraTotal className="h-12" disabled={codigo.length !== 6} carregando={enviando}>
            Verificar
          </Button>
          <button
            type="button"
            onClick={onSair}
            className="mx-auto inline-flex cursor-pointer items-center gap-1.5 rounded-md text-sm font-semibold text-ink-muted hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <LogOut size={15} aria-hidden="true" /> Sair e voltar
          </button>
        </form>
      )}
    </main>
  );
}
