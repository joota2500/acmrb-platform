"use client";

/**
 * NoticiaEditor — formulário completo de notícia (somente ADM DEUS)
 * ------------------------------------------------------------
 * Blocos: Conteúdo | Imagem de capa | Galeria | Publicação | SEO.
 * - Slug gerado do título (editável) com checagem de duplicidade
 * - Upload para o Storage (bucket "noticias") com pré-visualização
 *   e validação de tipo/tamanho (JPG, PNG, WEBP, GIF até 5 MB)
 * - Contadores de caracteres (resumo, SEO) e tempo de leitura
 * - Agendamento (status "agendado" + data futura)
 * - Pré-visualização de como fica no site
 * - Validação com zod antes de salvar
 * Visual: só Tailwind (classes em constantes logo abaixo).
 */

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  ArrowDown, ArrowUp, Eye, ImagePlus, Loader2, Save, Send, Trash2, Upload, X,
} from "lucide-react";
import EditorTextoNoticia from "@/components/admin/news/EditorTextoNoticia";
import ConteudoNoticia from "@/components/noticias/ConteudoNoticia";
import NoticiaCard from "@/components/noticias/NoticiaCard";
import {
  CATEGORIAS_NOTICIA, LIMITE_RESUMO, LIMITE_SEO_DESCRICAO, LIMITE_SEO_TITULO, ROTULO_STATUS,
  calcularTempoLeitura, formatarData, gerarSlug, type Noticia, type StatusNoticia,
} from "@/utils/noticias";
import { enviarImagem, slugEmUso, validarImagem, type DadosNoticia } from "@/services/noticiasAdmin";

import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

// ---------- Classes que se repetem no editor ----------
const BLOCO = "flex min-w-0 flex-col gap-4 rounded-card border border-black/5 bg-white p-4 shadow-card sm:p-5";
const TITULO_BLOCO = "float-left w-full border-b border-line pb-3 text-[0.95rem] font-extrabold text-brand";
const CAMPO = "relative flex min-w-0 flex-col gap-1.5";
const ROTULO = "text-[0.8rem] font-bold text-zinc-700";
const CONTROLE =
  "w-full rounded-control border border-line bg-white px-3.5 py-2.5 text-[0.92rem] text-ink outline-none transition focus:border-brand focus:shadow-focus";
const LINHA = "grid items-end gap-4 sm:grid-cols-2";
const DICA = "text-[0.8rem] text-ink-muted";
const ERRO = "text-[0.78rem] font-semibold text-danger";
const ICONE =
  "grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-zinc-100 text-zinc-600 transition hover:bg-brand-mint hover:text-brand focus-visible:outline-2 focus-visible:outline-brand";
// botão claro feito com <label> (para abrir o seletor de arquivo)
const BOTAO_CLARO =
  "inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control border border-emerald-100 bg-emerald-50 px-4 text-[0.9rem] font-bold text-emerald-800 transition hover:bg-emerald-100 focus-within:outline-2 focus-within:outline-leaf-bright has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60";
const BOTAO_GALERIA =
  "flex cursor-pointer rounded-lg border border-line bg-white p-1.5 text-zinc-600 transition hover:bg-brand-soft hover:text-brand";

const esquema = z
  .object({
    titulo: z.string().trim().min(5, "O título precisa de pelo menos 5 caracteres.").max(160, "Título muito longo (máx. 160)."),
    slug: z.string().trim().min(3, "Endereço (slug) muito curto.").regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use só letras minúsculas, números e hífens no endereço."),
    resumo: z.string().max(LIMITE_RESUMO, `Resumo com no máximo ${LIMITE_RESUMO} caracteres.`),
    conteudo: z.string().trim().min(30, "Escreva o texto da notícia (mínimo 30 caracteres)."),
    categoria: z.string().min(1, "Escolha uma categoria."),
    fonte_url: z.string().trim().refine((v) => !v || /^https?:\/\/\S+$/.test(v), "Link da fonte inválido (comece com http:// ou https://)."),
    seo_titulo: z.string().max(LIMITE_SEO_TITULO + 20, "Título SEO muito longo."),
    seo_descricao: z.string().max(LIMITE_SEO_DESCRICAO + 40, "Descrição SEO muito longa."),
    status: z.enum(["rascunho", "publicado", "agendado", "arquivado"]),
    publicado_em: z.string().nullable(),
  })
  .refine((d) => d.status !== "agendado" || (d.publicado_em && new Date(d.publicado_em).getTime() > Date.now()), {
    message: "Para agendar, escolha uma data e hora no futuro.",
    path: ["publicado_em"],
  });

