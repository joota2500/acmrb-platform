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
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

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

  return (
    <div className="min-h-dvh bg-[#F4F7F5] flex items-center justify-center p-4">
      {estado === "verificando" ? (
        <Loader2 className="animate-spin text-[#2E5E4E]" aria-label="Verificando segurança" />
      ) : (
        <form onSubmit={verificar} className="w-full max-w-sm bg-white rounded-3xl border border-black/5 p-6 sm:p-8 text-center space-y-4">
          <span className="w-14 h-14 rounded-2xl bg-[#DDF5EC] text-[#2E5E4E] flex items-center justify-center mx-auto">
            <ShieldCheck size={26} aria-hidden="true" />
          </span>
          <h1 className="text-xl font-black text-zinc-900">Verificação em duas etapas</h1>
          <p className="text-sm text-zinc-500">Digite o código de 6 dígitos do seu app autenticador.</p>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            aria-label="Código de verificação"
            className="w-full h-14 rounded-2xl border border-zinc-200 text-center text-2xl tracking-[0.5em] font-black focus:outline-none focus:ring-2 focus:ring-[#2E5E4E]/40"
          />
          {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
          <button type="submit" disabled={codigo.length !== 6 || enviando}
            className="w-full h-12 rounded-2xl bg-[#2E5E4E] text-white font-bold disabled:opacity-60">
            {enviando ? "Verificando..." : "Verificar"}
          </button>
          <button type="button" onClick={onSair} className="text-sm text-zinc-500 underline">
            Sair
          </button>
        </form>
      )}
    </div>
  );
}
