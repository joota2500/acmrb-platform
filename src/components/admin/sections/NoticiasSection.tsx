"use client";

/**
 * NoticiasSection — gestão de notícias no painel (SOMENTE ADM DEUS)
 * ------------------------------------------------------------
 * - Indicadores: total, publicadas, agendadas, rascunhos, destaques
 * - Lista com busca e filtros por situação e categoria
 * - Ações rápidas: editar, publicar/despublicar, destacar (posição
 *   1–3), duplicar, ver no site e excluir (com confirmação)
 * - Editor completo em NoticiaEditor
 * O banco reforça a regra pela RLS (is_deus) — migration
 * 20261020220000_noticias_completo.sql.
 *
 * A versão antiga (NoticiasForm, NoticiasList, NoticiasStats,
 * NoticiasCard) continua no projeto, marcada como NÃO UTILIZADO.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy, ExternalLink, EyeOff, FileText, Loader2, Lock, Pencil, Plus, RefreshCw, Search, Send, Star, Trash2,
  CalendarClock, Newspaper,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import { podeEditar } from "@/lib/permissions";
import { useToast, ToastArea } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CompartilharNoticia from "@/components/noticias/CompartilharNoticia";
import { resumoCurto } from "@/lib/compartilharNoticia";
import NoticiaEditor from "@/components/admin/news/NoticiaEditor";
import { atualizarCampos, salvarNoticia, type DadosNoticia } from "@/lib/noticiasAdmin";
import {
  CATEGORIAS_NOTICIA, ROTULO_STATUS, formatarData, normalizarNoticia, ordenarRecentes, visivelAoPublico,
  type Noticia, type StatusNoticia,
} from "@/lib/noticias";

import "@/styles/admin-noticias.css";

type Editor = { modo: "nova" } | { modo: "editar"; noticia: Noticia } | { modo: "duplicar"; noticia: Noticia } | null;

export default function NoticiasSection() {
  const papel = usePapelAdmin();
  const permitido = podeEditar(papel, "noticias");
  const { toasts, mostrar, fechar } = useToast();

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor>(null);
  const [excluir, setExcluir] = useState<Noticia | null>(null);

  const [busca, setBusca] = useState("");
  const [fStatus, setFStatus] = useState<"" | StatusNoticia | "destaque">("");
  const [fCategoria, setFCategoria] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    const { data, error } = await supabase.from("noticias").select("*").order("created_at", { ascending: false });
    if (error) setErroCarga(error.message);
    else setNoticias(ordenarRecentes((data ?? []).map(normalizarNoticia)));
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (permitido) carregar();
  }, [permitido, carregar]);

  /* ---------- Indicadores ---------- */
  const stats = useMemo(() => {
    const agora = Date.now();
    return {
      total: noticias.length,
      noAr: noticias.filter((n) => visivelAoPublico(n, agora)).length,
      agendadas: noticias.filter((n) => n.status === "agendado" && !visivelAoPublico(n, agora)).length,
      rascunhos: noticias.filter((n) => n.status === "rascunho").length,
      destaques: noticias.filter((n) => n.destaque).length,
      visualizacoes: noticias.reduce((s, n) => s + n.visualizacoes, 0),
    };
  }, [noticias]);

  const categorias = useMemo(
    () => Array.from(new Set([...CATEGORIAS_NOTICIA, ...noticias.map((n) => n.categoria).filter(Boolean)])),
    [noticias],
  );

  const filtradas = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return noticias.filter((n) => {
      if (fStatus === "destaque" ? !n.destaque : fStatus && n.status !== fStatus) return false;
      if (fCategoria && n.categoria !== fCategoria) return false;
      if (t && !`${n.titulo} ${n.resumo} ${n.tags.join(" ")}`.toLowerCase().includes(t)) return false;
      return true;
    });
  }, [noticias, busca, fStatus, fCategoria]);

  /* ---------- Salvar (editor) ---------- */
  async function salvar(dados: DadosNoticia) {
    setSalvando(true);
    const id = editor?.modo === "editar" ? editor.noticia.id : null;
    const { error, semColunasNovas } = await salvarNoticia(dados, id);
    setSalvando(false);
    if (error) {
      const msg = /duplicate|unique/i.test(error.message)
        ? "Já existe uma notícia com esse endereço (slug)."
        : /row-level|permission|policy/i.test(error.message)
          ? "O banco recusou: só o ADM DEUS pode salvar notícias."
          : error.message;
      return mostrar("erro", `Não foi possível salvar: ${msg}`);
    }
    if (semColunasNovas) {
      mostrar("aviso", "Salvo, mas sem tags, galeria, legenda e agendamento: rode a migration 20261020220000_noticias_completo.sql no Supabase.");
    } else {
      mostrar("sucesso", dados.status === "rascunho" ? "Rascunho salvo." : dados.status === "agendado" ? "Notícia agendada." : "Notícia salva.");
    }
    setEditor(null);
    carregar();
  }

  /* ---------- Ações rápidas ---------- */
  async function acao(n: Noticia, campos: Record<string, unknown>, msg: string) {
    setOcupado(n.id);
    const error = await atualizarCampos(n.id, campos);
    setOcupado(null);
    if (error) return mostrar("erro", `Não foi possível concluir: ${error.message}`);
    mostrar("sucesso", msg);
    carregar();
  }

  const publicar = (n: Noticia) =>
    acao(n, { status: "publicado", publicado: true, published_at: visivelAoPublico(n) ? n.publicado_em : new Date().toISOString() }, "Notícia publicada no site.");
  const despublicar = (n: Noticia) => acao(n, { status: "rascunho", publicado: false }, "Notícia retirada do site (virou rascunho).");
  const destacar = (n: Noticia, ordem: number | null) =>
    acao(n, { destaque: ordem !== null, ordem_destaque: ordem }, ordem ? `Destaque na posição ${ordem}.` : "Destaque removido.");

  async function confirmarExclusao() {
    if (!excluir) return;
    setOcupado(excluir.id);
    const { error } = await supabase.from("noticias").delete().eq("id", excluir.id);
    setOcupado(null);
    setExcluir(null);
    if (error) return mostrar("erro", `Não foi possível excluir: ${error.message}`);
    mostrar("sucesso", "Notícia excluída.");
    carregar();
  }

  /* ---------- Sem permissão ---------- */
  if (!permitido) {
    return (
      <div className="an__bloqueio">
        <Lock size={28} aria-hidden="true" />
        <h2>Somente o ADM DEUS gerencia notícias</h2>
        <p>Peça ao responsável pela plataforma para publicar ou alterar notícias.</p>
      </div>
    );
  }

  /* ---------- Editor aberto ---------- */
  if (editor) {
    let inicial: Noticia | null = null;
    if (editor.modo === "editar") inicial = editor.noticia;
    if (editor.modo === "duplicar") {
      const base = editor.noticia;
      inicial = { ...base, titulo: `${base.titulo} (cópia)`, slug: `${base.slug}-copia`, status: "rascunho", destaque: false, ordem_destaque: null, visualizacoes: 0 };
    }
    return (
      <>
        <NoticiaEditor
          key={editor.modo === "nova" ? "nova" : `${editor.modo}-${editor.noticia.id}`}
          inicial={inicial}
          editandoId={editor.modo === "editar" ? editor.noticia.id : null}
          salvando={salvando}
          onSalvar={salvar}
          onCancelar={() => setEditor(null)}
          onAviso={mostrar}
        />
        <ToastArea toasts={toasts} onFechar={fechar} />
      </>
    );
  }

  /* ---------- Lista ---------- */
  const cartoes = [
    { rotulo: "Total", valor: stats.total, Icone: Newspaper },
    { rotulo: "No ar", valor: stats.noAr, Icone: Send },
    { rotulo: "Agendadas", valor: stats.agendadas, Icone: CalendarClock },
    { rotulo: "Rascunhos", valor: stats.rascunhos, Icone: FileText },
    { rotulo: "Destaques", valor: stats.destaques, Icone: Star },
  ];

  return (
    <div className="an">
      <div className="an__cabecalho">
        <div>
          <h2>Notícias</h2>
          <p>Publique e organize as notícias do site. Os destaques aparecem na página inicial (máximo 3).</p>
        </div>
        <button type="button" className="an__btn" onClick={() => setEditor({ modo: "nova" })}>
          <Plus size={16} /> Nova notícia
        </button>
      </div>

      <div className="an__stats">
        {cartoes.map(({ rotulo, valor, Icone }) => (
          <div key={rotulo} className="an__stat">
            <Icone size={18} aria-hidden="true" />
            <strong>{valor}</strong>
            <span>{rotulo}</span>
          </div>
        ))}
      </div>
      <p className="an__dica">{stats.visualizacoes} visualizações no total.</p>

      <div className="an__filtros">
        <label className="an__busca">
          <Search size={16} aria-hidden="true" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por título, resumo ou tag" aria-label="Buscar notícias" />
        </label>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value as typeof fStatus)} aria-label="Filtrar por situação">
          <option value="">Todas as situações</option>
          {(Object.keys(ROTULO_STATUS) as StatusNoticia[]).map((s) => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
          <option value="destaque">Somente destaques</option>
        </select>
        <select value={fCategoria} onChange={(e) => setFCategoria(e.target.value)} aria-label="Filtrar por categoria">
          <option value="">Todas as categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" className="an__btn an__btn--claro" onClick={carregar} aria-label="Atualizar lista">
          <RefreshCw size={16} />
        </button>
      </div>

      {carregando && <div className="an__vazio"><Loader2 className="an__girando" /> Carregando notícias...</div>}
      {!carregando && erroCarga && (
        <div className="an__vazio an__vazio--erro" role="alert">
          Erro ao carregar: {erroCarga}
          <button type="button" className="an__btn an__btn--claro" onClick={carregar}>Tentar de novo</button>
        </div>
      )}
      {!carregando && !erroCarga && filtradas.length === 0 && (
        <div className="an__vazio">
          {noticias.length ? "Nenhuma notícia com esses filtros." : "Nenhuma notícia cadastrada. Clique em “Nova notícia”."}
        </div>
      )}

      <ul className="an__lista">
        {!carregando && filtradas.map((n) => {
          const noAr = visivelAoPublico(n);
          const agendada = n.status === "agendado" && !noAr;
          const rotulo = agendada ? "Agendada" : noAr ? "No ar" : ROTULO_STATUS[n.status];
          const cls = agendada ? "agendado" : noAr ? "publicado" : n.status;
          return (
            <li key={n.id} className="an__item">
              <div className="an__thumb">
                {n.imagem_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.imagem_url} alt="" />
                ) : <Newspaper size={22} aria-hidden="true" />}
              </div>
              <div className="an__info">
                <div className="an__selos">
                  <span className={`an__status an__status--${cls}`}>{rotulo}</span>
                  {n.destaque && <span className="an__status an__status--destaque"><Star size={11} /> Destaque {n.ordem_destaque ?? ""}</span>}
                  {n.categoria && <span className="an__cat">{n.categoria}</span>}
                </div>
                <h3>{n.titulo}</h3>
                <small>
                  {agendada ? "Entra no ar em " : ""}{formatarData(n.publicado_em)} • {n.visualizacoes} visualizações • {n.tempo_leitura} min
                </small>
              </div>
              <div className="an__acoes">
                {ocupado === n.id && <Loader2 size={16} className="an__girando" />}
                <button type="button" onClick={() => setEditor({ modo: "editar", noticia: n })} title="Editar"><Pencil size={15} /><span>Editar</span></button>
                {noAr || agendada ? (
                  <button type="button" onClick={() => despublicar(n)} title="Despublicar"><EyeOff size={15} /><span>Despublicar</span></button>
                ) : (
                  <button type="button" onClick={() => publicar(n)} title="Publicar agora"><Send size={15} /><span>Publicar</span></button>
                )}
                <select
                  value={n.destaque ? String(n.ordem_destaque ?? 1) : ""}
                  onChange={(e) => destacar(n, e.target.value ? Number(e.target.value) : null)}
                  aria-label="Destaque na página inicial"
                  title="Destaque na página inicial"
                >
                  <option value="">Sem destaque</option>
                  <option value="1">Destaque 1</option>
                  <option value="2">Destaque 2</option>
                  <option value="3">Destaque 3</option>
                </select>
                <button type="button" onClick={() => setEditor({ modo: "duplicar", noticia: n })} title="Duplicar"><Copy size={15} /><span>Duplicar</span></button>
                {noAr && (
                  <CompartilharNoticia variante="botao" rotulo="Compartilhar" titulo={n.titulo} resumo={resumoCurto(n.resumo, 220, n.conteudo)} slug={n.slug} imagemUrl={n.imagem_url} />
                )}
                {noAr && (
                  <a href={`/noticias/${n.slug}`} target="_blank" rel="noopener noreferrer" title="Ver no site"><ExternalLink size={15} /><span>Ver</span></a>
                )}
                <button type="button" className="an__perigo" onClick={() => setExcluir(n)} title="Excluir"><Trash2 size={15} /><span>Excluir</span></button>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir notícia?"
        mensagem={`“${excluir?.titulo ?? ""}” será apagada de vez. Se quiser só tirar do site, use “Despublicar”.`}
        textoConfirmar="Excluir"
        perigo
        carregando={!!excluir && ocupado === excluir.id}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
      <ToastArea toasts={toasts} onFechar={fechar} />
    </div>
  );
}

