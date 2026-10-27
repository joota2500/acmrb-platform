"use client";

/**
 * AcessosLista — todas as visitas registradas, com filtros (somente ADM DEUS)
 * ------------------------------------------------------------
 * Filtros: quem (todos, anônimos, logados), período, aparelho, origem e
 * busca por cidade ou id do navegador (completo). Clique em uma visita
 * para ver as páginas e o tempo em cada uma.
 * Lembrete na tela: anônimos somem em 24 h.
 * Dados: tabelas acessos_sessoes / acessos_paginas (RLS: só is_deus()).
 * CSS: src/styles/admin-acessos.css (prefixo "aac-").
 */

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Search, Smartphone, X } from "lucide-react";

import "@/styles/admin-acessos.css";
import { supabase } from "@/lib/supabase";
import { dataHoraCurta, duracao } from "@/components/admin/visitantes/tipos";
import AparelhoDetalhe from "@/components/admin/aparelhos/AparelhoDetalhe";
import { aparelhoDe, idCurto, localDe, mensagemErro, origemDe } from "./tipos";

interface Linha {
  id: string;
  anon_id: string;
  auth_user_id: string | null;
  iniciada_em: string;
  ultima_atividade: string;
  encerrada_em: string | null;
  duracao_seg: number;
  paginas: number;
  pagina_inicial: string | null;
  origem: string | null;
  referrer_host: string | null;
  utm_campaign: string | null;
  dispositivo: string | null;
  navegador: string | null;
  sistema: string | null;
  cidade: string | null;
  regiao: string | null;
  pais: string | null;
}
interface Pagina { id: number; caminho: string; entrou_em: string; duracao_seg: number }

const POR_PAGINA = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLUNAS = "id, anon_id, auth_user_id, iniciada_em, ultima_atividade, encerrada_em, duracao_seg, paginas, pagina_inicial, origem, referrer_host, utm_campaign, dispositivo, navegador, sistema, cidade, regiao, pais";

