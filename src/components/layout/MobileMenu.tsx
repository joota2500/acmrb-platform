"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";

import { navigation } from "./navItems";
import { smoothScrollTo } from "@/lib/scroll";

import "@/styles/mobile-menu.css";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  perfil?: any;
  logout?: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  user,
  perfil,
  logout,
}: MobileMenuProps) {
  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const id = href.replace("#", "");
      smoothScrollTo(id);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobileOverlay"
            onClick={onClose}
          />

          {/* Menu Slide */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mobileMenu"
          >
            <div className="mobileMenu__header">
              <button onClick={onClose} className="mobileMenu__close">
                ✕
              </button>
            </div>

            <div className="mobileMenu__content">
              {navigation.map((link, i) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      if (link.href.startsWith("#")) e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="mobileNavLink"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <div className="h-8"></div>

              {/* Login / Perfil */}
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
                      <p className="font-semibold">{perfil.nome}</p>
                      <p className="text-sm text-emerald-600">{perfil.tipo}</p>
                    </div>
                  </div>

                  {perfil.tipo === "admin" && (
                    <Link
                      href="/admin"
                      className="mobileMenu__admin-btn"
                      onClick={onClose}
                    >
                      Painel Admin
                    </Link>
                  )}

                  <button onClick={logout} className="mobileMenu__logout-btn">
                    <LogOut size={20} />
                    Sair
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="mobileMenu__login-btn"
                  onClick={onClose}
                >
                  Acessar Plataforma
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
