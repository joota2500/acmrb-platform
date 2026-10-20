"use client";

/**
 * /redefinir-senha — destino do link "Esqueci minha senha"
 * ------------------------------------------------------------
 * O Supabase envia um link que volta para cá com uma sessão de
 * recuperação (evento PASSWORD_RECOVERY, ou ?code=... no fluxo PKCE).
 * Com ela, o usuário define a nova senha (mesmas regras do painel).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { RegrasSenha, senhaValida } from "@/components/ui/RegrasSenha";

type Estado = "carregando" | "pronto" | "invalido" | "concluido";

export default function RedefinirSenhaPage() {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    const { data: ouvinte } = supabase.auth.onAuthStateChange((evento, sessao) => {
      if (!ativo) return;
      if (evento === "PASSWORD_RECOVERY" || (sessao && evento === "SIGNED_IN")) setEstado("pronto");
    });

    (async () => {
      // Link com erro (expirado/usado) vem na URL
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const busca = new URLSearchParams(window.location.search);
      if (hash.get("error") || busca.get("error")) return ativo && setEstado("invalido");

      // Fluxo PKCE: troca o código pela sessão
      const code = busca.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!ativo) return;
        if (!error) return setEstado("pronto");
      }

      // Fluxo implícito: o cliente já leu o #access_token
      const { data } = await supabase.auth.getSession();
      if (!ativo) return;
      if (data.session) return setEstado("pronto");

      // Dá um tempo para o evento chegar; sem sessão = link inválido
      setTimeout(async () => {
        const { data: d2 } = await supabase.auth.getSession();
        if (ativo) setEstado((e) => (e === "carregando" ? (d2.session ? "pronto" : "invalido") : e));
      }, 2500);
    })();

    return () => {
      ativo = false;
      ouvinte.subscription.unsubscribe();
    };
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!senhaValida(senha)) return setErro("A senha não atende aos requisitos.");
    if (senha !== confirmar) return setErro("A confirmação não confere.");
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) return setErro("Não foi possível salvar. O link pode ter expirado; peça um novo.");
    // Encerra a sessão de recuperação: o usuário entra de novo com a senha nova
    await supabase.auth.signOut();
    setEstado("concluido");
  }

  const campo = "w-full h-12 rounded-2xl border border-zinc-200 px-4 focus:outline-none focus:ring-2 focus:ring-[#2E5E4E]/40";

  return (
    <main className="min-h-dvh bg-[#F4F7F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-black/5 p-6 sm:p-8 shadow-sm">
        <span className="w-14 h-14 rounded-2xl bg-[#DDF5EC] text-[#2E5E4E] flex items-center justify-center mx-auto">
          <KeyRound size={26} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-black text-zinc-900 text-center">Redefinir senha</h1>

        {estado === "carregando" && (
          <p className="mt-6 flex justify-center"><Loader2 className="animate-spin text-[#2E5E4E]" aria-label="Validando link" /></p>
        )}

        {estado === "invalido" && (
          <div className="mt-4 text-center space-y-4">
            <p role="alert" className="text-zinc-600">
              Este link é inválido ou expirou. Peça um novo em “Esqueci minha senha”.
            </p>
            <Link href="/" className="inline-flex h-12 px-6 rounded-2xl bg-[#2E5E4E] text-white font-bold items-center">Voltar ao site</Link>
          </div>
        )}

        {estado === "concluido" && (
          <div className="mt-4 text-center space-y-4">
            <CheckCircle2 className="mx-auto text-emerald-600" size={40} aria-hidden="true" />
            <p className="text-zinc-600">Senha alterada! Entre novamente com a nova senha.</p>
            <Link href="/" className="inline-flex h-12 px-6 rounded-2xl bg-[#2E5E4E] text-white font-bold items-center">Ir para o site</Link>
          </div>
        )}

        {estado === "pronto" && (
          <form onSubmit={salvar} className="mt-6 space-y-4" noValidate>
            <label className="block text-sm font-semibold text-zinc-700">
              Nova senha
              <input className={campo} type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              <RegrasSenha senha={senha} />
            </label>
            <label className="block text-sm font-semibold text-zinc-700">
              Confirmar nova senha
              <input className={campo} type="password" autoComplete="new-password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
            </label>
            {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
            <button type="submit" disabled={salvando} className="w-full h-12 rounded-2xl bg-[#2E5E4E] text-white font-bold disabled:opacity-60">
              {salvando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
