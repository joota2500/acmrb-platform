"use client";

/**
 * Header (cabeçalho fixo do site)
 * ------------------------------------------------------------
 * O que faz:
 *  - Mostra a logo, o menu de navegação e o botão "Acessar Plataforma"
 *    (ou os dados do usuário logado, via UserMenu).
 *  - Abre o MobileMenu (gaveta lateral) em telas menores.
 *  - Mantém o recurso secreto: 5 cliques rápidos na logo abrem o
 *    AdminModal (hook useSecretUnlock).
 *
 * De onde vêm os dados:
 *  - useAuth() (AuthContext) → user, perfil, logout, loading (Supabase Auth).
 *  - navItems.ts → lista de links do menu.
 *
 * Responsividade:
 *  - Celular (<640px): altura ~64px, logo menor, subtítulo escondido,
 *    só logo + botão hambúrguer.
 *  - Tablet (640–1023px): altura ~72px, logo com subtítulo, hambúrguer.
 *    O menu horizontal NÃO aparece aqui para não quebrar linha/estourar.
 *  - Desktop (>=1024px): menu horizontal + botão "Acessar Plataforma".
 *    Entre 1024 e 1279px o espaçamento do menu é reduzido para caber.
 *
 * Mudanças desta versão (feat(header)):
 *  - Clique na logo agora também leva ao topo / página inicial,
 *    sem atrapalhar a contagem dos 5 cliques secretos.
 *  - Links "#âncora" funcionam também fora da página inicial
 *    (redirecionam para "/#secao").
 *  - "Início" rola suavemente ao topo quando já estamos em "/".
 *  - Altura do header não "pula" mais ao rolar (antes o padding somava).
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { useSecretUnlock } from "@/hooks/useSecretUnlock";
import { useAuth } from "@/contexts/AuthContext";

import { navigation } from "./navItems";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";
import AdminModal from "@/components/admin/AdminModal";
import "@/styles/header.css";

import { smoothScrollTo } from "@/lib/scroll";

/** ID usado pelo aria-controls do botão hambúrguer. */
const MOBILE_MENU_ID = "menu-mobile";

export default function Header() {
  // true quando a página foi rolada mais de 40px (header fica mais compacto)
  const [scrolled, setScrolled] = useState(false);
  // controla a abertura do menu mobile (gaveta lateral)
  const [menuOpen, setMenuOpen] = useState(false);

  // Função estável (useCallback) para o MobileMenu não refazer seus efeitos
  // (Esc / trava de rolagem) a cada renderização do Header.
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const pathname = usePathname();
  const router = useRouter();

  // Recurso secreto: conta cliques na logo e abre o AdminModal no 5º clique
  const { unlocked, handleSecretClick, closeAdmin } = useSecretUnlock();
  // Dados de autenticação vindos do Supabase (AuthContext)
  const { user, perfil, logout, loading } = useAuth();

  // Observa a rolagem para aplicar a classe "scrolled".
  // passive: true melhora o desempenho da rolagem no celular.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll(); // aplica o estado correto se a página já abrir rolada
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Navegação dos links do menu (usada no desktop e no mobile).
   *  - "#secao" na home → rolagem suave até a seção.
   *  - "#secao" em outra página → vai para "/#secao".
   *  - "/" estando na home → rolagem suave até o topo.
   * Retorna true quando tratou o clique (para o Link não navegar sozinho).
   */
  const navigateTo = (href: string): boolean => {
    setMenuOpen(false); // sempre fecha o menu mobile ao clicar num link
    const isHome = pathname === "/";

    if (href.startsWith("#")) {
      if (isHome) {
        smoothScrollTo(href.slice(1));
      } else {
        router.push(`/${href}`);
      }
      return true;
    }

    if (href === "/" && isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }

    return false; // deixa o <Link> navegar normalmente
  };

  /**
   * Clique na logo:
   *  1. Conta o clique secreto (5 cliques → AdminModal). Chamado primeiro
   *     e sempre, então o contador continua funcionando.
   *  2. Comportamento normal: topo da página (na home) ou ir para "/".
   * Observação: fora da home, o 1º clique navega para "/" e o Header é
   * montado de novo, então o contador recomeça lá — o atalho secreto
   * deve ser feito na página inicial.
   */
  const handleLogoClick = () => {
    handleSecretClick();
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        className={`header ${scrolled ? "scrolled" : ""}`}
      >
        {/* Container central: altura controlada no header.css (.header__inner) */}
        <div className="header__inner">
          {/* ===== Logo (clique = topo/home + contador secreto) ===== */}
          <button
            type="button"
            onClick={handleLogoClick}
            className="logo header__logo"
            aria-label="ACMRB - voltar ao início"
          >
            <span className="logoIcon" aria-hidden="true">
              ♻
            </span>
            <span className="header__brand">
              <span className="header__brand-title">ACMRB</span>
              <span className="header__brand-subtitle">
                Associação dos Catadores
              </span>
            </span>
          </button>

          {/* ===== Menu horizontal (somente desktop >=1024px) ===== */}
          <nav className="desktopNav" aria-label="Menu principal">
            {navigation.map((link) => (
              <Link
                key={link.id}
                // Âncoras viram "/#id" para funcionar em qualquer página (e no clique do meio)
                href={link.href.startsWith("#") ? `/${link.href}` : link.href}
                onClick={(e) => {
                  if (navigateTo(link.href)) e.preventDefault();
                }}
                className="navLink"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* ===== Área do usuário: login/perfil + botão hambúrguer ===== */}
          <UserMenu
            loading={loading}
            user={user}
            perfil={perfil}
            logout={logout}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            menuId={MOBILE_MENU_ID}
          />
        </div>
      </motion.header>

      {/* ===== Menu mobile (gaveta que desliza da esquerda) ===== */}
      <MobileMenu
        id={MOBILE_MENU_ID}
        isOpen={menuOpen}
        onClose={closeMenu}
        onNavigate={navigateTo}
        user={user}
        perfil={perfil}
        logout={logout}
      />

      {/* Modal secreto do admin (aberto pelos 5 cliques na logo) */}
      <AdminModal open={unlocked} onClose={closeAdmin} />
    </>
  );
}
