"use client";

/** Número que conta de 0 até o valor quando entra na tela (respeita prefers-reduced-motion) */

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

type Props = { valor: number; formatar: (n: number) => string };

export default function Contador({ valor, formatar }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const visivel = useInView(ref, { once: true });
  const reduzir = useReducedMotion();
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (!visivel) return;
    if (reduzir) {
      setAtual(valor);
      return;
    }
    const c = animate(0, valor, { duration: 1.3, ease: "easeOut", onUpdate: setAtual });
    return () => c.stop();
  }, [visivel, reduzir, valor]);

  return <span ref={ref}>{formatar(atual)}</span>;
}
