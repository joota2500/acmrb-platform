"use client";

/**
 * Seção "Usuários / Visitantes" (somente ADM DEUS)
 * ------------------------------------------------------------
 * - Lista os visitantes cadastrados (tabela visitantes) com busca por
 *   nome/e-mail, filtros (situação e cidade) e paginação no servidor.
 * - Mostra logins, tempo total e último acesso (view
 *   visitantes_atividade_resumo).
 * - Abre a gaveta de detalhes (VisitanteDetalhe) para ver atividade,
 *   editar, ativar/desativar e excluir.
 * Leitura: RLS is_deus(). Escrita: /api/admin/visitantes (service role).
 * CSS: src/styles/admin-visitantes.css (prefixo "advis-").
 */

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Search, UserRound, Users } from "lucide-react";

import "@/styles/admin-visitantes.css";
import { supabase } from "@/lib/supabase";
import { ToastArea, useToast } from "@/components/ui/Toast";
import VisitanteDetalhe from "@/components/admin/visitantes/VisitanteDetalhe";
import { dataHoraCurta, duracao, type ResumoAtividade, type Visitante } from "@/components/admin/visitantes/tipos";

const POR_PAGINA = 15;
type Situacao = "todos" | "ativos" | "inativos";

export default function VisitantesSection() {
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

  return (
    <div className="advis">
      <div className="advis-topo">
        <div>
          <h2 className="advis-titulo"><Users size={20} aria-hidden="true" /> Visitantes cadastrados</h2>
          <p className="advis-sub">Contas criadas na área de visitantes do site. Só o ADM DEUS vê esta seção.</p>
        </div>
        <button type="button" className="advis-btn advis-btn--soft" onClick={() => { void carregar(); void carregarCidades(); }}>
          <RefreshCw size={16} aria-hidden="true" /> Atualizar
        </button>
      </div>

      <div className="advis-filtros">
        <label className="advis-busca">
          <Search size={16} aria-hidden="true" />
          <span className="advis-sr">Buscar por nome ou e-mail</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou e-mail" />
        </label>
        <label>
          <span className="advis-sr">Situação</span>
          <select className="advis-select" value={situacao} onChange={(e) => { setSituacao(e.target.value as Situacao); setPagina(0); }}>
            <option value="todos">Todas as situações</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </label>
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
                      <span className={`advis-selo ${v.ativo ? "advis-selo--ativo" : "advis-selo--inativo"}`}>{v.ativo ? "Ativo" : "Inativo"}</span>
                    </td>
                    <td data-rotulo="Logins">{r?.total_logins ?? 0}</td>
                    <td data-rotulo="Tempo total">{duracao(r?.total_seg ?? 0)}</td>
                    <td data-rotulo="Último acesso">{dataHoraCurta(r?.ultimo_acesso)}</td>
                    <td className="advis-acao">
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

      <ToastArea toasts={toasts} onFechar={fechar} />
    </div>
  );
}
