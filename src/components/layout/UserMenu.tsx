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

import Link from "next/link";
import { Menu, X, LogOut, LogIn, LayoutDashboard, ClipboardList } from "lucide-react";

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

          {perfil.tipo === "visitante" && (
            <Link href="/minhas-coletas" className="user-menu__button" title="Minhas coletas">
              <ClipboardList size={16} aria-hidden="true" />
              <span>Minhas coletas</span>
            </Link>
          )}

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
