"use client";

/**
 * BuscaSecoes — "Ir para…" (atalho Ctrl+K ou ⌘K)
 * ------------------------------------------------------------
 * Janela com um campo de busca que filtra as seções do painel (só as que
 * o papel logado pode ver). Setas ↑ ↓ escolhem, Enter abre, Esc fecha.
 * A busca ignora acentos ("calendario" acha "Calendário").
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search, X } from "lucide-react";

import { GRUPOS_NAV, type SecaoId } from "@/constants/adminNav";
import { podeVer } from "@/constants/permissoes";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import { cn } from "@/utils/cn";

// tira acentos e deixa minúsculo
const limpar = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type Props = {
  aberta: boolean;
  onFechar: () => void;
  onSelecionar: (id: SecaoId) => void;
};

export default function BuscaSecoes({ aberta, onFechar, onSelecionar }: Props) {
  const papel = usePapelAdmin();
  const [texto, setTexto] = useState("");
  const [marcado, setMarcado] = useState(0);
  const campoRef = useRef<HTMLInputElement>(null);

  // todas as seções permitidas, com o nome do grupo junto
  const todas = useMemo(
    () => GRUPOS_NAV.flatMap((g) => g.itens.filter((i) => podeVer(papel, i.id)).map((i) => ({ ...i, grupo: g.titulo }))),
    [papel],
  );
  const achadas = useMemo(() => {
    const t = limpar(texto.trim());
    if (!t) return todas;
    return todas.filter((i) => limpar(`${i.rotulo} ${i.descricao} ${i.grupo}`).includes(t));
  }, [texto, todas]);

  // ao abrir: limpa a busca, trava a rolagem e foca o campo
  useEffect(() => {
    if (!aberta) return;
    setTexto("");
    setMarcado(0);
    const anterior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => campoRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [aberta]);

  if (!aberta) return null;

  const escolher = (id: SecaoId) => {
    onFechar();
    onSelecionar(id);
  };

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onFechar();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setMarcado((m) => Math.min(m + 1, achadas.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMarcado((m) => Math.max(m - 1, 0));
    } else if (e.key === "Enter" && achadas[marcado]) {
      e.preventDefault();
      escolher(achadas[marcado].id);
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-start justify-center p-3 pt-[10vh] sm:p-6 sm:pt-[12vh]" onKeyDown={teclas}>
      <div className="absolute inset-0 animate-aparecer bg-ink/50 backdrop-blur-xs motion-reduce:animate-none" onClick={onFechar} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ir para uma seção do painel"
        className="relative flex max-h-[75dvh] w-full max-w-xl animate-subir flex-col overflow-hidden rounded-card bg-white shadow-pop motion-reduce:animate-none"
      >
        {/* campo de busca */}
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search size={18} className="shrink-0 text-brand" aria-hidden="true" />
          <input
            ref={campoRef}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setMarcado(0);
            }}
            placeholder="Ir para… (ex.: coletas, notícias)"
            aria-label="Buscar seção"
            aria-controls="busca-secoes-lista"
            aria-activedescendant={achadas[marcado] ? `busca-${achadas[marcado].id}` : undefined}
            className="h-14 min-w-0 flex-1 border-0 bg-transparent text-base text-ink outline-none! placeholder:text-ink-muted"
          />
          <button type="button" onClick={onFechar} aria-label="Fechar busca" className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-zinc-100 hover:text-ink">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* resultados */}
        <ul id="busca-secoes-lista" role="listbox" aria-label="Seções" className="flex-1 overflow-y-auto overscroll-contain p-2">
          {achadas.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-muted">Nenhuma seção com “{texto}”.</li>}
          {achadas.map((i, n) => {
            const Icone = i.icone;
            return (
              <li
                key={i.id}
                id={`busca-${i.id}`}
                role="option"
                aria-selected={n === marcado}
                onMouseEnter={() => setMarcado(n)}
                onClick={() => escolher(i.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                  n === marcado ? "bg-brand-soft" : "hover:bg-surface-alt",
                )}
              >
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", n === marcado ? "bg-brand text-white" : "bg-brand-mint text-brand")}>
                  <Icone size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-bold text-ink">
                    <span className="truncate">{i.rotulo}</span>
                    {!i.pronto && <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-px text-[10px] font-bold uppercase text-ink-muted">em breve</span>}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">{i.grupo} · {i.descricao}</span>
                </span>
                {n === marcado && <CornerDownLeft size={16} className="hidden shrink-0 text-brand sm:block" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>

        {/* dica dos atalhos (só no computador) */}
        <p className="hidden gap-4 border-t border-line bg-surface-alt px-4 py-2 text-[11px] font-semibold text-ink-muted sm:flex">
          <span><kbd className="rounded border border-line bg-white px-1">↑</kbd> <kbd className="rounded border border-line bg-white px-1">↓</kbd> escolher</span>
          <span><kbd className="rounded border border-line bg-white px-1">Enter</kbd> abrir</span>
          <span><kbd className="rounded border border-line bg-white px-1">Esc</kbd> fechar</span>
        </p>
      </div>
    </div>
  );
}