export default function AcessosLista() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [nomes, setNomes] = useState<Record<string, string>>({});
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [quem, setQuem] = useState<"todos" | "anonimos" | "logados">("todos");
  const [periodo, setPeriodo] = useState(7);
  const [aparelho, setAparelho] = useState("");
  const [origem, setOrigem] = useState("");
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aberta, setAberta] = useState<Linha | null>(null);
  const [paginas, setPaginas] = useState<Pagina[]>([]);
  const [aparelhoAberto, setAparelhoAberto] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setBuscaAplicada(busca.trim()); setPagina(0); }, 350);
    return () => clearTimeout(t);
  }, [busca]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const desde = new Date(Date.now() - periodo * 86_400_000).toISOString();
    let q = supabase.from("acessos_sessoes").select(COLUNAS, { count: "exact" }).gte("iniciada_em", desde)
      .order("iniciada_em", { ascending: false }).range(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA - 1);
    if (quem === "anonimos") q = q.is("auth_user_id", null);
    if (quem === "logados") q = q.not("auth_user_id", "is", null);
    if (aparelho) q = q.eq("dispositivo", aparelho);
    if (origem) q = q.eq("origem", origem);
    if (buscaAplicada) {
      if (UUID.test(buscaAplicada)) q = q.eq("anon_id", buscaAplicada);
      else q = q.ilike("cidade", `%${buscaAplicada.replace(/[,()%*]/g, " ")}%`);
    }
    const { data, count, error } = await q;
    if (error) {
      setErro(mensagemErro(error, "20261027100000_acessos_site.sql"));
      setCarregando(false);
      return;
    }
    setErro("");
    const l = (data ?? []) as Linha[];
    setLinhas(l);
    setTotal(count ?? 0);
    const ids = Array.from(new Set(l.map((x) => x.auth_user_id).filter(Boolean))) as string[];
    if (ids.length) {
      const { data: v } = await supabase.from("visitantes").select("auth_user_id, nome").in("auth_user_id", ids);
      setNomes(Object.fromEntries((v ?? []).map((x) => [x.auth_user_id as string, x.nome as string])));
    }
    setCarregando(false);
  }, [pagina, quem, periodo, aparelho, origem, buscaAplicada]);

  useEffect(() => { void carregar(); }, [carregar]);

  async function abrir(l: Linha) {
    setAberta(l);
    setPaginas([]);
    const { data } = await supabase.from("acessos_paginas").select("id, caminho, entrou_em, duracao_seg").eq("sessao_id", l.id).order("id");
    setPaginas((data ?? []) as Pagina[]);
  }

  const mudar = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPagina(0); };
  const nTotal = Math.max(1, Math.ceil(total / POR_PAGINA));
  const agora = (l: Linha) => !l.encerrada_em && Date.now() - new Date(l.ultima_atividade).getTime() < 120_000;

  return (
    <div className="aac">
      <p className="aac-nota">Visitas de pessoas sem login ficam registradas por 24 h. As de pessoas logadas ficam enquanto a conta existir.</p>

      <div className="aac-filtros">
        <label className="advis-busca">
          <Search size={16} aria-hidden="true" />
          <span className="advis-sr">Buscar por cidade ou id do navegador</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Cidade ou id completo" />
        </label>
        <select className="advis-select" aria-label="Quem" value={quem} onChange={(e) => mudar(setQuem)(e.target.value as typeof quem)}>
          <option value="todos">Todos</option><option value="anonimos">Sem login (anônimos)</option><option value="logados">Logados</option>
        </select>
        <select className="advis-select" aria-label="Período" value={periodo} onChange={(e) => mudar(setPeriodo)(Number(e.target.value))}>
          <option value={1}>Últimas 24 h</option><option value={7}>7 dias</option><option value={30}>30 dias</option><option value={90}>90 dias</option>
        </select>
        <select className="advis-select" aria-label="Aparelho" value={aparelho} onChange={(e) => mudar(setAparelho)(e.target.value)}>
          <option value="">Todos os aparelhos</option><option value="celular">Celular</option><option value="tablet">Tablet</option><option value="computador">Computador</option>
        </select>
        <select className="advis-select" aria-label="Origem" value={origem} onChange={(e) => mudar(setOrigem)(e.target.value)}>
          <option value="">Todas as origens</option><option value="direto">Direto</option><option value="busca">Busca</option><option value="rede social">Rede social</option>
          <option value="e-mail">E-mail</option><option value="outros sites">Outros sites</option><option value="campanha">Campanha</option>
        </select>
        <button type="button" className="advis-btn advis-btn--soft" onClick={() => void carregar()}><RefreshCw size={16} aria-hidden="true" /> Atualizar</button>
      </div>

      {erro && <p className="aac-erro" role="alert">{erro}</p>}
      <p className="advis-contagem" aria-live="polite">{carregando ? "Carregando…" : `${total} visita${total === 1 ? "" : "s"}`}</p>

      {carregando ? (
        <p className="aac-vazio"><Loader2 className="advis-giro" aria-hidden="true" /> Carregando…</p>
      ) : linhas.length === 0 ? (
        <p className="aac-vazio">Nenhuma visita com esses filtros.</p>
      ) : (
        <div className="advis-tabela-wrap">
          <table className="advis-tabela">
            <thead><tr><th>Quando</th><th>Quem</th><th>Onde</th><th>Aparelho</th><th>Origem</th><th>Páginas</th><th>Tempo</th><th><span className="advis-sr">Detalhes</span></th></tr></thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.id}>
                  <td data-rotulo="Quando">{dataHoraCurta(l.iniciada_em)} {agora(l) && <span className="aac-selo aac-selo--agora">agora</span>}</td>
                  <td data-rotulo="Quem">
                    <strong className="advis-nome">{l.auth_user_id ? nomes[l.auth_user_id] ?? "Cadastrado" : "Anônimo"}</strong>
                    <span className="advis-email">id {idCurto(l.anon_id)}</span>
                  </td>
                  <td data-rotulo="Onde">{localDe(l)}</td>
                  <td data-rotulo="Aparelho">{aparelhoDe(l)}</td>
                  <td data-rotulo="Origem">{origemDe(l)}{l.utm_campaign ? ` · ${l.utm_campaign}` : ""}</td>
                  <td data-rotulo="Páginas">{l.paginas}</td>
                  <td data-rotulo="Tempo">{duracao(l.duracao_seg)}</td>
                  <td className="advis-acao">
                    <button type="button" className="advis-btn advis-btn--soft" onClick={() => void abrir(l)}>Ver</button>{" "}
                    <button type="button" className="advis-btn advis-btn--ghost" onClick={() => setAparelhoAberto(l.anon_id)}><Smartphone size={15} aria-hidden="true" /> Aparelho</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav className="advis-paginacao" aria-label="Paginação">
        <button type="button" className="advis-btn advis-btn--ghost" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}><ChevronLeft size={16} aria-hidden="true" /> Anterior</button>
        <span>Página {pagina + 1} de {nTotal}</span>
        <button type="button" className="advis-btn advis-btn--ghost" disabled={pagina + 1 >= nTotal} onClick={() => setPagina((p) => p + 1)}>Próxima <ChevronRight size={16} aria-hidden="true" /></button>
      </nav>

      {aparelhoAberto && <AparelhoDetalhe anonId={aparelhoAberto} onFechar={() => setAparelhoAberto(null)} onAlterado={() => void carregar()} />}

      {aberta && (
        <div className="aac-fundo" onClick={() => setAberta(null)} role="presentation">
          <div className="aac-modal" role="dialog" aria-modal="true" aria-labelledby="aac-visita" onClick={(e) => e.stopPropagation()}>
            <div className="aac-barra">
              <h3 id="aac-visita">Visita de {aberta.auth_user_id ? nomes[aberta.auth_user_id] ?? "cadastrado" : `anônimo (id ${idCurto(aberta.anon_id)})`}</h3>
              <button type="button" className="advd-fechar" onClick={() => setAberta(null)} aria-label="Fechar"><X size={20} /></button>
            </div>
            <p className="aac-nota">
              {dataHoraCurta(aberta.iniciada_em)} · {localDe(aberta)} · {aparelhoDe(aberta)} · origem: {origemDe(aberta)} · {duracao(aberta.duracao_seg)} no total
            </p>
            <button type="button" className="advis-btn advis-btn--soft" onClick={() => { setAparelhoAberto(aberta.anon_id); setAberta(null); }}><Smartphone size={15} aria-hidden="true" /> Gerenciar este aparelho (bloquear, suspender, expulsar)</button>
            <ul className="aac-linha-tempo">
              {paginas.length === 0 ? <li>Carregando páginas…</li> : paginas.map((p) => (
                <li key={p.id}><code className="aac-codigo">{p.caminho}</code><span>{new Date(p.entrou_em).toLocaleTimeString("pt-BR")} · {duracao(p.duracao_seg)}</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
