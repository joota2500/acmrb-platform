"use client";

/**
 * Tooltip — balãozinho com o nome do botão (para botões só com ícone)
 * ------------------------------------------------------------
 * Como funciona: <DicasFlutuantes /> fica UMA vez no layout principal e
 * escuta a página toda. O balão aparece:
 *   - ao passar o mouse,
 *   - ao chegar no botão pelo teclado (Tab),
 *   - ao tocar no celular (some sozinho depois de 1,5 s).
 *
 * Quem ganha balão:
 *   1) qualquer botão ou link com aria-label e SEM texto visível
 *      (ex.: <button aria-label="Excluir"><Trash2 /></button>) — automático;
 *   2) qualquer coisa com data-dica="texto", ou embrulhada no componente:
 *        <Tooltip texto="Copiar link"><button ...>...</button></Tooltip>
 *
 * O balão é "fixed" e fica sempre dentro da tela (não cria rolagem lateral).
 * Se o botão tiver title, ele é tirado enquanto o balão aparece (para não
 * aparecerem dois balões) e devolvido depois.
 */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

/** Embrulha um elemento para ele ganhar o balão com o texto */
export default function Tooltip({ texto, children, className }: { texto: string; children: ReactNode; className?: string }) {
  return (
    <span data-dica={texto} className={cn("inline-flex", className)}>
      {children}
    </span>
  );
}

const SELETOR = "[data-dica], button[aria-label], a[aria-label], [role=button][aria-label]";
const ID_BALAO = "dica-flutuante";

// texto do balão para este elemento (ou null se não precisa de balão)
function textoDe(el: HTMLElement): string | null {
  if (el.dataset.dica) return el.dataset.dica;
  const rotulo = el.getAttribute("aria-label");
  if (!rotulo) return null;
  // só para botões sem texto visível (o texto escondido no celular conta como invisível)
  return el.innerText.trim() === "" ? rotulo : null;
}

export function DicasFlutuantes() {
  const [dica, setDica] = useState<{ texto: string; caixa: DOMRect } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const balao = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let atual: HTMLElement | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const esconder = () => {
      if (atual) {
        // devolve o title e tira a ligação com o balão
        const t = atual.dataset.tituloGuardado;
        if (t !== undefined) {
          atual.setAttribute("title", t);
          delete atual.dataset.tituloGuardado;
        }
        if (atual.getAttribute("aria-describedby") === ID_BALAO) atual.removeAttribute("aria-describedby");
      }
      atual = null;
      clearTimeout(timer);
      setDica(null);
    };

    const mostrar = (alvo: EventTarget | null) => {
      const el = (alvo as Element | null)?.closest?.(SELETOR) as HTMLElement | null;
      if (!el) return;
      if (el === atual) return;
      const texto = textoDe(el);
      if (!texto) return;
      esconder();
      atual = el;
      const t = el.getAttribute("title");
      if (t !== null) {
        el.dataset.tituloGuardado = t;
        el.removeAttribute("title");
      }
      // se o texto não é o próprio aria-label, o leitor de tela lê o balão
      if (el.getAttribute("aria-label") !== texto) el.setAttribute("aria-describedby", ID_BALAO);
      setDica({ texto, caixa: el.getBoundingClientRect() });
    };

    const mouseEntrou = (e: PointerEvent) => {
      if (e.pointerType === "mouse") mostrar(e.target);
    };
    const mouseSaiu = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !atual) return;
      if (!atual.contains(e.relatedTarget as Node | null)) esconder();
    };
    const tocou = (e: TouchEvent) => {
      mostrar(e.target);
      if (atual) {
        clearTimeout(timer);
        timer = setTimeout(esconder, 1500);
      }
    };
    const focou = (e: FocusEvent) => {
      // só no foco pelo teclado (no clique do mouse não precisa)
      const el = e.target as HTMLElement;
      if (el.matches?.(":focus-visible")) mostrar(el);
    };
    const perdeuFoco = (e: FocusEvent) => {
      // só some se quem perdeu o foco é o botão do balão (no toque, o foco do botão anterior sai depois)
      if (atual && atual.contains(e.target as Node)) esconder();
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") esconder();
    };

    document.addEventListener("pointerover", mouseEntrou);
    document.addEventListener("pointerout", mouseSaiu);
    document.addEventListener("touchstart", tocou, { passive: true });
    document.addEventListener("focusin", focou);
    document.addEventListener("focusout", perdeuFoco);
    document.addEventListener("keydown", tecla);
    window.addEventListener("scroll", esconder, true);
    return () => {
      document.removeEventListener("pointerover", mouseEntrou);
      document.removeEventListener("pointerout", mouseSaiu);
      document.removeEventListener("touchstart", tocou);
      document.removeEventListener("focusin", focou);
      document.removeEventListener("focusout", perdeuFoco);
      document.removeEventListener("keydown", tecla);
      window.removeEventListener("scroll", esconder, true);
      clearTimeout(timer);
    };
  }, []);

  // calcula a posição: em cima do botão (ou embaixo, se não couber), sem sair da tela
  useLayoutEffect(() => {
    if (!dica || !balao.current) {
      setPos(null);
      return;
    }
    const { width: l, height: a } = balao.current.getBoundingClientRect();
    const c = dica.caixa;
    let y = c.top - a - 8;
    if (y < 8) y = c.bottom + 8;
    const x = Math.min(Math.max(8, c.left + c.width / 2 - l / 2), window.innerWidth - l - 8);
    setPos({ x, y });
  }, [dica]);

  if (!dica) return null;
  return (
    <div
      ref={balao}
      id={ID_BALAO}
      role="tooltip"
      style={{ left: pos?.x ?? 0, top: pos?.y ?? 0 }}
      className={cn(
        "pointer-events-none fixed z-[2200] max-w-[min(16rem,calc(100vw-1rem))] rounded-lg bg-ink px-2.5 py-1.5 text-center text-[0.78rem] font-bold leading-snug text-white shadow-pop",
        pos ? "animate-aparecer motion-reduce:animate-none" : "invisible",
      )}
    >
      {dica.texto}
    </div>
  );
}
