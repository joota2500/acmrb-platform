"use client";

/**
 * Bloco "Segurança" da Minha conta
 * ------------------------------------------------------------
 * - Trocar e-mail (rota do servidor: confere a senha e troca no Auth e
 *   em admins juntos, para não perder o acesso ao painel).
 * - Enviar e-mail de redefinição de senha (com espera entre envios).
 * - Sair de todas as outras sessões.
 * - Verificação em duas etapas (app autenticador / TOTP).
 */

import { useCallback, useEffect, useState } from "react";
import { Loader2, LogOut, Mail, MailCheck, ShieldCheck, ShieldOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { chamarApi, ESPERA_EMAIL_SEG, urlRedefinir } from "@/lib/apiAdmin";

type Mostrar = (tipo: "sucesso" | "erro" | "aviso", mensagem: string) => void;

const campo =
  "w-full h-12 rounded-2xl border border-zinc-200 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E5E4E]/40";
const botao =
  "w-full sm:w-auto h-11 px-5 rounded-2xl font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60";

/** Contagem regressiva simples para o botão de reenvio */
function useEspera() {
  const [resta, setResta] = useState(0);
  useEffect(() => {
    if (resta <= 0) return;
    const t = setTimeout(() => setResta((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resta]);
  return [resta, () => setResta(ESPERA_EMAIL_SEG)] as const;
}

export default function SegurancaConta({ email, mostrar, onEmailTrocado }: {
  email: string;
  mostrar: Mostrar;
  onEmailTrocado: () => void;
}) {
  /* ---------- Trocar e-mail ---------- */
  const [novoEmail, setNovoEmail] = useState("");
  const [senhaEmail, setSenhaEmail] = useState("");
  const [trocando, setTrocando] = useState(false);

  async function trocarEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail.trim())) return mostrar("aviso", "E-mail inválido.");
    if (!senhaEmail) return mostrar("aviso", "Informe sua senha atual.");
    setTrocando(true);
    try {
      await chamarApi("POST", "/api/admin/conta/email", { novoEmail, senhaAtual: senhaEmail });
      // Renova o token para ele já carregar o e-mail novo (as regras do banco usam o e-mail)
      await supabase.auth.refreshSession();
      setNovoEmail("");
      setSenhaEmail("");
      mostrar("sucesso", "E-mail alterado. Use o novo e-mail no próximo login.");
      onEmailTrocado();
    } catch (err) {
      mostrar("erro", (err as Error).message);
    } finally {
      setTrocando(false);
    }
  }

  /* ---------- E-mail de redefinição ---------- */
  const [resta, iniciarEspera] = useEspera();
  async function enviarRedefinicao() {
    iniciarEspera();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: urlRedefinir() });
    if (error) mostrar("erro", /rate|limit/i.test(error.message)
      ? "Muitos envios em pouco tempo. Aguarde alguns minutos."
      : "Não foi possível enviar o e-mail.");
    else mostrar("sucesso", `Enviamos um link de redefinição para ${email}.`);
  }

  /* ---------- Outras sessões ---------- */
  const [saindo, setSaindo] = useState(false);
  async function sairOutras() {
    setSaindo(true);
    const { error } = await supabase.auth.signOut({ scope: "others" });
    setSaindo(false);
    if (error) mostrar("erro", "Não foi possível encerrar as outras sessões.");
    else mostrar("sucesso", "As outras sessões foram encerradas (podem levar até 1 hora para expirar por completo).");
  }

  /* ---------- Duas etapas (TOTP) ---------- */
  const [fatorAtivo, setFatorAtivo] = useState<string | null>(null);
  const [cadastro, setCadastro] = useState<{ id: string; qr: string; segredo: string } | null>(null);
  const [codigo, setCodigo] = useState("");
  const [mfaOcupado, setMfaOcupado] = useState(false);

  const carregarFatores = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFatorAtivo(data?.totp.find((f) => f.status === "verified")?.id ?? null);
  }, []);

  useEffect(() => {
    carregarFatores();
  }, [carregarFatores]);

  async function iniciarMfa() {
    setMfaOcupado(true);
    // Remove cadastros antigos não concluídos (o Supabase não deixa duplicar)
    const { data: lista } = await supabase.auth.mfa.listFactors();
    for (const f of lista?.all ?? []) {
      if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `ACMRB ${Date.now()}` });
    setMfaOcupado(false);
    if (error || !data) return mostrar("erro", "Não foi possível iniciar. Verifique se o MFA está habilitado no Supabase.");
    setCadastro({ id: data.id, qr: data.totp.qr_code, segredo: data.totp.secret });
  }

  async function confirmarMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!cadastro) return;
    setMfaOcupado(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: cadastro.id, code: codigo });
    setMfaOcupado(false);
    if (error) return mostrar("erro", "Código inválido. Confira o horário do celular e tente de novo.");
    setCadastro(null);
    setCodigo("");
    mostrar("sucesso", "Verificação em duas etapas ativada. Ela será pedida em todo login.");
    carregarFatores();
  }

  async function desativarMfa() {
    if (!fatorAtivo || !confirm("Desativar a verificação em duas etapas?")) return;
    setMfaOcupado(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: fatorAtivo });
    setMfaOcupado(false);
    if (error) return mostrar("erro", "Não foi possível desativar.");
    mostrar("sucesso", "Verificação em duas etapas desativada.");
    carregarFatores();
  }

  return (
    <section className="bg-white rounded-3xl border border-black/5 p-5 sm:p-6 space-y-6 lg:col-span-2">
      <h2 className="text-lg font-black text-zinc-900">Segurança</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trocar e-mail */}
        <form onSubmit={trocarEmail} className="space-y-3" noValidate>
          <h3 className="font-bold text-zinc-800 flex items-center gap-2"><Mail size={16} aria-hidden="true" /> Trocar e-mail de acesso</h3>
          <input className={campo} type="email" placeholder="novo@email.com" value={novoEmail}
            aria-label="Novo e-mail" onChange={(e) => setNovoEmail(e.target.value)} />
          <input className={campo} type="password" placeholder="Senha atual" autoComplete="current-password"
            aria-label="Senha atual" value={senhaEmail} onChange={(e) => setSenhaEmail(e.target.value)} />
          <button type="submit" disabled={trocando} className={`${botao} bg-[#2E5E4E] text-white`}>
            {trocando && <Loader2 size={16} className="animate-spin" />} Trocar e-mail
          </button>
        </form>

        {/* Redefinição e sessões */}
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-zinc-800 flex items-center gap-2"><MailCheck size={16} aria-hidden="true" /> Redefinir por e-mail</h3>
            <p className="text-sm text-zinc-500 mt-1">Envia um link de redefinição de senha para {email}.</p>
            <button type="button" onClick={enviarRedefinicao} disabled={resta > 0}
              className={`${botao} mt-2 border border-zinc-200 hover:bg-zinc-50`}>
              {resta > 0 ? `Aguarde ${resta}s` : "Enviar link"}
            </button>
          </div>
          <div>
            <h3 className="font-bold text-zinc-800 flex items-center gap-2"><LogOut size={16} aria-hidden="true" /> Outros dispositivos</h3>
            <p className="text-sm text-zinc-500 mt-1">Encerra o acesso em todos os outros aparelhos; este continua conectado.</p>
            <button type="button" onClick={sairOutras} disabled={saindo}
              className={`${botao} mt-2 border border-zinc-200 hover:bg-zinc-50`}>
              {saindo && <Loader2 size={16} className="animate-spin" />} Sair dos outros dispositivos
            </button>
          </div>
        </div>
      </div>

      {/* Duas etapas */}
      <div className="border-t border-zinc-100 pt-5">
        <h3 className="font-bold text-zinc-800 flex items-center gap-2">
          <ShieldCheck size={16} aria-hidden="true" /> Verificação em duas etapas
          <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${fatorAtivo ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
            {fatorAtivo ? "Ativa" : "Desativada"}
          </span>
        </h3>
        <p className="text-sm text-zinc-500 mt-1 text-justify hyphens-auto" lang="pt-BR">
          Com ela ativa, além da senha o painel pede um código do app autenticador
          (Google Authenticator, Authy, Microsoft Authenticator…).
        </p>

        {fatorAtivo ? (
          <button type="button" onClick={desativarMfa} disabled={mfaOcupado}
            className={`${botao} mt-3 bg-red-50 text-red-700 hover:bg-red-100`}>
            <ShieldOff size={16} aria-hidden="true" /> Desativar
          </button>
        ) : cadastro ? (
          <form onSubmit={confirmarMfa} className="mt-3 flex flex-col sm:flex-row gap-4 sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cadastro.qr} alt="QR code para o app autenticador" className="w-44 h-44 border rounded-2xl p-2 bg-white" />
            <div className="space-y-3 flex-1">
              <p className="text-sm text-zinc-600">1. Leia o QR code no app. Sem câmera? Digite a chave:</p>
              <code className="block text-xs break-all bg-zinc-50 rounded-xl p-2">{cadastro.segredo}</code>
              <p className="text-sm text-zinc-600">2. Digite o código de 6 dígitos:</p>
              <input className={campo} inputMode="numeric" autoComplete="one-time-code" aria-label="Código de 6 dígitos"
                value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))} />
              <div className="flex gap-2 flex-wrap">
                <button type="submit" disabled={codigo.length !== 6 || mfaOcupado} className={`${botao} bg-[#2E5E4E] text-white`}>Confirmar</button>
                <button type="button" onClick={() => setCadastro(null)} className={`${botao} border border-zinc-200`}>Cancelar</button>
              </div>
            </div>
          </form>
        ) : (
          <button type="button" onClick={iniciarMfa} disabled={mfaOcupado}
            className={`${botao} mt-3 bg-[#1E3A34] text-white`}>
            {mfaOcupado && <Loader2 size={16} className="animate-spin" />} Ativar
          </button>
        )}
      </div>
    </section>
  );
}
