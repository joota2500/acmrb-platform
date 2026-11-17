"use client";

/**
 * UserMenu (lado direito do Header)
 * ------------------------------------------------------------
 *  - Deslogado: botão "Acessar Plataforma" → /login (só desktop >=1024px;
 *    em telas menores o mesmo botão aparece dentro do MobileMenu).
 *  - Logado: nome, tipo de perfil, avatar, "Painel Admin" (se admin) e Sair.
 *  - Botão hambúrguer: aparece abaixo de 1024px e abre/fecha o MobileMenu.
 *
 * Dados: recebidos do Header (vindos do AuthContext / Supabase).
 * Acessibilidade: hambúrguer com aria-expanded / aria-controls,
 * alvos de toque de 48px e foco visível.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, LogIn, LayoutDashboard, ClipboardList, ChevronDown, MessageCircle, UserRound } from "lucide-react";
import { useChatNaoLidas } from "@/hooks/useChatNaoLidas";

import { cn } from "@/utils/cn";
import { FOCO_MENU, SELO_NAO_LIDAS } from "@/components/layout/classesMenu";

// Botão arredondado verde do cabeçalho (Entrar, Painel, Minha área)
const BOTAO = cn(
  "inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-500 font-semibold text-white no-underline",
  "transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-[0_8px_20px_rgb(16_185_129/0.35)] motion-reduce:hover:translate-y-0",
  FOCO_MENU,
);

interface Perfil {
  nome?: string;
  tipo?: string | null;
  avatar_url?: string | null;
}

interface Props {
  loading: boolean;
  user: unknown;
  perfil: Perfil | null;
  logout: () => void;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** id do MobileMenu, usado no aria-controls */
  menuId?: string;
}

export default function UserMenu({
  loading,
  user,
  perfil,
  logout,
  menuOpen,
  setMenuOpen,
  menuId,
}: Props) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-4">
      {/* ===== Usuário logado (desktop) ===== */}
      {!loading && user && perfil ? (
        <div className="hidden items-center gap-2 lg:flex">
          {/* Perfil compacto: só o avatar; nome e papel aparecem ao passar o mouse (title) */}
          <div
            className="flex items-center gap-3 border-r border-white/20 pr-4"
            title={`${perfil.nome ?? "Usuário"} • ${perfil.tipo ?? "Associado"}`}
          >
            <div className="flex size-[2.1rem] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-emerald-500 text-[0.85rem] font-bold text-white transition-transform hover:scale-110">
              {perfil.avatar_url ? (
                <img src={perfil.avatar_url} alt={perfil.nome ?? "Usuário"} className="size-full object-cover" />
              ) : (
                <span>{(perfil.nome ?? "U").charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          {perfil.tipo === "visitante" && <MenuVisitante />}

          {perfil.tipo === "admin" && (
            <Link href="/admin" className={cn(BOTAO, "px-3.5 text-[0.82rem]")} title="Painel Admin">
              <LayoutDashboard size={16} aria-hidden="true" />
              <span>Painel</span>
            </Link>
          )}

          <button
            type="button"
            onClick={logout}
            className={cn(
              "flex size-[2.1rem] cursor-pointer items-center justify-center rounded-[14px] text-red-300 transition duration-300 hover:bg-red-500/20",
              FOCO_MENU,
            )}
            title="Sair"
            aria-label="Sair da conta"
          >
            <LogOut size={17} />
          </button>
        </div>
      ) : (
        /* ===== Botão "Entrar" (desktop) — destino: /login ===== */
        <Link href="/login" className={cn(BOTAO, "px-[0.95rem] text-[0.85rem] max-lg:hidden lg:max-xl:h-11")}>
          <LogIn size={16} aria-hidden="true" />
          <span>Entrar</span>
        </Link>
      )}

      {/* ===== Hambúrguer (abaixo de 1024px) — alterna abrir/fechar ===== */}
      <button
        type="button"
        className={cn(
          "flex size-12 cursor-pointer items-center justify-center rounded-xl text-white transition duration-300 hover:bg-white/15 lg:hidden",
          FOCO_MENU,
        )}
        onClick={() => setMenuOpen((aberto) => !aberto)}
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuOpen}
        aria-controls={menuId}
      >
        {menuOpen ? (
          <X size={26} strokeWidth={2.5} />
        ) : (
          <Menu size={26} strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}

/**
 * Menu "Minha área" do visitante (desktop): Minha conta, Mensagens
 * (com selo de respostas não lidas) e Minhas coletas.
 * Abre por clique/Enter, fecha com Esc ou clique fora.
 */
const ITEM_AREA =
  "flex items-center gap-2 rounded-[0.6rem] px-3 py-2.5 text-[0.88rem] font-bold text-brand-dark no-underline hover:bg-brand-soft focus-visible:bg-brand-soft focus-visible:outline-0";

function MenuVisitante() {
  const [aberto, setAberto] = useState(false);
  const naoLidas = useChatNaoLidas(true);
  const caixaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!caixaRef.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  const fechar = () => setAberto(false);

  return (
    <div className="relative" ref={caixaRef}>
      <button
        type="button"
        className={cn(BOTAO, "px-3.5 text-[0.82rem]")}
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((a) => !a)}
      >
        <UserRound size={16} aria-hidden="true" />
        <span>Minha área</span>
        {naoLidas > 0 && <span className={cn(SELO_NAO_LIDAS, "h-[1.2rem] min-w-[1.2rem] px-1 text-[0.68rem]")} aria-label={`${naoLidas} mensagens não lidas`}>{naoLidas > 9 ? "9+" : naoLidas}</span>}
        <ChevronDown size={14} aria-hidden="true" className={aberto ? "rotate-180" : undefined} />
      </button>
      {aberto && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-60 flex min-w-52 flex-col rounded-[0.9rem] border border-brand-mint bg-white p-1.5 shadow-[0_16px_36px_rgb(33_70_58/0.22)]" role="menu">
          <Link href="/minha-conta" role="menuitem" onClick={fechar} className={ITEM_AREA}>
            <UserRound size={16} aria-hidden="true" /> Minha conta
          </Link>
          <Link href="/mensagens" role="menuitem" onClick={fechar} className={ITEM_AREA}>
            <MessageCircle size={16} aria-hidden="true" /> Mensagens
            {naoLidas > 0 && <span className={cn(SELO_NAO_LIDAS, "ml-auto h-[1.2rem] min-w-[1.2rem] px-1 text-[0.68rem]")}>{naoLidas > 9 ? "9+" : naoLidas}</span>}
          </Link>
          <Link href="/minhas-coletas" role="menuitem" onClick={fechar} className={ITEM_AREA}>
            <ClipboardList size={16} aria-hidden="true" /> Minhas coletas
          </Link>
        </div>
      )}
    </div>
  );
}
