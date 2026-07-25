"use client";

import Link from "next/link";
import { Menu, LogOut } from "lucide-react";

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
}

export default function UserMenu({
  loading,
  user,
  perfil,
  logout,
  menuOpen,
  setMenuOpen,
}: Props) {
  return (
    <div className="user-menu">
      {/* Desktop Version */}
      {!loading && user && perfil ? (
        <div className="user-menu__desktop">
          <div className="user-menu__profile">
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

          {perfil.tipo === "admin" && (
            <Link href="/admin" className="user-menu__button">
              Painel Admin
            </Link>
          )}

          <button onClick={logout} className="user-menu__logout" title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      ) : (
        /* Botão Acessar Plataforma - Mantido original */
        <Link href="/login" className="user-menu__login">
          Acessar Plataforma
        </Link>
      )}

      {/* Hambúrguer - Só aparece em mobile/tablet */}
      <button
        className="user-menu__hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menu"
      >
        <Menu size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
}
