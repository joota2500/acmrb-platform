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
 * Visual: só Tailwind (o antigo admin-noticias.css foi apagado).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy, ExternalLink, EyeOff, FileText, Loader2, Lock, Pencil, Plus, RefreshCw, Search, Send, Star, Trash2,
  CalendarClock, Newspaper,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import { podeEditar } from "@/constants/permissoes";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CompartilharNoticia from "@/components/noticias/CompartilharNoticia";
import { resumoCurto } from "@/utils/compartilharNoticia";
import NoticiaEditor from "@/components/admin/news/NoticiaEditor";
import { atualizarCampos, salvarNoticia, type DadosNoticia } from "@/services/noticiasAdmin";
import {
  CATEGORIAS_NOTICIA, ROTULO_STATUS, formatarData, normalizarNoticia, ordenarRecentes, visivelAoPublico,
  type Noticia, type StatusNoticia,
} from "@/utils/noticias";

import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

// Classes que se repetem na lista
const CARTAO = "rounded-card border border-black/5 bg-white shadow-card";
const SELECT = "h-11 min-w-0 rounded-control border border-line bg-white px-3 text-[0.88rem] text-ink outline-none transition focus:border-brand focus:shadow-focus";
const BOTAO_ACAO =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 text-[0.78rem] font-bold text-zinc-700 no-underline transition hover:border-brand-line hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-bright disabled:cursor-not-allowed disabled:opacity-50";
// texto do botão some no celular (fica só o ícone + title)
const TEXTO_ACAO = "max-sm:sr-only";
const VAZIO = "flex flex-col items-center gap-3 rounded-card border border-dashed border-brand-line bg-white/60 p-8 text-center text-ink-soft";

// Cor do selo de cada situação
const COR_STATUS: Record<string, string> = {
  publicado: "bg-emerald-100 text-emerald-800",
  agendado: "bg-blue-100 text-blue-800",
  rascunho: "bg-zinc-100 text-zinc-700",
  arquivado: "bg-amber-100 text-amber-800",
};
const SELO = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-extrabold";

type Editor = { modo: "nova" } | { modo: "editar"; noticia: Noticia } | { modo: "duplicar"; noticia: Noticia } | null;

