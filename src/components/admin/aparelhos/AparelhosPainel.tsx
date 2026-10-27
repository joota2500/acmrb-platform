"use client";

/**
 * AparelhosPainel — aba "Aparelhos" (somente ADM DEUS)
 * ------------------------------------------------------------
 * Lista os aparelhos (navegadores) que visitaram o site, com ou sem conta,
 * e a situação de cada um: ativo, suspenso ou bloqueado. Filtros por
 * situação, por quem (anônimo/logado) e busca (id, cidade ou nome).
 * Ações rápidas: bloquear, suspender, desbloquear; "Detalhes" abre a
 * gaveta com histórico e a ação de expulsar.
 * Mostra também aparelhos bloqueados cujas visitas já expiraram (24 h).
 * Dados: função aparelhos_lista (migration 20261027130000).
 * CSS: src/styles/admin-aparelhos.css (prefixo "apa-").
 */

import { useCallback, useEffect, useState } from "react";
import { Ban, ChevronLeft, ChevronRight, Clock, Loader2, RefreshCw, Search, ShieldCheck, Smartphone } from "lucide-react";

import "@/styles/admin-aparelhos.css";
import { supabase } from "@/lib/supabase";
import { ToastArea, useToast } from "@/components/ui/Toast";
import { dataHoraCurta } from "@/components/admin/visitantes/tipos";
import { aparelhoDe, idCurto, localDe, mensagemErro } from "@/components/admin/acessos/tipos";
import AcaoAparelhoModal from "./AcaoAparelhoModal";
import AparelhoDetalhe from "./AparelhoDetalhe";
import SeloSituacao from "./SeloSituacao";
import { curto, type AcaoAparelho, type AparelhoItem } from "./tipos";

const POR_PAGINA = 15;
type Filtro = "todos" | "ativos" | "bloqueados" | "suspensos" | "online";
type Quem = "todos" | "anonimos" | "logados";

