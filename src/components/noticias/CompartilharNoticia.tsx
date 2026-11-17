"use client";

/**
 * CompartilharNoticia — botão e painel de compartilhamento
 * ------------------------------------------------------------
 * 1. Celular (iPhone/Android): abre a folha nativa de compartilhar com
 *    a IMAGEM DA CAPA + título + resumo + link (navigator.share com
 *    arquivo). A imagem é baixada antes do toque, para o navegador
 *    aceitar o compartilhamento.
 * 2. Computador ou navegador sem suporte: painel com WhatsApp, Facebook,
 *    X, Telegram, copiar link e copiar texto.
 * Variantes:
 *  - "inline": mostra tudo na própria página (lateral da notícia)
 *  - "botao" : só um botão; o painel abre como janela (usado no painel admin)
 * Estilo: Tailwind (sem arquivo CSS).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, FileText, MessageCircle, Send, Share2, X } from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";
import {
  imagemComoArquivo, linksRedes, mensagemCompleta, resumoCurto, urlDaNoticia, type DadosCompartilhar,
} from "@/utils/compartilharNoticia";

/* Classes reaproveitadas pelos botões das redes */
const REDE =
  "inline-flex min-h-11 items-center justify-start gap-2.5 rounded-control border border-brand-line bg-white px-4 text-sm font-bold text-brand-dark transition hover:border-brand hover:bg-brand-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-line";
const GLIFO = "inline-flex size-[1.15rem] items-center justify-center font-sans text-[1.05rem] font-black leading-none";

interface Props extends DadosCompartilhar {
  variante?: "inline" | "botao";
  /** Texto do botão principal */
  rotulo?: string;
  className?: string;
}

