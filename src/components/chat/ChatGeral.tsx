"use client";

/**
 * ChatGeral — conversa estilo WhatsApp entre visitante e equipe ACMRB
 * ------------------------------------------------------------
 * Usado em /mensagens (visitante) e na seção "Mensagens" do painel.
 *  - Balões com hora; separadores "Hoje", "Ontem", data
 *  - Ticks: ✓ enviando · ✓✓ enviada · ✓✓ azul "Visualizada"
 *  - Rola até o fim quando chega mensagem; Enter envia (Shift+Enter quebra)
 *  - Realtime quando disponível + atualização a cada 12 s
 *  - Abrir/receber marca como lidas as mensagens do outro lado
 * CSS: src/styles/chat-geral.css (prefixo "cg-").
 */

import { Fragment, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Check, CheckCheck, Loader2, MessageCircle, Send } from "lucide-react";
import "@/styles/chat-geral.css";
import { supabase } from "@/lib/supabase";
import {
  enviarMensagemChat, horaCurta, INTERVALO_CHAT_MS, listarMensagensChat, marcarLidasChat, rotuloDia,
  type LadoChat, type MensagemChat,
} from "@/lib/chatGeral";
import { EVENTO_CHAT_LIDO } from "@/hooks/useChatNaoLidas";

interface Props {
  conversaId: string;
  usuarioId: string;
  lado: LadoChat;
  nome: string;
  /** Texto do estado vazio */
  vazio?: string;
  /** Altura extra (ex.: painel) */
  className?: string;
}

type MsgTela = MensagemChat & { pendente?: boolean };

export default function ChatGeral({ conversaId, usuarioId, lado, nome, vazio, className }: Props) {
  const [msgs, setMsgs] = useState<MsgTela[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const listaRef = useRef<HTMLDivElement>(null);
  const qtdRef = useRef(0);

  const carregar = useCallback(async () => {
    try {
      const lista = await listarMensagensChat(conversaId);
      setMsgs((atual) => [...lista, ...atual.filter((m) => m.pendente && !lista.some((l) => l.texto === m.texto && l.autor_tipo === m.autor_tipo))]);
      setErro("");
      if (lista.some((m) => m.autor_tipo !== lado && !m.lida_em)) {
        await marcarLidasChat(conversaId);
        window.dispatchEvent(new Event(EVENTO_CHAT_LIDO));
      }
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }, [conversaId, lado]);

  useEffect(() => {
    setCarregando(true);
    setMsgs([]);
    qtdRef.current = 0;
    void carregar();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") void carregar();
    }, INTERVALO_CHAT_MS);
    const canal = supabase
      .channel(`chat-geral-${conversaId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_mensagens", filter: `conversa_id=eq.${conversaId}` }, () => void carregar())
      .subscribe();
    return () => {
      clearInterval(t);
      void supabase.removeChannel(canal);
    };
  }, [conversaId, carregar]);

  // Rola até o fim quando o número de mensagens muda
  useEffect(() => {
    if (msgs.length !== qtdRef.current) {
      const primeira = qtdRef.current === 0;
      qtdRef.current = msgs.length;
      const el = listaRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: primeira ? "auto" : "smooth" });
    }
  }, [msgs]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const t = texto.trim();
    if (!t) return;
    // Envio otimista: aparece na hora com ✓ (pendente)
    const temp: MsgTela = {
      id: `tmp-${Date.now()}`, conversa_id: conversaId, autor_id: usuarioId, autor_tipo: lado, autor_nome: nome,
      texto: t, created_at: new Date().toISOString(), lida_em: null, pendente: true,
    };
    setMsgs((m) => [...m, temp]);
    setTexto("");
    try {
      await enviarMensagemChat(conversaId, usuarioId, lado, nome, t);
      setMsgs((m) => m.filter((x) => x.id !== temp.id));
      await carregar();
    } catch (err) {
      setMsgs((m) => m.filter((x) => x.id !== temp.id));
      setTexto(t);
      setErro((err as Error).message);
    }
  }

  let diaAnterior = "";

  return (
    <section className={`cg ${className ?? ""}`} aria-label="Conversa com a equipe ACMRB">
      <div className="cg-lista" ref={listaRef} role="log" aria-live="polite">
        {carregando ? (
          <p className="cg-vazio"><Loader2 size={16} className="cg-giro" aria-hidden="true" /> Carregando conversa…</p>
        ) : msgs.length === 0 ? (
          <div className="cg-vazio cg-vazio--grande">
            <MessageCircle size={34} aria-hidden="true" />
            <p>{vazio ?? "Nenhuma mensagem ainda. Mande um oi!"}</p>
          </div>
        ) : (
          msgs.map((m) => {
            const minha = m.autor_tipo === lado;
            const dia = rotuloDia(m.created_at);
            const separador = dia !== diaAnterior;
            diaAnterior = dia;
            return (
              <Fragment key={m.id}>
                {separador && <div className="cg-dia"><span>{dia}</span></div>}
                <div className={`cg-msg ${minha ? "cg-msg--minha" : "cg-msg--outro"}`}>
                  {!minha && lado === "visitante" && (
                    <span className="cg-msg__autor">ACMRB{m.autor_nome ? ` · ${m.autor_nome.split(" ")[0]}` : ""}</span>
                  )}
                  <p className="cg-msg__texto">{m.texto}</p>
                  <span className="cg-msg__meta">
                    <time dateTime={m.created_at}>{horaCurta(m.created_at)}</time>
                    {minha &&
                      (m.pendente ? (
                        <Check size={15} aria-label="Enviando" />
                      ) : m.lida_em ? (
                        <CheckCheck size={15} className="cg-msg__lida" aria-label={`Visualizada às ${horaCurta(m.lida_em)}`} />
                      ) : (
                        <CheckCheck size={15} aria-label="Enviada" />
                      ))}
                  </span>
                </div>
              </Fragment>
            );
          })
        )}
        {(() => {
          // "Visualizada" abaixo da última mensagem minha já lida
          const ultima = [...msgs].reverse().find((m) => m.autor_tipo === lado);
          return ultima?.lida_em && msgs[msgs.length - 1]?.id === ultima.id ? <p className="cg-visto">Visualizada</p> : null;
        })()}
      </div>

      {erro && <p className="cg-erro" role="alert">{erro}</p>}

      <form className="cg-form" onSubmit={enviar}>
        <label htmlFor={`cg-${conversaId}`} className="cg-sr">Mensagem</label>
        <textarea
          id={`cg-${conversaId}`}
          rows={1}
          maxLength={2000}
          value={texto}
          placeholder="Digite uma mensagem"
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement).requestSubmit();
            }
          }}
        />
        <button type="submit" className="cg-enviar" disabled={!texto.trim()} aria-label="Enviar mensagem">
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
