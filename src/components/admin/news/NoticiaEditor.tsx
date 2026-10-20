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
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  ArrowDown, ArrowUp, Bold, Eye, Heading2, ImagePlus, List, Loader2, Quote, Save, Send, Trash2, Upload, X,
} from "lucide-react";
import ConteudoNoticia from "@/components/noticias/ConteudoNoticia";
import NoticiaCard from "@/components/noticias/NoticiaCard";
import {
  CATEGORIAS_NOTICIA, LIMITE_RESUMO, LIMITE_SEO_DESCRICAO, LIMITE_SEO_TITULO, ROTULO_STATUS,
  calcularTempoLeitura, formatarData, gerarSlug, type Noticia, type StatusNoticia,
} from "@/lib/noticias";
import { enviarImagem, slugEmUso, validarImagem, type DadosNoticia } from "@/lib/noticiasAdmin";

import "@/styles/noticia-detalhe.css";

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

/** ISO → valor do <input type="datetime-local"> (hora local) */
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
  const cls = atual > limite ? "an__contador an__contador--over" : atual > limite * 0.9 ? "an__contador an__contador--quase" : "an__contador";
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
  const conteudoRef = useRef<HTMLTextAreaElement>(null);

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

  /* ---------- Barra de formatação ---------- */
  function inserir(antes: string, depois = "", inicioDeLinha = false) {
    const el = conteudoRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e) || (inicioDeLinha ? "Texto" : "texto");
    const prefixo = inicioDeLinha && s > 0 && value[s - 1] !== "\n" ? "\n\n" : "";
    const novo = value.slice(0, s) + prefixo + antes + sel + depois + value.slice(e);
    set("conteudo", novo);
    requestAnimationFrame(() => {
      el.focus();
      const pos = s + prefixo.length + antes.length;
      el.setSelectionRange(pos, pos + sel.length);
    });
  }

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

  const erro = (k: string) => erros[k] && <span className="an__erro" role="alert">{erros[k]}</span>;

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
    <div className="an__editor">
      <div className="an__editor-topo">
        <h3>{editandoId ? "Editar notícia" : "Nova notícia"}</h3>
        <button type="button" className="an__icone" onClick={onCancelar} aria-label="Fechar editor"><X size={18} /></button>
      </div>

      <div className="an__form">
        {/* ---------- Conteúdo ---------- */}
        <fieldset className="an__bloco">
          <legend>Conteúdo</legend>

          <label className="an__campo">
            <span>Título *</span>
            <input value={d.titulo} onChange={(e) => set("titulo", e.target.value)} maxLength={160} placeholder="Ex.: ACMRB recebe nova prensa para papelão" />
            <Contador atual={d.titulo.length} limite={160} />
            {erro("titulo")}
          </label>

          <label className="an__campo">
            <span>Endereço (slug) *</span>
            <div className="an__slug">
              <small>/noticias/</small>
              <input
                value={d.slug}
                onChange={(e) => { setSlugManual(true); set("slug", gerarSlug(e.target.value)); }}
                aria-invalid={slugOcupado}
              />
              {slugManual && (
                <button type="button" className="an__link" onClick={() => setSlugManual(false)}>Gerar do título</button>
              )}
            </div>
            {slugOcupado && <span className="an__erro">Esse endereço já está em uso por outra notícia.</span>}
            {erro("slug")}
          </label>

          <label className="an__campo">
            <span>Resumo (aparece nos cartões e na linha fina)</span>
            <textarea rows={3} value={d.resumo} onChange={(e) => set("resumo", e.target.value)} />
            <Contador atual={d.resumo.length} limite={LIMITE_RESUMO} />
            {erro("resumo")}
          </label>

          <div className="an__campo">
            <span>Texto da notícia *</span>
            <div className="an__barra" role="toolbar" aria-label="Formatação">
              <button type="button" onClick={() => inserir("## ", "", true)} title="Subtítulo"><Heading2 size={16} /> Subtítulo</button>
              <button type="button" onClick={() => inserir("**", "**")} title="Negrito"><Bold size={16} /> Negrito</button>
              <button type="button" onClick={() => inserir("- ", "", true)} title="Lista"><List size={16} /> Lista</button>
              <button type="button" onClick={() => inserir("> ", "", true)} title="Citação"><Quote size={16} /> Citação</button>
            </div>
            <textarea
              ref={conteudoRef}
              rows={14}
              value={d.conteudo}
              onChange={(e) => set("conteudo", e.target.value)}
              aria-label="Texto da notícia"
              placeholder={"Deixe uma linha em branco entre os parágrafos.\n\n## Subtítulo\n- item de lista\n> citação\n**negrito** e [link](https://...)"}
            />
            <small className="an__dica">{palavras} palavras • cerca de {tempo} min de leitura</small>
            {erro("conteudo")}
          </div>

          <div className="an__linha">
            <label className="an__campo">
              <span>Categoria *</span>
              <input list="an-categorias" value={d.categoria} onChange={(e) => set("categoria", e.target.value)} placeholder="Escolha ou digite" />
              <datalist id="an-categorias">
                {CATEGORIAS_NOTICIA.map((c) => <option key={c} value={c} />)}
              </datalist>
              {erro("categoria")}
            </label>
            <label className="an__campo">
              <span>Autor</span>
              <input value={d.autor_nome} onChange={(e) => set("autor_nome", e.target.value)} />
            </label>
          </div>

          <div className="an__campo">
            <span>Tags (separe por vírgula ou Enter)</span>
            <div className="an__tags">
              {d.tags.map((t) => (
                <span key={t} className="an__tag">
                  #{t}
                  <button type="button" onClick={() => set("tags", d.tags.filter((x) => x !== t))} aria-label={`Remover tag ${t}`}><X size={12} /></button>
                </span>
              ))}
              <input
                value={tagTexto}
                onChange={(e) => (e.target.value.includes(",") ? adicionarTags(e.target.value) : setTagTexto(e.target.value))}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarTags(tagTexto); } }}
                onBlur={() => adicionarTags(tagTexto)}
                placeholder="reciclagem, papelão..."
                aria-label="Adicionar tag"
              />
            </div>
          </div>

          <label className="an__campo">
            <span>Link da fonte (opcional)</span>
            <input value={d.fonte_url} onChange={(e) => set("fonte_url", e.target.value)} placeholder="https://..." inputMode="url" />
            {erro("fonte_url")}
          </label>
        </fieldset>

        {/* ---------- Capa ---------- */}
        <fieldset className="an__bloco">
          <legend>Imagem de capa</legend>
          <div className="an__capa">
            <div className="an__capa-previa">
              {d.imagem_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.imagem_url} alt="Pré-visualização da capa" />
              ) : (
                <span><ImagePlus size={28} aria-hidden="true" /> Sem imagem</span>
              )}
            </div>
            <div className="an__capa-acoes">
              <label className="an__btn an__btn--claro">
                {enviandoCapa ? <Loader2 size={16} className="an__girando" /> : <Upload size={16} />}
                {d.imagem_url ? "Trocar imagem" : "Enviar imagem"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={enviandoCapa}
                  onChange={(e) => { trocarCapa(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              {d.imagem_url && (
                <button type="button" className="an__btn an__btn--perigo-claro" onClick={() => set("imagem_url", "")}>
                  <Trash2 size={16} /> Remover
                </button>
              )}
              <small className="an__dica">JPG, PNG, WEBP ou GIF até 5 MB. A imagem aparece inteira, sem cortes.</small>
            </div>
          </div>
          <div className="an__linha">
            <label className="an__campo">
              <span>Texto alternativo (acessibilidade)</span>
              <input value={d.imagem_alt} onChange={(e) => set("imagem_alt", e.target.value)} placeholder="Descreva a foto" />
            </label>
            <label className="an__campo">
              <span>Crédito da foto</span>
              <input value={d.imagem_credito} onChange={(e) => set("imagem_credito", e.target.value)} placeholder="Ex.: Acervo ACMRB" />
            </label>
          </div>
          <label className="an__campo">
            <span>Legenda</span>
            <input value={d.imagem_legenda} onChange={(e) => set("imagem_legenda", e.target.value)} />
          </label>
        </fieldset>

        {/* ---------- Galeria ---------- */}
        <fieldset className="an__bloco">
          <legend>Galeria de fotos ({d.galeria.length}/12)</legend>
          {d.galeria.length > 0 && (
            <ul className="an__galeria">
              {d.galeria.map((g, i) => (
                <li key={g.url + i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt={`Foto ${i + 1}`} />
                  <input value={g.legenda ?? ""} placeholder="Legenda"
                    onChange={(e) => set("galeria", d.galeria.map((x, j) => (j === i ? { ...x, legenda: e.target.value } : x)))} />
                  <div className="an__galeria-acoes">
                    <button type="button" onClick={() => moverGaleria(i, -1)} aria-label="Mover para cima"><ArrowUp size={14} /></button>
                    <button type="button" onClick={() => moverGaleria(i, 1)} aria-label="Mover para baixo"><ArrowDown size={14} /></button>
                    <button type="button" onClick={() => set("galeria", d.galeria.filter((_, j) => j !== i))} aria-label="Remover foto"><Trash2 size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {d.galeria.length < 12 && (
            <label className="an__btn an__btn--claro">
              {enviandoGaleria ? <Loader2 size={16} className="an__girando" /> : <ImagePlus size={16} />}
              Adicionar fotos
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={enviandoGaleria}
                onChange={(e) => { adicionarGaleria(e.target.files); e.target.value = ""; }} />
            </label>
          )}
        </fieldset>

        {/* ---------- Publicação ---------- */}
        <fieldset className="an__bloco">
          <legend>Publicação</legend>
          <div className="an__linha">
            <label className="an__campo">
              <span>Situação</span>
              <select value={d.status} onChange={(e) => set("status", e.target.value as StatusNoticia)}>
                {(Object.keys(ROTULO_STATUS) as StatusNoticia[]).map((s) => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
              </select>
            </label>
            <label className="an__campo">
              <span>{d.status === "agendado" ? "Publicar em *" : "Data de publicação"}</span>
              <input type="datetime-local" value={paraInput(d.publicado_em)}
                onChange={(e) => set("publicado_em", e.target.value ? new Date(e.target.value).toISOString() : null)} />
              {erro("publicado_em")}
            </label>
          </div>
          {d.status === "agendado" && d.publicado_em && (
            <small className="an__dica">A notícia entra no ar sozinha em {formatarData(d.publicado_em, true)} às {new Date(d.publicado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.</small>
          )}
          <div className="an__linha">
            <label className="an__check">
              <input type="checkbox" checked={d.destaque} onChange={(e) => { set("destaque", e.target.checked); if (e.target.checked && !d.ordem_destaque) set("ordem_destaque", 1); }} />
              <span>Destacar na página inicial</span>
            </label>
            {d.destaque && (
              <label className="an__campo">
                <span>Posição no destaque</span>
                <select value={d.ordem_destaque ?? 1} onChange={(e) => set("ordem_destaque", Number(e.target.value))}>
                  <option value={1}>1ª (cartão grande)</option>
                  <option value={2}>2ª</option>
                  <option value={3}>3ª</option>
                </select>
              </label>
            )}
          </div>
        </fieldset>

        {/* ---------- SEO ---------- */}
        <fieldset className="an__bloco">
          <legend>SEO (Google e redes sociais)</legend>
          <label className="an__campo">
            <span>Título para o Google (se vazio, usa o título)</span>
            <input value={d.seo_titulo} onChange={(e) => set("seo_titulo", e.target.value)} />
            <Contador atual={d.seo_titulo.length} limite={LIMITE_SEO_TITULO} />
            {erro("seo_titulo")}
          </label>
          <label className="an__campo">
            <span>Descrição para o Google (se vazia, usa o resumo)</span>
            <textarea rows={2} value={d.seo_descricao} onChange={(e) => set("seo_descricao", e.target.value)} />
            <Contador atual={d.seo_descricao.length} limite={LIMITE_SEO_DESCRICAO} />
            {erro("seo_descricao")}
          </label>
          <div className="an__google" aria-label="Como aparece no Google">
            <span className="an__google-url">acmrb.org.br › noticias › {d.slug || "..."}</span>
            <strong>{(d.seo_titulo || d.titulo || "Título da notícia").slice(0, 70)}</strong>
            <p>{(d.seo_descricao || d.resumo || "Descrição da notícia...").slice(0, 160)}</p>
          </div>
        </fieldset>
      </div>

      <div className="an__rodape">
        <button type="button" className="an__btn an__btn--claro" onClick={() => setPrevia(true)}><Eye size={16} /> Pré-visualizar</button>
        <span className="an__espaco" />
        <button type="button" className="an__btn an__btn--claro" onClick={onCancelar} disabled={salvando}>Cancelar</button>
        <button type="button" className="an__btn an__btn--claro" onClick={() => enviar("rascunho")} disabled={salvando}>
          <Save size={16} /> Salvar rascunho
        </button>
        <button type="button" className="an__btn" onClick={() => enviar(d.status === "rascunho" ? "publicado" : undefined)} disabled={salvando}>
          {salvando ? <Loader2 size={16} className="an__girando" /> : <Send size={16} />}
          {d.status === "agendado" ? "Agendar" : d.status === "arquivado" ? "Salvar arquivada" : "Publicar"}
        </button>
      </div>

      {previa && (
        <div className="an__modal" role="dialog" aria-modal="true" aria-label="Pré-visualização">
          <div className="an__modal-caixa">
            <div className="an__editor-topo">
              <h3>Pré-visualização</h3>
              <button type="button" className="an__icone" onClick={() => setPrevia(false)} aria-label="Fechar"><X size={18} /></button>
            </div>
            <p className="an__dica">Cartão (home e lista de notícias):</p>
            <div className="an__previa-card"><NoticiaCard noticia={previaNoticia} /></div>
            <p className="an__dica">Página da notícia:</p>
            <div className="nd an__previa-pagina">
              <span className="nd__categoria">{d.categoria || "Categoria"}</span>
              <h1 className="nd__titulo">{d.titulo || "Título da notícia"}</h1>
              {d.resumo && <p className="nd__linha-fina">{d.resumo}</p>}
              {d.imagem_url && (
                <figure className="nd__figura">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="nd__moldura"><img src={d.imagem_url} alt={d.imagem_alt || d.titulo} /></div>
                  {(d.imagem_legenda || d.imagem_credito) && <figcaption>{d.imagem_legenda} {d.imagem_credito && <span className="nd__credito">Foto: {d.imagem_credito}</span>}</figcaption>}
                </figure>
              )}
              <ConteudoNoticia texto={d.conteudo} className="nd__texto an__previa-texto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