export default function CompartilharNoticia({ titulo, resumo, slug, imagemUrl, variante = "inline", rotulo = "Compartilhar", className }: Props) {
  const [url, setUrl] = useState("");
  const [aberto, setAberto] = useState(false);
  const [aviso, setAviso] = useState("");
  const [copiado, setCopiado] = useState<"" | "link" | "texto">("");
  const [nativo, setNativo] = useState(false);
  const arquivoRef = useRef<File | null | undefined>(undefined); // undefined = ainda não tentou
  const preparandoRef = useRef<Promise<File | null> | null>(null);

  const dados: DadosCompartilhar = { titulo, resumo, slug, imagemUrl };

  useEffect(() => {
    setUrl(urlDaNoticia(slug));
    // folha nativa só em aparelhos de toque (celular/tablet); no computador usa o painel
    setNativo(typeof navigator !== "undefined" && typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches);
  }, [slug]);

  /** Baixa a capa uma vez (antes do toque, para o share() ser imediato) */
  const preparar = useCallback(() => {
    if (arquivoRef.current !== undefined || !imagemUrl) return Promise.resolve(arquivoRef.current ?? null);
    if (!preparandoRef.current) {
      preparandoRef.current = imagemComoArquivo(imagemUrl, slug).then((f) => {
        arquivoRef.current = f;
        return f;
      });
    }
    return preparandoRef.current;
  }, [imagemUrl, slug]);

  // na página (inline) já prepara; no painel prepara ao passar o mouse/tocar
  useEffect(() => {
    if (variante === "inline" && nativo) void preparar();
  }, [variante, nativo, preparar]);

  // janela: Esc fecha e trava a rolagem
  useEffect(() => {
    if (!aberto || variante !== "botao") return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("keydown", esc);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = antes;
    };
  }, [aberto, variante]);

  async function compartilhar() {
    setAviso("");
    if (!nativo) {
      setAberto(true);
      return;
    }
    // espera a capa no máximo 3 s
    const arquivo = await Promise.race([preparar(), new Promise<null>((r) => setTimeout(() => r(null), 3000))]);
    const comArquivo = !!arquivo && !!navigator.canShare?.({ files: [arquivo] });
    try {
      if (comArquivo) {
        // com imagem: o link vai dentro do texto (alguns apps ignoram o campo "url")
        await navigator.share({ title: titulo, text: mensagemCompleta(dados, url), files: [arquivo!] });
      } else {
        await navigator.share({ title: titulo, text: resumoCurto(resumo), url });
      }
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return; // a pessoa cancelou
      setAviso("Não foi possível abrir o compartilhamento do aparelho. Use uma das opções abaixo.");
      setAberto(true);
    }
  }

  async function copiar(que: "link" | "texto") {
    try {
      await navigator.clipboard.writeText(que === "link" ? url : mensagemCompleta(dados, url));
      setCopiado(que);
      setTimeout(() => setCopiado(""), 2500);
    } catch {
      setAviso("Seu navegador não permitiu copiar. Copie o endereço da barra do navegador.");
    }
  }

  const redes = linksRedes(dados, url || "");

  const opcoes = (
    <div className={cn("grid grid-cols-1 gap-2", variante === "botao" && "min-[481px]:grid-cols-2")}>
      <a className={cn(REDE, "border-[#128c4a] bg-[#128c4a] text-white hover:border-[#0e7a40] hover:bg-[#0e7a40]")} href={redes.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> WhatsApp</a>
      <a className={cn(REDE, "text-[#1877f2]")} href={redes.facebook} target="_blank" rel="noopener noreferrer"><span className={GLIFO} aria-hidden="true">f</span> Facebook</a>
      <a className={cn(REDE, "text-ink")} href={redes.x} target="_blank" rel="noopener noreferrer"><span className={GLIFO} aria-hidden="true">𝕏</span> X</a>
      <a className={cn(REDE, "text-[#229ed9]")} href={redes.telegram} target="_blank" rel="noopener noreferrer"><Send size={18} aria-hidden="true" /> Telegram</a>
      <button type="button" className={cn(REDE, "cursor-pointer")} onClick={() => copiar("link")} aria-live="polite">
        {copiado === "link" ? <><Check size={16} aria-hidden="true" /> Link copiado!</> : <><Copy size={16} aria-hidden="true" /> Copiar link</>}
      </button>
      <button type="button" className={cn(REDE, "cursor-pointer")} onClick={() => copiar("texto")} aria-live="polite">
        {copiado === "texto" ? <><Check size={16} aria-hidden="true" /> Texto copiado!</> : <><FileText size={16} aria-hidden="true" /> Copiar texto</>}
      </button>
    </div>
  );

  /* ----- Variante inline: tudo visível na página ----- */
  if (variante === "inline") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-brand"><Share2 size={14} aria-hidden="true" /> {rotulo}</span>
        {nativo && (
          <Button type="button" onClick={compartilhar} className="min-h-11">
            <Send size={16} aria-hidden="true" /> Enviar com foto e resumo
          </Button>
        )}
        {opcoes}
        {aviso && <p className="rounded-xl bg-amber-100 px-3 py-2 text-left text-xs leading-snug text-amber-800" role="status">{aviso}</p>}
      </div>
    );
  }

  /* ----- Variante botão + janela ----- */
  return (
    <>
      <button
        type="button"
        className={cn(
          "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-brand-line bg-brand-soft px-3 text-xs font-bold text-brand-dark transition hover:border-brand hover:bg-brand-mint focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-line",
          className,
        )}
        onClick={compartilhar}
        onPointerEnter={() => nativo && void preparar()}
        onFocus={() => nativo && void preparar()}
        onTouchStart={() => nativo && void preparar()}
        title="Compartilhar notícia"
      >
        <Share2 size={15} aria-hidden="true" /><span>{rotulo}</span>
      </button>

      {aberto && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-0 min-[481px]:items-center min-[481px]:p-4" onClick={() => setAberto(false)}>
            <div className="relative flex max-h-[calc(100dvh-2rem)] w-full flex-col gap-4 overflow-y-auto rounded-t-card bg-white px-4 pb-6 pt-5 shadow-[0_24px_60px_rgb(0_0_0/0.3)] min-[481px]:w-[min(30rem,100%)] min-[481px]:rounded-card min-[481px]:p-5" role="dialog" aria-modal="true" aria-label="Compartilhar notícia" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="absolute right-2.5 top-2.5 z-10 grid size-9 cursor-pointer place-items-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200" onClick={() => setAberto(false)} aria-label="Fechar"><X size={18} aria-hidden="true" /></button>
              <div className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-soft p-2.5 pr-11">
                {imagemUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagemUrl} alt="" className="size-20 flex-none rounded-xl object-cover" />
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  <strong className="line-clamp-2 text-left text-sm leading-snug text-brand-dark">{titulo}</strong>
                  {resumo && <p className="line-clamp-2 text-left text-xs leading-snug text-zinc-600">{resumoCurto(resumo, 140)}</p>}
                  <small className="truncate text-[0.7rem] text-ink-muted">{url}</small>
                </div>
              </div>
              {opcoes}
              {aviso && <p className="rounded-xl bg-amber-100 px-3 py-2 text-left text-xs leading-snug text-amber-800" role="status">{aviso}</p>}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
