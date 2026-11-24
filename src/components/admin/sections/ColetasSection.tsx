"use client";

/**
 * Seção "Coletas" do painel (deus e admin normal)
 * ------------------------------------------------------------
 * Abas:
 *  - Pedidos: lista com filtros (status, bairro, data do pedido) e
 *    contagem de mensagens não lidas.
 *  - Mapa: pedidos no mapa (cor = status).
 *  - Rota do dia: agendados para a data escolhida, ordenados por
 *    bairro, com link de rota no Google Maps encadeando os endereços.
 * Detalhe (gaveta): ao abrir, "enviado" vira "recebido"; mostra foto,
 * linha do tempo, permite mudar status e data agendada; e o chat.
 * RLS: is_active_admin() (admin e deus). Fotos: bucket privado, abertas
 * por link assinado (urlFoto). Status muda direto na tabela; as triggers
 * do banco cuidam do resto (linha do tempo, avisos).
 * Visual só com Tailwind, no mesmo padrão de notícias/apoiadores
 * (o antigo admin-coletas.css foi apagado).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  CalendarClock, CheckCircle2, ExternalLink, Eye, Inbox, Loader2, Lock, MapPin, MessageCircle, Navigation, RefreshCw, Save, Send, Truck, XCircle,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import ChatColeta from "@/components/coletas/ChatColeta";
import LinhaTempoColeta from "@/components/coletas/LinhaTempoColeta";
import {
  PERIODOS, ROTULO_STATUS, STATUS_COLETA, dataBR, dataHoraBR, linkRota, urlFoto, type Solicitacao, type StatusColeta,
} from "@/services/coletas";
import Button from "@/components/ui/Button";
import PainelLateral from "@/components/admin/apoiadores/PainelLateral";
import { cn } from "@/utils/cn";
import {
  BLOCO, BOTAO_ACAO, CAIXA_VAZIA, CAMPO, CARTAO, CONTROLE, ROTULO, SELECT, SELO, TEXTO_ACAO, TITULO_BLOCO,
} from "@/components/admin/apoiadores/estilos";

const MapaColetas = dynamic(() => import("@/components/mapa/MapaColetas"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center rounded-card bg-emerald-50 font-semibold text-leaf">Carregando mapa…</div>,
});

type Aba = "pedidos" | "mapa" | "rota";

// cor e ícone de cada status (selo, cartões do topo)
const COR_STATUS: Record<StatusColeta, string> = {
  enviado: "bg-zinc-100 text-zinc-700",
  recebido: "bg-sky-100 text-sky-800",
  agendado: "bg-amber-100 text-amber-800",
  concluido: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-red-100 text-red-700",
};
const ICONE_STATUS: Record<StatusColeta, LucideIcon> = {
  enviado: Send,
  recebido: Inbox,
  agendado: CalendarClock,
  concluido: CheckCircle2,
  cancelado: XCircle,
};
// borda colorida do cartão quando o filtro daquele status está ligado
const ANEL_STATUS: Record<StatusColeta, string> = {
  enviado: "border-zinc-400",
  recebido: "border-sky-400",
  agendado: "border-amber-400",
  concluido: "border-emerald-500",
  cancelado: "border-red-400",
};
const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const diaLocal = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function ColetasSection() {
  const { user, perfil } = useAuth();
  const { mostrar } = useToast();
  const [aba, setAba] = useState<Aba>("pedidos");
  const [lista, setLista] = useState<Solicitacao[]>([]);
  const [naoLidas, setNaoLidas] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [fStatus, setFStatus] = useState<StatusColeta | "">("");
  const [fBairro, setFBairro] = useState("");
  const [fData, setFData] = useState("");
  const [diaRota, setDiaRota] = useState(hojeISO());
  const [abertoId, setAbertoId] = useState<string | null>(null);
  // erro da última carga ("sem-permissao" quando o banco recusa)
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from("coleta_solicitacoes").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) {
      mostrar("erro", "Não foi possível carregar os pedidos. A migration de coletas já foi rodada?");
      setErroCarga(error.code === "42501" ? "sem-permissao" : error.message);
      setCarregando(false);
      return;
    }
    setErroCarga(null);
    setLista((data ?? []) as Solicitacao[]);
    // mensagens de visitantes ainda não lidas, por pedido
    const { data: msgs } = await supabase.from("coleta_mensagens").select("solicitacao_id").eq("autor_tipo", "visitante").is("lida_em", null).limit(1000);
    const mapa: Record<string, number> = {};
    for (const m of (msgs ?? []) as { solicitacao_id: string }[]) mapa[m.solicitacao_id] = (mapa[m.solicitacao_id] ?? 0) + 1;
    setNaoLidas(mapa);
    setCarregando(false);
  }, [mostrar]);

  useEffect(() => {
    void carregar();
    const t = setInterval(() => document.visibilityState === "visible" && void carregar(), 30_000);
    return () => clearInterval(t);
  }, [carregar]);

  const bairros = useMemo(() => Array.from(new Set(lista.map((s) => s.bairro))).sort((a, b) => a.localeCompare(b, "pt-BR")), [lista]);
  const filtrados = lista.filter(
    (s) => (!fStatus || s.status === fStatus) && (!fBairro || s.bairro === fBairro) && (!fData || diaLocal(s.created_at) === fData),
  );
  const rota = lista
    .filter((s) => s.status === "agendado" && s.data_agendada === diaRota)
    .sort((a, b) => a.bairro.localeCompare(b.bairro, "pt-BR") || a.endereco.localeCompare(b.endereco, "pt-BR"));
  const urlRota = linkRota(rota);
  const contagem = (st: StatusColeta) => lista.filter((s) => s.status === st).length;
  const aberto = lista.find((s) => s.id === abertoId) ?? null;

  // useCallback: o PainelLateral refaz o foco se esta função mudar a cada render
  const fecharDetalhe = useCallback(() => setAbertoId(null), []);

  // botão de atualizar (gira enquanto busca)
  async function atualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }
  const mensagensNovas = Object.values(naoLidas).reduce((t, n) => t + n, 0);

  /* ---------- Sem permissão ---------- */
  if (erroCarga === "sem-permissao") {
    return (
      <div role="alert" className={cn(CARTAO, "mx-auto my-8 flex max-w-md flex-col items-center gap-2.5 p-8 text-center text-brand")}>
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-mint">
          <Lock size={26} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-extrabold text-ink">Sem permissão para ver as coletas</h2>
        <p className="text-sm text-ink-soft">Só administradores ativos veem os pedidos de coleta.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black tracking-tight text-ink sm:text-2xl">Coletas</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Pedidos de coleta dos visitantes. Abra um pedido para ver a foto, mudar o status, agendar e conversar.
            {mensagensNovas > 0 && <strong className="text-danger"> {mensagensNovas} mensagem(ns) nova(s).</strong>}
          </p>
        </div>
        <Button type="button" tamanho="pequeno" onClick={() => setAba("rota")} className="max-sm:w-full">
          <Truck size={16} aria-hidden="true" /> Rota do dia
        </Button>
      </div>

      {/* Indicadores (clicar filtra pelo status) */}
      <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 xl:grid-cols-5" aria-label="Pedidos por status">
        {STATUS_COLETA.map((st) => {
          const Icone = ICONE_STATUS[st];
          const ativo = fStatus === st;
          return (
            <li key={st} className={cn(st === "cancelado" && "max-sm:col-span-2")}>
              <button
                type="button"
                aria-pressed={ativo}
                className={cn(
                  CARTAO,
                  "flex w-full cursor-pointer items-center gap-3 border-2 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  ativo ? ANEL_STATUS[st] : "border-transparent",
                )}
                onClick={() => { setFStatus(ativo ? "" : st); setAba("pedidos"); }}
              >
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", COR_STATUS[st])}>
                  <Icone size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <strong className="block text-2xl font-black leading-none text-ink">{carregando ? "–" : contagem(st)}</strong>
                  <span className="text-[0.78rem] font-semibold text-ink-soft">{ROTULO_STATUS[st]}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Abas + filtros num cartão só */}
      <div className={cn(CARTAO, "flex flex-col gap-3 p-3")}>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 grid-cols-3 gap-1 rounded-2xl bg-surface-alt p-1 ring-1 ring-line" role="tablist" aria-label="Visualização">
            {(["pedidos", "mapa", "rota"] as Aba[]).map((a) => (
              <button
                key={a}
                type="button"
                role="tab"
                aria-selected={aba === a}
                className={cn(
                  "h-9 cursor-pointer rounded-xl text-[0.85rem] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand sm:text-[0.9rem]",
                  aba === a ? "bg-white text-brand shadow-sm ring-1 ring-black/5" : "text-ink-muted hover:text-brand",
                )}
                onClick={() => setAba(a)}
              >
                {a === "pedidos" ? "Pedidos" : a === "mapa" ? "Mapa" : "Rota do dia"}
              </button>
            ))}
          </div>
          <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void atualizar()} aria-label="Atualizar" title="Atualizar" className="h-11">
            <RefreshCw size={16} aria-hidden="true" className={cn(atualizando && "animate-spin")} />
          </Button>
        </div>

        {aba !== "rota" && (
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-[13rem_13rem_minmax(0,16rem)_auto]">
            <select value={fStatus} onChange={(e) => setFStatus(e.target.value as StatusColeta | "")} aria-label="Filtrar por status" className={SELECT}>
              <option value="">Todos os status</option>
              {STATUS_COLETA.map((st) => <option key={st} value={st}>{ROTULO_STATUS[st]}</option>)}
            </select>
            <select value={fBairro} onChange={(e) => setFBairro(e.target.value)} aria-label="Filtrar por bairro" className={SELECT}>
              <option value="">Todos os bairros</option>
              {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <label className="col-span-2 flex h-11 min-w-0 items-center gap-2 rounded-control border border-line bg-white pl-3 text-[0.8rem] font-bold text-zinc-600 focus-within:border-brand focus-within:shadow-focus lg:col-span-1">
              <span className="whitespace-nowrap">Pedido em</span>
              <input type="date" value={fData} onChange={(e) => setFData(e.target.value)} className="h-full min-w-0 flex-1 border-0 bg-transparent pr-2 text-[0.88rem] font-normal text-ink outline-none" />
            </label>
            {(fStatus || fBairro || fData) && (
              <Button type="button" variante="secundario" tamanho="pequeno" className="col-span-2 h-11 lg:col-span-1" onClick={() => { setFStatus(""); setFBairro(""); setFData(""); }}>
                <XCircle size={16} aria-hidden="true" /> Limpar
              </Button>
            )}
          </div>
        )}
      </div>

      {carregando ? (
        // esqueleto no lugar da lista
        <ul className="flex flex-col gap-3" aria-label="Carregando pedidos">
          {[0, 1, 2].map((i) => (
            <li key={i} className={cn(CARTAO, "flex animate-pulse flex-col gap-2 p-4")}>
              <div className="h-4 w-20 rounded-full bg-zinc-100" />
              <div className="h-4 w-2/3 rounded-full bg-zinc-100" />
              <div className="h-3 w-1/2 rounded-full bg-zinc-100" />
            </li>
          ))}
        </ul>
      ) : erroCarga ? (
        <div className={cn(CAIXA_VAZIA, "border-red-200 text-danger")} role="alert">
          Erro ao carregar: {erroCarga}
          <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void atualizar()}><RefreshCw size={16} aria-hidden="true" /> Tentar de novo</Button>
        </div>
      ) : aba === "pedidos" ? (
        filtrados.length === 0 ? (
          <div className={CAIXA_VAZIA}>
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-brand"><Inbox size={22} aria-hidden="true" /></span>
            {lista.length ? "Nenhum pedido com esses filtros." : "Nenhum pedido de coleta recebido ainda."}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtrados.map((s) => {
              const Icone = ICONE_STATUS[s.status];
              const novas = naoLidas[s.id] ?? 0;
              return (
                <li key={s.id} className={cn(CARTAO, "flex flex-col gap-3 p-3 transition hover:border-brand-line sm:p-4 xl:flex-row xl:items-center")}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      <span className={cn(SELO, COR_STATUS[s.status])}><Icone size={11} aria-hidden="true" /> {ROTULO_STATUS[s.status]}</span>
                      {s.data_agendada && <span className={cn(SELO, "bg-amber-50 text-amber-800")}><CalendarClock size={11} aria-hidden="true" /> {dataBR(s.data_agendada)}</span>}
                      {s.foto_path && <span className={cn(SELO, "bg-zinc-100 text-zinc-600")}>com foto</span>}
                      {novas > 0 && (
                        <span className={cn(SELO, "bg-danger text-white")} aria-label={`${novas} mensagens não lidas`}>
                          <MessageCircle size={11} aria-hidden="true" /> {novas} nova{novas > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 truncate text-[0.95rem] font-extrabold text-ink sm:text-base">{s.bairro}</h3>
                    <p className="truncate text-[0.82rem] text-zinc-600">{s.endereco}</p>
                    <small className="mt-0.5 block truncate text-[0.76rem] text-ink-muted">
                      {s.materiais.join(", ")} · {s.quantidade} · Pedido em {dataHoraBR(s.created_at)}
                    </small>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-3 xl:border-0 xl:pt-0">
                    <button type="button" className={cn(BOTAO_ACAO, "border-brand-line bg-brand-soft text-brand")} onClick={() => setAbertoId(s.id)} title="Abrir pedido" aria-label={`Abrir pedido de ${s.bairro}`}>
                      <Eye size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Abrir pedido</span>
                    </button>
                    <a href={linkMapa(s)} target="_blank" rel="noopener noreferrer" className={BOTAO_ACAO} title="Ver no Google Maps" aria-label="Ver no Google Maps">
                      <MapPin size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Mapa</span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : aba === "mapa" ? (
        <div className="flex flex-col gap-1.5">
          {/* altura fixa: o mapa usa h-full */}
          <div className="h-[clamp(320px,60dvh,560px)] overflow-hidden rounded-card border border-emerald-100">
            <MapaColetas pedidos={filtrados} onSelecionar={setAbertoId} />
          </div>
          <p className="text-[0.78rem] text-ink-muted">{filtrados.filter((s) => s.latitude == null).length} pedido(s) sem ponto no mapa não aparecem aqui.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          <div className={cn(CARTAO, "flex flex-wrap items-center justify-between gap-2.5 p-3")}>
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-control border border-line bg-white pl-3 text-[0.8rem] font-bold text-zinc-600 focus-within:border-brand focus-within:shadow-focus sm:max-w-[16rem]">
              <span>Data</span>
              <input type="date" value={diaRota} onChange={(e) => setDiaRota(e.target.value)} className="h-full min-w-0 flex-1 border-0 bg-transparent pr-2 text-[0.88rem] font-normal text-ink outline-none" />
            </label>
            {urlRota && (
              <Button tamanho="pequeno" href={urlRota} target="_blank" rel="noopener noreferrer" className="max-sm:w-full">
                <Navigation size={16} aria-hidden="true" /> Abrir rota no Google Maps
              </Button>
            )}
          </div>
          {rota.length === 0 ? (
            <div className={CAIXA_VAZIA}>
              <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-brand"><Truck size={22} aria-hidden="true" /></span>
              Nenhuma coleta agendada para {dataBR(diaRota)}.
            </div>
          ) : (
            <>
              {rota.length > 10 && <p className="text-[0.78rem] text-warning">O Google Maps aceita até 10 paradas por rota; divida o trajeto se necessário.</p>}
              <ol className="flex list-none flex-col gap-2.5 p-0">
                {rota.map((s, i) => (
                  <li key={s.id} className="flex items-start gap-3">
                    <span className="mt-2 grid size-8 shrink-0 place-items-center rounded-full bg-brand text-[0.85rem] font-black text-white">{i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setAbertoId(s.id)}
                      className={cn(CARTAO, "flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 px-4 py-3 text-left transition hover:border-brand-line focus-visible:outline-2 focus-visible:outline-brand")}
                    >
                      <strong className="text-[0.9rem] text-ink [overflow-wrap:anywhere]">{s.bairro} — {s.endereco}</strong>
                      <span className="text-[0.78rem] text-ink-muted">{s.janela_agendada || PERIODOS[s.periodo]} · {s.materiais.join(", ")} · {s.quantidade}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}

      {aberto && user && (
        <DetalheColeta
          s={aberto}
          adminId={user.id}
          adminNome={perfil?.nome ?? "Equipe"}
          onFechar={fecharDetalhe}
          onSalvo={(msg) => { mostrar("sucesso", msg); void carregar(); }}
          onErro={(msg) => mostrar("erro", msg)}
          onLidas={() => setNaoLidas((m) => ({ ...m, [aberto.id]: 0 }))}
        />
      )}
    </div>
  );
}

/** Link do Google Maps do pedido (ponto marcado ou endereço) */
function linkMapa(s: Solicitacao) {
  return s.latitude != null
    ? `https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.endereco}, ${s.bairro}, Baturité - CE`)}`;
}

/* ---------- Gaveta de detalhe ---------- */
function DetalheColeta({
  s, adminId, adminNome, onFechar, onSalvo, onErro, onLidas,
}: {
  s: Solicitacao; adminId: string; adminNome: string;
  onFechar: () => void; onSalvo: (m: string) => void; onErro: (m: string) => void; onLidas: () => void;
}) {
  const [status, setStatus] = useState<StatusColeta>(s.status);
  const [data, setData] = useState(s.data_agendada ?? "");
  const [janela, setJanela] = useState(s.janela_agendada ?? "");
  const [foto, setFoto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Ao abrir: "enviado" vira "recebido" automaticamente
  useEffect(() => {
    if (s.status === "enviado") {
      void supabase.from("coleta_solicitacoes").update({ status: "recebido" }).eq("id", s.id).eq("status", "enviado")
        .then(({ error }) => { if (!error) onSalvo("Pedido marcado como recebido."); });
    }
    onLidas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.id]);

  useEffect(() => {
    setStatus(s.status);
    setData(s.data_agendada ?? "");
    setJanela(s.janela_agendada ?? "");
  }, [s.status, s.data_agendada, s.janela_agendada]);

  useEffect(() => {
    if (s.foto_path) void urlFoto(s.foto_path).then(setFoto);
  }, [s.foto_path]);

  // (o Esc para fechar fica por conta do PainelLateral)

  async function salvar() {
    if (status === "agendado" && !data) return onErro("Informe a data agendada.");
    setSalvando(true);
    const { error } = await supabase
      .from("coleta_solicitacoes")
      .update({ status, data_agendada: data || null, janela_agendada: janela.trim() || null })
      .eq("id", s.id);
    setSalvando(false);
    if (error) return onErro("Não foi possível salvar.");
    onSalvo("Pedido atualizado.");
  }

  const mapsLink = linkMapa(s);
  const Icone = ICONE_STATUS[s.status];

  // gaveta com cabeçalho e rodapé fixos (só o meio rola)
  return (
    <PainelLateral
      aberto
      titulo={`Coleta em ${s.bairro}`}
      onFechar={onFechar}
      rodape={
        <>
          <Button type="button" variante="contorno" tamanho="pequeno" onClick={onFechar}>Fechar</Button>
          <Button type="button" tamanho="pequeno" onClick={() => void salvar()} disabled={salvando}>
            {salvando ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />} Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(SELO, COR_STATUS[s.status])}><Icone size={11} aria-hidden="true" /> {ROTULO_STATUS[s.status]}</span>
        <span className="text-[0.8rem] text-ink-muted">Pedido em {dataHoraBR(s.created_at)}</span>
      </div>

      <div className={BLOCO}>
        <LinhaTempoColeta s={s} />
      </div>

      <fieldset className={BLOCO}>
        <legend className={TITULO_BLOCO}>Pedido</legend>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0 sm:col-span-2">
            <dt className={ROTULO}>Endereço</dt>
            <dd className="mt-0.5 text-[0.88rem] text-zinc-800 [overflow-wrap:anywhere]">
              {s.endereco}
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="ml-1.5 inline-flex items-center gap-0.5 text-[0.78rem] font-bold text-brand hover:underline">
                <MapPin size={13} aria-hidden="true" /> mapa <ExternalLink size={11} aria-hidden="true" />
              </a>
            </dd>
          </div>
          <div className="min-w-0"><dt className={ROTULO}>Materiais</dt><dd className="mt-0.5 text-[0.88rem] text-zinc-800">{s.materiais.join(", ")}</dd></div>
          <div className="min-w-0"><dt className={ROTULO}>Quantidade</dt><dd className="mt-0.5 text-[0.88rem] text-zinc-800">{s.quantidade}</dd></div>
          <div className="min-w-0 sm:col-span-2"><dt className={ROTULO}>Preferência</dt><dd className="mt-0.5 text-[0.88rem] text-zinc-800">{s.data_preferida ? dataBR(s.data_preferida) : "Sem data"} · {PERIODOS[s.periodo]}</dd></div>
          {s.observacoes && <div className="min-w-0 sm:col-span-2"><dt className={ROTULO}>Observações</dt><dd className="mt-0.5 text-[0.88rem] text-zinc-800 [overflow-wrap:anywhere]">{s.observacoes}</dd></div>}
        </dl>

        {/* foto privada: o link assinado vence sozinho */}
        {foto && (
          <a href={foto} target="_blank" rel="noopener noreferrer" className="block w-fit max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto} alt="Foto do material enviada pelo visitante" className="max-h-64 max-w-full rounded-2xl border border-line object-contain" />
          </a>
        )}
        {s.foto_path && !foto && <p className="text-[0.78rem] text-ink-muted"><Loader2 size={13} className="mr-1 inline animate-spin" aria-hidden="true" />Carregando foto…</p>}
      </fieldset>

      <fieldset className={BLOCO}>
        <legend className={TITULO_BLOCO}>Status e agendamento</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className={CAMPO}>
            <span className={ROTULO}>Status</span>
            <select className={CONTROLE} value={status} onChange={(e) => setStatus(e.target.value as StatusColeta)}>
              {STATUS_COLETA.map((st) => <option key={st} value={st}>{ROTULO_STATUS[st]}</option>)}
            </select>
          </label>
          <label className={CAMPO}>
            <span className={ROTULO}>Data agendada</span>
            <input className={CONTROLE} type="date" value={data} onChange={(e) => { setData(e.target.value); if (e.target.value && (status === "enviado" || status === "recebido")) setStatus("agendado"); }} />
          </label>
          <label className={CAMPO}>
            <span className={ROTULO}>Janela / horário</span>
            <input className={CONTROLE} value={janela} maxLength={60} onChange={(e) => setJanela(e.target.value)} placeholder="Ex.: 8h às 11h" />
          </label>
        </div>
        <p className="text-[0.76rem] text-ink-muted">Depois de mudar, toque em “Salvar” no rodapé. O visitante vê a mudança na página dele.</p>
      </fieldset>

      <fieldset className={BLOCO}>
        <legend className={TITULO_BLOCO}>Conversa com o visitante</legend>
        <ChatColeta solicitacaoId={s.id} usuarioId={adminId} lado="admin" nome={adminNome} />
      </fieldset>
    </PainelLateral>
  );
}