export default function NoticiasSection() {
  const papel = usePapelAdmin();
  const permitido = podeEditar(papel, "noticias");
  const { mostrar } = useToast();

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
      <div className={cn(CARTAO, "mx-auto my-8 flex max-w-md flex-col items-center gap-2.5 p-8 text-center text-brand")}>
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-mint">
          <Lock size={26} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-extrabold text-ink">Somente o ADM DEUS gerencia notícias</h2>
        <p className="text-sm text-ink-soft">Peça ao responsável pela plataforma para publicar ou alterar notícias.</p>
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
      </>
    );
  }

  /* ---------- Lista ---------- */
  const cartoes = [
    { rotulo: "Total", valor: stats.total, Icone: Newspaper, cor: "bg-brand-mint text-brand" },
    { rotulo: "No ar", valor: stats.noAr, Icone: Send, cor: "bg-emerald-100 text-emerald-700" },
    { rotulo: "Agendadas", valor: stats.agendadas, Icone: CalendarClock, cor: "bg-blue-100 text-blue-700" },
    { rotulo: "Rascunhos", valor: stats.rascunhos, Icone: FileText, cor: "bg-zinc-100 text-zinc-600" },
    { rotulo: "Destaques", valor: stats.destaques, Icone: Star, cor: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black tracking-tight text-ink sm:text-2xl">Notícias</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Publique e organize as notícias do site. Os destaques aparecem na página inicial (máximo 3).
          </p>
        </div>
        <Button type="button" tamanho="pequeno" onClick={() => setEditor({ modo: "nova" })} className="max-sm:w-full">
          <Plus size={16} /> Nova notícia
        </Button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cartoes.map(({ rotulo, valor, Icone, cor }) => (
          <div key={rotulo} className={cn(CARTAO, "flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-card-hover")}>
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", cor)}>
              <Icone size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <strong className="block text-2xl font-black leading-none text-ink">{carregando ? "–" : valor}</strong>
              <span className="text-[0.78rem] font-semibold text-ink-soft">{rotulo}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="-mt-2 text-[0.8rem] text-ink-muted">{stats.visualizacoes} visualizações no total.</p>

      {/* Filtros */}
      <div className={cn(CARTAO, "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2.5 p-3 lg:grid-cols-[minmax(0,1fr)_13rem_13rem_auto]")}>
        <label className="col-span-3 flex h-11 items-center gap-2 rounded-control border border-line bg-white px-3.5 text-ink-muted transition focus-within:border-brand focus-within:shadow-focus lg:col-span-1">
          <Search size={16} aria-hidden="true" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, resumo ou tag"
            aria-label="Buscar notícias"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[0.9rem] text-ink outline-none"
          />
        </label>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value as typeof fStatus)} aria-label="Filtrar por situação" className={SELECT}>
          <option value="">Todas as situações</option>
          {(Object.keys(ROTULO_STATUS) as StatusNoticia[]).map((s) => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
          <option value="destaque">Somente destaques</option>
        </select>
        <select value={fCategoria} onChange={(e) => setFCategoria(e.target.value)} aria-label="Filtrar por categoria" className={SELECT}>
          <option value="">Todas as categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={carregar} aria-label="Atualizar lista" title="Atualizar lista" className="h-11">
          <RefreshCw size={16} className={cn(carregando && "animate-spin")} />
        </Button>
      </div>

      {/* Carregando: esqueleto no lugar da lista */}
      {carregando && (
        <ul className="flex flex-col gap-3" aria-label="Carregando notícias">
          {[0, 1, 2].map((i) => (
            <li key={i} className={cn(CARTAO, "grid animate-pulse grid-cols-[5rem_minmax(0,1fr)] items-center gap-4 p-3.5 sm:grid-cols-[6rem_minmax(0,1fr)]")}>
              <div className="aspect-[4/3] rounded-xl bg-zinc-100" />
              <div className="flex flex-col gap-2">
                <div className="h-3 w-24 rounded-full bg-zinc-100" />
                <div className="h-4 w-3/4 rounded-full bg-zinc-100" />
                <div className="h-3 w-1/2 rounded-full bg-zinc-100" />
              </div>
            </li>
          ))}
        </ul>
      )}
      {!carregando && erroCarga && (
        <div className={cn(VAZIO, "border-red-200 text-danger")} role="alert">
          Erro ao carregar: {erroCarga}
          <Button type="button" variante="secundario" tamanho="pequeno" onClick={carregar}>Tentar de novo</Button>
        </div>
      )}
      {!carregando && !erroCarga && filtradas.length === 0 && (
        <div className={VAZIO}>
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-brand"><Newspaper size={22} aria-hidden="true" /></span>
          {noticias.length ? "Nenhuma notícia com esses filtros." : "Nenhuma notícia cadastrada. Clique em “Nova notícia”."}
        </div>
      )}

      {/* Lista */}
      <ul className="flex flex-col gap-3">
        {!carregando && filtradas.map((n) => {
          const noAr = visivelAoPublico(n);
          const agendada = n.status === "agendado" && !noAr;
          const rotulo = agendada ? "Agendada" : noAr ? "No ar" : ROTULO_STATUS[n.status];
          const cls = agendada ? "agendado" : noAr ? "publicado" : n.status;
          return (
            <li
              key={n.id}
              className={cn(
                CARTAO,
                "grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 p-3 transition hover:border-brand-line sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-4 sm:p-3.5 xl:grid-cols-[6rem_minmax(0,1fr)_auto]",
              )}
            >
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-zinc-100 text-zinc-400">
                {n.imagem_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.imagem_url} alt="" className="size-full object-contain" />
                ) : <Newspaper size={22} aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  <span className={cn(SELO, COR_STATUS[cls] ?? COR_STATUS.rascunho)}>{rotulo}</span>
                  {n.destaque && <span className={cn(SELO, "bg-leaf text-white")}><Star size={11} aria-hidden="true" /> Destaque {n.ordem_destaque ?? ""}</span>}
                  {n.categoria && <span className={cn(SELO, "bg-emerald-50 font-bold text-leaf")}>{n.categoria}</span>}
                </div>
                <h3 className="mt-1.5 line-clamp-2 text-[0.92rem] font-extrabold leading-snug text-ink [overflow-wrap:anywhere] sm:text-base">{n.titulo}</h3>
                <small className="mt-0.5 block text-[0.78rem] text-ink-muted">
                  {agendada ? "Entra no ar em " : ""}{formatarData(n.publicado_em)} • {n.visualizacoes} visualizações • {n.tempo_leitura} min
                </small>
              </div>
              <div className="col-span-2 flex flex-wrap items-center gap-1.5 border-t border-line pt-3 xl:col-span-1 xl:max-w-[27rem] xl:justify-end xl:border-0 xl:pt-0">
                {ocupado === n.id && <Loader2 size={16} className="animate-spin text-brand" aria-label="Salvando" />}
                <button type="button" className={BOTAO_ACAO} onClick={() => setEditor({ modo: "editar", noticia: n })} title="Editar"><Pencil size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Editar</span></button>
                {noAr || agendada ? (
                  <button type="button" className={BOTAO_ACAO} onClick={() => despublicar(n)} title="Despublicar" disabled={ocupado === n.id}><EyeOff size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Despublicar</span></button>
                ) : (
                  <button type="button" className={BOTAO_ACAO} onClick={() => publicar(n)} title="Publicar agora" disabled={ocupado === n.id}><Send size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Publicar</span></button>
                )}
                <select
                  value={n.destaque ? String(n.ordem_destaque ?? 1) : ""}
                  onChange={(e) => destacar(n, e.target.value ? Number(e.target.value) : null)}
                  aria-label="Destaque na página inicial"
                  title="Destaque na página inicial"
                  className={cn(SELECT, "h-9 rounded-xl px-2 text-[0.78rem] font-bold")}
                  disabled={ocupado === n.id}
                >
                  <option value="">Sem destaque</option>
                  <option value="1">Destaque 1</option>
                  <option value="2">Destaque 2</option>
                  <option value="3">Destaque 3</option>
                </select>
                <button type="button" className={BOTAO_ACAO} onClick={() => setEditor({ modo: "duplicar", noticia: n })} title="Duplicar"><Copy size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Duplicar</span></button>
                {noAr && (
                  <CompartilharNoticia variante="botao" rotulo="Compartilhar" titulo={n.titulo} resumo={resumoCurto(n.resumo, 220, n.conteudo)} slug={n.slug} imagemUrl={n.imagem_url} />
                )}
                {noAr && (
                  <a href={`/noticias/${n.slug}`} target="_blank" rel="noopener noreferrer" title="Ver no site" className={BOTAO_ACAO}><ExternalLink size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Ver</span></a>
                )}
                <button type="button" className={cn(BOTAO_ACAO, "text-danger hover:border-red-200 hover:bg-danger-soft hover:text-danger")} onClick={() => setExcluir(n)} title="Excluir"><Trash2 size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Excluir</span></button>
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
    </div>
  );
}

