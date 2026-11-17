"use client";

/**
 * ChatColeta — conversa de um pedido de coleta (visitante ↔ admins)
 * ------------------------------------------------------------
 * - Atualiza em tempo real (Supabase Realtime) quando disponível e,
 *   de qualquer forma, a cada 15 s (reserva simples e confiável).
 * - Marca como lidas as mensagens do outro lado ao abrir/receber.
 * - Indicadores: ✓ enviada, ✓✓ lida (verde).
 * Visual: Tailwind.
 */

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Check, CheckCheck, Send } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";
import { supabase } from "@/lib/supabase";
import { enviarMensagem, listarMensagens, marcarLidas, type Mensagem } from "@/services/coletas";

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
    <section className="flex min-h-0 flex-col overflow-hidden rounded-[1.1rem] border border-emerald-100 bg-[#f7faf8]" aria-label="Conversa sobre o pedido">
      <div
        className="flex h-[clamp(240px,45dvh,420px)] flex-col gap-2 overflow-y-auto overscroll-contain p-4 max-[480px]:h-[clamp(220px,50dvh,360px)] max-[480px]:p-2.5"
        role="log"
        aria-live="polite"
      >
        {carregando ? (
          <p className="m-auto flex items-center gap-1.5 text-center text-[0.86rem] text-zinc-500"><Spinner tamanho={16} /> Carregando conversa…</p>
        ) : msgs.length === 0 ? (
          <p className="m-auto flex items-center gap-1.5 text-center text-[0.86rem] text-zinc-500">
            {lado === "visitante" ? "Nenhuma mensagem ainda. Tire dúvidas sobre sua coleta por aqui." : "Nenhuma mensagem ainda. Escreva para o visitante."}
          </p>
        ) : (
          msgs.map((m) => {
            const minha = m.autor_tipo === lado;
            return (
              <div
                key={m.id}
                className={cn(
                  "flex max-w-[min(80%,32rem)] flex-col gap-1 rounded-2xl px-3.5 py-2 shadow-[0_1px_2px_rgb(0_0_0/0.05)] max-[480px]:max-w-[88%]",
                  minha
                    ? "self-end rounded-br-[0.3rem] bg-brand text-white"
                    : "self-start rounded-bl-[0.3rem] border border-zinc-200 bg-white text-zinc-900",
                )}
              >
                {!minha && (
                  <span className="text-[0.72rem] font-extrabold text-brand">
                    {m.autor_tipo === "admin" ? `ACMRB${m.autor_nome ? ` · ${m.autor_nome}` : ""}` : m.autor_nome ?? "Visitante"}
                  </span>
                )}
                <p className="m-0 whitespace-pre-wrap break-words text-left text-[0.9rem] leading-snug hyphens-none">{m.texto}</p>
                <span className={cn("inline-flex items-center gap-1 self-end text-[0.68rem]", minha ? "opacity-75" : "text-zinc-500 opacity-75")}>
                  {horaMsg(m.created_at)}
                  {minha &&
                    (m.lida_em ? (
                      <CheckCheck size={14} className="text-emerald-300" aria-label={`Lida às ${horaMsg(m.lida_em)}`} />
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

      {erro && <p className="m-0 bg-danger-soft px-4 py-2 text-[0.8rem] text-danger" role="alert">{erro}</p>}

      {bloqueado ? (
        <p className="m-0 border-t border-zinc-200 bg-white px-4 py-3 text-center text-[0.82rem] text-zinc-500">
          Este pedido foi encerrado. A conversa fica disponível apenas para leitura.
        </p>
      ) : (
        <form className="flex items-end gap-2 border-t border-zinc-200 bg-white p-2.5" onSubmit={enviar}>
          <label htmlFor={`chat-${solicitacaoId}`} className="sr-only">Mensagem</label>
          <textarea
            id={`chat-${solicitacaoId}`}
            rows={1}
            maxLength={2000}
            value={texto}
            placeholder="Escreva uma mensagem…"
            className="max-h-32 min-h-[2.6rem] min-w-0 flex-1 resize-y rounded-[0.9rem] border border-zinc-200 px-3 py-2.5 text-base outline-none focus:border-brand focus:shadow-focus sm:text-[0.92rem]"
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              // Enter envia; Shift+Enter quebra linha
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement).requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            className="inline-flex size-[2.6rem] shrink-0 cursor-pointer items-center justify-center rounded-[0.9rem] bg-brand text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!texto.trim() || enviando}
            aria-label="Enviar mensagem"
          >
            {enviando ? <Spinner tamanho={18} className="text-white" /> : <Send size={18} aria-hidden="true" />}
          </button>
        </form>
      )}
    </section>
  );
}
