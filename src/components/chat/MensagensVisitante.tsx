"use client";

/**
 * MensagensVisitante — conversa do visitante com a equipe (/mensagens)
 * ------------------------------------------------------------
 * Cria a conversa na primeira visita (chat_minha_conversa) e mostra o
 * ChatGeral. Deslogado: convite para entrar. Admin: aviso do painel.
 * CSS: src/styles/mensagens-visitante.css (prefixo "mvis").
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import "@/styles/mensagens-visitante.css";
import { useAuth } from "@/contexts/AuthContext";
import PedirLogin from "@/components/coletas/PedirLogin";
import ChatGeral from "@/components/chat/ChatGeral";
import { minhaConversa } from "@/lib/chatGeral";

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

  if (loading) return <div className="pcol__carregando"><Loader2 className="mvis-giro" aria-hidden="true" /></div>;
  if (!user || !perfil)
    return <PedirLogin titulo="Entre para conversar com a equipe" texto="Com sua conta de visitante você manda mensagens direto para a ACMRB e acompanha as respostas." />;
  if (perfil.tipo !== "visitante")
    return <PedirLogin titulo="Conta de administrador" aviso="As conversas dos visitantes ficam em Painel → Mensagens." />;

  return (
    <div className="mvis">
      <div className="mvis-topo">
        <span className="mvis-avatar" aria-hidden="true">♻</span>
        <div className="mvis-topo__texto">
          <strong>Equipe ACMRB</strong>
          <span><ShieldCheck size={13} aria-hidden="true" /> Respondemos em horário comercial</span>
        </div>
        <Link href="/minha-conta" className="mvis-link">Meus dados</Link>
      </div>
      {erro ? (
        <p className="mvis-erro" role="alert">{erro}</p>
      ) : !conversaId ? (
        <div className="pcol__carregando"><Loader2 className="mvis-giro" aria-hidden="true" /></div>
      ) : (
        <ChatGeral
          conversaId={conversaId}
          usuarioId={user.id}
          lado="visitante"
          nome={perfil.nome ?? "Visitante"}
          className="mvis-chat"
          vazio="Nenhuma mensagem ainda. Tire dúvidas, dê sugestões ou fale sobre reciclagem com a equipe da ACMRB."
        />
      )}
    </div>
  );
}
