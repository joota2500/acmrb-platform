"use client";

/**
 * MobileMenu (gaveta lateral do celular/tablet, abaixo de 1024px)
 * ------------------------------------------------------------
 *  - Desliza da esquerda com Framer Motion, com fundo escurecido (overlay).
 *  - Fecha ao: clicar no X, clicar no overlay, apertar Esc ou clicar num link.
 *  - Enquanto aberto, trava a rolagem da página de fundo (body).
 *  - Mostra os mesmos links do desktop (navItems.ts) e, no final,
 *    o botão "Acessar Plataforma" (/login) ou os dados do usuário logado.
 *
 * Dados: user/perfil/logout vêm do Header (AuthContext / Supabase).
 * Navegação: a lógica de âncoras/topo fica no Header (onNavigate), para
 * desktop e mobile se comportarem igual.
 * Acessibilidade: role="dialog" + aria-modal, foco vai para o botão
 * fechar ao abrir, alvos de toque >=48px e foco visível (mobile-menu.css).
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ClipboardList, LogOut, LogIn, MessageCircle, UserRound, X } from "lucide-react";
import { useChatNaoLidas } from "@/hooks/useChatNaoLidas";

import { hrefReal, navigation } from "./navItems";
import { smoothScrollTo } from "@/lib/scroll";

import "@/styles/mobile-menu.css";

interface MobileMenuProps {
  /** id usado pelo aria-controls do botão hambúrguer */
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  /**
   * Navegação vinda do Header. Retorna true quando já tratou o clique
   * (âncora/topo) e o Link não deve navegar sozinho.
   */
  onNavigate?: (href: string) => boolean;
  user?: any;
  perfil?: any;
  logout?: () => void;
}

export default function MobileMenu({
  id,
  isOpen,
  onClose,
  onNavigate,
  user,
  perfil,
  logout,
}: MobileMenuProps) {
  // Referência do botão fechar, para receber o foco quando o menu abre
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  // Respostas da equipe ainda não lidas (só visitante logado)
  const naoLidas = useChatNaoLidas(!!user && perfil?.tipo === "visitante");

  // Esc fecha o menu + trava a rolagem do body enquanto estiver aberto
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflowAnterior;
    };
  }, [isOpen, onClose]);

  // Clique num link: usa a navegação do Header; se não houver, faz o
  // comportamento antigo (rolagem suave para âncoras) e fecha o menu.
  // Submenu aberto no celular (id do item pai) — um por vez
  const [subAberto, setSubAberto] = useState<string | null>(null);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (onNavigate) {
      if (onNavigate(href)) e.preventDefault();
      onClose();
      return;
    }
    if (href.startsWith("#")) {
      e.preventDefault();
      smoothScrollTo(href.slice(1));
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fundo escurecido: clicar fora fecha o menu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobileOverlay"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Gaveta lateral */}
          <motion.div
            id={id}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mobileMenu"
          >
            {/* Topo da gaveta: nome + botão fechar */}
            <div className="mobileMenu__header">
              <span className="mobileMenu__title">ACMRB</span>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                className="mobileMenu__close"
                aria-label="Fechar menu"
              >
                <X size={26} />
              </button>
            </div>

            <nav className="mobileMenu__content" aria-label="Menu principal">
              {/* Links (entrada escalonada) */}
              {navigation.map((link, i) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {link.children?.length ? (
                    /* Submenu: toque no item para expandir (Coleta, Contato) */
                    <div className={`mobileSub${subAberto === link.id ? " mobileSub--aberto" : ""}`}>
                      <button
                        type="button"
                        className="mobileNavLink mobileSub__botao"
                        aria-expanded={subAberto === link.id}
                        aria-controls={`mobile-sub-${link.id}`}
                        onClick={() => setSubAberto((v) => (v === link.id ? null : link.id))}
                      >
                        {link.name}
                        <ChevronDown size={18} className="mobileSub__seta" aria-hidden="true" />
                      </button>
                      <div id={`mobile-sub-${link.id}`} className="mobileSub__lista" hidden={subAberto !== link.id}>
                        {link.children.map((f) => (
                          <Link
                            key={f.id}
                            href={hrefReal(f.href)}
                            onClick={(e) => handleNavClick(e, f.href)}
                            className="mobileSub__link"
                          >
                            {f.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={hrefReal(link.href)}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="mobileNavLink"
                    >
                      {link.name}
                    </Link>
                  )}
                </motion.div>
              ))}

              {/* ===== Login / Perfil ===== */}
              {user && perfil ? (
                <div className="mobileMenu__user-section">
                  <div className="mobileMenu__user-info">
                    <div className="mobileMenu__avatar">
                      {perfil.avatar_url ? (
                        <img src={perfil.avatar_url} alt={perfil.nome} />
                      ) : (
                        <span>
                          {(perfil.nome ?? "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{perfil.nome}</p>
                      <p className="text-sm text-emerald-300">{perfil.tipo}</p>
                    </div>
                  </div>

                  {perfil.tipo === "visitante" && (
                    <>
                      <Link href="/minha-conta" className="mobileMenu__admin-btn" onClick={onClose}>
                        <UserRound size={18} aria-hidden="true" /> Minha conta
                      </Link>
                      <Link href="/mensagens" className="mobileMenu__admin-btn" onClick={onClose}>
                        <MessageCircle size={18} aria-hidden="true" /> Mensagens
                        {naoLidas > 0 && <span className="mobileMenu__selo" aria-label={`${naoLidas} não lidas`}>{naoLidas > 9 ? "9+" : naoLidas}</span>}
                      </Link>
                      <Link href="/minhas-coletas" className="mobileMenu__admin-btn" onClick={onClose}>
                        <ClipboardList size={18} aria-hidden="true" /> Minhas coletas
                      </Link>
                    </>
                  )}

                  {perfil.tipo === "admin" && (
                    <Link
                      href="/admin"
                      className="mobileMenu__admin-btn"
                      onClick={onClose}
                    >
                      Painel Admin
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      logout?.();
                      onClose();
                    }}
                    className="mobileMenu__logout-btn"
                  >
                    <LogOut size={20} />
                    Sair
                  </button>
                </div>
              ) : (
                /* Mesmo destino do botão do desktop: /login */
                <Link
                  href="/login"
                  className="mobileMenu__login-btn"
                  onClick={onClose}
                >
                  <LogIn size={20} aria-hidden="true" />
                  Acessar Plataforma
                </Link>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
