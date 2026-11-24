"use client";

/**
 * AdminHeader — barra superior fixa (sticky) do painel
 * ------------------------------------------------------------
 * Esquerda: hambúrguer (só abaixo de 1024px), caminho "Painel / Grupo"
 * (tablet e computador), título da seção e selo "em breve".
 * Direita: busca de seção (Ctrl+K), sino das mensagens não lidas (quem pode
 * ver mensagens), "Ver site" e o menu do usuário (nome, papel, e-mail, Sair).
 * Botões só com ícone ganham o balão do Tooltip (item 12) pelo aria-label.
 * O menu do usuário fecha com Esc ou clique fora.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, ChevronRight, ExternalLink, LogOut, Menu, Search, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

type Props = {
  titulo: string;
  descricao?: string;
  /** Grupo da seção no menu (para o caminho "Painel / Grupo") */
  grupo?: string;
  /** Ícone da seção ativa (o mesmo do menu lateral) */
  icone?: LucideIcon;
  emBreve?: boolean;
  onAbrirGaveta: () => void;
  gavetaAberta: boolean;
  usuario: { nome: string; email: string; papel: string };
  /** true = ADM DEUS (selo dourado); false = administrador (selo verde) */
  deus?: boolean;
  onSair: () => void;
  onBuscar: () => void;
  /** null = não mostra o sino (papel sem acesso às mensagens) */
  naoLidas: number | null;
  onAbrirMensagens: () => void;
};

// Botão quadrado só com ícone (44px = bom alvo de toque)
const BOTAO_ICONE =
  "relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl text-brand-dark transition-colors hover:bg-brand-mint focus-visible:outline-2 focus-visible:outline-brand";

