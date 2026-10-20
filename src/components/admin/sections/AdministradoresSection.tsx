"use client";

/**
 * Seção "Administradores" (somente o deus)
 * ------------------------------------------------------------
 * Mostra as 2 vagas do sistema: 1 deus + 1 administrador normal.
 * Criar/excluir o admin normal passa pela rota /api/admin/administradores
 * (servidor, com service role) — o navegador nunca vê essa chave.
 */

import { useCallback, useEffect, useState } from "react";
import { Crown, Eye, EyeOff, Loader2, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ToastArea, useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { RegrasSenha, senhaValida } from "@/components/ui/RegrasSenha";
import { chamarApi } from "@/lib/apiAdmin";
import GerenciarAdmin from "@/components/admin/conta/GerenciarAdmin";
import AuditoriaLista from "@/components/admin/conta/AuditoriaLista";

interface AdminLinha {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  avatar_url: string | null;
  ultimo_login: string | null;
  created_at?: string | null;
}

// Regras de senha e chamada à API ficam em arquivos compartilhados
export { RegrasSenha, senhaValida } from "@/components/ui/RegrasSenha";

export const dataHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "nunca";

const campo =
  "w-full h-12 rounded-2xl border border-zinc-200 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E5E4E]/40";

export default function AdministradoresSection() {
  const { toasts, mostrar, fechar } = useToast();
  const [lista, setLista] = useState<AdminLinha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluir, setExcluir] = useState<AdminLinha | null>(null);
  const [verSenha, setVerSenha] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  // Muda a cada ação para recarregar o histórico
  const [versao, setVersao] = useState(0);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("admins")
      .select("id, nome, email, role, ativo, avatar_url, ultimo_login, created_at")
      .order("role", { ascending: false });
    if (error) mostrar("erro", "Não foi possível carregar os administradores.");
    setLista((data as AdminLinha[]) ?? []);
    setCarregando(false);
  }, [mostrar]);

  useEffect(() => {
    carregar();
  }, [carregar, versao]);

  const recarregarTudo = () => setVersao((v) => v + 1);

  const deus = lista.find((a) => a.role === "deus");
  const normal = lista.find((a) => a.role !== "deus");

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (form.nome.trim().length < 3) return mostrar("aviso", "Informe o nome completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return mostrar("aviso", "E-mail inválido.");
    if (!senhaValida(form.senha)) return mostrar("aviso", "A senha temporária não atende aos requisitos.");

    setSalvando(true);
    try {
      await chamarApi("POST", "/api/admin/administradores", form);
      mostrar("sucesso", "Administrador criado! Envie o e-mail e a senha temporária para ele por um canal seguro.");
      setForm({ nome: "", email: "", senha: "" });
      recarregarTudo();
    } catch (err) {
      mostrar("erro", (err as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    if (!excluir) return;
    setSalvando(true);
    try {
      await chamarApi("DELETE", `/api/admin/administradores?id=${encodeURIComponent(excluir.id)}`);
      mostrar("sucesso", "Administrador excluído e acesso removido.");
      setExcluir(null);
      recarregarTudo();
    } catch (err) {
      mostrar("erro", (err as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="bg-white rounded-3xl border border-black/5 p-10 flex justify-center" aria-busy="true">
        <Loader2 className="animate-spin text-[#2E5E4E]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-500 text-justify hyphens-auto" lang="pt-BR">
        O sistema permite no máximo dois administradores: você (ADM DEUS) e um
        administrador normal, que tem acesso às áreas do dia a dia (notícias,
        associados, parceiros, materiais, denúncias e relatórios).
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Vaga 1: deus */}
        <article className="bg-white rounded-3xl border border-black/5 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600">
            <Crown size={14} aria-hidden="true" /> Vaga 1 · ADM DEUS
          </p>
          {deus ? (
            <>
              <h3 className="mt-3 text-lg font-black text-zinc-900 break-words">{deus.nome}</h3>
              <p className="text-sm text-zinc-500 break-all">{deus.email}</p>
              <p className="mt-2 text-xs text-zinc-400">Último acesso: {dataHora(deus.ultimo_login)}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-red-600">
              Nenhum deus definido. Rode a migration 20261020180000_admins_papeis.sql.
            </p>
          )}
        </article>

        {/* Vaga 2: admin normal */}
        <article className="bg-white rounded-3xl border border-black/5 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2E5E4E]">
            <ShieldCheck size={14} aria-hidden="true" /> Vaga 2 · Administrador
          </p>

          {normal ? (
            <>
              <h3 className="mt-3 text-lg font-black text-zinc-900 break-words">
                {normal.nome}{" "}
                {!normal.ativo && (
                  <span className="align-middle text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-600">Desativado</span>
                )}
              </h3>
              <p className="text-sm text-zinc-500 break-all">{normal.email}</p>
              <p className="mt-2 text-xs text-zinc-400">
                Último acesso: {dataHora(normal.ultimo_login)} · Criado em: {dataHora(normal.created_at ?? null)}
              </p>
              <GerenciarAdmin alvo={normal} mostrar={mostrar} onAlterado={recarregarTudo} />
              <button
                type="button"
                onClick={() => setExcluir(normal)}
                className="mt-4 h-11 px-4 rounded-2xl bg-red-50 text-red-700 font-bold inline-flex items-center gap-2 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-500"
              >
                <Trash2 size={16} aria-hidden="true" /> Excluir administrador
              </button>
            </>
          ) : (
            <form onSubmit={criar} className="mt-4 space-y-3" noValidate>
              <label className="block text-sm font-semibold text-zinc-700">
                Nome
                <input className={campo} value={form.nome} autoComplete="off"
                  onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </label>
              <label className="block text-sm font-semibold text-zinc-700">
                E-mail
                <input className={campo} type="email" value={form.email} autoComplete="off"
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="block text-sm font-semibold text-zinc-700">
                Senha temporária
                <span className="relative block">
                  <input className={`${campo} pr-12`} type={verSenha ? "text" : "password"} value={form.senha}
                    autoComplete="new-password" onChange={(e) => setForm({ ...form, senha: e.target.value })} />
                  <button type="button" onClick={() => setVerSenha((v) => !v)}
                    aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
                <RegrasSenha senha={form.senha} />
              </label>
              <button type="submit" disabled={salvando}
                className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-[#2E5E4E] text-white font-bold inline-flex items-center justify-center gap-2 hover:bg-[#21463A] disabled:opacity-60">
                {salvando ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} aria-hidden="true" />}
                Criar administrador
              </button>
              <p className="text-xs text-zinc-400">
                Peça para ele trocar a senha em “Minha conta” no primeiro acesso.
              </p>
            </form>
          )}
        </article>
      </div>

      <AuditoriaLista atualizar={versao} />

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir administrador?"
        mensagem={`${excluir?.nome ?? ""} perderá o acesso ao painel imediatamente. Esta ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        perigo
        carregando={salvando}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
      <ToastArea toasts={toasts} onFechar={fechar} />
    </div>
  );
}