export default function AparelhosPainel() {
  const { toasts, mostrar, fechar } = useToast();
  const [itens, setItens] = useState<AparelhoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [quem, setQuem] = useState<Quem>("todos");
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);
  const [acao, setAcao] = useState<{ tipo: AcaoAparelho; item: AparelhoItem } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setBuscaAplicada(busca.trim()); setPagina(0); }, 350);
    return () => clearTimeout(t);
  }, [busca]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await supabase.rpc("aparelhos_lista", {
      p_filtro: filtro,
      p_quem: quem,
      p_busca: buscaAplicada || null,
      p_limite: POR_PAGINA,
      p_desloc: pagina * POR_PAGINA,
    });
    if (error) {
      setErro(mensagemErro(error, "20261027130000_dispositivos_bloqueios.sql"));
      setCarregando(false);
      return;
    }
    setErro("");
    const r = data as { total: number; itens: AparelhoItem[] };
    setItens(r.itens ?? []);
    setTotal(r.total ?? 0);
    setCarregando(false);
  }, [filtro, quem, buscaAplicada, pagina]);

  useEffect(() => { void carregar(); }, [carregar]);

  const nPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const quemRotulo = (i: AparelhoItem) => (i.nome ? i.nome : i.logado ? "Cadastrado" : "Anônimo");

  return (
    <div className="aac">
      <div className="aac-barra">
        <p className="aac-nota">
          Aparelhos que visitaram o site. O bloqueio vale em até 15 segundos. Visitas de anônimos somem em 24 h, mas os bloqueios continuam até você desbloquear.
        </p>
        <button type="button" className="advis-btn advis-btn--soft" onClick={() => void carregar()}><RefreshCw size={16} aria-hidden="true" /> Atualizar</button>
      </div>

      <div className="apa-chips" role="group" aria-label="Filtrar por situação">
        {([["todos", "Todos"], ["online", "No site agora"], ["ativos", "Ativos"], ["suspensos", "Suspensos"], ["bloqueados", "Bloqueados"]] as [Filtro, string][]).map(([v, r]) => (
          <button key={v} type="button" className={filtro === v ? "aac-chip aac-chip--ativo" : "aac-chip"} aria-pressed={filtro === v} onClick={() => { setFiltro(v); setPagina(0); }}>{r}</button>
        ))}
      </div>

      <div className="apa-filtros">
        <label className="advis-busca">
          <Search size={16} aria-hidden="true" />
          <span className="advis-sr">Buscar por id, cidade ou nome</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Id do aparelho, cidade ou nome" />
        </label>
        <select className="advis-select" aria-label="Quem" value={quem} onChange={(e) => { setQuem(e.target.value as Quem); setPagina(0); }}>
          <option value="todos">Anônimos e logados</option>
          <option value="anonimos">Só anônimos</option>
          <option value="logados">Só logados</option>
        </select>
      </div>

      {erro && <p className="aac-erro" role="alert">{erro}</p>}
      <p className="advis-contagem" aria-live="polite">{carregando ? "Carregando…" : `${total} aparelho${total === 1 ? "" : "s"}`}</p>

      {carregando ? (
        <p className="aac-vazio"><Loader2 className="advis-giro" aria-hidden="true" /> Carregando…</p>
      ) : itens.length === 0 ? (
        <p className="aac-vazio"><Smartphone aria-hidden="true" /> Nenhum aparelho com esses filtros.</p>
      ) : (
        <div className="advis-tabela-wrap">
          <table className="advis-tabela">
            <thead><tr><th>Aparelho</th><th>Situação</th><th>Onde</th><th>Última atividade</th><th>Visitas</th><th><span className="advis-sr">Ações</span></th></tr></thead>
            <tbody>
              {itens.map((i) => (
                <tr key={i.anon_id} className={i.situacao !== "ativo" ? `apa-linha apa-linha--${i.situacao}` : "apa-linha"}>
                  <td data-rotulo="Aparelho">
                    <strong className="advis-nome">{quemRotulo(i)}</strong>
                    <span className="advis-email">id {idCurto(i.anon_id)} · {aparelhoDe(i)}</span>
                  </td>
                  <td data-rotulo="Situação">
                    <SeloSituacao situacao={i.situacao} ate={i.ate} />
                    {i.online && <span className="apa-selo apa-selo--online">no site agora</span>}
                    {i.situacao !== "ativo" && i.motivo && <span className="advis-email">Motivo: {curto(i.motivo)}</span>}
                  </td>
                  <td data-rotulo="Onde">{localDe(i)}</td>
                  <td data-rotulo="Última atividade">{dataHoraCurta(i.ultima_atividade)}</td>
                  <td data-rotulo="Visitas">{i.sessoes ?? 0}</td>
                  <td className="advis-acao apa-acoes-linha">
                    {i.situacao === "ativo" ? (
                      <>
                        <button type="button" className="advis-btn apa-btn--aviso" onClick={() => setAcao({ tipo: "suspender", item: i })} title="Suspender por um tempo"><Clock size={15} aria-hidden="true" /> Suspender</button>
                        <button type="button" className="advis-btn apa-btn--perigo" onClick={() => setAcao({ tipo: "bloquear", item: i })}><Ban size={15} aria-hidden="true" /> Bloquear</button>
                      </>
                    ) : (
                      <button type="button" className="advis-btn" onClick={() => setAcao({ tipo: "desbloquear", item: i })}><ShieldCheck size={15} aria-hidden="true" /> Desbloquear</button>
                    )}
                    <button type="button" className="advis-btn advis-btn--soft" onClick={() => setAberto(i.anon_id)}>Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav className="advis-paginacao" aria-label="Paginação">
        <button type="button" className="advis-btn advis-btn--ghost" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}><ChevronLeft size={16} aria-hidden="true" /> Anterior</button>
        <span>Página {pagina + 1} de {nPaginas}</span>
        <button type="button" className="advis-btn advis-btn--ghost" disabled={pagina + 1 >= nPaginas} onClick={() => setPagina((p) => p + 1)}>Próxima <ChevronRight size={16} aria-hidden="true" /></button>
      </nav>

      {aberto && <AparelhoDetalhe anonId={aberto} onFechar={() => setAberto(null)} onAlterado={() => void carregar()} />}

      {acao && (
        <AcaoAparelhoModal
          acao={acao.tipo}
          alvo={{ anon_id: acao.item.anon_id, descricao: `Aparelho id ${idCurto(acao.item.anon_id)} · ${quemRotulo(acao.item)} · ${aparelhoDe(acao.item)}` }}
          onFechar={() => setAcao(null)}
          onFeito={(msg) => { setAcao(null); mostrar("sucesso", msg); void carregar(); }}
        />
      )}
      <ToastArea toasts={toasts} onFechar={fechar} />
    </div>
  );
}
