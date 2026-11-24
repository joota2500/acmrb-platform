"use client";

/**
 * template.tsx — pequena transição ao trocar de página (Framer Motion)
 * ------------------------------------------------------------
 * O Next monta este arquivo de novo a cada navegação, então cada página
 * pública entra com um fade + leve subida (0,35 s).
 * - No painel (/admin) não anima: lá a troca é por seção e já tem o fade dela.
 * - MotionConfig reducedMotion="user": se a pessoa pediu "reduzir movimento"
 *   no sistema, todas as animações do Framer Motion do site ficam paradas.
 */

import { MotionConfig, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();
  const painel = caminho.startsWith("/admin");

  return (
    <MotionConfig reducedMotion="user">
      {painel ? (
        children
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
          {children}
        </motion.div>
      )}
    </MotionConfig>
  );
}
