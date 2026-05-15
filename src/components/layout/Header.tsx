"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import AdminModal from "../admin/AdminModal";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { label: "Início", href: "#" },
    { label: "Quem Somos", href: "#quem-somos" },
    { label: "Notícias", href: "#noticias" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`
          fixed
          top-0
          left-0
          w-full
          z-50
          transition-all
          duration-500
          ${
            scrolled
              ? "bg-[#07111F]/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
              : "bg-transparent"
          }
        `}
      >
        <div
          className="
            max-w-7xl
            mx-auto
            px-5
            md:px-8
            h-20
            flex
            items-center
            justify-between
          "
        >

          {/* LOGO */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              const next = clicks + 1;

              setClicks(next);

              if (next >= 5) {
                setAdminOpen(true);
                setClicks(0);
              }
            }}
          >

            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-gradient-to-br
                from-emerald-400
                to-cyan-500
                flex
                items-center
                justify-center
                text-black
                font-black
                shadow-lg
                shadow-emerald-500/30
              "
            >
              A
            </div>

            <div>

              <h1 className="text-white font-black text-lg">
                ACMRB
              </h1>

              <p className="text-emerald-300 text-xs">
                Plataforma ESG
              </p>

            </div>

          </div>

          {/* DESKTOP */}
          <nav
            className="
              hidden
              lg:flex
              items-center
              gap-10
              text-sm
            "
          >

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="
                  text-gray-300
                  hover:text-white
                  transition
                  relative
                  group
                "
              >
                {link.label}

                <span
                  className="
                    absolute
                    left-0
                    -bottom-2
                    w-0
                    h-[2px]
                    bg-emerald-400
                    transition-all
                    duration-300
                    group-hover:w-full
                  "
                />
              </a>
            ))}

          </nav>

          {/* CTA */}
          <button
            className="
              hidden
              lg:flex
              items-center
              justify-center
              px-6
              py-3
              rounded-2xl
              bg-gradient-to-r
              from-emerald-400
              to-cyan-500
              text-black
              font-bold
              hover:scale-105
              transition
              shadow-xl
              shadow-emerald-500/20
            "
          >
            Seja Parceiro
          </button>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setMenuOpen(true)}
            className="
              lg:hidden
              flex
              flex-col
              gap-1.5
            "
          >

            <span className="w-6 h-[2px] bg-white rounded-full" />
            <span className="w-6 h-[2px] bg-white rounded-full" />
            <span className="w-6 h-[2px] bg-white rounded-full" />

          </button>

        </div>
      </motion.header>

      {/* MOBILE MENU */}
      <AnimatePresence>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              fixed
              inset-0
              z-[999]
              bg-[#020817]/95
              backdrop-blur-3xl
              flex
              items-center
              justify-center
            "
          >

            <button
              onClick={() => setMenuOpen(false)}
              className="
                absolute
                top-8
                right-8
                text-white
                text-4xl
              "
            >
              ×
            </button>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="
                flex
                flex-col
                items-center
                gap-10
              "
            >

              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="
                    text-white
                    text-4xl
                    font-black
                    hover:text-emerald-400
                    transition
                  "
                >
                  {link.label}
                </a>
              ))}

              <button
                className="
                  mt-8
                  px-10
                  py-5
                  rounded-2xl
                  bg-gradient-to-r
                  from-emerald-400
                  to-cyan-500
                  text-black
                  font-black
                  text-lg
                "
              >
                Seja Parceiro
              </button>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

      <AdminModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
      />
    </>
  );
}