/** ISO → valor do <input className={CONTROLE} type="datetime-local"> (hora local) */
function paraInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function dadosIniciais(n?: Noticia | null): DadosNoticia {
  return {
    titulo: n?.titulo ?? "",
    slug: n?.slug ?? "",
    resumo: n?.resumo ?? "",
    conteudo: n?.conteudo ?? "",
    categoria: n?.categoria ?? "",
    tags: n?.tags ?? [],
    imagem_url: n?.imagem_url ?? "",
    imagem_alt: n && n.imagem_alt !== n.titulo ? n.imagem_alt : "",
    imagem_legenda: n?.imagem_legenda ?? "",
    imagem_credito: n?.imagem_credito ?? "",
    galeria: n?.galeria ?? [],
    status: n?.status ?? "rascunho",
    publicado_em: n ? n.publicado_em : null,
    destaque: n?.destaque ?? false,
    ordem_destaque: n?.ordem_destaque ?? null,
    autor_nome: n?.autor_nome ?? "ACMRB",
    tempo_leitura: n?.tempo_leitura ?? 1,
    fonte_url: n?.fonte_url ?? "",
    seo_titulo: n?.seo_titulo ?? "",
    seo_descricao: n?.seo_descricao ?? "",
  };
}

interface Props {
  inicial: Noticia | null;
  editandoId: string | null;
  salvando: boolean;
  onSalvar: (dados: DadosNoticia) => void;
  onCancelar: () => void;
  onAviso: (tipo: "erro" | "aviso" | "sucesso", msg: string) => void;
}

function Contador({ atual, limite }: { atual: number; limite: number }) {
  const cls = cn(
    "self-end text-[0.72rem] text-ink-muted",
    atual > limite * 0.9 && "text-warning",
    atual > limite && "font-extrabold text-danger",
  );
  return <span className={cls} aria-live="polite">{atual}/{limite}</span>;
}

