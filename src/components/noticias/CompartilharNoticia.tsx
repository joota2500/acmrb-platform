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
 * CSS: src/styles/compartilhar-noticia.css (prefixo "cn").
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, FileText, MessageCircle, Send, Share2, X } from "lucide-react";
import "@/styles/compartilhar-noticia.css";
import {
  imagemComoArquivo, linksRedes, mensagemCompleta, resumoCurto, urlDaNoticia, type DadosCompartilhar,
} from "@/lib/compartilharNoticia";

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
    <div className="cn-opcoes">
      <a className="cn-rede cn-rede--whats" href={redes.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> WhatsApp</a>
      <a className="cn-rede cn-rede--face" href={redes.facebook} target="_blank" rel="noopener noreferrer"><span className="cn-glifo" aria-hidden="true">f</span> Facebook</a>
      <a className="cn-rede cn-rede--x" href={redes.x} target="_blank" rel="noopener noreferrer"><span className="cn-glifo" aria-hidden="true">𝕏</span> X</a>
      <a className="cn-rede cn-rede--tg" href={redes.telegram} target="_blank" rel="noopener noreferrer"><Send size={18} aria-hidden="true" /> Telegram</a>
      <button type="button" className="cn-rede" onClick={() => copiar("link")} aria-live="polite">
        {copiado === "link" ? <><Check size={16} aria-hidden="true" /> Link copiado!</> : <><Copy size={16} aria-hidden="true" /> Copiar link</>}
      </button>
      <button type="button" className="cn-rede" onClick={() => copiar("texto")} aria-live="polite">
        {copiado === "texto" ? <><Check size={16} aria-hidden="true" /> Texto copiado!</> : <><FileText size={16} aria-hidden="true" /> Copiar texto</>}
      </button>
    </div>
  );

  /* ----- Variante inline: tudo visível na página ----- */
  if (variante === "inline") {
    return (
      <div className={`cn cn--inline ${className ?? ""}`}>
        <span className="cn-rotulo"><Share2 size={14} aria-hidden="true" /> {rotulo}</span>
        {nativo && (
          <button type="button" className="cn-principal" onClick={compartilhar}>
            <Send size={16} aria-hidden="true" /> Enviar com foto e resumo
          </button>
        )}
        {opcoes}
        {aviso && <p className="cn-aviso" role="status">{aviso}</p>}
      </div>
    );
  }

  /* ----- Variante botão + janela ----- */
  return (
    <>
      <button
        type="button"
        className={`cn-botao ${className ?? ""}`}
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
          <div className="cn-fundo" onClick={() => setAberto(false)}>
            <div className="cn-janela" role="dialog" aria-modal="true" aria-label="Compartilhar notícia" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="cn-fechar" onClick={() => setAberto(false)} aria-label="Fechar"><X size={18} aria-hidden="true" /></button>
              <div className="cn-previa">
                {imagemUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagemUrl} alt="" />
                )}
                <div className="cn-previa__texto">
                  <strong>{titulo}</strong>
                  {resumo && <p>{resumoCurto(resumo, 140)}</p>}
                  <small>{url}</small>
                </div>
              </div>
              {opcoes}
              {aviso && <p className="cn-aviso" role="status">{aviso}</p>}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
