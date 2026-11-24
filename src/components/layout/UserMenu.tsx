"use client";

/**
 * UserMenu (lado direito do Header)
 * ------------------------------------------------------------
 *  - Deslogado: botão "Acessar Plataforma" → /login (só desktop >=1024px;
 *    em telas menores o mesmo botão aparece dentro do MobileMenu).
 *  - Logado: botão com avatar + primeiro nome que abre o menu da conta (itens + Sair).
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
  const email = (user as { email?: string } | null)?.email;
  return (
    <div className="flex items-center gap-2.5 sm:gap-4">
      {/* ===== Usuário logado (desktop): botão com avatar + primeiro nome que abre o menu ===== */}
      {!loading && user && perfil ? (
        <div className="hidden lg:block">
          <MenuConta perfil={perfil} email={email} logout={logout} />
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

// Avatar redondo: foto ou a inicial do nome (usado aqui e no menu do celular)
export function AvatarUsuario({ perfil, className }: { perfil: Perfil; className?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 font-bold text-white ring-2 ring-white/30", className)} aria-hidden="true">
      {perfil.avatar_url ? (
        <img src={perfil.avatar_url} alt="" className="size-full object-cover" />
      ) : (
        (perfil.nome ?? "U").trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}

// nome do papel para mostrar embaixo do nome
export const nomePapel = (tipo?: string | null) => (tipo === "admin" ? "Administrador" : tipo === "visitante" ? "Visitante" : "Associado");

/**
 * Menu da conta (desktop): avatar + primeiro nome + seta.
 * Itens: Minha conta / Mensagens / Minhas coletas (visitante), Painel (admin) e Sair.
 * Abre por clique/Enter, setas ↑↓ andam entre os itens, fecha com Esc ou clique fora.
 */
const ITEM_AREA =
  "flex items-center gap-2.5 rounded-[0.6rem] px-3 py-2.5 text-[0.88rem] font-bold text-brand-dark no-underline transition hover:bg-brand-soft focus-visible:bg-brand-soft focus-visible:outline-0";

function MenuConta({ perfil, email, logout }: { perfil: Perfil; email?: string; logout: () => void }) {
  const [aberto, setAberto] = useState(false);
  const naoLidas = useChatNaoLidas(perfil.tipo === "visitante");
  const caixaRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  const primeiroNome = (perfil.nome ?? "Usuário").trim().split(/\s+/)[0];

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!caixaRef.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  // setas para cima/baixo andam pelos itens do menu
  function teclas(e: React.KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const itens = Array.from(listaRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    const i = itens.indexOf(document.activeElement as HTMLElement);
    const prox = e.key === "ArrowDown" ? (i + 1) % itens.length : (i - 1 + itens.length) % itens.length;
    itens[prox]?.focus();
  }

  const fechar = () => setAberto(false);

  return (
    <div className="relative" ref={caixaRef}>
      <button
        ref={botaoRef}
        type="button"
        className={cn(
          "flex h-11 cursor-pointer items-center gap-2 rounded-full bg-white/10 py-1 pr-3 pl-1 text-[0.85rem] font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20",
          FOCO_MENU,
        )}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={`Menu da conta de ${perfil.nome ?? "usuário"}`}
        onClick={() => setAberto((a) => !a)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setAberto(true);
            setTimeout(() => listaRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus(), 0);
          }
        }}
      >
        <span className="relative">
          <AvatarUsuario perfil={perfil} className="size-9 text-sm" />
          {naoLidas > 0 && <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-red-500 ring-2 ring-emerald-900" aria-hidden="true" />}
        </span>
        <span className="max-w-28 truncate">{primeiroNome}</span>
        <ChevronDown size={15} aria-hidden="true" className={cn("transition-transform", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div
          ref={listaRef}
          onKeyDown={teclas}
          className="absolute right-0 top-[calc(100%+0.6rem)] z-60 w-64 origin-top-right animate-aparecer overflow-hidden rounded-2xl border border-brand-mint bg-white shadow-[0_18px_40px_rgb(33_70_58/0.25)]"
          role="menu"
          aria-label="Minha conta"
        >
          {/* cabeçalho com nome, e-mail e papel */}
          <div className="flex items-center gap-3 border-b border-brand-mint bg-brand-soft/60 px-4 py-3.5">
            <AvatarUsuario perfil={perfil} className="size-10 text-base ring-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-brand-dark">{perfil.nome ?? "Usuário"}</p>
              {email && <p className="truncate text-xs text-zinc-500">{email}</p>}
              <span className="mt-1 inline-block rounded-full bg-brand-mint px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-brand-dark">{nomePapel(perfil.tipo)}</span>
            </div>
          </div>

          <div className="flex flex-col p-1.5">
            {perfil.tipo === "visitante" && (
              <>
                <Link href="/minha-conta" role="menuitem" onClick={fechar} className={ITEM_AREA}>
                  <UserRound size={17} aria-hidden="true" /> Minha conta
                </Link>
                <Link href="/mensagens" role="menuitem" onClick={fechar} className={ITEM_AREA}>
                  <MessageCircle size={17} aria-hidden="true" /> Mensagens
                  {naoLidas > 0 && <span className={cn(SELO_NAO_LIDAS, "ml-auto h-[1.2rem] min-w-[1.2rem] px-1 text-[0.68rem]")} aria-label={`${naoLidas} mensagens não lidas`}>{naoLidas > 9 ? "9+" : naoLidas}</span>}
                </Link>
                <Link href="/minhas-coletas" role="menuitem" onClick={fechar} className={ITEM_AREA}>
                  <ClipboardList size={17} aria-hidden="true" /> Minhas coletas
                </Link>
              </>
            )}
            {perfil.tipo === "admin" && (
              <Link href="/admin" role="menuitem" onClick={fechar} className={ITEM_AREA}>
                <LayoutDashboard size={17} aria-hidden="true" /> Painel admin
              </Link>
            )}
          </div>

          {/* Sair separado, em vermelho */}
          <div className="border-t border-brand-mint p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                fechar();
                logout();
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-[0.6rem] px-3 py-2.5 text-[0.88rem] font-bold text-red-600 transition hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-0"
            >
              <LogOut size={17} aria-hidden="true" /> Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
