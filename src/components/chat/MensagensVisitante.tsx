"use client";

/**
 * MensagensVisitante — conversa do visitante com a equipe (/mensagens)
 * ------------------------------------------------------------
 * Cria a conversa na primeira visita (chat_minha_conversa) e mostra o
 * ChatGeral. Deslogado: convite para entrar. Admin: aviso do painel.
 * Visual: Tailwind.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import PedirLogin from "@/components/coletas/PedirLogin";
import ChatGeral from "@/components/chat/ChatGeral";
import { minhaConversa } from "@/services/chatGeral";

export default function MensagensVisitante() {
  const { user, perfil, loading } = useAuth();
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!user || perfil?.tipo !== "visitante") return;
    minhaConversa()
      .then((id) => (id ? setConversaId(id) : setErro("Não foi possível abrir a conversa.")))
      .catch((e: Error) => setErro(e.message));
  }, [user, perfil?.tipo]);

  if (loading) return <Spinner centralizado />;
  if (!user || !perfil)
    return <PedirLogin titulo="Entre para conversar com a equipe" texto="Com sua conta de visitante você manda mensagens direto para a ACMRB e acompanha as respostas." />;
  if (perfil.tipo !== "visitante")
    return <PedirLogin titulo="Conta de administrador" aviso="As conversas dos visitantes ficam em Painel → Mensagens." />;

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-brand-mint bg-white shadow-[0_10px_30px_rgb(33_70_58/0.08)] sm:rounded-[1.25rem]">
      <div className="flex items-center gap-3 bg-brand px-3 py-2.5 text-white sm:px-4 sm:py-3">
        <span className="flex size-10.5 shrink-0 items-center justify-center rounded-full bg-brand-mint text-xl text-brand" aria-hidden="true">
          ♻
        </span>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <strong className="text-base">Equipe ACMRB</strong>
          <span className="inline-flex items-center gap-1 text-xs text-brand-mint">
            <ShieldCheck size={13} aria-hidden="true" /> Respondemos em horário comercial
          </span>
        </div>
        <Link href="/minha-conta" className="shrink-0 rounded-full border border-white/40 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10">
          Meus dados
        </Link>
      </div>
      {erro ? (
        <p className="m-0 p-6 text-center text-danger" role="alert">
          {erro}
        </p>
      ) : !conversaId ? (
        <Spinner centralizado />
      ) : (
        <ChatGeral
          conversaId={conversaId}
          usuarioId={user.id}
          lado="visitante"
          nome={perfil.nome ?? "Visitante"}
          className="rounded-none border-0"
          vazio="Nenhuma mensagem ainda. Tire dúvidas, dê sugestões ou fale sobre reciclagem com a equipe da ACMRB."
        />
      )}
    </div>
  );
}