export default function NoticiaEditor({ inicial, editandoId, salvando, onSalvar, onCancelar, onAviso }: Props) {
  const [d, setD] = useState<DadosNoticia>(() => dadosIniciais(inicial));
  const [slugManual, setSlugManual] = useState(Boolean(inicial?.slug));
  const [slugOcupado, setSlugOcupado] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [tagTexto, setTagTexto] = useState("");
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [enviandoGaleria, setEnviandoGaleria] = useState(false);
  const [previa, setPrevia] = useState(false);

  const set = <K extends keyof DadosNoticia>(k: K, v: DadosNoticia[K]) => setD((x) => ({ ...x, [k]: v }));

  // slug automático enquanto não for editado à mão
  useEffect(() => {
    if (!slugManual) set("slug", gerarSlug(d.titulo));
  }, [d.titulo, slugManual]);

  // checa duplicidade do slug (com atraso)
  useEffect(() => {
    if (!d.slug) return setSlugOcupado(false);
    const t = setTimeout(async () => setSlugOcupado(await slugEmUso(d.slug, editandoId)), 450);
    return () => clearTimeout(t);
  }, [d.slug, editandoId]);

  const tempo = useMemo(() => calcularTempoLeitura(d.conteudo), [d.conteudo]);
  const palavras = useMemo(() => d.conteudo.trim().split(/\s+/).filter(Boolean).length, [d.conteudo]);

  /* ---------- Tags ---------- */
  function adicionarTags(texto: string) {
    const novas = texto.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean);
    if (!novas.length) return;
    set("tags", Array.from(new Set([...d.tags, ...novas])).slice(0, 15));
    setTagTexto("");
  }

  /* ---------- Imagens ---------- */
  async function trocarCapa(arquivo?: File) {
    if (!arquivo) return;
    const problema = validarImagem(arquivo);
    if (problema) return onAviso("erro", problema);
    setEnviandoCapa(true);
    try {
      set("imagem_url", await enviarImagem(arquivo, "capas"));
      onAviso("sucesso", "Imagem de capa enviada.");
    } catch (e) {
      onAviso("erro", `Não foi possível enviar a imagem: ${(e as Error).message}`);
    } finally {
      setEnviandoCapa(false);
    }
  }

  async function adicionarGaleria(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    const lista = Array.from(arquivos).slice(0, 12 - d.galeria.length);
    for (const a of lista) {
      const problema = validarImagem(a);
      if (problema) return onAviso("erro", `${a.name}: ${problema}`);
    }
    setEnviandoGaleria(true);
    try {
      const urls: { url: string; legenda: string }[] = [];
      for (const a of lista) urls.push({ url: await enviarImagem(a, "galeria"), legenda: "" });
      setD((x) => ({ ...x, galeria: [...x.galeria, ...urls] }));
      onAviso("sucesso", `${urls.length} foto(s) adicionada(s) à galeria.`);
    } catch (e) {
      onAviso("erro", `Falha no envio da galeria: ${(e as Error).message}`);
    } finally {
      setEnviandoGaleria(false);
    }
  }

  function moverGaleria(i: number, dir: -1 | 1) {
    const g = [...d.galeria];
    const j = i + dir;
    if (j < 0 || j >= g.length) return;
    [g[i], g[j]] = [g[j], g[i]];
    set("galeria", g);
  }

  /* ---------- Salvar ---------- */
  function enviar(statusForcado?: StatusNoticia) {
    const final: DadosNoticia = { ...d, status: statusForcado ?? d.status, tempo_leitura: tempo };
    if (final.status === "publicado" && (!final.publicado_em || new Date(final.publicado_em).getTime() > Date.now())) {
      final.publicado_em = new Date().toISOString();
    }
    const r = esquema.safeParse(final);
    const novos: Record<string, string> = {};
    if (!r.success) r.error.issues.forEach((i) => (novos[String(i.path[0])] ||= i.message));
    if (slugOcupado) novos.slug = "Já existe outra notícia com esse endereço. Altere o slug.";
    setErros(novos);
    if (Object.keys(novos).length) {
      onAviso("erro", Object.values(novos)[0]);
      return;
    }
    onSalvar(final);
  }

  const erro = (k: string) => erros[k] && <span className={ERRO} role="alert">{erros[k]}</span>;

  // objeto usado na pré-visualização
  const previaNoticia: Noticia = {
    id: editandoId ?? "previa",
    ...d,
    imagem_alt: d.imagem_alt || d.titulo,
    tempo_leitura: tempo,
    ordem_destaque: d.ordem_destaque,
    publicado_em: d.publicado_em ?? new Date().toISOString(),
    visualizacoes: inicial?.visualizacoes ?? 0,
    created_at: inicial?.created_at ?? "",
    updated_at: "",
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-black tracking-tight text-ink sm:text-[1.35rem]">{editandoId ? "Editar notícia" : "Nova notícia"}</h3>
        <button type="button" className={ICONE} onClick={onCancelar} aria-label="Fechar editor"><X size={18} /></button>
      </div>

      <div className="flex flex-col gap-4">
        {/* ---------- Conteúdo ---------- */}
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Conteúdo</legend>

          <label className={CAMPO}>
            <span className={ROTULO}>Título *</span>
            <input className={CONTROLE} value={d.titulo} onChange={(e) => set("titulo", e.target.value)} maxLength={160} placeholder="Ex.: ACMRB recebe nova prensa para papelão" />
            <Contador atual={d.titulo.length} limite={160} />
            {erro("titulo")}
          </label>

          <label className={CAMPO}>
            <span className={ROTULO}>Endereço (slug) *</span>
            <div className="flex items-center gap-1.5 rounded-control border border-line bg-white px-3.5 transition focus-within:border-brand focus-within:shadow-focus">
              <small className="whitespace-nowrap text-ink-muted">/noticias/</small>
              <input
                className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-[0.92rem] text-ink outline-none"
                value={d.slug}
                onChange={(e) => { setSlugManual(true); set("slug", gerarSlug(e.target.value)); }}
                aria-invalid={slugOcupado}
              />
              {slugManual && (
                <button type="button" className="cursor-pointer whitespace-nowrap border-0 bg-transparent text-[0.8rem] font-bold text-leaf hover:underline" onClick={() => setSlugManual(false)}>Gerar do título</button>
              )}
            </div>
            {slugOcupado && <span className={ERRO}>Esse endereço já está em uso por outra notícia.</span>}
            {erro("slug")}
          </label>

          <label className={CAMPO}>
            <span className={ROTULO}>Resumo (aparece nos cartões e na linha fina)</span>
            <textarea className={CONTROLE} rows={3} value={d.resumo} onChange={(e) => set("resumo", e.target.value)} />
            <Contador atual={d.resumo.length} limite={LIMITE_RESUMO} />
            {erro("resumo")}
          </label>

          <div className={CAMPO}>
            <span className={ROTULO}>Texto da notícia *</span>
            <EditorTextoNoticia
              valor={d.conteudo}
              onChange={(v) => set("conteudo", v)}
              placeholder={"Escreva aqui. Use a barra acima para títulos, negrito, listas, citações e links.\n\nDeixe uma linha em branco entre os parágrafos."}
            />
            <small className={DICA}>{palavras} palavras • cerca de {tempo} min de leitura</small>
            {erro("conteudo")}
          </div>

          <div className={LINHA}>
            <label className={CAMPO}>
              <span className={ROTULO}>Categoria *</span>
              <input className={CONTROLE} list="an-categorias" value={d.categoria} onChange={(e) => set("categoria", e.target.value)} placeholder="Escolha ou digite" />
              <datalist id="an-categorias">
                {CATEGORIAS_NOTICIA.map((c) => <option key={c} value={c} />)}
              </datalist>
              {erro("categoria")}
            </label>
            <label className={CAMPO}>
              <span className={ROTULO}>Autor</span>
              <input className={CONTROLE} value={d.autor_nome} onChange={(e) => set("autor_nome", e.target.value)} />
            </label>
          </div>

          <div className={CAMPO}>
            <span className={ROTULO}>Tags (separe por vírgula ou Enter)</span>
            <div className="flex flex-wrap items-center gap-1.5 rounded-control border border-line bg-white p-2 transition focus-within:border-brand focus-within:shadow-focus">
              {d.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.78rem] font-bold text-leaf">
                  #{t}
                  <button type="button" className="flex cursor-pointer rounded-full hover:text-danger" onClick={() => set("tags", d.tags.filter((x) => x !== t))} aria-label={`Remover tag ${t}`}><X size={12} /></button>
                </span>
              ))}
              <input
                className="min-w-36 flex-1 border-0 bg-transparent p-1 text-[0.92rem] text-ink outline-none"
                value={tagTexto}
                onChange={(e) => (e.target.value.includes(",") ? adicionarTags(e.target.value) : setTagTexto(e.target.value))}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarTags(tagTexto); } }}
                onBlur={() => adicionarTags(tagTexto)}
                placeholder="reciclagem, papelão..."
                aria-label="Adicionar tag"
              />
            </div>
          </div>

          <label className={CAMPO}>
            <span className={ROTULO}>Link da fonte (opcional)</span>
            <input className={CONTROLE} value={d.fonte_url} onChange={(e) => set("fonte_url", e.target.value)} placeholder="https://..." inputMode="url" />
            {erro("fonte_url")}
          </label>
        </fieldset>

        {/* ---------- Capa ---------- */}
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Imagem de capa</legend>
          <div className="grid items-center gap-4 sm:grid-cols-[16rem_minmax(0,1fr)]">
            <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-brand-line bg-[repeating-linear-gradient(45deg,#f3f4f6_0_10px,#eef2f1_10px_20px)] text-ink-muted">
              {d.imagem_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.imagem_url} alt="Pré-visualização da capa" className="size-full object-contain" />
              ) : (
                <span className="flex flex-col items-center gap-1.5 text-[0.8rem]"><ImagePlus size={28} aria-hidden="true" /> Sem imagem</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <label className={BOTAO_CLARO}>
                {enviandoCapa ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {d.imagem_url ? "Trocar imagem" : "Enviar imagem"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={enviandoCapa}
                  onChange={(e) => { trocarCapa(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              {d.imagem_url && (
                <Button type="button" variante="perigo" tamanho="pequeno" onClick={() => set("imagem_url", "")}>
                  <Trash2 size={16} /> Remover
                </Button>
              )}
              <small className={cn(DICA, "basis-full")}>JPG, PNG, WEBP ou GIF até 5 MB. A imagem aparece inteira, sem cortes.</small>
            </div>
          </div>
          <div className={LINHA}>
            <label className={CAMPO}>
              <span className={ROTULO}>Texto alternativo (acessibilidade)</span>
              <input className={CONTROLE} value={d.imagem_alt} onChange={(e) => set("imagem_alt", e.target.value)} placeholder="Descreva a foto" />
            </label>
            <label className={CAMPO}>
              <span className={ROTULO}>Crédito da foto</span>
              <input className={CONTROLE} value={d.imagem_credito} onChange={(e) => set("imagem_credito", e.target.value)} placeholder="Ex.: Acervo ACMRB" />
            </label>
          </div>
          <label className={CAMPO}>
            <span className={ROTULO}>Legenda</span>
            <input className={CONTROLE} value={d.imagem_legenda} onChange={(e) => set("imagem_legenda", e.target.value)} />
          </label>
        </fieldset>

        {/* ---------- Galeria ---------- */}
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Galeria de fotos ({d.galeria.length}/12)</legend>
          {d.galeria.length > 0 && (
            <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3 p-0">
              {d.galeria.map((g, i) => (
                <li key={g.url + i} className="flex flex-col gap-2 rounded-control border border-line bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt={`Foto ${i + 1}`} className="aspect-[4/3] w-full rounded-lg bg-zinc-100 object-contain" />
                  <input className="rounded-lg border border-line px-2.5 py-1.5 text-[0.8rem] outline-none focus:border-brand" value={g.legenda ?? ""} placeholder="Legenda"
                    onChange={(e) => set("galeria", d.galeria.map((x, j) => (j === i ? { ...x, legenda: e.target.value } : x)))} />
                  <div className="flex justify-end gap-1">
                    <button type="button" className={BOTAO_GALERIA} onClick={() => moverGaleria(i, -1)} aria-label="Mover para cima"><ArrowUp size={14} /></button>
                    <button type="button" className={BOTAO_GALERIA} onClick={() => moverGaleria(i, 1)} aria-label="Mover para baixo"><ArrowDown size={14} /></button>
                    <button type="button" className={BOTAO_GALERIA} onClick={() => set("galeria", d.galeria.filter((_, j) => j !== i))} aria-label="Remover foto"><Trash2 size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {d.galeria.length < 12 && (
            <label className={BOTAO_CLARO}>
              {enviandoGaleria ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              Adicionar fotos
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={enviandoGaleria}
                onChange={(e) => { adicionarGaleria(e.target.files); e.target.value = ""; }} />
            </label>
          )}
        </fieldset>

        {/* ---------- Publicação ---------- */}
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Publicação</legend>
          <div className={LINHA}>
            <label className={CAMPO}>
              <span className={ROTULO}>Situação</span>
              <select className={CONTROLE} value={d.status} onChange={(e) => set("status", e.target.value as StatusNoticia)}>
                {(Object.keys(ROTULO_STATUS) as StatusNoticia[]).map((s) => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
              </select>
            </label>
            <label className={CAMPO}>
              <span className={ROTULO}>{d.status === "agendado" ? "Publicar em *" : "Data de publicação"}</span>
              <input className={CONTROLE} type="datetime-local" value={paraInput(d.publicado_em)}
                onChange={(e) => set("publicado_em", e.target.value ? new Date(e.target.value).toISOString() : null)} />
              {erro("publicado_em")}
            </label>
          </div>
          {d.status === "agendado" && d.publicado_em && (
            <small className={DICA}>A notícia entra no ar sozinha em {formatarData(d.publicado_em, true)} às {new Date(d.publicado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.</small>
          )}
          <div className={LINHA}>
            <label className="flex min-h-11 items-center gap-2 text-[0.9rem] font-semibold text-zinc-700">
              <input type="checkbox" className="size-[1.15rem] accent-leaf" checked={d.destaque} onChange={(e) => { set("destaque", e.target.checked); if (e.target.checked && !d.ordem_destaque) set("ordem_destaque", 1); }} />
              <span>Destacar na página inicial</span>
            </label>
            {d.destaque && (
              <label className={CAMPO}>
                <span className={ROTULO}>Posição no destaque</span>
                <select className={CONTROLE} value={d.ordem_destaque ?? 1} onChange={(e) => set("ordem_destaque", Number(e.target.value))}>
                  <option value={1}>1ª (cartão grande)</option>
                  <option value={2}>2ª</option>
                  <option value={3}>3ª</option>
                </select>
              </label>
            )}
          </div>
        </fieldset>

        {/* ---------- SEO ---------- */}
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>SEO (Google e redes sociais)</legend>
          <label className={CAMPO}>
            <span className={ROTULO}>Título para o Google (se vazio, usa o título)</span>
            <input className={CONTROLE} value={d.seo_titulo} onChange={(e) => set("seo_titulo", e.target.value)} />
            <Contador atual={d.seo_titulo.length} limite={LIMITE_SEO_TITULO} />
            {erro("seo_titulo")}
          </label>
          <label className={CAMPO}>
            <span className={ROTULO}>Descrição para o Google (se vazia, usa o resumo)</span>
            <textarea className={CONTROLE} rows={2} value={d.seo_descricao} onChange={(e) => set("seo_descricao", e.target.value)} />
            <Contador atual={d.seo_descricao.length} limite={LIMITE_SEO_DESCRICAO} />
            {erro("seo_descricao")}
          </label>
          <div className="rounded-control border border-line bg-zinc-50 px-4 py-3.5" aria-label="Como aparece no Google">
            <span className="block text-[0.75rem] text-leaf">acmrb.org.br › noticias › {d.slug || "..."}</span>
            <strong className="my-0.5 block text-[1.05rem] font-semibold text-[#1a0dab]">{(d.seo_titulo || d.titulo || "Título da notícia").slice(0, 70)}</strong>
            <p className="text-left text-[0.83rem] text-ink-soft">{(d.seo_descricao || d.resumo || "Descrição da notícia...").slice(0, 160)}</p>
          </div>
        </fieldset>
      </div>

      <div className="sticky bottom-0 z-5 flex flex-wrap gap-2.5 rounded-card border border-line bg-white/95 p-3 shadow-[0_-8px_24px_-18px_rgb(0_0_0/0.35)] backdrop-blur max-sm:[&>button]:flex-[1_1_45%]">
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => setPrevia(true)}><Eye size={16} /> Pré-visualizar</Button>
        <span className="flex-1 max-sm:hidden" />
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={onCancelar} disabled={salvando}>Cancelar</Button>
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => enviar("rascunho")} disabled={salvando}>
          <Save size={16} /> Salvar rascunho
        </Button>
        <Button type="button" tamanho="pequeno" onClick={() => enviar(d.status === "rascunho" ? "publicado" : undefined)} disabled={salvando}>
          {salvando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {d.status === "agendado" ? "Agendar" : d.status === "arquivado" ? "Salvar arquivada" : "Publicar"}
        </Button>
      </div>

      {previa && (
        <div className="fixed inset-0 z-95 flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-8" role="dialog" aria-modal="true" aria-label="Pré-visualização">
          <div className="flex w-full max-w-4xl flex-col gap-3.5 rounded-3xl bg-white p-4 shadow-pop sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-black tracking-tight text-ink">Pré-visualização</h3>
              <button type="button" className={ICONE} onClick={() => setPrevia(false)} aria-label="Fechar"><X size={18} /></button>
            </div>
            <p className={DICA}>Cartão (home e lista de notícias):</p>
            <div className="max-w-[22rem]"><NoticiaCard noticia={previaNoticia} /></div>
            <p className={DICA}>Página da notícia:</p>
            <div className="rounded-card border border-emerald-100 bg-white p-4 sm:p-6">
              <span className="inline-block rounded-full bg-brand px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">{d.categoria || "Categoria"}</span>
              <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-ink [overflow-wrap:anywhere]">{d.titulo || "Título da notícia"}</h1>
              {d.resumo && <p className="mt-3 border-l-4 border-brand-line pl-3 text-lg leading-relaxed text-zinc-700">{d.resumo}</p>}
              {d.imagem_url && (
                <figure className="mt-6">
                  <div className="flex h-72 items-center justify-center overflow-hidden rounded-card bg-zinc-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.imagem_url} alt={d.imagem_alt || d.titulo} className="size-full object-contain" />
                  </div>
                  {(d.imagem_legenda || d.imagem_credito) && <figcaption className="mt-2 text-sm italic text-ink-soft">{d.imagem_legenda} {d.imagem_credito && <span className="not-italic text-ink-muted">Foto: {d.imagem_credito}</span>}</figcaption>}
                </figure>
              )}
              <ConteudoNoticia texto={d.conteudo} className="mt-6" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
