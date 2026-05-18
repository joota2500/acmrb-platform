"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Menu,
  X,
  ArrowRight,
  User,
  LogOut,
} from "lucide-react";

import AdminModal from "../admin/AdminModal";

import { useSecretUnlock } from "../../hooks/useSecretUnlock";

import { useAuth } from "@/contexts/AuthContext";

const links = [
  {
    name: "Início",
    href: "#",
  },

  {
    name: "Quem Somos",
    href: "#quem-somos",
  },

  {
    name: "Projetos",
    href: "#projetos",
  },

  {
    name: "Notícias",
    href: "#noticias",
  },

  {
    name: "Parcerias",
    href: "#parceiros",
  },

  {
    name: "Denúncias",
    href: "#denuncias",
  },

  {
    name: "Contato",
    href: "#contato",
  },
];

export default function Header() {

  const [scrolled, setScrolled] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const {
    unlocked,
    handleSecretClick,
    closeAdmin,
  } = useSecretUnlock();

  const {
    user,
    perfil,
    logout,
    loading,
  } = useAuth();

  useEffect(() => {

    const handleScroll = () => {

      setScrolled(
        window.scrollY > 20,
      );

    };

    window.addEventListener(
      "scroll",
      handleScroll,
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll,
      );

  }, []);

  useEffect(() => {

    if (menuOpen) {

      document.body.style.overflow =
        "hidden";

    } else {

      document.body.style.overflow =
        "auto";

    }

    return () => {

      document.body.style.overflow =
        "auto";

    };

  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{
          duration: 0.6,
        }}
        className="
          fixed
          top-0
          left-0
          w-full
          z-50
        "
      >

        <div
          className="
            container-custom
            pt-3
            md:pt-4
          "
        >

          <div
            className={`
              relative
              flex
              items-center
              justify-between
              rounded-4xl
              border
              transition-all
              duration-300
              px-5
              md:px-7
              lg:px-9
              ${
                scrolled
                  ? `
                    py-2.5
                    bg-white/88
                    backdrop-blur-2xl
                    border-white/40
                    shadow-[0_15px_60px_rgba(15,23,42,0.08)]
                  `
                  : `
                    py-3
                    bg-white/68
                    backdrop-blur-xl
                    border-white/20
                  `
              }
            `}
          >

            {/* LOGO */}

            <button
              onClick={handleSecretClick}
              className="
                flex
                items-center
                gap-3
                md:gap-4
                shrink-0
              "
            >

              <div
                className="
                  w-10
                  h-10
                  md:w-11
                  md:h-11
                  rounded-[18px]
                  bg-linear-to-br
                  from-[#2E5E4E]
                  to-[#5F9B83]
                  flex
                  items-center
                  justify-center
                  text-white
                  text-base
                  md:text-lg
                  font-black
                  shadow-[0_10px_30px_rgba(46,94,78,0.35)]
                "
              >

                ♻

              </div>

              <div className="text-left">

                <h2
                  className="
                    text-[15px]
                    md:text-lg
                    font-black
                    text-[#111827]
                    leading-none
                    tracking-tight
                  "
                >

                  ACMRB

                </h2>

                <p
                  className="
                    hidden
                    sm:block
                    text-[11px]
                    md:text-xs
                    text-zinc-500
                    mt-1
                    leading-none
                  "
                >

                  Associação Reciclaê • Baturité CE

                </p>

              </div>

            </button>

            {/* DESKTOP MENU */}

            <nav
              className="
                hidden
                lg:flex
                items-center
                gap-6
              "
            >

              {links.map((link) => (

                <a
                  key={link.name}
                  href={link.href}
                  className="
                    relative
                    text-[14px]
                    font-semibold
                    text-zinc-700
                    hover:text-[#2E5E4E]
                    transition-all
                    duration-300
                    group
                  "
                >

                  {link.name}

                  <span
                    className="
                      absolute
                      left-0
                      -bottom-2
                      w-0
                      h-0.5
                      rounded-full
                      bg-[#2E5E4E]
                      transition-all
                      duration-300
                      group-hover:w-full
                    "
                  />

                </a>

              ))}

            </nav>

            {/* RIGHT */}

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              {/* USER / AUTH */}

              {!loading && (

                <>
                
                  {user && perfil ? (

                    <div
                      className="
                        hidden
                        md:flex
                        items-center
                        gap-3
                      "
                    >

                      {/* AVATAR */}

                      <div
                        className="
                          relative
                          shrink-0
                        "
                      >

                        {perfil.avatar_url ? (

                          <img
                            src={
                              perfil.avatar_url
                            }
                            alt={perfil.nome}
                            className="
                              w-11
                              h-11
                              rounded-2xl
                              object-cover
                              border
                              border-black/5
                              shadow-lg
                            "
                          />

                        ) : (

                          <div
                            className="
                              w-11
                              h-11
                              rounded-2xl
                              bg-[#2E5E4E]
                              flex
                              items-center
                              justify-center
                              text-white
                              font-black
                              text-sm
                              shadow-lg
                            "
                          >

                            {perfil.nome
                              ?.charAt(0)
                              .toUpperCase()}

                          </div>

                        )}

                        {/* STATUS */}

                        <div
                          className={`
                            absolute
                            -bottom-1
                            -right-1
                            px-2
                            py-1
                            rounded-full
                            text-[10px]
                            font-black
                            border
                            shadow-sm
                            ${
                              perfil.tipo ===
                              "admin"
                                ? `
                                  bg-emerald-100
                                  text-emerald-700
                                  border-emerald-200
                                `
                                : `
                                  bg-zinc-100
                                  text-zinc-600
                                  border-zinc-200
                                `
                            }
                          `}
                        >

                          {perfil.tipo ===
                          "admin"
                            ? "ADMIN"
                            : "USER"}

                        </div>

                      </div>

                      {/* INFO */}

                      <div
                        className="
                          flex
                          flex-col
                          leading-none
                          min-w-0
                        "
                      >

                        <span
                          className="
                            text-sm
                            font-black
                            text-zinc-800
                            truncate
                            max-w-40
                          "
                        >

                          {perfil.nome}

                        </span>

                        <span
                          className="
                            text-xs
                            text-zinc-500
                            truncate
                            max-w-44
                          "
                        >

                          {perfil.role}

                        </span>

                      </div>

                      {/* ADMIN BUTTON */}

                      {perfil.tipo ===
                        "admin" && (

                        <Link
                          href="/admin"
                          className="
                            h-11
                            px-4
                            rounded-2xl
                            bg-[#2E5E4E]
                            hover:bg-[#23473A]
                            text-white
                            text-sm
                            font-black
                            flex
                            items-center
                            justify-center
                            transition-all
                            shadow-lg
                          "
                        >

                          Painel

                        </Link>

                      )}

                      {/* LOGOUT */}

                      <button
                        onClick={logout}
                        className="
                          w-11
                          h-11
                          rounded-2xl
                          border
                          border-black/5
                          bg-white
                          flex
                          items-center
                          justify-center
                          hover:bg-red-50
                          hover:text-red-500
                          transition-all
                        "
                      >

                        <LogOut size={18} />

                      </button>

                    </div>

                  ) : (

                    <Link
                      href="/login"
                      className="
                        hidden
                        md:inline-flex
                        items-center
                        justify-center
                        gap-2
                        h-11
                        px-5
                        rounded-2xl
                        bg-[#2E5E4E]
                        hover:bg-[#24473B]
                        text-white
                        text-sm
                        font-bold
                        transition-all
                        shadow-[0_10px_25px_rgba(46,94,78,0.20)]
                      "
                    >

                      <User size={16} />

                      Entrar

                    </Link>

                  )}

                </>

              )}

              
              
              
              {/* MOBILE BUTTON */}

              <button
                onClick={() =>
                  setMenuOpen(
                    !menuOpen,
                  )
                }
                className="
                  lg:hidden
                  w-11
                  h-11
                  rounded-2xl
                  bg-white/70
                  border
                  border-black/5
                  backdrop-blur-xl
                  flex
                  items-center
                  justify-center
                  text-[#1F2937]
                  shadow-sm
                "
              >

                {menuOpen ? (
                  <X size={22} />
                ) : (
                  <Menu size={22} />
                )}

              </button>

            </div>

          </div>

        </div>

      </motion.header>

      {/* MOBILE MENU */}

      <AnimatePresence>

        {menuOpen && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
              fixed
              inset-0
              z-40
              bg-[#F4F8F5]/96
              backdrop-blur-3xl
            "
          >

            <motion.div
              initial={{
                y: -30,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -30,
                opacity: 0,
              }}
              transition={{
                duration: 0.35,
              }}
              className="
                h-full
                flex
                flex-col
                justify-between
                px-6
                pt-24
                pb-10
              "
            >

              {/* TOP */}

              <div>

                {/* LOGIN MOBILE */}

                {!user && (

                  <Link
                    href="/login"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      gap-3
                      mb-8
                      h-14
                      rounded-3xl
                      bg-[#2E5E4E]
                      text-white
                      font-black
                      shadow-lg
                    "
                  >

                    <User size={18} />

                    Entrar

                  </Link>

                )}

                {/* USER MOBILE */}

                {user && perfil && (

                  <div
                    className="
                      flex
                      items-center 
                      justify-between
                      bg-white
                      rounded-3xl
                      p-4
                      mb-8
                      border
                      border-black/5
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        min-w-0
                      "
                    >

                      {/* AVATAR */}

                      {perfil.avatar_url ? (

                        <img
                          src={
                            perfil.avatar_url
                          }
                          alt={perfil.nome}
                          className="
                            w-12
                            h-12
                            rounded-2xl
                            object-cover
                          "
                        />

                      ) : (

                        <div
                          className="
                            w-12
                            h-12
                            rounded-2xl
                            bg-[#2E5E4E]
                            flex
                            items-center
                            justify-center
                            text-white
                            font-black
                          "
                        >

                          {perfil.nome
                            ?.charAt(0)
                            .toUpperCase()}

                        </div>

                      )}

                      {/* INFO */}

                      <div
                        className="
                          min-w-0
                        "
                      >

                        <p
                          className="
                            text-sm
                            font-black
                            text-zinc-800
                            truncate
                          "
                        >

                          {perfil.nome}

                        </p>

                        <p
                          className="
                            text-xs
                            text-zinc-500
                            truncate
                          "
                        >

                          {perfil.role}

                        </p>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      {perfil.tipo ===
                        "admin" && (

                        <Link
                          href="/admin"
                          className="
                            h-11
                            px-4
                            rounded-2xl
                            bg-[#2E5E4E]
                            text-white
                            text-sm
                            font-black
                            flex
                            items-center
                            justify-center
                          "
                        >

                          Painel

                        </Link>

                      )}

                      <button
                        onClick={logout}
                        className="
                          w-11
                          h-11
                          rounded-2xl
                          bg-red-50
                          text-red-500
                          flex
                          items-center
                          justify-center
                        "
                      >

                        <LogOut size={18} />

                      </button>

                    </div>

                  </div>

                )}

                {/* LINKS */}

                <div
                  className="
                    flex
                    flex-col
                  "
                >

                  {links.map(
                    (
                      link,
                      index,
                    ) => (

                      <motion.a
                        key={link.name}
                        href={link.href}
                        initial={{
                          opacity: 0,
                          x: -30,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.06,
                        }}
                        onClick={() =>
                          setMenuOpen(
                            false,
                          )
                        }
                        className="
                          flex
                          items-center
                          justify-between
                          py-4
                          border-b
                          border-black/5
                          text-[#111827]
                          text-[1.2rem]
                          font-black
                          tracking-tight
                        "
                      >

                        {link.name}

                        <ArrowRight
                          size={18}
                          className="
                            text-zinc-400
                          "
                        />

                      </motion.a>

                    ),
                  )}

                </div>

              </div>

              {/* FOOTER */}

              <div>

                <a
                  href="tel:+5585999999999"
                  className="
                    w-full
                    h-14
                    rounded-3xl
                    bg-[#2E5E4E]
                    hover:bg-[#23473A]
                    transition-all
                    text-white
                    font-black
                    text-base
                    flex
                    items-center
                    justify-center
                    gap-3
                    shadow-[0_15px_40px_rgba(46,94,78,0.25)]
                  "
                >

                  Ligar Agora

                  <ArrowRight
                    size={18}
                  />

                </a>

                <p
                  className="
                    text-center
                    text-xs
                    text-zinc-500
                    mt-6
                    leading-6
                  "
                >

                  Plataforma ESG • ACMRB
                  <br />
                  Associação Reciclaê
                  • Baturité CE

                </p>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

      {/* ADMIN */}

      <AdminModal
        open={unlocked}
        onClose={closeAdmin}
      />

    </>
  );

}