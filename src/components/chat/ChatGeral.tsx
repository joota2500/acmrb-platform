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
 * Visual: Tailwind (balões e caixa de envio).
 */

import { Fragment, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Check, CheckCheck, MessageCircle, Send } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";
import { supabase } from "@/lib/supabase";
import {
  enviarMensagemChat, horaCurta, INTERVALO_CHAT_MS, listarMensagensChat, marcarLidasChat, rotuloDia,
  type LadoChat, type MensagemChat,
} from "@/services/chatGeral";
import { EVENTO_CHAT_LIDO } from "@/hooks/useChatNaoLidas";

interface Props {
  conversaId: string;
  usuarioId: string;
  lado: LadoChat;
  nome: string;
  /** Texto do estado vazio */
  vazio?: string;
  /** Classes extras da caixa (ex.: tirar a borda quando já está dentro de outro cartão) */
  className?: string;
  /** Classe de altura da lista de mensagens (o padrão serve para a página do visitante) */
  alturaLista?: string;
}

type MsgTela = MensagemChat & { pendente?: boolean };

export default function ChatGeral({ conversaId, usuarioId, lado, nome, vazio, className, alturaLista }: Props) {
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
    <section
      className={cn("flex min-h-0 flex-col overflow-hidden rounded-[1.1rem] border border-brand-mint bg-brand-soft", className)}
      aria-label="Conversa com a equipe ACMRB"
    >
      <div
        className={cn(
          "flex flex-col gap-1.5 overflow-y-auto overscroll-contain bg-brand-soft bg-[radial-gradient(rgb(46_94_78/0.07)_1px,transparent_1px)] bg-size-[18px_18px] px-2 py-3 sm:px-3.5 sm:py-4",
          alturaLista ?? "h-[clamp(300px,62dvh,520px)] sm:h-[clamp(320px,60dvh,560px)]",
        )}
        ref={listaRef}
        role="log"
        aria-live="polite"
      >
        {carregando ? (
          <p className="m-auto flex items-center gap-1.5 text-center text-sm text-zinc-600">
            <Spinner tamanho={16} /> Carregando conversa…
          </p>
        ) : msgs.length === 0 ? (
          <div className="m-auto flex max-w-72 flex-col items-center gap-2.5 text-center text-brand">
            <MessageCircle size={34} aria-hidden="true" />
            <p className="m-0 text-center text-sm text-zinc-600">{vazio ?? "Nenhuma mensagem ainda. Mande um oi!"}</p>
          </div>
        ) : (
          msgs.map((m) => {
            const minha = m.autor_tipo === lado;
            const dia = rotuloDia(m.created_at);
            const separador = dia !== diaAnterior;
            diaAnterior = dia;
            return (
              <Fragment key={m.id}>
                {separador && (
                  <div className="mb-1.5 mt-2.5 flex justify-center">
                    <span className="rounded-lg bg-white px-3 py-0.5 text-xs font-bold text-brand-dark shadow-sm">{dia}</span>
                  </div>
                )}
                <div
                  className={cn(
                    "relative flex max-w-[86%] flex-col rounded-[0.85rem] px-2.5 pb-1 pt-1.5 text-zinc-900 shadow-[0_1px_1px_rgb(0_0_0/0.08)] sm:max-w-[min(78%,34rem)]",
                    minha ? "self-end rounded-tr-[0.2rem] bg-brand-mint" : "self-start rounded-tl-[0.2rem] bg-white",
                  )}
                >
                  {!minha && lado === "visitante" && (
                    <span className="mb-0.5 text-xs font-extrabold text-brand">ACMRB{m.autor_nome ? ` · ${m.autor_nome.split(" ")[0]}` : ""}</span>
                  )}
                  <p className="m-0 whitespace-pre-wrap break-words text-left text-[0.92rem] leading-snug hyphens-none">{m.texto}</p>
                  <span className="mt-0.5 inline-flex items-center gap-1 self-end text-[0.66rem] text-ink-muted">
                    <time dateTime={m.created_at}>{horaCurta(m.created_at)}</time>
                    {minha &&
                      (m.pendente ? (
                        <Check size={15} aria-label="Enviando" />
                      ) : m.lida_em ? (
                        <CheckCheck size={15} className="text-[#34B7F1]" aria-label={`Visualizada às ${horaCurta(m.lida_em)}`} />
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
          return ultima?.lida_em && msgs[msgs.length - 1]?.id === ultima.id ? (
            <p className="mb-0 ml-0 mr-1 mt-0.5 self-end text-[0.7rem] text-ink-muted">Visualizada</p>
          ) : null;
        })()}
      </div>

      {erro && (
        <p className="m-0 bg-danger-soft px-4 py-2 text-xs text-danger" role="alert">
          {erro}
        </p>
      )}

      <form className="flex items-end gap-2 border-t border-zinc-200 bg-zinc-100 p-2.5" onSubmit={enviar}>
        <label htmlFor={`cg-${conversaId}`} className="sr-only">
          Mensagem
        </label>
        <textarea
          id={`cg-${conversaId}`}
          rows={1}
          maxLength={2000}
          value={texto}
          placeholder="Digite uma mensagem"
          className="max-h-32 min-h-10.5 min-w-0 flex-1 resize-none rounded-[1.3rem] border border-zinc-200 bg-white px-3.5 py-2.5 text-base outline-none [field-sizing:content] focus:border-brand focus:shadow-focus sm:text-[0.92rem]"
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement).requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:enabled:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!texto.trim()}
          aria-label="Enviar mensagem"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
