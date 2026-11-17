"use client";

/**
 * MobileMenu (gaveta lateral do celular/tablet, abaixo de 1024px)
 * ------------------------------------------------------------
 *  - Desliza da esquerda com Framer Motion, com fundo escurecido (overlay).
 *  - Fecha ao: clicar no X, clicar no overlay, apertar Esc ou clicar num link.
 *  - Enquanto aberto, trava a rolagem da página de fundo (body).
 *  - Mostra os mesmos links do desktop (constants/navegacao.ts) e, no final,
 *    o botão "Acessar Plataforma" (/login) ou os dados do usuário logado.
 *
 * Dados: user/perfil/logout vêm do Header (AuthContext / Supabase).
 * Navegação: a lógica de âncoras/topo fica no Header (onNavigate), para
 * desktop e mobile se comportarem igual.
 * Acessibilidade: role="dialog" + aria-modal, foco vai para o botão
 * fechar ao abrir, alvos de toque >=48px e foco visível.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ClipboardList, LogOut, LogIn, MessageCircle, Recycle, UserRound, X } from "lucide-react";
import { useChatNaoLidas } from "@/hooks/useChatNaoLidas";

import { usePathname } from "next/navigation";
import { CTA_MENU, hrefReal, itemAtivo, linkAtivo, navigation } from "@/constants/navegacao";
import { smoothScrollTo } from "@/utils/scroll";

import { cn } from "@/utils/cn";
import { FOCO_MENU, SELO_NAO_LIDAS } from "@/components/layout/classesMenu";

// Link grande do menu (celular)
const LINK_MOBILE = cn(
  "flex min-h-12 items-center rounded-[14px] px-[1.1rem] py-[0.7rem] text-base font-medium text-emerald-50 no-underline",
  "transition duration-300 hover:translate-x-2 hover:bg-emerald-500/20 hover:text-emerald-200 motion-reduce:hover:translate-x-0",
  FOCO_MENU,
);
// Item da página atual (destaque na gaveta)
const ATIVO_MOBILE = "bg-emerald-500/20 text-emerald-200";
// Botões largos da área do usuário (Minha conta, Painel, Sair, Acessar)
const BOTAO_MOBILE = cn(
  "mt-2 w-full cursor-pointer rounded-[14px] border-0 p-4 text-center font-semibold no-underline transition duration-300",
  FOCO_MENU,
);

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
  const pathname = usePathname();
  // ao abrir a gaveta, já deixa aberto o grupo da página em que a pessoa está
  const [subAberto, setSubAberto] = useState<string | null>(() => navigation.find((l) => l.children && itemAtivo(l, pathname))?.id ?? null);

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
            className="fixed inset-0 z-55 bg-black/70 backdrop-blur-[6px]"
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
            className="fixed left-0 top-0 z-60 h-dvh w-full max-w-95 overflow-y-auto overscroll-contain bg-emerald-900 shadow-[8px_0_40px_rgb(0_0_0/0.4)]"
          >
            {/* Topo da gaveta: nome + botão fechar */}
            <div className="flex items-center justify-between border-b border-emerald-500/25 px-6 py-5">
              <span className="text-[1.4rem] font-black tracking-[-1px] text-white">ACMRB</span>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                className={cn("flex size-12.5 cursor-pointer items-center justify-center rounded-xl text-emerald-200 transition-colors duration-300 hover:bg-white/10 hover:text-white", FOCO_MENU)}
                aria-label="Fechar menu"
              >
                <X size={26} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-6" aria-label="Menu principal">
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
                    <div>
                      <button
                        type="button"
                        className={cn(LINK_MOBILE, itemAtivo(link, pathname) && ATIVO_MOBILE, "w-full cursor-pointer justify-between border-0 bg-transparent text-left font-[inherit]")}
                        aria-expanded={subAberto === link.id}
                        aria-controls={`mobile-sub-${link.id}`}
                        onClick={() => setSubAberto((v) => (v === link.id ? null : link.id))}
                      >
                        {link.name}
                        <ChevronDown size={18} className={cn("opacity-80 transition-transform duration-200 motion-reduce:transition-none", subAberto === link.id && "rotate-180")} aria-hidden="true" />
                      </button>
                      <div id={`mobile-sub-${link.id}`} className="mb-1.5 ml-[1.1rem] mt-[0.1rem] flex flex-col gap-0.5 border-l-2 border-emerald-200/25 pl-3" hidden={subAberto !== link.id}>
                        {link.children.map((f) => (
                          <Link
                            key={f.id}
                            href={hrefReal(f.href)}
                            onClick={(e) => handleNavClick(e, f.href)}
                            aria-current={linkAtivo(f.href, pathname) ? "page" : undefined}
                            className={cn(
                              "flex min-h-11 items-center gap-2.5 rounded-xl px-[0.9rem] py-2 text-[0.95rem] no-underline transition-colors duration-300 hover:bg-emerald-500/20 hover:text-emerald-200 focus-visible:bg-emerald-500/20 focus-visible:text-emerald-200 focus-visible:outline-none",
                              linkAtivo(f.href, pathname) ? "bg-emerald-500/20 text-emerald-200" : "text-emerald-100",
                            )}
                          >
                            {f.icone && <f.icone size={17} className="flex-none text-emerald-300" aria-hidden="true" />}
                            {f.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={hrefReal(link.href)}
                      onClick={(e) => handleNavClick(e, link.href)}
                      aria-current={itemAtivo(link, pathname) ? "page" : undefined}
                      className={cn(LINK_MOBILE, itemAtivo(link, pathname) && ATIVO_MOBILE)}
                    >
                      {link.name}
                    </Link>
                  )}
                </motion.div>
              ))}

              {/* Botão de destaque */}
              <Link
                href={CTA_MENU.href}
                onClick={(e) => handleNavClick(e, CTA_MENU.href)}
                className={cn(BOTAO_MOBILE, "mt-4 flex items-center justify-center gap-2.5 bg-sun text-[1.05rem] font-bold text-emerald-950 hover:bg-yellow-300")}
              >
                <Recycle size={20} aria-hidden="true" /> {CTA_MENU.name}
              </Link>

              {/* ===== Login / Perfil ===== */}
              {user && perfil ? (
                <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-7">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex size-15.5 items-center justify-center overflow-hidden rounded-[14px] bg-emerald-500 text-[1.4rem] font-bold text-white">
                      {perfil.avatar_url ? (
                        <img src={perfil.avatar_url} alt={perfil.nome} className="size-full rounded-[14px] object-cover" />
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
                      <Link href="/minha-conta" className={cn(BOTAO_MOBILE, "block bg-emerald-500 text-white")} onClick={onClose}>
                        <UserRound size={18} aria-hidden="true" /> Minha conta
                      </Link>
                      <Link href="/mensagens" className={cn(BOTAO_MOBILE, "block bg-emerald-500 text-white")} onClick={onClose}>
                        <MessageCircle size={18} aria-hidden="true" /> Mensagens
                        {naoLidas > 0 && <span className={cn(SELO_NAO_LIDAS, "ml-auto h-[1.35rem] min-w-[1.35rem] px-1.5 text-[0.72rem]")} aria-label={`${naoLidas} não lidas`}>{naoLidas > 9 ? "9+" : naoLidas}</span>}
                      </Link>
                      <Link href="/minhas-coletas" className={cn(BOTAO_MOBILE, "block bg-emerald-500 text-white")} onClick={onClose}>
                        <ClipboardList size={18} aria-hidden="true" /> Minhas coletas
                      </Link>
                    </>
                  )}

                  {perfil.tipo === "admin" && (
                    <Link
                      href="/admin"
                      className={cn(BOTAO_MOBILE, "block bg-emerald-500 text-white")}
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
                    className={cn(BOTAO_MOBILE, "flex items-center justify-center gap-2.5 bg-red-500/20 text-red-300 hover:bg-red-500/35")}
                  >
                    <LogOut size={20} />
                    Sair
                  </button>
                </div>
              ) : (
                /* Mesmo destino do botão do desktop: /login */
                <Link
                  href="/login"
                  className={cn(BOTAO_MOBILE, "mt-8 flex items-center justify-center gap-2.5 bg-emerald-500 text-[1.15rem] text-white hover:bg-emerald-600")}
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
