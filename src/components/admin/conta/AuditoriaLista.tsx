"use client";

/**
 * Histórico de ações sobre administradores (tabela admin_auditoria).
 * Só o deus consegue ler (RLS). Mostra os 50 registros mais recentes.
 */

import { useCallback, useEffect, useState } from "react";
import { History, Loader2, RefreshCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Registro {
  id: number;
  ator_email: string;
  acao: string;
  alvo_email: string | null;
  created_at: string;
}

const ROTULOS: Record<string, string> = {
  criar_admin: "Criou administrador",
  excluir_admin: "Excluiu administrador",
  desativar_admin: "Desativou administrador",
  reativar_admin: "Reativou administrador",
  redefinir_senha: "Redefiniu a senha de",
  trocar_email: "Trocou o e-mail de admin para",
  trocar_proprio_email: "Trocou o próprio e-mail para",
};

export default function AuditoriaLista({ atualizar }: { atualizar: number }) {
  const [itens, setItens] = useState<Registro[]>([]);
  const [estado, setEstado] = useState<"carregando" | "ok" | "erro">("carregando");

  const carregar = useCallback(async () => {
    setEstado("carregando");
    const { data, error } = await supabase
      .from("admin_auditoria")
      .select("id, ator_email, acao, alvo_email, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setItens(data ?? []);
    setEstado(error ? "erro" : "ok");
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar, atualizar]);

  return (
    <section className="bg-white rounded-3xl border border-black/5 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black text-zinc-900 flex items-center gap-2"><History size={18} aria-hidden="true" /> Histórico</h3>
        <button type="button" onClick={carregar} aria-label="Atualizar histórico" className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50">
          <RefreshCcw size={16} />
        </button>
      </div>

      {estado === "carregando" && <Loader2 className="mt-4 animate-spin text-[#2E5E4E]" />}
      {estado === "erro" && (
        <p className="mt-3 text-sm text-amber-700">
          Histórico indisponível. Rode a migration 20261020190000_admin_auditoria.sql no Supabase.
        </p>
      )}
      {estado === "ok" && itens.length === 0 && <p className="mt-3 text-sm text-zinc-500">Nenhuma ação registrada ainda.</p>}
      {estado === "ok" && itens.length > 0 && (
        <ul className="mt-3 divide-y divide-zinc-100">
          {itens.map((r) => (
            <li key={r.id} className="py-3 text-sm flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-700 break-words">
                <strong>{r.ator_email}</strong> · {ROTULOS[r.acao] ?? r.acao} {r.alvo_email && <em className="not-italic text-zinc-900">{r.alvo_email}</em>}
              </span>
              <time className="text-xs text-zinc-400 shrink-0" dateTime={r.created_at}>
                {new Date(r.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
