"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";

import AdminModal from "../admin/AdminModal";
import { useSecretUnlock } from "@/hooks/useSecretUnlock";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { name: "Início", href: "#" },
  { name: "Quem Somos", href: "#quem-somos" }, 
  { name: "Ações", href: "#projetos" },
  { name: "Transparência", href: "#transparencia" },
  { name: "Notícias", href: "#noticias" },
  { name: "Contato", href: "#contato" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { unlocked, handleSecretClick, closeAdmin } = useSecretUnlock();
  const { user, perfil, logout, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl border-b border-emerald-100 dark:border-slate-800 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          {/* Logo - Centralizado em mobile */}
          <button
            onClick={handleSecretClick}
            className="flex items-center gap-4 group flex-1 md:flex-none"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-3xl bg-emerald-800 flex items-center justify-center text-4xl shadow-inner ring-8 ring-emerald-100 dark:ring-emerald-950/50">
              ♻
            </div>
            <div className="leading-none text-left">
              <div className="font-black text-2xl md:text-3xl tracking-[-2px] text-emerald-950 dark:text-white">
                ACMRB
              </div>
              <div className="text-xs md:text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Associação dos Catadores
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10 text-[15px] font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-emerald-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
            {!loading && user && perfil ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-700">
                  <div className="text-right">
                    <p className="font-semibold text-sm">{perfil.nome}</p>
                    <p className="text-xs text-emerald-600 capitalize">
                      {perfil.tipo}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-emerald-100">
                    {perfil.avatar_url ? (
                      <img
                        src={perfil.avatar_url}
                        alt=""
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-700 text-white flex items-center justify-center text-xl font-bold">
                        {perfil.nome?.[0] || "U"}
                      </div>
                    )}
                  </div>
                </div>

                {perfil.tipo === "admin" && (
                  <Link
                    href="/admin"
                    className="px-7 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-2xl transition-all active:scale-95"
                  >
                    Painel
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-3 hover:bg-red-50 rounded-2xl text-red-500 hover:text-red-600 transition"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:block px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-2xl transition-all"
              >
                Acessar Plataforma
              </Link>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-4 text-slate-700 dark:text-slate-300"
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu - Melhorado e Responsivo */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white dark:bg-slate-950 lg:hidden pt-24 overflow-y-auto"
          >
            <div className="px-8 py-10 flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-5 text-xl font-medium border-b border-slate-100 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-2xl px-4 transition"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminModal open={unlocked} onClose={closeAdmin} />
    </>
  );
}
