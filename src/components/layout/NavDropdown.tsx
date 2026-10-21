"use client";

/**
 * NavDropdown — item do menu desktop com submenu
 * ------------------------------------------------------------
 * Abre ao passar o mouse e também pelo teclado: Enter/Espaço/↓ no
 * botão abrem; Esc fecha e devolve o foco; sair do foco fecha.
 * CSS: src/styles/nav-dropdown.css (prefixo "navdd").
 */

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import "@/styles/nav-dropdown.css";
import { hrefReal, type NavItem } from "./navItems";

interface Props {
  item: NavItem;
  /** Navegação do Header; retorna true quando tratou o clique */
  onNavigate: (href: string) => boolean;
}

export default function NavDropdown({ item, onNavigate }: Props) {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idMenu = useId();

  // Fecha ao clicar fora
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!raizRef.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  const entrar = () => {
    if (timer.current) clearTimeout(timer.current);
    setAberto(true);
  };
  // pequeno atraso evita fechar ao atravessar o espaço até o painel
  const sair = () => {
    timer.current = setTimeout(() => setAberto(false), 140);
  };

  const focarItem = (indice: number) => {
    const links = raizRef.current?.querySelectorAll<HTMLAnchorElement>(".navdd__link");
    links?.[indice]?.focus();
  };

  return (
    <div
      ref={raizRef}
      className={`navdd${aberto ? " navdd--aberto" : ""}`}
      onMouseEnter={entrar}
      onMouseLeave={sair}
      onBlur={(e) => {
        if (!raizRef.current?.contains(e.relatedTarget as Node)) setAberto(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && aberto) {
          setAberto(false);
          botaoRef.current?.focus();
        }
      }}
    >
      <button
        ref={botaoRef}
        type="button"
        className="navLink navdd__botao"
        aria-haspopup="true"
        aria-expanded={aberto}
        aria-controls={idMenu}
        onClick={() => setAberto((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setAberto(true);
            setTimeout(() => focarItem(0), 0);
          }
        }}
      >
        {item.name}
        <ChevronDown size={15} className="navdd__seta" aria-hidden="true" />
      </button>

      <ul id={idMenu} className="navdd__painel" role="list">
        {item.children?.map((f, i) => (
          <li key={f.id}>
            <Link
              href={hrefReal(f.href)}
              className="navdd__link"
              tabIndex={aberto ? 0 : -1}
              onClick={(e) => {
                setAberto(false);
                if (onNavigate(f.href)) e.preventDefault();
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); focarItem(i + 1); }
                if (e.key === "ArrowUp") { e.preventDefault(); if (i === 0) botaoRef.current?.focus(); else focarItem(i - 1); }
              }}
            >
              {f.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
