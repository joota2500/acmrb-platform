"use client";

/**
 * ChatColeta — conversa de um pedido de coleta (visitante ↔ admins)
 * ------------------------------------------------------------
 * - Atualiza em tempo real (Supabase Realtime) quando disponível e,
 *   de qualquer forma, a cada 15 s (reserva simples e confiável).
 * - Marca como lidas as mensagens do outro lado ao abrir/receber.
 * - Indicadores: ✓ enviada, ✓✓ lida (verde).
 * CSS: src/styles/chat-coleta.css (prefixo "chat-").
 */

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Check, CheckCheck, Loader2, Send } from "lucide-react";
import "@/styles/chat-coleta.css";
import { supabase } from "@/lib/supabase";
import { enviarMensagem, listarMensagens, marcarLidas, type Mensagem } from "@/lib/coletas";

interface Props {
  solicitacaoId: string;
  usuarioId: string;
  lado: "visitante" | "admin";
  nome: string;
  /** Pedido cancelado/concluído: só leitura para o visitante */
  bloqueado?: boolean;
}

const INTERVALO_MS = 15_000;

const horaMsg = (iso: string) => {
  const d = new Date(iso);
  const hoje = new Date().toDateString() === d.toDateString();
  return hoje
    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

export default function ChatColeta({ solicitacaoId, usuarioId, lado, nome, bloqueado }: Props) {
  const [msgs, setMsgs] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);
  const qtdRef = useRef(0);

  const carregar = useCallback(async () => {
    try {
      const lista = await listarMensagens(solicitacaoId);
      setMsgs(lista);
      setErro("");
      // marca como lidas as do outro lado ainda não lidas
      if (lista.some((m) => m.autor_tipo !== lado && !m.lida_em)) void marcarLidas(solicitacaoId);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }, [solicitacaoId, lado]);

  // Carga inicial + atualização a cada 15 s + realtime (se houver)
  useEffect(() => {
    setCarregando(true);
    void carregar();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") void carregar();
    }, INTERVALO_MS);
    const canal = supabase
      .channel(`coleta-chat-${solicitacaoId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "coleta_mensagens", filter: `solicitacao_id=eq.${solicitacaoId}` },
        () => void carregar(),
      )
      .subscribe();
    return () => {
      clearInterval(t);
      void supabase.removeChannel(canal);
    };
  }, [solicitacaoId, carregar]);

  // Rola até o fim só quando chegam mensagens novas
  useEffect(() => {
    if (msgs.length !== qtdRef.current) {
      qtdRef.current = msgs.length;
      fimRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [msgs]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const t = texto.trim();
    if (!t || enviando) return;
    setEnviando(true);
    try {
      await enviarMensagem(solicitacaoId, usuarioId, lado, nome, t);
      setTexto("");
      await carregar();
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="chat" aria-label="Conversa sobre o pedido">
      <div className="chat-lista" role="log" aria-live="polite">
        {carregando ? (
          <p className="chat-vazio"><Loader2 size={16} className="chat-giro" aria-hidden="true" /> Carregando conversa…</p>
        ) : msgs.length === 0 ? (
          <p className="chat-vazio">
            {lado === "visitante" ? "Nenhuma mensagem ainda. Tire dúvidas sobre sua coleta por aqui." : "Nenhuma mensagem ainda. Escreva para o visitante."}
          </p>
        ) : (
          msgs.map((m) => {
            const minha = m.autor_tipo === lado;
            return (
              <div key={m.id} className={`chat-msg ${minha ? "chat-msg--minha" : "chat-msg--outro"}`}>
                {!minha && <span className="chat-msg__autor">{m.autor_tipo === "admin" ? `ACMRB${m.autor_nome ? ` · ${m.autor_nome}` : ""}` : m.autor_nome ?? "Visitante"}</span>}
                <p className="chat-msg__texto">{m.texto}</p>
                <span className="chat-msg__meta">
                  {horaMsg(m.created_at)}
                  {minha &&
                    (m.lida_em ? (
                      <CheckCheck size={14} className="chat-msg__lida" aria-label={`Lida às ${horaMsg(m.lida_em)}`} />
                    ) : (
                      <Check size={14} aria-label="Enviada" />
                    ))}
                </span>
              </div>
            );
          })
        )}
        <div ref={fimRef} />
      </div>

      {erro && <p className="chat-erro" role="alert">{erro}</p>}

      {bloqueado ? (
        <p className="chat-bloqueado">Este pedido foi encerrado. A conversa fica disponível apenas para leitura.</p>
      ) : (
        <form className="chat-form" onSubmit={enviar}>
          <label htmlFor={`chat-${solicitacaoId}`} className="chat-sr">Mensagem</label>
          <textarea
            id={`chat-${solicitacaoId}`}
            rows={1}
            maxLength={2000}
            value={texto}
            placeholder="Escreva uma mensagem…"
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              // Enter envia; Shift+Enter quebra linha
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement).requestSubmit();
              }
            }}
          />
          <button type="submit" className="chat-enviar" disabled={!texto.trim() || enviando} aria-label="Enviar mensagem">
            {enviando ? <Loader2 size={18} className="chat-giro" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
          </button>
        </form>
      )}
    </section>
  );
}
