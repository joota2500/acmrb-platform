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
 * alvos de toque de 48px e foco visível (user-menu.css).
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, LogIn, LayoutDashboard, ClipboardList, ChevronDown, MessageCircle, UserRound } from "lucide-react";
import { useChatNaoLidas } from "@/hooks/useChatNaoLidas";

import "@/styles/user-menu.css";

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
    <div className="user-menu">
      {/* ===== Usuário logado (desktop) ===== */}
      {!loading && user && perfil ? (
        <div className="user-menu__desktop">
          {/* Perfil compacto: só o avatar; nome e papel aparecem ao passar o mouse */}
          <div className="user-menu__profile" title={`${perfil.nome ?? "Usuário"} • ${perfil.tipo ?? "Associado"}`}>
            <div className="user-menu__info">
              <span className="user-menu__name">
                {perfil.nome ?? "Usuário"}
              </span>
              <span className="user-menu__role">
                {perfil.tipo ?? "Associado"}
              </span>
            </div>

            <div className="user-menu__avatar">
              {perfil.avatar_url ? (
                <img src={perfil.avatar_url} alt={perfil.nome ?? "Usuário"} />
              ) : (
                <span>{(perfil.nome ?? "U").charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          {perfil.tipo === "visitante" && <MenuVisitante />}

          {perfil.tipo === "admin" && (
            <Link href="/admin" className="user-menu__button" title="Painel Admin">
              <LayoutDashboard size={16} aria-hidden="true" />
              <span>Painel</span>
            </Link>
          )}

          <button
            type="button"
            onClick={logout}
            className="user-menu__logout"
            title="Sair"
            aria-label="Sair da conta"
          >
            <LogOut size={17} />
          </button>
        </div>
      ) : (
        /* ===== Botão "Acessar Plataforma" (desktop) — mesmo destino: /login ===== */
        <Link href="/login" className="user-menu__login">
          <LogIn size={16} aria-hidden="true" />
          <span>Entrar</span>
        </Link>
      )}

      {/* ===== Hambúrguer (abaixo de 1024px) — alterna abrir/fechar ===== */}
      <button
        type="button"
        className="user-menu__hamburger"
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
    <div className="user-menu__area" ref={caixaRef}>
      <button
        type="button"
        className="user-menu__button"
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((a) => !a)}
      >
        <UserRound size={16} aria-hidden="true" />
        <span>Minha área</span>
        {naoLidas > 0 && <span className="user-menu__selo" aria-label={`${naoLidas} mensagens não lidas`}>{naoLidas > 9 ? "9+" : naoLidas}</span>}
        <ChevronDown size={14} aria-hidden="true" className={aberto ? "user-menu__seta--aberta" : undefined} />
      </button>
      {aberto && (
        <div className="user-menu__dropdown" role="menu">
          <Link href="/minha-conta" role="menuitem" onClick={fechar}>
            <UserRound size={16} aria-hidden="true" /> Minha conta
          </Link>
          <Link href="/mensagens" role="menuitem" onClick={fechar}>
            <MessageCircle size={16} aria-hidden="true" /> Mensagens
            {naoLidas > 0 && <span className="user-menu__selo">{naoLidas > 9 ? "9+" : naoLidas}</span>}
          </Link>
          <Link href="/minhas-coletas" role="menuitem" onClick={fechar}>
            <ClipboardList size={16} aria-hidden="true" /> Minhas coletas
          </Link>
        </div>
      )}
    </div>
  );
}
