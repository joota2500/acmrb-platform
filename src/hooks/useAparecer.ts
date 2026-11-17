"use client";

/**
 * useAparecer — animação de entrada das seções (sobe e aparece)
 * ------------------------------------------------------------
 * Uso:  const aparecer = useAparecer();
 *       <motion.div {...aparecer(0.1)}>...</motion.div>
 * O número é o atraso (em segundos), bom para entrada escalonada.
 * Se a pessoa pediu "reduzir movimento" no sistema, não anima nada.
 */

import { useReducedMotion } from "framer-motion";

export function useAparecer() {
  const reduzir = useReducedMotion();

  return (atraso = 0) =>
    reduzir
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.5, delay: atraso },
        };
}
