"use client";

/**
 * AdminHeader — barra superior fixa (sticky) do painel
 * ------------------------------------------------------------
 * - Abaixo de 1024px: botão hambúrguer (abre a gaveta), título da seção
 *   e avatar.
 * - Desktop: título + descrição da seção ativa e menu do usuário
 *   (nome, papel, e-mail e "Sair"), que abre ao clicar no avatar.
 * O menu do usuário fecha com Esc ou clique fora.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, LogOut, Menu } from "lucide-react";

type Props = {
  titulo: string;
  descricao?: string;
  emBreve?: boolean;
  onAbrirGaveta: () => void;
  gavetaAberta: boolean;
  usuario: { nome: string; email: string; papel: string };
  onSair: () => void;
};

export default function AdminHeader({
  titulo,
  descricao,
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
    <header className="admin-header">
      <div className="admin-header__inner">
        {/* Hambúrguer: só abaixo de 1024px */}
        <button
          type="button"
          onClick={onAbrirGaveta}
          aria-label="Abrir menu"
          aria-expanded={gavetaAberta}
          aria-controls="admin-gaveta"
          className="lg:hidden w-11 h-11 shrink-0 rounded-xl text-[#21463A] hover:bg-[#DDF5EC] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#2E5E4E]"
        >
          <Menu size={22} />
        </button>

        {/* Título da seção ativa */}
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl font-black text-[#111827] truncate">
            <span className="truncate">{titulo}</span>
            {emBreve && (
              <span className="shrink-0 text-[10px] font-bold uppercase bg-[#DDF5EC] text-[#2E5E4E] px-2 py-0.5 rounded-full">
                em breve
              </span>
            )}
          </h1>
          {descricao && (
            <p className="hidden sm:block text-sm text-zinc-500 truncate">{descricao}</p>
          )}
        </div>

        {/* Link para o site (desktop/tablet) */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex h-11 px-4 items-center gap-2 rounded-xl text-sm font-semibold text-[#2E5E4E] hover:bg-[#DDF5EC] focus-visible:outline-2 focus-visible:outline-[#2E5E4E]"
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
            className="h-11 min-w-11 rounded-xl flex items-center gap-2 px-1 sm:pr-3 hover:bg-[#DDF5EC] focus-visible:outline-2 focus-visible:outline-[#2E5E4E]"
          >
            <span className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-600 to-[#2E5E4E] text-white font-black flex items-center justify-center">
              {inicial}
            </span>
            <span className="hidden sm:block text-left leading-tight max-w-40">
              <span className="block text-sm font-bold text-zinc-900 truncate">{usuario.nome}</span>
              <span className="block text-[11px] font-bold uppercase text-emerald-700">{usuario.papel}</span>
            </span>
            <ChevronDown size={16} className="hidden sm:block text-zinc-400" aria-hidden="true" />
          </button>

          {menuAberto && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-xl border border-black/5 p-2 z-50"
            >
              <div className="px-3 py-3 border-b border-zinc-100">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-amber-400 text-[#111827] px-2 py-0.5 rounded-full">
                  {usuario.papel}
                </span>
                <p className="mt-1 font-bold text-zinc-900 truncate">{usuario.nome}</p>
                <p className="text-sm text-zinc-500 truncate" title={usuario.email}>{usuario.email}</p>
              </div>
              <Link
                role="menuitem"
                href="/"
                target="_blank"
                className="md:hidden mt-1 min-h-11 px-3 rounded-xl flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
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
                className="mt-1 w-full min-h-11 px-3 rounded-xl flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50"
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
