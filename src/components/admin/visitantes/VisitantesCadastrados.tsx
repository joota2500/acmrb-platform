"use client";

/**
 * Aba "Cadastrados" (somente ADM DEUS) — CRUD dos visitantes com conta
 * ------------------------------------------------------------
 * - Lista os visitantes cadastrados (tabela visitantes) com busca por
 *   nome/e-mail, filtros (situação e cidade) e paginação no servidor.
 * - Mostra logins, tempo total e último acesso (view
 *   visitantes_atividade_resumo).
 * - Cria visitantes (Novo visitante) e abre a gaveta de detalhes
 *   (VisitanteDetalhe): atividade, edição, ativar/desativar, redefinir
 *   senha, histórico de logins e exclusão.
 * Leitura: RLS is_deus(). Escrita: /api/admin/visitantes (service role).
 * CSS: src/styles/admin-visitantes.css (prefixo "advis-").
 */

import { useCallback, useEffect, useState } from "react";
import { Ban, CheckCircle2, ChevronLeft, ChevronRight, Loader2, LogOut, Power, RefreshCw, Search, UserPlus, UserRound, Users } from "lucide-react";

import "@/styles/admin-visitantes.css";
import "@/styles/admin-aparelhos.css";
import "@/styles/admin-acessos.css";
import { supabase } from "@/lib/supabase";
import { ToastArea, useToast } from "@/components/ui/Toast";
import { chamarApi } from "@/lib/apiAdmin";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AcaoAparelhoModal from "@/components/admin/aparelhos/AcaoAparelhoModal";
import NovoVisitanteModal from "./NovoVisitanteModal";
import VisitanteDetalhe from "./VisitanteDetalhe";
import { dataHoraCurta, duracao, type ResumoAtividade, type Visitante } from "./tipos";

const POR_PAGINA = 15;
type Situacao = "todos" | "ativos" | "inativos";

