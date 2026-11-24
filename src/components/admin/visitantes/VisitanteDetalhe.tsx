"use client";

/**
 * VisitanteDetalhe — gaveta de um visitante (somente ADM DEUS)
 * ------------------------------------------------------------
 * Abre no PainelLateral (cabeçalho e rodapé fixos). Abas:
 *  - Atividade: logins, tempo total e médio, último acesso, páginas mais
 *    visitadas, itens mais clicados, sessões e eventos recentes
 *    (visitante_sessoes e visitante_eventos, RLS is_deus).
 *  - Histórico: pedidos de coleta, últimas mensagens do chat, logins e
 *    visitas ao site logado.
 *  - Aparelhos: aparelhos usados pela conta, com a situação de cada um.
 *  - Dados e conta: editar, ativar/desativar, expulsar, redefinir senha e
 *    excluir — tudo pela rota /api/admin/visitantes.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, Ban, CheckCircle2, Clock, Copy, Eye, EyeOff, FileText, KeyRound, LogIn, LogOut, Mail, MessageCircle,
  MousePointerClick, Power, Save, Smartphone, Timer, Trash2, Truck, Wifi,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { chamarApi } from "@/services/apiAdmin";
import { mascaraTelefone } from "@/utils/validacao";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AcaoAparelhoModal from "@/components/admin/aparelhos/AcaoAparelhoModal";
import AparelhoDetalhe from "@/components/admin/aparelhos/AparelhoDetalhe";
import PainelLateral from "@/components/admin/apoiadores/PainelLateral";
import Button from "@/components/ui/Button";
import { BLOCO, BOTAO_ACAO, CAMPO, CARTAO, CONTROLE, DICA, LINHA, ROTULO, SELO, TITULO_BLOCO } from "@/components/admin/apoiadores/estilos";
import { aparelhoDe, idCurto, localDe } from "@/types/acessos";
import { ROTULO_SITUACAO, tempoRestante, type SituacaoAparelho } from "@/types/aparelhos";
import { ROTULO_STATUS, type StatusColeta } from "@/services/coletas";
import {
  carregarHistorico, mascararEmail, mascararTelefone, navegadorDe, ranking,
  type ColetaResumo, type ExtrasVisitante, type MensagemResumo,
} from "@/services/visitantesAdmin";
import { dataHoraCurta, duracao, type Visitante } from "@/types/visitantes";
import { cn } from "@/utils/cn";

interface Sessao { id: string; iniciada_em: string; ultima_atividade: string; encerrada_em: string | null; duracao_seg: number; user_agent: string | null }
interface Evento { id: number; sessao_id: string | null; tipo: "pagina" | "clique"; caminho: string; rotulo: string | null; alvo: string | null; criado_em: string }
interface LoginReg { id: number; criado_em: string; dispositivo: string | null; navegador: string | null; cidade: string | null; regiao: string | null; pais: string | null }
interface AcessoSite { id: string; iniciada_em: string; duracao_seg: number; paginas: number; origem: string | null; referrer_host: string | null; dispositivo: string | null; navegador: string | null; sistema: string | null; cidade: string | null; regiao: string | null; pais: string | null }
interface AparelhoDaConta { anon_id: string; ultima: string; dispositivo: string | null; navegador: string | null; sistema: string | null; cidade: string | null; regiao: string | null; pais: string | null; visitas: number; situacao: SituacaoAparelho; ate: string | null }

type Aba = "atividade" | "historico" | "aparelhos" | "dados";
const ABAS: { id: Aba; rotulo: string }[] = [
  { id: "atividade", rotulo: "Atividade" },
  { id: "historico", rotulo: "Histórico" },
  { id: "aparelhos", rotulo: "Aparelhos" },
  { id: "dados", rotulo: "Dados e conta" },
];

const COR_COLETA: Record<StatusColeta, string> = {
  enviado: "bg-sky-50 text-sky-800",
  recebido: "bg-indigo-50 text-indigo-800",
  agendado: "bg-amber-50 text-amber-800",
  concluido: "bg-emerald-50 text-emerald-800",
  cancelado: "bg-zinc-100 text-zinc-600",
};
const COR_SITUACAO: Record<SituacaoAparelho, string> = {
  ativo: "bg-emerald-50 text-emerald-800",
  suspenso: "bg-amber-50 text-amber-800",
  bloqueado: "bg-red-50 text-danger",
};

// pedaços repetidos de classe
const TITULO_SECAO = "mb-3 flex items-center gap-2 text-[0.9rem] font-extrabold text-ink [&>svg]:shrink-0 [&>svg]:text-brand";
const VAZIO = "text-[0.84rem] text-ink-muted";
const LINHA_TEMPO = "flex flex-col gap-2.5";
const ITEM_TEMPO = "flex min-w-0 gap-2.5 text-[0.82rem]";
const PONTO = "mt-1.5 size-2 shrink-0 rounded-full";

interface Props {
  visitante: Visitante;
  extras?: ExtrasVisitante;
  onFechar: () => void;
  onAlterado: (msg: string) => void;
  onErro: (msg: string) => void;
  onExcluido: (msg: string) => void;
}

export default function VisitanteDetalhe({ visitante: v, extras, onFechar, onAlterado, onErro, onExcluido }: Props) {
  const [aba, setAba] = useState<Aba>("atividade");
  const [mostrarDados, setMostrarDados] = useState(false);
  const [aparelhos, setAparelhos] = useState<AparelhoDaConta[] | null>(null);
  const [aparelhoAberto, setAparelhoAberto] = useState<string | null>(null);
  const [expulsando, setExpulsando] = useState(false);
  const [confirmarSituacao, setConfirmarSituacao] = useState(false);
  const [historico, setHistorico] = useState<{ coletas: ColetaResumo[]; mensagens: MensagemResumo[]; logins: LoginReg[]; acessos: AcessoSite[]; erro: string } | null>(null);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [linkSenha, setLinkSenha] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: v.nome,
    telefone: v.telefone ?? "",
    cidade: v.cidade ?? "",
    data_nascimento: v.data_nascimento ?? "",
  });

  // com outra janela aberta por cima (aparelho, expulsar, confirmar), o Esc não fecha a gaveta
  const subAberto = !!aparelhoAberto || expulsando || confirmar || confirmarSituacao;
  const fechar = useCallback(() => { if (!subAberto) onFechar(); }, [subAberto, onFechar]);

  // Atividade (sessões e eventos)
  useEffect(() => {
    let vivo = true;
    (async () => {
      setCarregando(true);
      if (!v.auth_user_id) { setCarregando(false); return; }
      const [s, e] = await Promise.all([
        supabase.from("visitante_sessoes").select("id, iniciada_em, ultima_atividade, encerrada_em, duracao_seg, user_agent")
          .eq("auth_user_id", v.auth_user_id).order("iniciada_em", { ascending: false }).limit(500),
        supabase.from("visitante_eventos").select("id, sessao_id, tipo, caminho, rotulo, alvo, criado_em")
          .eq("auth_user_id", v.auth_user_id).order("criado_em", { ascending: false }).limit(1000),
      ]);
      if (!vivo) return;
      setSessoes((s.data ?? []) as Sessao[]);
      setEventos((e.data ?? []) as Evento[]);
      setCarregando(false);
    })();
    return () => { vivo = false; };
  }, [v.auth_user_id]);

  // Histórico: coletas, chat, logins e visitas (carrega ao abrir a aba)
  useEffect(() => {
    if (aba !== "historico" || historico !== null) return;
    if (!v.auth_user_id) { setHistorico({ coletas: [], mensagens: [], logins: [], acessos: [], erro: "" }); return; }
    const id = v.auth_user_id;
    void (async () => {
      const [h, l, a] = await Promise.all([
        carregarHistorico(id),
        supabase.from("login_tentativas").select("id, criado_em, dispositivo, navegador, cidade, regiao, pais").eq("auth_user_id", id).eq("sucesso", true).order("criado_em", { ascending: false }).limit(30),
        supabase.from("acessos_sessoes").select("id, iniciada_em, duracao_seg, paginas, origem, referrer_host, dispositivo, navegador, sistema, cidade, regiao, pais").eq("auth_user_id", id).order("iniciada_em", { ascending: false }).limit(30),
      ]);
      setHistorico({ ...h, logins: (l.data ?? []) as LoginReg[], acessos: (a.data ?? []) as AcessoSite[] });
    })();
  }, [aba, historico, v.auth_user_id]);

  // Aparelhos da conta: um por id de navegador, com a situação atual de cada um
  const carregarAparelhos = useCallback(async () => {
    if (!v.auth_user_id) { setAparelhos([]); return; }
    const { data: ss } = await supabase.from("acessos_sessoes")
      .select("anon_id, ultima_atividade, dispositivo, navegador, sistema, cidade, regiao, pais")
      .eq("auth_user_id", v.auth_user_id).order("ultima_atividade", { ascending: false }).limit(500);
    const mapa = new Map<string, AparelhoDaConta>();
    for (const s of (ss ?? []) as (Omit<AparelhoDaConta, "ultima" | "visitas" | "situacao" | "ate"> & { ultima_atividade: string })[]) {
      const atual = mapa.get(s.anon_id);
      if (atual) atual.visitas += 1;
      else mapa.set(s.anon_id, { anon_id: s.anon_id, ultima: s.ultima_atividade, dispositivo: s.dispositivo, navegador: s.navegador, sistema: s.sistema, cidade: s.cidade, regiao: s.regiao, pais: s.pais, visitas: 1, situacao: "ativo", ate: null });
    }
    const ids = [...mapa.keys()];
    if (ids.length) {
      const { data: bl } = await supabase.from("dispositivos_bloqueios").select("dispositivo_id, tipo, ate").in("dispositivo_id", ids).eq("ativo", true);
      for (const b of (bl ?? []) as { dispositivo_id: string; tipo: "bloqueio" | "suspensao"; ate: string | null }[]) {
        const a = mapa.get(b.dispositivo_id);
        if (!a) continue;
        if (b.tipo === "bloqueio") { a.situacao = "bloqueado"; a.ate = null; }
        else if (b.ate && new Date(b.ate).getTime() > Date.now() && a.situacao !== "bloqueado") { a.situacao = "suspenso"; a.ate = b.ate; }
      }
    }
    setAparelhos([...mapa.values()]);
  }, [v.auth_user_id]);

  useEffect(() => {
    if (aba === "aparelhos" && aparelhos === null) void carregarAparelhos();
  }, [aba, aparelhos, carregarAparelhos]);

  // Métricas calculadas no navegador (até 500 sessões / 1000 eventos)
  const m = useMemo(() => {
    const totalSeg = sessoes.reduce((a, s) => a + (s.duracao_seg ?? 0), 0);
    return {
      logins: sessoes.length,
      totalSeg,
      mediaSeg: sessoes.length ? Math.round(totalSeg / sessoes.length) : 0,
      ultimo: sessoes[0]?.ultima_atividade ?? null,
      paginas: ranking(eventos.filter((e) => e.tipo === "pagina").map((e) => e.caminho), 8),
      cliques: ranking(eventos.filter((e) => e.tipo === "clique").map((e) => e.rotulo || e.alvo || "(sem rótulo)"), 8),
    };
  }, [sessoes, eventos]);

  async function salvar(dados: Record<string, unknown>, msg: string) {
    setSalvando(true);
    try {
      await chamarApi("PATCH", "/api/admin/visitantes", { id: v.id, ...dados });
      onAlterado(msg);
    } catch (e) {
      onErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  // Redefinir senha: por e-mail (Supabase envia) ou gerando o link para o deus copiar
  async function redefinirSenha(modo: "email" | "link") {
    setSalvando(true);
    setLinkSenha(null);
    try {
      const r = await chamarApi("POST", "/api/admin/visitantes", { acao: "resetar_senha", id: v.id, modo });
      if (modo === "link") setLinkSenha(r.link as string);
      else onAlterado(`E-mail de redefinição enviado para ${v.email}.`);
    } catch (e) {
      onErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function copiarLink() {
    if (!linkSenha) return;
    try {
      await navigator.clipboard.writeText(linkSenha);
      onAlterado("Link copiado. Envie ao visitante (vale por pouco tempo).");
    } catch {
      onErro("Não foi possível copiar; selecione o link e copie manualmente.");
    }
  }

  async function excluir() {
    setSalvando(true);
    try {
      const r = await chamarApi("DELETE", `/api/admin/visitantes?id=${v.id}`);
      setConfirmar(false);
      onExcluido(r.modo === "completo" ? "Visitante excluído (conta e histórico)." : "Visitante excluído.");
    } catch (e) {
      onErro((e as Error).message);
      setSalvando(false);
    }
  }

  return (
    <PainelLateral
      aberto
      titulo={v.nome}
      onFechar={fechar}
      rodape={
        <>
          <Button type="button" variante="contorno" tamanho="pequeno" onClick={onFechar}>Fechar</Button>
          {aba === "dados" && (
            <Button type="submit" form="form-dados-visitante" tamanho="pequeno" disabled={salvando}>
              <Save size={16} aria-hidden="true" /> Salvar dados
            </Button>
          )}
        </>
      }
    >
      {/* Cartão de identificação */}
      <section className={cn(CARTAO, "flex min-w-0 flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4")}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-brand-mint text-lg font-black text-brand" aria-hidden="true">
            {v.nome.charAt(0).toUpperCase()}
            {extras?.online && <i className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-2 border-white bg-emerald-500" />}
          </span>
          <div className="min-w-0 text-[0.84rem] text-zinc-600">
            <p className="truncate">{mostrarDados ? v.email : mascararEmail(v.email)}</p>
            <p>{v.telefone ? (mostrarDados ? mascaraTelefone(v.telefone) : mascararTelefone(v.telefone)) : "Sem telefone"}{v.cidade ? ` · ${v.cidade}` : ""}</p>
            <p className="text-[0.76rem] text-ink-muted">Cadastrado em {dataHoraCurta(v.created_at)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {v.ativo
            ? <span className={cn(SELO, "bg-emerald-50 text-emerald-800")}><CheckCircle2 size={11} aria-hidden="true" /> Ativo</span>
            : <span className={cn(SELO, "bg-red-50 text-danger")}><Ban size={11} aria-hidden="true" /> Inativo</span>}
          {extras?.online && <span className={cn(SELO, "bg-emerald-500 text-white")}><Wifi size={11} aria-hidden="true" /> Online</span>}
          <button type="button" className={BOTAO_ACAO} onClick={() => setMostrarDados((x) => !x)} aria-pressed={mostrarDados}>
            {mostrarDados ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />} {mostrarDados ? "Esconder" : "Mostrar"} dados
          </button>
        </div>
      </section>

      {/* Abas da gaveta */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 ring-1 ring-line sm:grid-cols-4" role="tablist" aria-label="Detalhes do visitante">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => setAba(a.id)}
            className={cn(
              "h-9 cursor-pointer rounded-xl text-[0.84rem] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
              aba === a.id ? "bg-brand text-white shadow-sm" : "text-ink-muted hover:bg-brand-soft hover:text-brand",
            )}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      {/* ===== Atividade ===== */}
      {aba === "atividade" && (carregando ? (
        <Esqueleto />
      ) : (
        <>
          <ul className="grid list-none grid-cols-2 gap-2.5 p-0">
            {[
              { i: LogIn, v: String(m.logins), r: "logins" },
              { i: Clock, v: duracao(m.totalSeg), r: "tempo total" },
              { i: Timer, v: duracao(m.mediaSeg), r: "média por sessão" },
              { i: Activity, v: dataHoraCurta(m.ultimo), r: "último acesso" },
            ].map(({ i: Icone, v: valor, r }) => (
              <li key={r} className={cn(CARTAO, "flex min-w-0 flex-col gap-1 p-3")}>
                <Icone size={16} aria-hidden="true" className="text-brand" />
                <strong className="truncate text-[1.05rem] font-black text-ink">{valor}</strong>
                <span className="text-[0.74rem] font-semibold text-ink-muted">{r}</span>
              </li>
            ))}
          </ul>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <Barras titulo="Páginas mais visitadas" icone={FileText} itens={m.paginas} />
            <Barras titulo="Itens mais clicados" icone={MousePointerClick} itens={m.cliques} />
          </div>

          <section className={BLOCO}>
            <h3 className={TITULO_SECAO}><LogIn size={16} aria-hidden="true" /> Sessões recentes</h3>
            {sessoes.length === 0 ? <p className={VAZIO}>Nenhuma sessão registrada.</p> : (
              <ul className={LINHA_TEMPO}>
                {sessoes.slice(0, 10).map((s) => (
                  <li key={s.id} className={ITEM_TEMPO}>
                    <span className={cn(PONTO, "bg-brand")} aria-hidden="true" />
                    <div className="min-w-0">
                      <strong className="block font-bold text-ink">{dataHoraCurta(s.iniciada_em)}</strong>
                      <span className="text-ink-muted">{duracao(s.duracao_seg)} · {navegadorDe(s.user_agent)} · {s.encerrada_em ? `saiu ${dataHoraCurta(s.encerrada_em)}` : "sem saída registrada"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={BLOCO}>
            <h3 className={TITULO_SECAO}><Activity size={16} aria-hidden="true" /> Eventos recentes</h3>
            {eventos.length === 0 ? <p className={VAZIO}>Nenhum evento registrado.</p> : (
              <ul className={LINHA_TEMPO}>
                {eventos.slice(0, 30).map((e) => (
                  <li key={e.id} className={ITEM_TEMPO}>
                    <span className={cn(PONTO, e.tipo === "pagina" ? "bg-brand" : "bg-amber-500")} aria-hidden="true" />
                    <div className="min-w-0">
                      <strong className="block break-words font-bold text-ink">{e.tipo === "pagina" ? `Abriu ${e.caminho}` : `Clicou em “${e.rotulo || e.alvo || "item"}”`}</strong>
                      <span className="break-words text-ink-muted">{dataHoraCurta(e.criado_em)}{e.tipo === "clique" ? ` · em ${e.caminho}` : ""}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ))}

      {/* ===== Histórico ===== */}
      {aba === "historico" && (historico === null ? (
        <Esqueleto />
      ) : (
        <>
          <section className={BLOCO}>
            <h3 className={TITULO_SECAO}><Truck size={16} aria-hidden="true" /> Pedidos de coleta ({historico.coletas.length})</h3>
            {historico.erro ? <p className="text-[0.84rem] text-danger">{historico.erro}</p>
              : historico.coletas.length === 0 ? <p className={VAZIO}>Nenhum pedido de coleta.</p> : (
              <ul className="flex flex-col gap-2">
                {historico.coletas.map((c) => (
                  <li key={c.id} className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-surface-alt px-3 py-2 text-[0.82rem]">
                    <span className={cn(SELO, COR_COLETA[c.status as StatusColeta] ?? "bg-zinc-100 text-zinc-600")}>{ROTULO_STATUS[c.status as StatusColeta] ?? c.status}</span>
                    <strong className="min-w-0 truncate text-ink">{c.bairro}</strong>
                    <span className="w-full truncate text-ink-muted">
                      {c.materiais.join(", ")} · pedido em {dataHoraCurta(c.created_at)}{c.data_agendada ? ` · agendado ${new Date(c.data_agendada + "T12:00:00").toLocaleDateString("pt-BR")}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={BLOCO}>
            <h3 className={TITULO_SECAO}><MessageCircle size={16} aria-hidden="true" /> Últimas mensagens do chat</h3>
            {historico.mensagens.length === 0 ? <p className={VAZIO}>Nenhuma mensagem no chat.</p> : (
              <ul className="flex flex-col gap-1.5">
                {historico.mensagens.map((msg) => (
                  <li key={msg.id} className={cn("max-w-[85%] rounded-xl px-3 py-1.5 text-[0.82rem]", msg.autor_tipo === "admin" ? "self-end bg-brand-mint text-ink" : "self-start bg-surface-alt text-ink")}>
                    <p className="break-words">{msg.texto}</p>
                    <span className="text-[0.7rem] text-ink-muted">{msg.autor_tipo === "admin" ? "Equipe" : "Visitante"} · {dataHoraCurta(msg.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className={DICA}>Para responder, use a tela Mensagens.</p>
          </section>

          <section className={BLOCO}>
            <h3 className={TITULO_SECAO}><LogIn size={16} aria-hidden="true" /> Logins (últimos 30)</h3>
            {historico.logins.length === 0 ? <p className={VAZIO}>Nenhum login registrado depois da ativação do registro de segurança.</p> : (
              <ul className={LINHA_TEMPO}>
                {historico.logins.map((l) => (
                  <li key={l.id} className={ITEM_TEMPO}>
                    <span className={cn(PONTO, "bg-brand")} aria-hidden="true" />
                    <div className="min-w-0">
                      <strong className="block font-bold text-ink">{dataHoraCurta(l.criado_em)}</strong>
                      <span className="text-ink-muted">{[l.dispositivo, l.navegador].filter(Boolean).join(" · ") || "aparelho não informado"} · {[l.cidade, l.regiao, l.pais].filter(Boolean).join(", ") || "local não informado"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={BLOCO}>
            <h3 className={TITULO_SECAO}><Activity size={16} aria-hidden="true" /> Visitas ao site logado (últimas 30)</h3>
            {historico.acessos.length === 0 ? <p className={VAZIO}>Nenhuma visita registrada.</p> : (
              <ul className={LINHA_TEMPO}>
                {historico.acessos.map((a) => (
                  <li key={a.id} className={ITEM_TEMPO}>
                    <span className={cn(PONTO, "bg-leaf-bright")} aria-hidden="true" />
                    <div className="min-w-0">
                      <strong className="block font-bold text-ink">{dataHoraCurta(a.iniciada_em)} · {duracao(a.duracao_seg)} · {a.paginas} página(s)</strong>
                      <span className="break-words text-ink-muted">{aparelhoDe(a)} · {localDe(a)} · origem: {a.referrer_host ?? a.origem ?? "direto"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ))}

      {/* ===== Aparelhos ===== */}
      {aba === "aparelhos" && (aparelhos === null ? (
        <Esqueleto />
      ) : (
        <section className={BLOCO}>
          <h3 className={TITULO_SECAO}><Smartphone size={16} aria-hidden="true" /> Aparelhos usados por esta conta</h3>
          {aparelhos.length === 0 ? <p className={VAZIO}>Nenhum aparelho registrado ainda (a medição de acessos precisa estar ativa neste navegador).</p> : (
            <ul className="flex flex-col gap-2">
              {aparelhos.map((a) => (
                <li key={a.anon_id} className="flex min-w-0 flex-col gap-2 rounded-xl bg-surface-alt p-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1 text-[0.82rem]">
                    <strong className="block break-words text-ink">{aparelhoDe(a)} <span className="font-normal text-ink-muted">· id {idCurto(a.anon_id)}</span></strong>
                    <span className="break-words text-ink-muted">{localDe(a)} · última atividade {dataHoraCurta(a.ultima)} · {a.visitas} visita(s)</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn(SELO, COR_SITUACAO[a.situacao])}>
                      {ROTULO_SITUACAO[a.situacao]}{a.ate && a.situacao !== "ativo" ? ` · ${tempoRestante(a.ate)}` : ""}
                    </span>
                    <button type="button" className={BOTAO_ACAO} onClick={() => setAparelhoAberto(a.anon_id)}>Gerenciar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className={DICA}>Bloquear um aparelho impede aquele navegador de abrir o site (mesmo sem login). Para tirar só a conta, use “Desativar” em Dados e conta.</p>
        </section>
      ))}

      {/* ===== Dados e conta ===== */}
      {aba === "dados" && (
        <>
          <form id="form-dados-visitante" className={BLOCO} onSubmit={(e) => { e.preventDefault(); void salvar(form, "Dados do visitante salvos."); }}>
            <h3 className={TITULO_BLOCO}>Dados pessoais</h3>
            <label className={CAMPO}>
              <span className={ROTULO}>Nome completo</span>
              <input className={CONTROLE} value={form.nome} maxLength={100} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </label>
            <label className={CAMPO}>
              <span className={ROTULO}>E-mail (login)</span>
              <input className={cn(CONTROLE, "bg-zinc-50 text-ink-muted")} value={v.email} disabled />
            </label>
            <div className={LINHA}>
              <label className={CAMPO}>
                <span className={ROTULO}>Telefone</span>
                <input className={CONTROLE} inputMode="tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: mascaraTelefone(e.target.value) })} />
              </label>
              <label className={CAMPO}>
                <span className={ROTULO}>Nascimento</span>
                <input className={CONTROLE} type="date" value={form.data_nascimento} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })} />
              </label>
            </div>
            <label className={CAMPO}>
              <span className={ROTULO}>Cidade</span>
              <input className={CONTROLE} value={form.cidade} maxLength={80} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </label>
            <p className={DICA}>O botão “Salvar dados” fica no rodapé.</p>
          </form>

          <Acao titulo={`Situação: ${v.ativo ? "ativo" : "inativo"}`} texto="Desativar bloqueia o login do visitante sem apagar o histórico.">
            <Button type="button" variante={v.ativo ? "contorno" : "secundario"} tamanho="pequeno" disabled={salvando} onClick={() => setConfirmarSituacao(true)}>
              <Power size={16} aria-hidden="true" /> {v.ativo ? "Desativar" : "Reativar"}
            </Button>
          </Acao>
          <Acao titulo="Expulsar (sair de todos os aparelhos)" texto="Encerra o login desta conta em todos os aparelhos agora. A pessoa pode entrar de novo com a senha; para impedir, desative a conta ou bloqueie o aparelho.">
            <Button type="button" variante="secundario" tamanho="pequeno" disabled={salvando || !v.auth_user_id} onClick={() => setExpulsando(true)}>
              <LogOut size={16} aria-hidden="true" /> Expulsar
            </Button>
          </Acao>
          <Acao titulo="Redefinir senha" texto="Envie ao visitante um e-mail para criar nova senha, ou gere o link e mande por WhatsApp.">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variante="secundario" tamanho="pequeno" disabled={salvando} onClick={() => void redefinirSenha("email")}>
                <Mail size={16} aria-hidden="true" /> Enviar e-mail
              </Button>
              <Button type="button" variante="secundario" tamanho="pequeno" disabled={salvando} onClick={() => void redefinirSenha("link")}>
                <KeyRound size={16} aria-hidden="true" /> Gerar link
              </Button>
            </div>
          </Acao>
          {linkSenha && (
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
              <input className={cn(CONTROLE, "flex-1")} readOnly value={linkSenha} onFocus={(e) => e.currentTarget.select()} aria-label="Link para redefinir a senha" />
              <Button type="button" tamanho="pequeno" onClick={() => void copiarLink()}><Copy size={16} aria-hidden="true" /> Copiar</Button>
            </div>
          )}
          <Acao titulo="Excluir visitante" texto="Remove a conta de acesso, o perfil, as sessões e os eventos. Não pode ser desfeito." perigo>
            <Button type="button" variante="perigo" tamanho="pequeno" disabled={salvando} onClick={() => setConfirmar(true)}>
              <Trash2 size={16} aria-hidden="true" /> Excluir
            </Button>
          </Acao>
        </>
      )}

      {/* Janelas por cima da gaveta */}
      <ConfirmDialog
        aberto={confirmarSituacao}
        titulo={v.ativo ? "Desativar a conta?" : "Reativar a conta?"}
        mensagem={v.ativo
          ? `${v.nome} não conseguirá mais entrar com este e-mail até você reativar. O histórico é mantido.`
          : `${v.nome} volta a poder entrar com este e-mail.`}
        textoConfirmar={v.ativo ? "Desativar" : "Reativar"}
        perigo={v.ativo}
        carregando={salvando}
        onConfirmar={async () => { await salvar({ ativo: !v.ativo }, v.ativo ? "Visitante desativado." : "Visitante reativado."); setConfirmarSituacao(false); }}
        onCancelar={() => setConfirmarSituacao(false)}
      />
      {expulsando && v.auth_user_id && (
        <AcaoAparelhoModal
          acao="expulsar"
          alvo={{ usuario_id: v.auth_user_id, descricao: `Conta de ${v.nome} (${v.email}): sair de todos os aparelhos` }}
          onFechar={() => setExpulsando(false)}
          onFeito={(msg) => { setExpulsando(false); onAlterado(msg); }}
        />
      )}
      {aparelhoAberto && <AparelhoDetalhe anonId={aparelhoAberto} onFechar={() => setAparelhoAberto(null)} onAlterado={() => setAparelhos(null)} />}
      <ConfirmDialog
        aberto={confirmar}
        titulo="Excluir visitante?"
        mensagem={`A conta de ${v.nome} (${v.email}) e todo o histórico serão apagados. Esta ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        perigo
        carregando={salvando}
        onConfirmar={excluir}
        onCancelar={() => setConfirmar(false)}
      />
    </PainelLateral>
  );
}

/* ---------- pedacinhos da gaveta ---------- */
function Esqueleto() {
  return (
    <div className="flex animate-pulse flex-col gap-3" aria-label="Carregando">
      <div className="h-20 rounded-card bg-white" />
      <div className="h-32 rounded-card bg-white" />
    </div>
  );
}

function Barras({ titulo, icone: Icone, itens }: { titulo: string; icone: typeof FileText; itens: [string, number][] }) {
  const maior = itens[0]?.[1] ?? 1;
  return (
    <section className={BLOCO}>
      <h3 className={TITULO_SECAO}><Icone size={16} aria-hidden="true" /> {titulo}</h3>
      {itens.length === 0 ? <p className={VAZIO}>Sem registros.</p> : (
        <ul className="flex flex-col gap-2">
          {itens.map(([k, n]) => (
            <li key={k} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 text-[0.8rem]">
              <span className="truncate text-zinc-700" title={k}>{k}</span>
              <b className="text-ink">{n}</b>
              <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-brand-soft">
                <i className="block h-full rounded-full bg-leaf-bright" style={{ width: `${(n / maior) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Acao({ titulo, texto, perigo, children }: { titulo: string; texto: string; perigo?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn(BLOCO, "sm:flex-row sm:items-center", perigo && "border-red-200 bg-danger-soft")}>
      <div className="min-w-0 flex-1">
        <h3 className={cn("text-[0.9rem] font-extrabold", perigo ? "text-danger" : "text-ink")}>{titulo}</h3>
        <p className="text-[0.8rem] text-ink-soft">{texto}</p>
      </div>
      {children}
    </div>
  );
}
