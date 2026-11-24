"use client";

/**
 * MensagensSection — chat geral com os visitantes (painel, deus e admin)
 * ------------------------------------------------------------
 * Mesmo padrão das telas de notícias, apoiadores e coletas:
 *  - topo com título e botão de atualizar;
 *  - cartões de números (clicar filtra a lista);
 *  - busca e filtro num cartão;
 *  - lista de conversas com selos (não lida, aguardando resposta, respondida);
 *  - a conversa abre na gaveta (PainelLateral) com cabeçalho e rodapé fixos.
 * Abrir a conversa marca as mensagens do visitante como lidas (feito no ChatGeral).
 * Os dados do visitante vêm da função chat_admin_conversas() (security
 * definer, só is_active_admin), pois o admin normal não lê a tabela de visitantes.
 * A lista se atualiza sozinha (tempo real + a cada INTERVALO_CHAT_MS).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCheck, Clock, Eye, Inbox, Lock, Mail, MapPin, MessageCircle, MessagesSquare, Phone, RefreshCw, Search, Star, XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ChatGeral from "@/components/chat/ChatGeral";
import Button from "@/components/ui/Button";
import PainelLateral from "@/components/admin/apoiadores/PainelLateral";
import { BOTAO_ACAO, CAIXA_VAZIA, CARTAO, SELECT, SELO, TEXTO_ACAO } from "@/components/admin/apoiadores/estilos";
import { INTERVALO_CHAT_MS, listarConversasAdmin, quandoCurto, type ConversaAdmin } from "@/services/chatGeral";
import { CANAIS_CONTATO, linkLigar, linkWhats } from "@/services/contaVisitante";
import { EVENTO_CHAT_LIDO } from "@/hooks/useChatNaoLidas";
import { mascaraTelefone } from "@/utils/validacao";
import { cn } from "@/utils/cn";

const semAcento = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// filtros da lista (os cartões de números usam os mesmos)
type Filtro = "" | "nao-lidas" | "aguardando" | "respondidas";

const ROTULO_FILTRO: Record<Exclude<Filtro, "">, string> = {
  "nao-lidas": "Não lidas",
  aguardando: "Aguardando resposta",
  respondidas: "Respondidas",
};

// em que situação a conversa está (a última mensagem foi de quem?)
const naoLida = (c: ConversaAdmin) => (c.nao_lidas || 0) > 0;
const aguardando = (c: ConversaAdmin) => !!c.ultima_msg_autor && c.ultima_msg_autor !== "admin";
const respondida = (c: ConversaAdmin) => c.ultima_msg_autor === "admin";

function passaFiltro(c: ConversaAdmin, f: Filtro) {
  if (f === "nao-lidas") return naoLida(c);
  if (f === "aguardando") return aguardando(c);
  if (f === "respondidas") return respondida(c);
  return true;
}

const inicial = (nome: string | null) => (nome ?? "V").trim().charAt(0).toUpperCase() || "V";

export default function MensagensSection() {
  const { user, perfil } = useAuth();
  const [lista, setLista] = useState<ConversaAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  // erro da última carga ("sem-permissao" quando o banco recusa)
  const [erroCarga, setErroCarga] = useState("");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("");
  const [abertaId, setAbertaId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLista(await listarConversasAdmin());
      setErroCarga("");
    } catch (e) {
      const msg = (e as Error).message;
      setErroCarga(msg.includes("42501") ? "sem-permissao" : msg);
    } finally {
      setCarregando(false);
    }
  }, []);

  // botão "atualizar" (mostra o ícone girando enquanto busca)
  const atualizar = useCallback(async () => {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }, [carregar]);

  useEffect(() => {
    void carregar();
    const t = setInterval(() => document.visibilityState === "visible" && void carregar(), INTERVALO_CHAT_MS);
    const canal = supabase
      .channel("admin-chat-conversas")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_mensagens" }, () => void carregar())
      .subscribe();
    const aoLer = () => void carregar();
    window.addEventListener(EVENTO_CHAT_LIDO, aoLer);
    return () => {
      clearInterval(t);
      window.removeEventListener(EVENTO_CHAT_LIDO, aoLer);
      void supabase.removeChannel(canal);
    };
  }, [carregar]);

  const filtradas = useMemo(() => {
    const q = semAcento(busca.trim());
    const qDig = q.replace(/\D/g, "");
    return lista.filter((c) => {
      if (!passaFiltro(c, filtro)) return false;
      if (!q) return true;
      return (
        semAcento(`${c.nome ?? ""} ${c.cidade ?? ""} ${c.bairro ?? ""} ${c.email ?? ""} ${c.ultima_msg_texto ?? ""}`).includes(q) ||
        (qDig.length >= 3 && (c.telefone ?? "").replace(/\D/g, "").includes(qDig))
      );
    });
  }, [lista, busca, filtro]);

  const aberta = lista.find((c) => c.conversa_id === abertaId) ?? null;
  const totalNaoLidas = lista.reduce((s, c) => s + (c.nao_lidas || 0), 0);

  // gaveta: função estável, senão o PainelLateral pega o foco de novo a cada render
  const fecharConversa = useCallback(() => setAbertaId(null), []);

  // cartões de números
  const cartoes: { id: Filtro; rotulo: string; valor: number; icone: typeof Inbox; cor: string; anel: string }[] = [
    { id: "", rotulo: "Conversas", valor: lista.length, icone: MessagesSquare, cor: "bg-brand-mint text-brand", anel: "border-brand" },
    { id: "nao-lidas", rotulo: `Não lidas${totalNaoLidas ? ` (${totalNaoLidas} msg)` : ""}`, valor: lista.filter(naoLida).length, icone: Mail, cor: "bg-red-50 text-danger", anel: "border-red-300" },
    { id: "aguardando", rotulo: "Aguardando resposta", valor: lista.filter(aguardando).length, icone: Clock, cor: "bg-amber-50 text-amber-700", anel: "border-amber-300" },
    { id: "respondidas", rotulo: "Respondidas", valor: lista.filter(respondida).length, icone: CheckCheck, cor: "bg-emerald-50 text-emerald-700", anel: "border-emerald-300" },
  ];

  /* ---------- Sem permissão ---------- */
  if (erroCarga === "sem-permissao") {
    return (
      <div role="alert" className={cn(CARTAO, "mx-auto my-8 flex max-w-md flex-col items-center gap-2.5 p-8 text-center text-brand")}>
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-mint">
          <Lock size={26} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-extrabold text-ink">Sem permissão para ver as mensagens</h2>
        <p className="text-sm text-ink-soft">Só administradores ativos leem e respondem as conversas dos visitantes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black tracking-tight text-ink sm:text-2xl">Mensagens</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Conversas dos visitantes com a equipe. Abra uma conversa para ler, responder e ver o contato.
            {totalNaoLidas > 0 && (
              <strong className="text-danger"> {totalNaoLidas} mensage{totalNaoLidas > 1 ? "ns" : "m"} não lida{totalNaoLidas > 1 ? "s" : ""}.</strong>
            )}
          </p>
        </div>
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void atualizar()} className="max-sm:w-full">
          <RefreshCw size={16} aria-hidden="true" className={cn(atualizando && "animate-spin")} /> Atualizar
        </Button>
      </div>

      {/* Indicadores (clicar filtra a lista) */}
      <ul className="grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4" aria-label="Resumo das conversas">
        {cartoes.map((k) => {
          const Icone = k.icone;
          const ativo = filtro === k.id;
          return (
            <li key={k.rotulo}>
              <button
                type="button"
                aria-pressed={ativo}
                className={cn(
                  CARTAO,
                  "flex h-full w-full cursor-pointer items-center gap-3 border-2 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:p-4",
                  ativo ? k.anel : "border-transparent",
                )}
                onClick={() => setFiltro(ativo ? "" : k.id)}
              >
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", k.cor)}>
                  <Icone size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <strong className="block text-2xl font-black leading-none text-ink">{carregando ? "–" : k.valor}</strong>
                  <span className="text-[0.78rem] font-semibold leading-tight text-ink-soft">{k.rotulo}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Busca e filtro num cartão só */}
      <div className={cn(CARTAO, "grid gap-2.5 p-3 sm:grid-cols-[minmax(0,1fr)_14rem_auto]")}>
        <label className="flex h-11 min-w-0 items-center gap-2 rounded-control border border-line bg-white px-3 text-ink-muted focus-within:border-brand focus-within:shadow-focus">
          <Search size={16} aria-hidden="true" className="shrink-0" />
          <span className="sr-only">Buscar conversa</span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, telefone, cidade…"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[0.9rem] text-ink outline-none"
          />
        </label>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value as Filtro)} aria-label="Filtrar conversas" className={SELECT}>
          <option value="">Todas as conversas</option>
          {(Object.keys(ROTULO_FILTRO) as Exclude<Filtro, "">[]).map((f) => (
            <option key={f} value={f}>{ROTULO_FILTRO[f]}</option>
          ))}
        </select>
        {(busca || filtro) && (
          <Button type="button" variante="secundario" tamanho="pequeno" className="h-11" onClick={() => { setBusca(""); setFiltro(""); }}>
            <XCircle size={16} aria-hidden="true" /> Limpar
          </Button>
        )}
      </div>

      {carregando ? (
        // esqueleto no lugar da lista
        <ul className="flex flex-col gap-3" aria-label="Carregando conversas">
          {[0, 1, 2].map((i) => (
            <li key={i} className={cn(CARTAO, "flex animate-pulse items-center gap-3 p-4")}>
              <div className="size-11 shrink-0 rounded-full bg-zinc-100" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-1/3 rounded-full bg-zinc-100" />
                <div className="h-3 w-2/3 rounded-full bg-zinc-100" />
              </div>
            </li>
          ))}
        </ul>
      ) : erroCarga ? (
        <div className={cn(CAIXA_VAZIA, "border-red-200 text-danger")} role="alert">
          Erro ao carregar: {erroCarga}
          <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void atualizar()}>
            <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
          </Button>
        </div>
      ) : filtradas.length === 0 ? (
        <div className={CAIXA_VAZIA}>
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-brand"><Inbox size={22} aria-hidden="true" /></span>
          {lista.length ? "Nenhuma conversa com essa busca ou filtro." : "Nenhum visitante mandou mensagem ainda."}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtradas.map((c) => {
            const whats = linkWhats(c.telefone);
            const ligar = linkLigar(c.telefone);
            const lugar = [c.bairro, c.cidade].filter(Boolean).join(", ");
            return (
              <li
                key={c.conversa_id}
                className={cn(
                  CARTAO,
                  "flex flex-col gap-3 p-3 transition hover:border-brand-line sm:p-4 lg:flex-row lg:items-center",
                  naoLida(c) && "border-l-4 border-l-danger",
                )}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-mint text-base font-black text-brand" aria-hidden="true">
                    {inicial(c.nome)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="min-w-0 truncate text-[0.95rem] font-extrabold text-ink sm:text-base">{c.nome ?? "Visitante"}</h3>
                      <time className={cn("shrink-0 text-[0.75rem]", naoLida(c) ? "font-bold text-danger" : "text-ink-muted")}>
                        {quandoCurto(c.ultima_msg_em)}
                      </time>
                    </div>
                    <p className="truncate text-[0.84rem] text-zinc-600">
                      {c.ultima_msg_autor === "admin" && <span className="font-bold text-brand">Você: </span>}
                      {c.ultima_msg_texto ?? "Sem mensagens ainda."}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {naoLida(c) ? (
                        <span className={cn(SELO, "bg-danger text-white")} aria-label={`${c.nao_lidas} mensagens não lidas`}>
                          <Mail size={11} aria-hidden="true" /> {c.nao_lidas} não lida{c.nao_lidas > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className={cn(SELO, "bg-zinc-100 text-zinc-600")}><Eye size={11} aria-hidden="true" /> Lida</span>
                      )}
                      {aguardando(c) && <span className={cn(SELO, "bg-amber-50 text-amber-800")}><Clock size={11} aria-hidden="true" /> Aguardando resposta</span>}
                      {respondida(c) && <span className={cn(SELO, "bg-emerald-50 text-emerald-800")}><CheckCheck size={11} aria-hidden="true" /> Respondida</span>}
                      {c.telefone && <span className={cn(SELO, "bg-surface-alt text-zinc-600")}><Phone size={11} aria-hidden="true" /> {mascaraTelefone(c.telefone)}</span>}
                      {lugar && <span className={cn(SELO, "max-w-full bg-surface-alt text-zinc-600")}><MapPin size={11} aria-hidden="true" /> <span className="truncate">{lugar}</span></span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-3 lg:border-0 lg:pt-0">
                  <button
                    type="button"
                    className={cn(BOTAO_ACAO, "border-brand-line bg-brand-soft text-brand")}
                    onClick={() => setAbertaId(c.conversa_id)}
                    title="Abrir conversa"
                    aria-label={`Abrir conversa com ${c.nome ?? "visitante"}`}
                  >
                    <MessageCircle size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Abrir conversa</span>
                  </button>
                  {whats && (
                    <a href={whats} target="_blank" rel="noopener noreferrer" className={BOTAO_ACAO} title="Abrir WhatsApp" aria-label="Abrir WhatsApp">
                      <MessagesSquare size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>WhatsApp</span>
                    </a>
                  )}
                  {ligar && (
                    <a href={ligar} className={BOTAO_ACAO} title="Ligar" aria-label="Ligar">
                      <Phone size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Ligar</span>
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ===== Conversa aberta (gaveta) ===== */}
      {aberta && user && (
        <PainelLateral
          aberto
          titulo={aberta.nome ?? "Visitante"}
          onFechar={fecharConversa}
          rodape={
            <>
              {aberta.email && (
                <a href={`mailto:${aberta.email}`} className={cn(BOTAO_ACAO, "h-10")} title="Enviar e-mail" aria-label="Enviar e-mail">
                  <Mail size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>E-mail</span>
                </a>
              )}
              <Button type="button" variante="contorno" tamanho="pequeno" onClick={fecharConversa}>Fechar</Button>
            </>
          }
        >
          <DadosContato c={aberta} />
          <ChatGeral
            key={aberta.conversa_id}
            conversaId={aberta.conversa_id}
            usuarioId={user.id}
            lado="admin"
            nome={perfil?.nome ?? "Equipe ACMRB"}
            alturaLista="h-[clamp(260px,calc(100dvh-24rem),600px)]"
            vazio="Nenhuma mensagem nesta conversa."
          />
        </PainelLateral>
      )}
    </div>
  );
}

/* ---------- contato do visitante (topo da gaveta) ---------- */
function DadosContato({ c }: { c: ConversaAdmin }) {
  const whats = linkWhats(c.telefone);
  const ligar = linkLigar(c.telefone);
  const lugar = [c.bairro, c.cidade].filter(Boolean).join(", ");
  return (
    <section className={cn(CARTAO, "flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4")} aria-label="Contato do visitante">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-mint text-lg font-black text-brand" aria-hidden="true">
          {inicial(c.nome)}
        </span>
        <div className="min-w-0 text-[0.84rem] text-zinc-600">
          <p className="truncate font-bold text-ink">{c.telefone ? mascaraTelefone(c.telefone) : "Sem telefone informado"}</p>
          {lugar && <p className="flex min-w-0 items-center gap-1"><MapPin size={12} aria-hidden="true" className="shrink-0" /> <span className="truncate">{lugar}</span></p>}
          {c.email && <p className="truncate">{c.email}</p>}
          {c.contato_preferido && (
            <p className="flex items-center gap-1 font-semibold text-amber-700">
              <Star size={12} aria-hidden="true" /> Prefere {CANAIS_CONTATO[c.contato_preferido as keyof typeof CANAIS_CONTATO] ?? c.contato_preferido}
            </p>
          )}
        </div>
      </div>
      {(whats || ligar) && (
        <div className="flex flex-wrap gap-1.5">
          {whats && (
            <a href={whats} target="_blank" rel="noopener noreferrer" className={cn(BOTAO_ACAO, "border-emerald-200 bg-emerald-50 text-emerald-800")} aria-label="Abrir WhatsApp">
              <MessagesSquare size={15} aria-hidden="true" /> WhatsApp
            </a>
          )}
          {ligar && (
            <a href={ligar} className={BOTAO_ACAO} aria-label="Ligar">
              <Phone size={15} aria-hidden="true" /> Ligar
            </a>
          )}
        </div>
      )}
    </section>
  );
}
