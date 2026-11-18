"use client";

/**
 * AdminHeader — barra superior fixa (sticky) do painel
 * ------------------------------------------------------------
 * - Abaixo de 1024px: botão hambúrguer (abre a gaveta), título da seção
 *   e avatar.
 * - Desktop: ícone + título + descrição da seção ativa e menu do usuário
 *   (nome, papel, e-mail e "Sair"), que abre ao clicar no avatar.
 * O menu do usuário fecha com Esc ou clique fora.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, LogOut, Menu, type LucideIcon } from "lucide-react";

type Props = {
  titulo: string;
  descricao?: string;
  /** Ícone da seção ativa (o mesmo do menu lateral) */
  icone?: LucideIcon;
  emBreve?: boolean;
  onAbrirGaveta: () => void;
  gavetaAberta: boolean;
  usuario: { nome: string; email: string; papel: string };
  onSair: () => void;
};

export default function AdminHeader({
  titulo,
  descricao,
  icone: Icone,
  emBreve,
  onAbrirGaveta,
  gavetaAberta,
  usuario,
  onSair,
}: Props) {
  const [menuAberto, setMenuAberto] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);
  const inicial = (usuario.nome || "A").charAt(0).toUpperCase();

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
    <header className="sticky top-0 z-30 border-b border-line bg-white/80 shadow-card backdrop-blur-xl">
      <div className="mx-auto flex h-15 max-w-[88rem] items-center gap-2 px-3 sm:h-17 sm:gap-3 sm:px-6 lg:h-19 lg:px-8">
        {/* Hambúrguer: só abaixo de 1024px */}
        <button
          type="button"
          onClick={onAbrirGaveta}
          aria-label="Abrir menu"
          aria-expanded={gavetaAberta}
          aria-controls="admin-gaveta"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-brand-dark transition-colors hover:bg-brand-mint focus-visible:outline-2 focus-visible:outline-brand lg:hidden"
        >
          <Menu size={22} aria-hidden="true" />
        </button>

        {/* Ícone da seção (tablet e desktop) */}
        {Icone && (
          <span
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-mint text-brand sm:flex"
            aria-hidden="true"
          >
            <Icone size={22} />
          </span>
        )}

        {/* Título da seção ativa */}
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 truncate text-lg font-black tracking-tight text-ink sm:text-xl lg:text-2xl">
            <span className="truncate">{titulo}</span>
            {emBreve && (
              <span className="shrink-0 rounded-full bg-brand-mint px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
                em breve
              </span>
            )}
          </h1>
          {descricao && <p className="hidden truncate text-sm text-ink-muted sm:block">{descricao}</p>}
        </div>

        {/* Link para o site (desktop/tablet) */}
        <Link
          href="/"
          target="_blank"
          className="hidden h-11 items-center gap-2 rounded-xl border border-brand-line px-4 text-sm font-semibold text-brand transition-colors hover:bg-brand-mint focus-visible:outline-2 focus-visible:outline-brand md:inline-flex"
        >
          Ver site <ExternalLink size={16} aria-hidden="true" />
        </Link>

        {/* Menu do usuário */}
        <div className="relative shrink-0" ref={caixaRef}>
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuAberto}
            aria-label="Menu do usuário"
            className="flex h-11 min-w-11 items-center gap-2 rounded-xl px-1 transition-colors hover:bg-brand-mint focus-visible:outline-2 focus-visible:outline-brand sm:pr-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-brand font-black text-white shadow-sm">
              {inicial}
            </span>
            <span className="hidden max-w-40 text-left leading-tight sm:block">
              <span className="block truncate text-sm font-bold text-ink">{usuario.nome}</span>
              <span className="block text-[11px] font-bold uppercase text-leaf">{usuario.papel}</span>
            </span>
            <ChevronDown
              size={16}
              className={`hidden text-ink-muted transition-transform sm:block ${menuAberto ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {menuAberto && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] animate-subir rounded-2xl border border-line bg-white p-2 shadow-pop motion-reduce:animate-none"
            >
              <div className="rounded-xl bg-surface-alt px-3 py-3">
                <span className="inline-block rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-ink">
                  {usuario.papel}
                </span>
                <p className="mt-1 truncate font-bold text-ink">{usuario.nome}</p>
                <p className="truncate text-sm text-ink-muted" title={usuario.email}>
                  {usuario.email}
                </p>
              </div>
              <Link
                role="menuitem"
                href="/"
                target="_blank"
                className="mt-1 flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand md:hidden"
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
                className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-bold text-danger transition-colors hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-red-600"
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
