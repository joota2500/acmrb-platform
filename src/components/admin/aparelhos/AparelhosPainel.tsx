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
 */

import { useCallback, useEffect, useState } from "react";
import { Ban, ChevronLeft, ChevronRight, Clock, Loader2, Pencil, RefreshCw, Search, ShieldCheck, Smartphone } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { dataHoraCurta } from "@/types/visitantes";
import { aparelhoDe, idCurto, localDe, mensagemErro } from "@/types/acessos";
import AcaoAparelhoModal from "@/components/admin/aparelhos/AcaoAparelhoModal";
import AparelhoDetalhe from "@/components/admin/aparelhos/AparelhoDetalhe";
import SeloSituacao from "@/components/admin/aparelhos/SeloSituacao";
import { curto, type AcaoAparelho, type AparelhoItem } from "@/types/aparelhos";
import Button from "@/components/ui/Button";
import * as E from "@/components/admin/acessos/estilos";
import { cn } from "@/utils/cn";

const POR_PAGINA = 15;
type Filtro = "todos" | "ativos" | "bloqueados" | "suspensos" | "online";
type Quem = "todos" | "anonimos" | "logados";

export default function AparelhosPainel() {
  const { mostrar } = useToast();
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
    <div className={E.RAIZ}>
      <div className={E.BARRA}>
        <p className={E.NOTA}>
          Aparelhos que visitaram o site. O bloqueio vale na próxima navegação e a página aberta é trocada em até ~10 segundos. Visitas de anônimos somem em 24 h, mas os bloqueios continuam até você desbloquear.
        </p>
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void carregar()}><RefreshCw size={16} aria-hidden="true" /> Atualizar</Button>
      </div>

      <div className={E.CHIPS} role="group" aria-label="Filtrar por situação">
        {([["todos", "Todos"], ["online", "No site agora"], ["ativos", "Ativos"], ["suspensos", "Suspensos"], ["bloqueados", "Bloqueados"]] as [Filtro, string][]).map(([v, r]) => (
          <button key={v} type="button" className={filtro === v ? cn(E.CHIP, E.CHIP_ATIVO) : E.CHIP} aria-pressed={filtro === v} onClick={() => { setFiltro(v); setPagina(0); }}>{r}</button>
        ))}
      </div>

      <div className={E.FILTROS_APA}>
        <label className={E.BUSCA}>
          <Search size={16} aria-hidden="true" />
          <span className={E.SR}>Buscar por id, cidade ou nome</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Id do aparelho, cidade ou nome" />
        </label>
        <select className={E.SELECT} aria-label="Quem" value={quem} onChange={(e) => { setQuem(e.target.value as Quem); setPagina(0); }}>
          <option value="todos">Anônimos e logados</option>
          <option value="anonimos">Só anônimos</option>
          <option value="logados">Só logados</option>
        </select>
      </div>

      {erro && <p className={E.ERRO} role="alert">{erro}</p>}
      <p className={E.CONTAGEM} aria-live="polite">{carregando ? "Carregando…" : `${total} aparelho${total === 1 ? "" : "s"}`}</p>

      {carregando ? (
        <p className={E.VAZIO}><Loader2 className={E.GIRO} aria-hidden="true" /> Carregando…</p>
      ) : itens.length === 0 ? (
        <p className={E.VAZIO}><Smartphone aria-hidden="true" /> Nenhum aparelho com esses filtros.</p>
      ) : (
        <div className={E.TABELA_CAIXA}>
          <table className={E.TABELA}>
            <thead><tr><th>Aparelho</th><th>Situação</th><th>Onde</th><th>Última atividade</th><th>Visitas</th><th><span className={E.SR}>Ações</span></th></tr></thead>
            <tbody>
              {itens.map((i) => (
                <tr key={i.anon_id} className={E.COR_LINHA_SITUACAO[i.situacao] || undefined}>
                  <td data-rotulo="Aparelho">
                    <strong className={E.NOME}>{quemRotulo(i)}</strong>
                    <span className={E.DETALHE}>id {idCurto(i.anon_id)} · {aparelhoDe(i)}</span>
                  </td>
                  <td data-rotulo="Situação">
                    <SeloSituacao situacao={i.situacao} ate={i.ate} />
                    {i.online && <span className={cn(E.SELO_SITUACAO, E.SELO_ONLINE)}>no site agora</span>}
                    {i.situacao !== "ativo" && i.motivo && <span className={E.DETALHE}>Motivo: {curto(i.motivo)}</span>}
                  </td>
                  <td data-rotulo="Onde">{localDe(i)}</td>
                  <td data-rotulo="Última atividade">{dataHoraCurta(i.ultima_atividade)}</td>
                  <td data-rotulo="Visitas">{i.sessoes ?? 0}</td>
                  <td className={cn(E.ACAO_TD, E.ACOES_LINHA)}>
                    {i.situacao === "ativo" ? (
                      <>
                        <Button type="button" variante="contorno" tamanho="pequeno" onClick={() => setAcao({ tipo: "suspender", item: i })} title="Suspender por um tempo"><Clock size={15} aria-hidden="true" /> Suspender</Button>
                        <Button type="button" variante="perigo" tamanho="pequeno" onClick={() => setAcao({ tipo: "bloquear", item: i })}><Ban size={15} aria-hidden="true" /> Bloquear</Button>
                      </>
                    ) : (
                      <>
                        <Button type="button" tamanho="pequeno" onClick={() => setAcao({ tipo: "desbloquear", item: i })}><ShieldCheck size={15} aria-hidden="true" /> Desbloquear</Button>
                        <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => setAcao({ tipo: "editar", item: i })}><Pencil size={15} aria-hidden="true" /> Editar</Button>
                      </>
                    )}
                    <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => setAberto(i.anon_id)}>Detalhes</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav className={E.PAGINACAO} aria-label="Paginação">
        <Button type="button" variante="contorno" tamanho="pequeno" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}><ChevronLeft size={16} aria-hidden="true" /> Anterior</Button>
        <span>Página {pagina + 1} de {nPaginas}</span>
        <Button type="button" variante="contorno" tamanho="pequeno" disabled={pagina + 1 >= nPaginas} onClick={() => setPagina((p) => p + 1)}>Próxima <ChevronRight size={16} aria-hidden="true" /></Button>
      </nav>

      {aberto && <AparelhoDetalhe anonId={aberto} onFechar={() => setAberto(null)} onAlterado={() => void carregar()} />}

      {acao && (
        <AcaoAparelhoModal
          acao={acao.tipo}
          inicial={acao.item.bloqueio_tipo ? { motivo: acao.item.motivo ?? "", ate: acao.item.ate, tipo: acao.item.bloqueio_tipo } : undefined}
          alvo={{ anon_id: acao.item.anon_id, descricao: `Aparelho id ${idCurto(acao.item.anon_id)} · ${quemRotulo(acao.item)} · ${aparelhoDe(acao.item)}` }}
          onFechar={() => setAcao(null)}
          onFeito={(msg) => { setAcao(null); mostrar("sucesso", msg); void carregar(); }}
        />
      )}
    </div>
  );
}
