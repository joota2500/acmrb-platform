"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { useSecretUnlock } from "@/hooks/useSecretUnlock";
import { useAuth } from "@/contexts/AuthContext";

import { navigation } from "./navItems";
import UserMenu from "./UserMenu";
import AdminModal from "@/components/admin/AdminModal";
import "@/styles/header.css";

import { smoothScrollTo } from "@/lib/scroll";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { unlocked, handleSecretClick, closeAdmin } = useSecretUnlock();
  const { user, perfil, logout, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Função de navegação com scroll suave
  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const id = href.replace("#", "");
      smoothScrollTo(id);
    }
    setMenuOpen(false); // fecha o menu mobile após clicar
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <motion.header
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        className={`header ${scrolled ? "scrolled" : ""}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={handleSecretClick}
            className="logo"
            aria-label="Logo ACMRB"
          >
            <div className="logoIcon">♻</div>
            <div className="leading-none text-left">
              <div className="font-black text-3xl tracking-[-2.5px] text-emerald-950 dark:text-white">
                ACMRB
              </div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">
                Associação dos Catadores
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="desktopNav">
            {navigation.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith("#")) {
                    e.preventDefault(); // impede o comportamento padrão
                    handleNavClick(link.href);
                  }
                }}
                className="navLink"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <UserMenu
            loading={loading}
            user={user}
            perfil={perfil}
            logout={logout}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
          />
        </div>
      </motion.header>

      {/* Mobile Menu - Slide da Esquerda */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <AdminModal open={unlocked} onClose={closeAdmin} />
    </>
  );
}
