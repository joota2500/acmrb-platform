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
 *  - navegacao.ts → lista de links do menu.
 *
 * Visual: Tailwind (verde esmeralda do cabeçalho).
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
import { Recycle } from "lucide-react";

import { useSecretUnlock } from "@/hooks/useSecretUnlock";
import { useAuth } from "@/contexts/AuthContext";

import { CTA_MENU, hrefReal, itemAtivo, navigation } from "@/constants/navegacao";
import NavDropdown from "@/components/layout/NavDropdown";
import UserMenu from "@/components/layout/UserMenu";
import MobileMenu from "@/components/layout/MobileMenu";
import AdminModal from "@/components/auth/AdminModal";
import { cn } from "@/utils/cn";
import { BOTAO_CTA, LINK_NAV, LINK_NAV_ATIVO } from "@/components/layout/classesMenu";

import { smoothScrollTo } from "@/utils/scroll";

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
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-emerald-500/25 shadow-[0_4px_30px_rgb(6_78_59/0.25)] backdrop-blur-xl",
          "transition-[background-color,box-shadow] duration-300",
          scrolled ? "bg-emerald-900/98" : "bg-emerald-900/95",
        )}
      >
        {/* Container central: logo | menu | ações. A altura só muda no desktop ao rolar. */}
        <div
          className={cn(
            "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-300 sm:h-18 sm:px-6 lg:h-20 lg:px-8",
            scrolled && "lg:h-17",
          )}
        >
          {/* ===== Logo (clique = topo/home + contador secreto) ===== */}
          <button
            type="button"
            onClick={handleLogoClick}
            className={cn(
              "flex min-h-11 shrink-0 cursor-pointer items-center gap-2.5 rounded-xl p-0 transition-transform duration-300 hover:scale-[1.03] sm:gap-3.5",
              "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-200",
            )}
            aria-label="ACMRB - voltar ao início"
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 text-[1.6rem] leading-none text-white shadow-[0_8px_20px_rgb(16_185_129/0.4),inset_0_2px_4px_rgb(255_255_255/0.25)] sm:size-11.5 sm:text-[1.9rem] xl:size-13 xl:text-[2.25rem]"
              aria-hidden="true"
            >
              ♻
            </span>
            <span className="flex flex-col text-left leading-none">
              <span className="text-2xl font-black tracking-[-1.5px] text-white sm:text-[1.75rem] sm:tracking-[-2px] xl:text-3xl xl:tracking-[-2.5px]">
                ACMRB
              </span>
              {/* Subtítulo escondido no celular para não apertar o hambúrguer */}
              <span className="mt-[0.2rem] hidden whitespace-nowrap text-[0.8rem] font-medium tracking-[0.02em] text-emerald-200 sm:block lg:hidden xl:block xl:text-sm">
                Associação dos Catadores
              </span>
            </span>
          </button>

          {/* ===== Menu horizontal (somente desktop >=1024px) ===== */}
          <nav
            className="hidden items-center gap-5 text-[15px] font-medium lg:flex xl:gap-7 xl:text-[15.5px]"
            aria-label="Menu principal"
          >
            {navigation.filter((link) => !link.soMobile).map((link) =>
              link.children?.length ? (
                // Item com submenu (A Associação, Coleta, Parceiros)
                <NavDropdown key={link.id} item={link} onNavigate={navigateTo} ativo={itemAtivo(link, pathname)} />
              ) : (
                <Link
                  key={link.id}
                  href={hrefReal(link.href)}
                  onClick={(e) => {
                    if (navigateTo(link.href)) e.preventDefault();
                  }}
                  aria-current={itemAtivo(link, pathname) ? "page" : undefined}
                  className={cn(LINK_NAV, itemAtivo(link, pathname) && LINK_NAV_ATIVO)}
                >
                  {link.name}
                </Link>
              ),
            )}
          </nav>

          {/* ===== Ações: botão de destaque + login/perfil + hambúrguer ===== */}
          <div className="flex items-center gap-3">
            {/* ===== Botão de destaque (só telas largas; abaixo disso ele está no submenu Coleta e na gaveta) ===== */}
            <Link href={CTA_MENU.href} className={cn(BOTAO_CTA, "hidden sm:inline-flex lg:hidden xl:inline-flex")}>
              <Recycle size={17} aria-hidden="true" /> {CTA_MENU.name}
            </Link>

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
