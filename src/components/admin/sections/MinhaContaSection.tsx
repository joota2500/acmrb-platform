"use client";

/**
 * Seção "Minha conta" (todos os administradores)
 * ------------------------------------------------------------
 * - Nome, telefone e foto (bucket "admins" do Storage).
 * - Troca de senha: confirma a senha atual (signInWithPassword) antes
 *   de chamar supabase.auth.updateUser.
 * - Mostra o último acesso registrado.
 * - Bloco "Segurança": trocar e-mail (pela rota do servidor), link de
 *   redefinição, sair dos outros aparelhos e verificação em 2 etapas.
 */

import { useCallback, useEffect, useState } from "react";
import { Camera, KeyRound, Loader2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { mascaraTelefone } from "@/lib/validacao";
import { ToastArea, useToast } from "@/components/ui/Toast";
import { dataHora } from "./AdministradoresSection";
import { RegrasSenha, senhaValida } from "@/components/ui/RegrasSenha";
import SegurancaConta from "@/components/admin/conta/SegurancaConta";
import { ROTULO_PAPEL, papelDe } from "@/lib/permissions";

interface Conta {
  id: string;
  nome: string;
  email: string;
  role: string;
  telefone: string | null;
  avatar_url: string | null;
  ultimo_login: string | null;
  created_at?: string | null;
}

const campo =
  "w-full h-12 rounded-2xl border border-zinc-200 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E5E4E]/40";

export default function MinhaContaSection() {
  const { toasts, mostrar, fechar } = useToast();
  const [conta, setConta] = useState<Conta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [senhas, setSenhas] = useState({ atual: "", nova: "", confirmar: "" });
  const [trocandoSenha, setTrocandoSenha] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data: sessao } = await supabase.auth.getUser();
    const email = sessao.user?.email;
    if (!email) {
      setCarregando(false);
      return;
    }
    // "telefone" só existe após a migration; sem ela, tenta sem a coluna
    let r = await supabase
      .from("admins")
      .select("id, nome, email, role, telefone, avatar_url, ultimo_login, created_at")
      .eq("email", email)
      .maybeSingle();
    if (r.error) {
      r = (await supabase
        .from("admins")
        .select("id, nome, email, role, avatar_url, ultimo_login")
        .eq("email", email)
        .maybeSingle()) as typeof r;
    }
    if (r.error || !r.data) mostrar("erro", "Não foi possível carregar seus dados.");
    setConta(r.data ? ({ ...r.data, telefone: (r.data as Partial<Conta>).telefone ?? null } as Conta) : null);
    setCarregando(false);
  }, [mostrar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    if (!conta) return;
    if (conta.nome.trim().length < 3) return mostrar("aviso", "Informe seu nome.");
    setSalvando(true);
    try {
      let avatar_url = conta.avatar_url;
      if (foto) {
        if (foto.size > 3 * 1024 * 1024) throw new Error("A foto deve ter no máximo 3 MB.");
        const { data: u } = await supabase.auth.getUser();
        const ext = foto.name.split(".").pop()?.toLowerCase() || "jpg";
        const caminho = `${u.user?.id ?? conta.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("admins").upload(caminho, foto, { upsert: true });
        if (error) throw new Error("A foto não pôde ser enviada (verifique se a migration do bucket “admins” foi rodada).");
        avatar_url = supabase.storage.from("admins").getPublicUrl(caminho).data.publicUrl;
      }
      const { error } = await supabase
        .from("admins")
        .update({ nome: conta.nome.trim(), telefone: conta.telefone || null, avatar_url })
        .eq("id", conta.id);
      if (error) throw new Error("Não foi possível salvar o perfil.");
      setConta({ ...conta, avatar_url });
      setFoto(null);
      mostrar("sucesso", "Perfil atualizado.");
    } catch (err) {
      mostrar("erro", (err as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (!conta) return;
    if (!senhas.atual) return mostrar("aviso", "Informe a senha atual.");
    if (!senhaValida(senhas.nova)) return mostrar("aviso", "A nova senha não atende aos requisitos.");
    if (senhas.nova !== senhas.confirmar) return mostrar("aviso", "A confirmação não confere com a nova senha.");
    if (senhas.nova === senhas.atual) return mostrar("aviso", "A nova senha deve ser diferente da atual.");

    setTrocandoSenha(true);
    try {
      // Reautentica para provar que é o dono da conta
      const { error: erroLogin } = await supabase.auth.signInWithPassword({ email: conta.email, password: senhas.atual });
      if (erroLogin) throw new Error("Senha atual incorreta.");
      const { error } = await supabase.auth.updateUser({ password: senhas.nova });
      if (error) throw new Error("Não foi possível trocar a senha. Tente novamente.");
      setSenhas({ atual: "", nova: "", confirmar: "" });
      mostrar("sucesso", "Senha alterada com sucesso.");
    } catch (err) {
      mostrar("erro", (err as Error).message);
    } finally {
      setTrocandoSenha(false);
    }
  }

  if (carregando) {
    return (
      <div className="bg-white rounded-3xl border border-black/5 p-10 flex justify-center" aria-busy="true">
        <Loader2 className="animate-spin text-[#2E5E4E]" />
      </div>
    );
  }
  if (!conta) return <ToastArea toasts={toasts} onFechar={fechar} />;

  const previa = foto ? URL.createObjectURL(foto) : conta.avatar_url;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Perfil */}
      <form onSubmit={salvarPerfil} className="bg-white rounded-3xl border border-black/5 p-5 sm:p-6 space-y-4" noValidate>
        <h2 className="text-lg font-black text-zinc-900">Perfil</h2>

        <div className="flex items-center gap-4">
          <span className="w-20 h-20 rounded-full bg-[#DDF5EC] text-[#2E5E4E] text-2xl font-black overflow-hidden flex items-center justify-center shrink-0">
            {previa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previa} alt="Sua foto" className="w-full h-full object-cover" />
            ) : (
              conta.nome.charAt(0).toUpperCase()
            )}
          </span>
          <label className="h-11 px-4 rounded-2xl border border-zinc-200 inline-flex items-center gap-2 font-semibold text-sm cursor-pointer hover:bg-zinc-50">
            <Camera size={16} aria-hidden="true" /> Trocar foto
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        <label className="block text-sm font-semibold text-zinc-700">
          Nome
          <input className={campo} value={conta.nome} onChange={(e) => setConta({ ...conta, nome: e.target.value })} />
        </label>
        <label className="block text-sm font-semibold text-zinc-700">
          Telefone
          <input className={campo} inputMode="tel" value={conta.telefone ?? ""}
            onChange={(e) => setConta({ ...conta, telefone: mascaraTelefone(e.target.value) })} />
        </label>
        <div className="text-sm text-zinc-500 space-y-1">
          <p>E-mail: <span className="font-semibold text-zinc-700 break-all">{conta.email}</span></p>
          <p>Papel: <span className="font-semibold text-zinc-700">{ROTULO_PAPEL[papelDe(conta.role)]}</span></p>
          <p>Último acesso: <span className="font-semibold text-zinc-700">{dataHora(conta.ultimo_login)}</span></p>
          <p>Conta criada em: <span className="font-semibold text-zinc-700">{dataHora(conta.created_at ?? null)}</span></p>
        </div>

        <button type="submit" disabled={salvando}
          className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-[#2E5E4E] text-white font-bold inline-flex items-center justify-center gap-2 hover:bg-[#21463A] disabled:opacity-60">
          {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} aria-hidden="true" />}
          Salvar perfil
        </button>
      </form>

      {/* Senha */}
      <form onSubmit={trocarSenha} className="bg-white rounded-3xl border border-black/5 p-5 sm:p-6 space-y-4" noValidate>
        <h2 className="text-lg font-black text-zinc-900">Trocar senha</h2>
        <label className="block text-sm font-semibold text-zinc-700">
          Senha atual
          <input className={campo} type="password" autoComplete="current-password" value={senhas.atual}
            onChange={(e) => setSenhas({ ...senhas, atual: e.target.value })} />
        </label>
        <label className="block text-sm font-semibold text-zinc-700">
          Nova senha
          <input className={campo} type="password" autoComplete="new-password" value={senhas.nova}
            onChange={(e) => setSenhas({ ...senhas, nova: e.target.value })} />
          <RegrasSenha senha={senhas.nova} />
        </label>
        <label className="block text-sm font-semibold text-zinc-700">
          Confirmar nova senha
          <input className={campo} type="password" autoComplete="new-password" value={senhas.confirmar}
            onChange={(e) => setSenhas({ ...senhas, confirmar: e.target.value })} />
        </label>
        <button type="submit" disabled={trocandoSenha}
          className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-[#1E3A34] text-white font-bold inline-flex items-center justify-center gap-2 hover:bg-[#142824] disabled:opacity-60">
          {trocandoSenha ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} aria-hidden="true" />}
          Alterar senha
        </button>
      </form>

      <SegurancaConta email={conta.email} mostrar={mostrar} onEmailTrocado={carregar} />

      <ToastArea toasts={toasts} onFechar={fechar} />
    </div>
  );
}
