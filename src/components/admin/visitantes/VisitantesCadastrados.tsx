"use client";

/**
 * Aba "Cadastrados" (somente ADM DEUS) — CRUD dos visitantes com conta
 * ------------------------------------------------------------
 * - Lista em cartões com selos (ativo/inativo, online agora, novo, coletas,
 *   chat com mensagens não lidas), busca por nome/e-mail, filtros (situação
 *   e cidade) e paginação no servidor.
 * - E-mail e telefone aparecem mascarados na lista; completos só na gaveta.
 * - Logins, tempo total e último acesso vêm da view visitantes_atividade_resumo.
 * - Novo visitante e detalhes abrem na gaveta (PainelLateral).
 * Leitura: RLS is_deus(). Escrita: /api/admin/visitantes (service role).
 */

import { useCallback, useEffect, useState } from "react";
import {
  Ban, CheckCircle2, ChevronLeft, ChevronRight, Clock, Eye, Inbox, Lock, LogIn, LogOut, MapPin, MessageCircle, Phone,
  Power, RefreshCw, Search, Sparkles, Truck, UserPlus, Wifi, XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { ToastArea, useToast } from "@/components/ui/Toast";
import { chamarApi } from "@/services/apiAdmin";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AcaoAparelhoModal from "@/components/admin/aparelhos/AcaoAparelhoModal";
import NovoVisitanteModal from "@/components/admin/visitantes/NovoVisitanteModal";
import VisitanteDetalhe from "@/components/admin/visitantes/VisitanteDetalhe";
import Button from "@/components/ui/Button";
import { BOTAO_ACAO, BOTAO_PERIGO, CAIXA_VAZIA, CARTAO, SELECT, SELO, TEXTO_ACAO } from "@/components/admin/apoiadores/estilos";
import { carregarExtras, mascararEmail, mascararTelefone, type ExtrasVisitante } from "@/services/visitantesAdmin";
import { mensagemErro } from "@/types/acessos";
import { dataHoraCurta, duracao, type ResumoAtividade, type Visitante } from "@/types/visitantes";
import { cn } from "@/utils/cn";

const POR_PAGINA = 15;
type Situacao = "todos" | "ativos" | "inativos";

// cadastrado há menos de 7 dias ganha o selo "Novo"
const ehNovo = (iso: string) => Date.now() - new Date(iso).getTime() < 7 * 24 * 60 * 60 * 1000;

export default function VisitantesCadastrados() {
  const { toasts, mostrar, fechar } = useToast();
  const [lista, setLista] = useState<Visitante[]>([]);
  const [resumos, setResumos] = useState<Record<string, ResumoAtividade>>({});
  const [extras, setExtras] = useState<Record<string, ExtrasVisitante>>({});
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [situacao, setSituacao] = useState<Situacao>("todos");
  const [cidade, setCidade] = useState("");
  const [cidades, setCidades] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  // erro da última carga ("sem-permissao" quando o banco recusa)
  const [erroCarga, setErroCarga] = useState("");
  const [aberto, setAberto] = useState<Visitante | null>(null);
  const [novo, setNovo] = useState(false);
  const [expulsar, setExpulsar] = useState<Visitante | null>(null);
  const [mudarSituacao, setMudarSituacao] = useState<Visitante | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Busca com atraso (evita uma consulta por tecla)
  useEffect(() => {
    const t = setTimeout(() => {
      setBuscaAplicada(busca.trim());
      setPagina(0);
    }, 350);
    return () => clearTimeout(t);
  }, [busca]);

  const carregarCidades = useCallback(async () => {
    const { data } = await supabase.from("visitantes").select("cidade").not("cidade", "is", null).limit(2000);
    const unicas = Array.from(new Set((data ?? []).map((d) => (d.cidade as string).trim()).filter(Boolean)));
    setCidades(unicas.sort((a, b) => a.localeCompare(b, "pt-BR")));
  }, []);

  const carregar = useCallback(async () => {
    let q = supabase
      .from("visitantes")
      .select("id, auth_user_id, nome, email, telefone, cidade, data_nascimento, ativo, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA - 1);
    if (buscaAplicada) {
      // Remove caracteres que quebram o filtro "or" do PostgREST
      const termo = buscaAplicada.replace(/[,()%*]/g, " ");
      q = q.or(`nome.ilike.%${termo}%,email.ilike.%${termo}%`);
    }
    if (situacao !== "todos") q = q.eq("ativo", situacao === "ativos");
    if (cidade) q = q.eq("cidade", cidade);

    const { data, count, error } = await q;
    if (error) {
      setErroCarga(error.code === "42501" ? "sem-permissao" : mensagemErro(error, "20261020260000_visitantes_perfil"));
      setCarregando(false);
      return;
    }
    const linhas = (data ?? []) as Visitante[];
    setLista(linhas);
    setTotal(count ?? 0);
    setErroCarga("");

    // Resumo de atividade e extras (online, coletas, chat) só da página atual
    const ids = linhas.map((l) => l.auth_user_id).filter(Boolean) as string[];
    if (ids.length) {
      const [{ data: r }, ex] = await Promise.all([
        supabase.from("visitantes_atividade_resumo").select("*").in("auth_user_id", ids),
        carregarExtras(ids),
      ]);
      const mapa: Record<string, ResumoAtividade> = {};
      for (const x of (r ?? []) as ResumoAtividade[]) mapa[x.auth_user_id] = x;
      setResumos(mapa);
      setExtras(ex);
    } else {
      setResumos({});
      setExtras({});
    }
    setCarregando(false);
  }, [pagina, buscaAplicada, situacao, cidade]);

  const atualizar = useCallback(async () => {
    setAtualizando(true);
    await Promise.all([carregar(), carregarCidades()]);
    setAtualizando(false);
  }, [carregar, carregarCidades]);

  useEffect(() => {
    void carregar();
  }, [carregar]);
  useEffect(() => {
    void carregarCidades();
  }, [carregarCidades]);

  // Mantém a gaveta com os dados atualizados após editar/ativar
  useEffect(() => {
    setAberto((a) => (a ? lista.find((x) => x.id === a.id) ?? a : a));
  }, [lista]);

  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  // funções estáveis para as gavetas (senão o foco pula a cada render)
  const fecharDetalhe = useCallback(() => setAberto(null), []);
  const fecharNovo = useCallback(() => setNovo(false), []);

  // Ativar/desativar direto da lista (depois da confirmação)
  async function confirmarSituacao() {
    if (!mudarSituacao) return;
    setSalvando(true);
    try {
      await chamarApi("PATCH", "/api/admin/visitantes", { id: mudarSituacao.id, ativo: !mudarSituacao.ativo });
      mostrar("sucesso", mudarSituacao.ativo ? "Visitante desativado: não consegue mais entrar." : "Visitante reativado.");
      setMudarSituacao(null);
      void carregar();
    } catch (e) {
      mostrar("erro", (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  /* ---------- Sem permissão ---------- */
  if (erroCarga === "sem-permissao") {
    return (
      <div role="alert" className={cn(CARTAO, "mx-auto my-8 flex max-w-md flex-col items-center gap-2.5 p-8 text-center text-brand")}>
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-mint"><Lock size={26} aria-hidden="true" /></span>
        <h2 className="text-lg font-extrabold text-ink">Sem permissão para ver os visitantes</h2>
        <p className="text-sm text-ink-soft">Só o ADM DEUS vê as contas dos visitantes.</p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* Topo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft" aria-live="polite">
          {carregando ? "Carregando…" : `${total} visitante${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}`}
        </p>
        <div className="flex gap-2 max-sm:w-full max-sm:[&>button]:flex-1">
          <Button type="button" tamanho="pequeno" onClick={() => setNovo(true)}>
            <UserPlus size={16} aria-hidden="true" /> Novo visitante
          </Button>
          <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void atualizar()}>
            <RefreshCw size={16} aria-hidden="true" className={cn(atualizando && "animate-spin")} /> Atualizar
          </Button>
        </div>
      </div>

      {/* Busca e filtros num cartão só */}
      <div className={cn(CARTAO, "grid gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_13rem_auto]")}>
        <label className="flex h-11 min-w-0 items-center gap-2 rounded-control border border-line bg-white px-3 text-ink-muted focus-within:border-brand focus-within:shadow-focus sm:col-span-2 lg:col-span-1">
          <Search size={16} aria-hidden="true" className="shrink-0" />
          <span className="sr-only">Buscar por nome ou e-mail</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou e-mail" className="h-full min-w-0 flex-1 border-0 bg-transparent text-[0.9rem] text-ink outline-none" />
        </label>
        <select value={situacao} onChange={(e) => { setSituacao(e.target.value as Situacao); setPagina(0); }} aria-label="Situação da conta" className={SELECT}>
          <option value="todos">Todas as situações</option>
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos (login bloqueado)</option>
        </select>
        <select value={cidade} onChange={(e) => { setCidade(e.target.value); setPagina(0); }} aria-label="Cidade" className={SELECT}>
          <option value="">Todas as cidades</option>
          {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {(busca || situacao !== "todos" || cidade) && (
          <Button type="button" variante="secundario" tamanho="pequeno" className="h-11 sm:col-span-2 lg:col-span-1" onClick={() => { setBusca(""); setSituacao("todos"); setCidade(""); setPagina(0); }}>
            <XCircle size={16} aria-hidden="true" /> Limpar
          </Button>
        )}
      </div>

      {carregando ? (
        // esqueleto no lugar da lista
        <ul className="flex flex-col gap-3" aria-label="Carregando visitantes">
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
          {erroCarga}
          <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void atualizar()}><RefreshCw size={16} aria-hidden="true" /> Tentar de novo</Button>
        </div>
      ) : lista.length === 0 ? (
        <div className={CAIXA_VAZIA}>
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-brand"><Inbox size={22} aria-hidden="true" /></span>
          {buscaAplicada || situacao !== "todos" || cidade ? "Nenhum visitante com essa busca ou filtro." : "Nenhum visitante cadastrado ainda."}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((v) => {
            const r = v.auth_user_id ? resumos[v.auth_user_id] : undefined;
            const ex = v.auth_user_id ? extras[v.auth_user_id] : undefined;
            return (
              <li key={v.id} className={cn(CARTAO, "flex flex-col gap-3 p-3 transition hover:border-brand-line sm:p-4 lg:flex-row lg:items-center", !v.ativo && "bg-zinc-50")}>
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-brand-mint text-base font-black text-brand" aria-hidden="true">
                    {v.nome.charAt(0).toUpperCase()}
                    {ex?.online && <i className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-emerald-500" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[0.95rem] font-extrabold text-ink sm:text-base">{v.nome}</h3>
                    <p className="flex min-w-0 flex-wrap gap-x-3 text-[0.8rem] text-zinc-600">
                      <span className="truncate">{mascararEmail(v.email)}</span>
                      {v.telefone && <span className="inline-flex items-center gap-1"><Phone size={11} aria-hidden="true" /> {mascararTelefone(v.telefone)}</span>}
                      {v.cidade && <span className="inline-flex min-w-0 items-center gap-1"><MapPin size={11} aria-hidden="true" className="shrink-0" /> <span className="truncate">{v.cidade}</span></span>}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {v.ativo
                        ? <span className={cn(SELO, "bg-emerald-50 text-emerald-800")}><CheckCircle2 size={11} aria-hidden="true" /> Ativo</span>
                        : <span className={cn(SELO, "bg-red-50 text-danger")}><Ban size={11} aria-hidden="true" /> Inativo · login bloqueado</span>}
                      {ex?.online && <span className={cn(SELO, "bg-emerald-500 text-white")}><Wifi size={11} aria-hidden="true" /> Online agora</span>}
                      {ehNovo(v.created_at) && <span className={cn(SELO, "bg-sky-50 text-sky-800")}><Sparkles size={11} aria-hidden="true" /> Novo</span>}
                      {!!ex?.coletas && <span className={cn(SELO, "bg-amber-50 text-amber-800")}><Truck size={11} aria-hidden="true" /> {ex.coletas} coleta{ex.coletas > 1 ? "s" : ""}</span>}
                      {ex?.chat && (
                        <span className={cn(SELO, ex.naoLidas ? "bg-danger text-white" : "bg-violet-50 text-violet-800")}>
                          <MessageCircle size={11} aria-hidden="true" /> {ex.naoLidas ? `${ex.naoLidas} msg nova${ex.naoLidas > 1 ? "s" : ""}` : "Chat"}
                        </span>
                      )}
                    </div>
                    <small className="mt-1 block text-[0.75rem] text-ink-muted">
                      <LogIn size={11} aria-hidden="true" className="inline" /> {r?.total_logins ?? 0} login(s) · <Clock size={11} aria-hidden="true" className="inline" /> {duracao(r?.total_seg ?? 0)} no site · último acesso {dataHoraCurta(r?.ultimo_acesso)}
                    </small>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-3 lg:border-0 lg:pt-0">
                  <button type="button" className={cn(BOTAO_ACAO, "border-brand-line bg-brand-soft text-brand")} onClick={() => setAberto(v)} title="Ver detalhes" aria-label={`Ver detalhes de ${v.nome}`}>
                    <Eye size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Detalhes</span>
                  </button>
                  <button type="button" className={cn(BOTAO_ACAO, v.ativo && BOTAO_PERIGO)} onClick={() => setMudarSituacao(v)} title={v.ativo ? "Desativar conta" : "Reativar conta"} aria-label={v.ativo ? `Desativar ${v.nome}` : `Reativar ${v.nome}`}>
                    <Power size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>{v.ativo ? "Desativar" : "Reativar"}</span>
                  </button>
                  <button type="button" className={BOTAO_ACAO} disabled={!v.auth_user_id} onClick={() => setExpulsar(v)} title="Encerra o login em todos os aparelhos" aria-label={`Expulsar ${v.nome} de todos os aparelhos`}>
                    <LogOut size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Expulsar</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!carregando && !erroCarga && paginas > 1 && (
        <nav className="flex items-center justify-center gap-2 text-[0.85rem] text-zinc-600" aria-label="Paginação">
          <Button type="button" variante="contorno" tamanho="pequeno" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)} aria-label="Página anterior">
            <ChevronLeft size={16} aria-hidden="true" /><span className={TEXTO_ACAO}>Anterior</span>
          </Button>
          <span>Página {pagina + 1} de {paginas}</span>
          <Button type="button" variante="contorno" tamanho="pequeno" disabled={pagina + 1 >= paginas} onClick={() => setPagina((p) => p + 1)} aria-label="Próxima página">
            <span className={TEXTO_ACAO}>Próxima</span><ChevronRight size={16} aria-hidden="true" />
          </Button>
        </nav>
      )}

      {aberto && (
        <VisitanteDetalhe
          visitante={aberto}
          extras={aberto.auth_user_id ? extras[aberto.auth_user_id] : undefined}
          onFechar={fecharDetalhe}
          onAlterado={(msg) => { mostrar("sucesso", msg); void carregar(); void carregarCidades(); }}
          onErro={(msg) => mostrar("erro", msg)}
          onExcluido={(msg) => { setAberto(null); mostrar("sucesso", msg); void carregar(); }}
        />
      )}

      {novo && (
        <NovoVisitanteModal
          onFechar={fecharNovo}
          onCriado={(msg) => { setNovo(false); mostrar("sucesso", msg); void carregar(); void carregarCidades(); }}
        />
      )}

      <ConfirmDialog
        aberto={!!mudarSituacao}
        titulo={mudarSituacao?.ativo ? "Desativar a conta?" : "Reativar a conta?"}
        mensagem={mudarSituacao
          ? mudarSituacao.ativo
            ? `${mudarSituacao.nome} não conseguirá mais entrar até você reativar. O histórico é mantido.`
            : `${mudarSituacao.nome} volta a poder entrar com o e-mail e a senha.`
          : ""}
        textoConfirmar={mudarSituacao?.ativo ? "Desativar" : "Reativar"}
        perigo={!!mudarSituacao?.ativo}
        carregando={salvando}
        onConfirmar={confirmarSituacao}
        onCancelar={() => setMudarSituacao(null)}
      />

      {expulsar?.auth_user_id && (
        <AcaoAparelhoModal
          acao="expulsar"
          alvo={{ usuario_id: expulsar.auth_user_id, descricao: `Conta de ${expulsar.nome} (${expulsar.email}): sair de todos os aparelhos` }}
          onFechar={() => setExpulsar(null)}
          onFeito={(msg) => { setExpulsar(null); mostrar("sucesso", msg); }}
        />
      )}

      <ToastArea toasts={toasts} onFechar={fechar} />
    </div>
  );
}
