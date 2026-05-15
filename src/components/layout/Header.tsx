"use client";

import { useState } from "react";
import AdminModal from "../admin/AdminModal";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [adminOpen, setAdminOpen] = useState(false);
  const [clicks, setClicks] = useState(0);

  const navLinks = [
    { label: "Início", href: "#" },
    { label: "Quem Somos", href: "#quem-somos" },
    { label: "Notícias", href: "#noticias" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <>
      <header
        className="
          fixed
          top-0
          left-0
          w-full
          z-50
          bg-green-950/90
          backdrop-blur-md
          border-b
          border-white/10
        "
      >
        <div
          className="
            max-w-7xl
            mx-auto
            px-6
            h-20
            flex
            items-center
            justify-between
          "
        >

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
                rounded-full
                bg-green-500
                flex
                items-center
                justify-center
                text-black
                font-bold
              "
            >
              A
            </div>

            <div>

              <h1 className="text-white font-bold text-lg">
                ACMRB
              </h1>

              <p className="text-green-300 text-xs">
                Plataforma ESG
              </p>

            </div>

          </div>

          <nav className="
            hidden
            md:flex
            items-center
            gap-8
            text-white
            text-sm
          ">

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="
                  hover:text-green-400
                  transition
                "
              >
                {link.label}
              </a>
            ))}

          </nav>

          <button
            className="
              hidden
              md:block
              bg-green-500
              hover:bg-green-400
              transition
              px-5
              py-2
              rounded-full
              text-black
              font-semibold
            "
          >
            Seja Parceiro
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="
              md:hidden
              flex
              flex-col
              gap-1
            "
          >

            <span className="w-6 h-[2px] bg-white"></span>
            <span className="w-6 h-[2px] bg-white"></span>
            <span className="w-6 h-[2px] bg-white"></span>

          </button>

        </div>
      </header>

      {menuOpen && (
        <div
          className="
            fixed
            inset-0
            z-[999]
            bg-black/80
            backdrop-blur-xl
            flex
            flex-col
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

          <div className="
            flex
            flex-col
            items-center
            gap-8
          ">

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="
                  text-white
                  text-3xl
                  font-bold
                  hover:text-green-400
                  transition
                "
              >
                {link.label}
              </a>
            ))}

            <button
              className="
                mt-8
                bg-green-500
                hover:bg-green-400
                transition
                px-8
                py-4
                rounded-full
                text-black
                font-bold
              "
            >
              Seja Parceiro
            </button>

          </div>

        </div>
      )}
      <AdminModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}