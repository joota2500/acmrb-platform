"use client";

/**
 * NavDropdown — item do menu desktop com submenu
 * ------------------------------------------------------------
 * Abre ao passar o mouse e também pelo teclado: Enter/Espaço/↓ no
 * botão abrem; Esc fecha e devolve o foco; sair do foco fecha.
 * Cada opção mostra ícone, título e uma linha de descrição. A página
 * atual fica destacada (aria-current) e o título do grupo também.
 * Visual: Tailwind.
 */

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { LINK_NAV, LINK_NAV_ATIVO } from "@/components/layout/classesMenu";
import { hrefReal, linkAtivo, type NavItem } from "@/constants/navegacao";
import { usePathname } from "next/navigation";

interface Props {
  item: NavItem;
  /** Navegação do Header; retorna true quando tratou o clique */
  onNavigate: (href: string) => boolean;
  /** alguma página deste grupo é a página atual */
  ativo?: boolean;
}

export default function NavDropdown({ item, onNavigate, ativo = false }: Props) {
  const pathname = usePathname();
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
    const links = raizRef.current?.querySelectorAll<HTMLAnchorElement>("ul a");
    links?.[indice]?.focus();
  };

  return (
    <div
      ref={raizRef}
      className="relative inline-flex"
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
        className={cn(LINK_NAV, ativo && LINK_NAV_ATIVO, "cursor-pointer gap-1 border-0 bg-transparent p-0 font-[inherit]")}
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
        <ChevronDown size={15} className={cn("opacity-80 transition-transform duration-200 motion-reduce:transition-none", aberto && "rotate-180")} aria-hidden="true" />
      </button>

      <ul id={idMenu} className={cn(
          "absolute left-1/2 top-[calc(100%-4px)] z-60 m-0 w-72 list-none rounded-2xl border border-emerald-200/20 bg-emerald-900 p-2 shadow-[0_16px_34px_rgb(0_0_0/0.28)]",
          "-translate-x-1/2 transition-[opacity,transform,visibility] duration-200 motion-reduce:transition-none",
          aberto ? "visible translate-y-0 opacity-100" : "invisible translate-y-1.5 opacity-0",
        )} role="list">
        {item.children?.map((f, i) => {
          const Icone = f.icone;
          const atual = linkAtivo(f.href, pathname);
          return (
            <li key={f.id}>
              <Link
                href={hrefReal(f.href)}
                aria-current={atual ? "page" : undefined}
                className={cn(
                  "flex items-start gap-3 rounded-xl px-3 py-2.5 no-underline transition-colors hover:bg-emerald-500/20 focus-visible:bg-emerald-500/20 focus-visible:outline-none",
                  atual && "bg-emerald-500/15",
                )}
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
                {Icone && (
                  <span className="mt-0.5 grid size-9 flex-none place-items-center rounded-lg bg-emerald-500/20 text-emerald-300" aria-hidden="true">
                    <Icone size={18} />
                  </span>
                )}
                <span className="flex min-w-0 flex-col">
                  <span className={cn("text-[0.92rem] font-semibold", atual ? "text-emerald-200" : "text-emerald-50")}>{f.name}</span>
                  {f.descricao && <span className="mt-0.5 text-xs leading-snug text-emerald-100/70">{f.descricao}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
