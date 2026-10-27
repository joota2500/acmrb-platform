"use client";

/**
 * EditorTextoNoticia — caixa de texto da notícia com barra de formatação
 * ------------------------------------------------------------
 * Título 1/2/3, texto normal, negrito, itálico, lista com marcadores,
 * lista numerada, citação, link, linha divisória, limpar formatação,
 * desfazer/refazer. Atalhos: Ctrl/⌘+B, Ctrl/⌘+I, Ctrl/⌘+K; Enter dentro
 * de uma lista continua a lista.
 * As trocas usam execCommand("insertText") para o Ctrl+Z continuar
 * funcionando; se o navegador não permitir, atualiza o estado direto.
 * CSS: src/styles/barra-formatacao.css (prefixo "bf").
 */

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  Bold, Heading1, Heading2, Heading3, Italic, Link2, List, ListOrdered, Minus, Pilcrow, Quote,
  Redo2, RemoveFormatting, Undo2, X,
} from "lucide-react";
import "@/styles/barra-formatacao.css";
import {
  continuarLista, envolver, inserirDivisor, inserirLink, limparFormato, prefixoDeLinha, type Troca,
} from "@/lib/editorTexto";

interface Props {
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rotulo?: string;
  linhas?: number;
}

export default function EditorTextoNoticia({ valor, onChange, placeholder, rotulo = "Texto da notícia", linhas = 16 }: Props) {
  const alvo = useRef<HTMLTextAreaElement>(null);
  const [linkAberto, setLinkAberto] = useState(false);
  const [url, setUrl] = useState("https://");
  const [erroLink, setErroLink] = useState("");
  const selecaoLink = useRef<{ s: number; e: number }>({ s: 0, e: 0 });
  const campoUrl = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (linkAberto) campoUrl.current?.focus();
  }, [linkAberto]);

  /** Aplica uma troca no textarea (mantém o histórico de desfazer) */
  function aplicar(fn: (v: string, s: number, e: number) => Troca | null, faixa?: { s: number; e: number }): boolean {
    const el = alvo.current;
    if (!el) return false;
    const s = faixa?.s ?? el.selectionStart;
    const e = faixa?.e ?? el.selectionEnd;
    const t = fn(el.value, s, e);
    if (!t) return false;

    el.focus();
    el.setSelectionRange(t.inicio, t.fim);
    let ok = false;
    try {
      ok = document.execCommand("insertText", false, t.novo);
    } catch {
      ok = false;
    }
    if (!ok) {
      onChange(el.value.slice(0, t.inicio) + t.novo + el.value.slice(t.fim));
    }
    // seleção calculada sobre o texto novo inteiro
    const ajustar = () => {
      const a = alvo.current;
      if (!a) return;
      a.focus();
      a.setSelectionRange(t.selInicio, t.selFim);
    };
    requestAnimationFrame(ajustar);
    return true;
  }

  function abrirLink() {
    const el = alvo.current;
    if (!el) return;
    selecaoLink.current = { s: el.selectionStart, e: el.selectionEnd };
    const sel = el.value.slice(el.selectionStart, el.selectionEnd);
    setUrl(/^https?:\/\/\S+$/.test(sel) ? sel : "https://");
    setErroLink("");
    setLinkAberto(true);
  }

  function confirmarLink() {
    const limpo = url.trim();
    if (!/^https?:\/\/[^\s)]+\.[^\s)]+/.test(limpo)) {
      setErroLink("Digite um endereço completo, começando com http:// ou https://");
      return;
    }
    aplicar((v, s, e) => inserirLink(v, s, e, limpo), selecaoLink.current);
    setLinkAberto(false);
  }

  /** Atalhos de teclado e continuação de lista com Enter */
  function aoTeclar(ev: KeyboardEvent<HTMLTextAreaElement>) {
    const meta = ev.ctrlKey || ev.metaKey;
    if (meta && !ev.shiftKey && !ev.altKey) {
      const k = ev.key.toLowerCase();
      if (k === "b") { ev.preventDefault(); aplicar((v, s, e) => envolver(v, s, e, "**", "negrito")); }
      else if (k === "i") { ev.preventDefault(); aplicar((v, s, e) => envolver(v, s, e, "*", "itálico")); }
      else if (k === "k") { ev.preventDefault(); abrirLink(); }
      return;
    }
    if (ev.key === "Enter" && !ev.shiftKey && !ev.altKey && !meta) {
      const el = ev.currentTarget;
      if (el.selectionStart !== el.selectionEnd) return;
      if (aplicar((v, s) => continuarLista(v, s))) ev.preventDefault();
    }
  }

  const desfazer = () => { alvo.current?.focus(); document.execCommand("undo"); };
  const refazer = () => { alvo.current?.focus(); document.execCommand("redo"); };

  // Evita que o clique no botão tire o foco/seleção do textarea
  const semFoco = { onMouseDown: (e: React.MouseEvent) => e.preventDefault() };

  const Botao = ({ titulo, icone: Icone, onClick, texto }: { titulo: string; icone: typeof Bold; onClick: () => void; texto?: string }) => (
    <button type="button" className="bf-btn" title={titulo} aria-label={titulo} onClick={onClick} {...semFoco}>
      <Icone size={17} aria-hidden="true" />
      {texto && <span className="bf-btn__texto">{texto}</span>}
    </button>
  );

  return (
    <div className="bf">
      <div className="bf-barra" role="toolbar" aria-label="Formatação do texto">
      <div className="bf-grupo" role="group" aria-label="Títulos">
        <Botao titulo="Título 1 (grande)" icone={Heading1} onClick={() => aplicar((v, s, e) => prefixoDeLinha(v, s, e, "h1"))} />
        <Botao titulo="Título 2 (subtítulo)" icone={Heading2} onClick={() => aplicar((v, s, e) => prefixoDeLinha(v, s, e, "h2"))} />
        <Botao titulo="Título 3 (menor)" icone={Heading3} onClick={() => aplicar((v, s, e) => prefixoDeLinha(v, s, e, "h3"))} />
        <Botao titulo="Parágrafo normal" icone={Pilcrow} onClick={() => aplicar((v, s, e) => prefixoDeLinha(v, s, e, "normal"))} />
      </div>
      <div className="bf-grupo" role="group" aria-label="Estilo do texto">
        <Botao titulo="Negrito (Ctrl+B)" icone={Bold} onClick={() => aplicar((v, s, e) => envolver(v, s, e, "**", "negrito"))} />
        <Botao titulo="Itálico (Ctrl+I)" icone={Italic} onClick={() => aplicar((v, s, e) => envolver(v, s, e, "*", "itálico"))} />
        <Botao titulo="Link (Ctrl+K)" icone={Link2} onClick={abrirLink} />
      </div>
      <div className="bf-grupo" role="group" aria-label="Listas e blocos">
        <Botao titulo="Lista com marcadores" icone={List} onClick={() => aplicar((v, s, e) => prefixoDeLinha(v, s, e, "ul"))} />
        <Botao titulo="Lista numerada" icone={ListOrdered} onClick={() => aplicar((v, s, e) => prefixoDeLinha(v, s, e, "ol"))} />
        <Botao titulo="Citação" icone={Quote} onClick={() => aplicar((v, s, e) => prefixoDeLinha(v, s, e, "citacao"))} />
        <Botao titulo="Linha divisória" icone={Minus} onClick={() => aplicar((v, s, e) => inserirDivisor(v, s, e))} />
      </div>
      <div className="bf-grupo" role="group" aria-label="Outros">
        <Botao titulo="Limpar formatação" icone={RemoveFormatting} onClick={() => aplicar((v, s, e) => limparFormato(v, s, e))} />
        <Botao titulo="Desfazer (Ctrl+Z)" icone={Undo2} onClick={desfazer} />
        <Botao titulo="Refazer (Ctrl+Y)" icone={Redo2} onClick={refazer} />
      </div>

      </div>

      {linkAberto && (
        <div className="bf-link" role="dialog" aria-label="Inserir link">
          <label htmlFor="bf-url">Endereço do link</label>
          <div className="bf-link__linha">
            <input
              id="bf-url"
              ref={campoUrl}
              value={url}
              inputMode="url"
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); confirmarLink(); }
                if (e.key === "Escape") { setLinkAberto(false); alvo.current?.focus(); }
              }}
              placeholder="https://..."
            />
            <button type="button" className="bf-link__ok" onClick={confirmarLink}>Inserir</button>
            <button type="button" className="bf-link__x" onClick={() => { setLinkAberto(false); alvo.current?.focus(); }} aria-label="Cancelar">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          {erroLink && <p className="bf-link__erro" role="alert">{erroLink}</p>}
        </div>
      )}

      <textarea
        ref={alvo}
        className="bf-texto"
        rows={linhas}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={aoTeclar}
        aria-label={rotulo}
        placeholder={placeholder}
      />
    </div>
  );
}