export default function VisitantesCadastrados() {
  const { toasts, mostrar, fechar } = useToast();
  const [lista, setLista] = useState<Visitante[]>([]);
  const [resumos, setResumos] = useState<Record<string, ResumoAtividade>>({});
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [situacao, setSituacao] = useState<Situacao>("todos");
  const [cidade, setCidade] = useState("");
  const [cidades, setCidades] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
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
    setCarregando(true);
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
      mostrar("erro", "Não foi possível carregar os visitantes. A migration de visitantes já foi rodada?");
      setCarregando(false);
      return;
    }
    const linhas = (data ?? []) as Visitante[];
    setLista(linhas);
    setTotal(count ?? 0);

    // Resumo de atividade só dos visitantes da página
    const ids = linhas.map((l) => l.auth_user_id).filter(Boolean) as string[];
    if (ids.length) {
      const { data: r } = await supabase.from("visitantes_atividade_resumo").select("*").in("auth_user_id", ids);
      const mapa: Record<string, ResumoAtividade> = {};
      for (const x of (r ?? []) as ResumoAtividade[]) mapa[x.auth_user_id] = x;
      setResumos(mapa);
    } else setResumos({});
    setCarregando(false);
  }, [pagina, buscaAplicada, situacao, cidade, mostrar]);

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

  return (
    <div className="advis">
      <div className="advis-topo">
        <div>
          <h2 className="advis-titulo"><Users size={20} aria-hidden="true" /> Visitantes cadastrados</h2>
          <p className="advis-sub">Contas criadas na área de visitantes do site. Só o ADM DEUS vê esta seção.</p>
        </div>
        <div className="advis-topo-botoes">
          <button type="button" className="advis-btn" onClick={() => setNovo(true)}>
            <UserPlus size={16} aria-hidden="true" /> Novo visitante
          </button>
          <button type="button" className="advis-btn advis-btn--soft" onClick={() => { void carregar(); void carregarCidades(); }}>
            <RefreshCw size={16} aria-hidden="true" /> Atualizar
          </button>
        </div>
      </div>

      <div className="advis-filtros apa-filtros">
        <label className="advis-busca">
          <Search size={16} aria-hidden="true" />
          <span className="advis-sr">Buscar por nome ou e-mail</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou e-mail" />
        </label>
        <div className="apa-chips" role="group" aria-label="Situação" style={{ gridColumn: "1 / -1" }}>
          {([["todos", "Todos"], ["ativos", "Ativos"], ["inativos", "Inativos (bloqueados)"]] as [Situacao, string][]).map(([v, r]) => (
            <button key={v} type="button" className={situacao === v ? "aac-chip aac-chip--ativo" : "aac-chip"} aria-pressed={situacao === v} onClick={() => { setSituacao(v); setPagina(0); }}>{r}</button>
          ))}
        </div>
        <label>
          <span className="advis-sr">Cidade</span>
          <select className="advis-select" value={cidade} onChange={(e) => { setCidade(e.target.value); setPagina(0); }}>
            <option value="">Todas as cidades</option>
            {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <p className="advis-contagem" aria-live="polite">
        {carregando ? "Carregando…" : `${total} visitante${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}`}
      </p>

      {carregando ? (
        <div className="advis-vazio"><Loader2 className="advis-giro" aria-hidden="true" /> Carregando visitantes…</div>
      ) : lista.length === 0 ? (
        <div className="advis-vazio"><UserRound aria-hidden="true" /> Nenhum visitante encontrado.</div>
      ) : (
        <div className="advis-tabela-wrap">
          <table className="advis-tabela">
            <thead>
              <tr>
                <th>Visitante</th>
                <th>Cidade</th>
                <th>Situação</th>
                <th>Logins</th>
                <th>Tempo total</th>
                <th>Último acesso</th>
                <th><span className="advis-sr">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((v) => {
                const r = v.auth_user_id ? resumos[v.auth_user_id] : undefined;
                return (
                  <tr key={v.id}>
                    <td data-rotulo="Visitante">
                      <strong className="advis-nome">{v.nome}</strong>
                      <span className="advis-email">{v.email}</span>
                    </td>
                    <td data-rotulo="Cidade">{v.cidade ?? "—"}</td>
                    <td data-rotulo="Situação">
                      <span className={`apa-selo ${v.ativo ? "apa-selo--ativo" : "apa-selo--bloqueado"}`}>
                        {v.ativo ? <CheckCircle2 size={13} aria-hidden="true" /> : <Ban size={13} aria-hidden="true" />} {v.ativo ? "Ativo" : "Inativo · login bloqueado"}
                      </span>
                    </td>
                    <td data-rotulo="Logins">{r?.total_logins ?? 0}</td>
                    <td data-rotulo="Tempo total">{duracao(r?.total_seg ?? 0)}</td>
                    <td data-rotulo="Último acesso">{dataHoraCurta(r?.ultimo_acesso)}</td>
                    <td className="advis-acao apa-acoes-linha">
                      <button type="button" className={v.ativo ? "advis-btn apa-btn--aviso" : "advis-btn"} onClick={() => setMudarSituacao(v)}>
                        <Power size={15} aria-hidden="true" /> {v.ativo ? "Desativar" : "Reativar"}
                      </button>
                      <button type="button" className="advis-btn advis-btn--ghost" disabled={!v.auth_user_id} onClick={() => setExpulsar(v)} title="Encerra o login em todos os aparelhos">
                        <LogOut size={15} aria-hidden="true" /> Expulsar
                      </button>
                      <button type="button" className="advis-btn advis-btn--soft" onClick={() => setAberto(v)}>Detalhes</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <nav className="advis-paginacao" aria-label="Paginação">
        <button type="button" className="advis-btn advis-btn--ghost" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>
          <ChevronLeft size={16} aria-hidden="true" /> Anterior
        </button>
        <span>Página {pagina + 1} de {paginas}</span>
        <button type="button" className="advis-btn advis-btn--ghost" disabled={pagina + 1 >= paginas} onClick={() => setPagina((p) => p + 1)}>
          Próxima <ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>

      {aberto && (
        <VisitanteDetalhe
          visitante={aberto}
          onFechar={() => setAberto(null)}
          onAlterado={(msg) => { mostrar("sucesso", msg); void carregar(); void carregarCidades(); }}
          onErro={(msg) => mostrar("erro", msg)}
          onExcluido={(msg) => { setAberto(null); mostrar("sucesso", msg); void carregar(); }}
        />
      )}

      {novo && (
        <NovoVisitanteModal
          onFechar={() => setNovo(false)}
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