export default function AdminHeader({
  titulo,
  descricao,
  grupo,
  icone: Icone,
  emBreve,
  onAbrirGaveta,
  gavetaAberta,
  usuario,
  deus,
  onSair,
  onBuscar,
  naoLidas,
  onAbrirMensagens,
}: Props) {
  const [menuAberto, setMenuAberto] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);
  const inicial = (usuario.nome || "A").charAt(0).toUpperCase();
  const seloPapel = deus ? "bg-amber-400 text-ink" : "bg-brand-mint text-brand-dark";

  // Fecha o menu do usuário com Esc ou clique fora
  useEffect(() => {
    if (!menuAberto) return;
    const fora = (e: MouseEvent) => {
      if (!caixaRef.current?.contains(e.target as Node)) setMenuAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenuAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [menuAberto]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-16 max-w-[88rem] items-center gap-1.5 px-2.5 sm:h-18 sm:gap-3 sm:px-6 lg:h-19 lg:px-8 xl:px-10">
        {/* Hambúrguer: só abaixo de 1024px */}
        <button
          type="button"
          onClick={onAbrirGaveta}
          aria-label="Abrir menu"
          aria-expanded={gavetaAberta}
          aria-controls="admin-gaveta"
          className={cn(BOTAO_ICONE, "lg:hidden")}
        >
          <Menu size={22} aria-hidden="true" />
        </button>

        {/* Ícone da seção (tablet e computador) */}
        {Icone && (
          <span className="hidden size-11 shrink-0 place-items-center rounded-2xl bg-brand-mint text-brand sm:grid" aria-hidden="true">
            <Icone size={22} />
          </span>
        )}

        {/* Caminho + título da seção ativa */}
        <div className="min-w-0 flex-1">
          {grupo && (
            <nav aria-label="Você está em" className="hidden sm:block">
              <ol className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <li>Painel</li>
                <li aria-hidden="true"><ChevronRight size={12} /></li>
                <li className="truncate">{grupo}</li>
              </ol>
            </nav>
          )}
          <h1 className="flex min-w-0 items-center gap-2 text-[1.05rem] font-black leading-tight tracking-tight text-ink sm:text-xl lg:text-[1.4rem]">
            <span className="truncate">{titulo}</span>
            {emBreve && (
              <span className="shrink-0 rounded-full bg-brand-mint px-2 py-0.5 text-[10px] font-bold uppercase text-brand">em breve</span>
            )}
          </h1>
          {descricao && <p className="hidden truncate text-[0.8rem] text-ink-muted xl:block">{descricao}</p>}
        </div>

        {/* Busca: pílula no computador, ícone no celular/tablet */}
        <button
          type="button"
          onClick={onBuscar}
          className="hidden h-11 w-56 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-alt px-3 text-sm text-ink-muted transition-colors hover:border-brand-line hover:bg-white focus-visible:outline-2 focus-visible:outline-brand xl:flex"
        >
          <Search size={16} className="text-brand" aria-hidden="true" />
          <span className="flex-1 text-left">Buscar seção…</span>
          <kbd className="rounded-md border border-line bg-white px-1.5 text-[10px] font-bold">Ctrl K</kbd>
        </button>
        <button type="button" onClick={onBuscar} aria-label="Buscar seção" className={cn(BOTAO_ICONE, "xl:hidden")}>
          <Search size={20} aria-hidden="true" />
        </button>

        {/* Sino: mensagens de visitantes não lidas */}
        {naoLidas !== null && (
          <button
            type="button"
            onClick={onAbrirMensagens}
            aria-label={naoLidas > 0 ? `Mensagens: ${naoLidas} não lidas` : "Mensagens: nenhuma nova"}
            className={BOTAO_ICONE}
          >
            <Bell size={20} aria-hidden="true" />
            {naoLidas > 0 && (
              <span className="absolute top-1.5 right-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white" aria-hidden="true">
                {naoLidas > 99 ? "99+" : naoLidas}
              </span>
            )}
          </button>
        )}

        {/* Link para o site (computador) */}
        <Link href="/" target="_blank" aria-label="Ver o site (abre em outra aba)" className={cn(BOTAO_ICONE, "hidden md:grid")}>
          <ExternalLink size={19} aria-hidden="true" />
        </Link>

        {/* Menu do usuário */}
        <div className="relative shrink-0" ref={caixaRef}>
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuAberto}
            aria-label={`Menu do usuário: ${usuario.nome}, ${usuario.papel}`}
            className="flex h-11 min-w-11 cursor-pointer items-center gap-2 rounded-xl px-1 transition-colors hover:bg-brand-mint focus-visible:outline-2 focus-visible:outline-brand md:pr-2.5 md:pl-1.5"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-emerald-500 to-brand font-black text-white shadow-sm" aria-hidden="true">
              {inicial}
            </span>
            <span className="hidden max-w-40 text-left leading-tight md:block" aria-hidden="true">
              <span className="block truncate text-sm font-bold text-ink">{usuario.nome}</span>
              <span className={cn("mt-0.5 inline-block rounded-full px-1.5 py-px text-[9px] font-black uppercase tracking-wider", seloPapel)}>{usuario.papel}</span>
            </span>
            <ChevronDown size={16} className={cn("hidden text-ink-muted transition-transform md:block", menuAberto && "rotate-180")} aria-hidden="true" />
          </button>

          {menuAberto && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-[min(18rem,calc(100vw-1.5rem))] animate-subir rounded-2xl border border-line bg-white p-2 shadow-pop motion-reduce:animate-none"
            >
              <div className="rounded-xl bg-surface-alt px-3 py-3">
                <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider", seloPapel)}>{usuario.papel}</span>
                <p className="mt-1 truncate font-bold text-ink">{usuario.nome}</p>
                <p className="truncate text-sm text-ink-muted">{usuario.email}</p>
              </div>
              <Link
                role="menuitem"
                href="/"
                target="_blank"
                className="mt-1 flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
              >
                <ExternalLink size={16} aria-hidden="true" /> Ver site
              </Link>
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setMenuAberto(false);
                  onSair();
                }}
                className="mt-1 flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-bold text-danger transition-colors hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-red-600"
              >
                <LogOut size={16} aria-hidden="true" /> Sair do painel
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
