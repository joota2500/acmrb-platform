"use client";

import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { Menu, X } from "lucide-react";

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
    name: "Parceiros",
    href: "#parceiros",
  },
  {
    name: "Contato",
    href: "#contato",
  },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

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
          duration-300
          ${
            scrolled
              ? `
                py-4
              `
              : `
                py-6
              `
          }
        `}
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-6
            md:px-10
          "
        >

          <div
            className={`
              flex
              items-center
              justify-between
              rounded-3xl
              border
              backdrop-blur-2xl
              transition-all
              duration-300
              px-6
              lg:px-8
              ${
                scrolled
                  ? `
                    bg-white/85
                    border-black/5
                    shadow-[0_10px_40px_rgba(15,23,42,0.06)]
                    py-4
                  `
                  : `
                    bg-white/65
                    border-black/5
                    py-5
                  `
              }
            `}
          >

            {/* LOGO */}
            <div
              className="
                flex
                items-center
                gap-4
              "
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-linear-to-br
                  from-[#2E5E4E]
                  to-[#4F8A73]
                  flex
                  items-center
                  justify-center
                  text-white
                  font-black
                  shadow-lg
                "
              >
                ♻
              </div>

              <div>

                <h2
                  className="
                    text-lg
                    md:text-xl
                    font-black
                    text-[#1F2937]
                    leading-none
                  "
                >
                  ACMRB
                </h2>

                <p
                  className="
                    text-xs
                    text-[#6B7280]
                    mt-1
                  "
                >
                  Associação Reciclaê - Baturité CE
                </p>

              </div>

            </div>

            {/* DESKTOP MENU */}
            <nav
              className="
                hidden
                lg:flex
                items-center
                gap-8
              "
            >

              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="
                    relative
                    text-[#374151]
                    font-medium
                    hover:text-[#2E5E4E]
                    transition
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
                gap-4
              "
            >

              {/* CTA */}
              <button
                className="
                  hidden
                  md:flex
                  items-center
                  justify-center
                  px-6
                  py-3
                  rounded-2xl
                  bg-[#2E5E4E]
                  hover:bg-[#24473B]
                  text-white
                  font-semibold
                  transition
                  shadow-lg
                  shadow-[#2E5E4E]/10
                "
              >
                Seja Parceiro
              </button>

              {/* MOBILE BUTTON */}
              <button
                onClick={() =>
                  setMenuOpen(!menuOpen)
                }
                className="
                  lg:hidden
                  w-12
                  h-12
                  rounded-2xl
                  border
                  border-black/5
                  bg-white/70
                  flex
                  items-center
                  justify-center
                  text-[#1F2937]
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
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
              fixed
              inset-0
              z-40
              bg-[#F5F7F4]/95
              backdrop-blur-2xl
              pt-32
              px-6
            "
          >

            <div
              className="
                flex
                flex-col
                gap-6
              "
            >

              {links.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.08,
                  }}
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="
                    text-3xl
                    font-bold
                    text-[#1F2937]
                    border-b
                    border-black/5
                    pb-5
                  "
                >
                  {link.name}
                </motion.a>
              ))}

              <button
                className="
                  mt-6
                  h-16
                  rounded-2xl
                  bg-[#2E5E4E]
                  text-white
                  font-semibold
                  text-lg
                "
              >
                Solicitar parceria
              </button>

            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </>
  );
}