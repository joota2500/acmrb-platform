/**
 * AdminContent — área de conteúdo das seções
 * ------------------------------------------------------------
 * Largura máxima confortável e espaçamento por tela:
 * celular 16px, tablet 24px, desktop 32–40px. No celular reserva espaço
 * embaixo para a barra de navegação rápida (AdminBottomNav).
 *
 * As seções internas foram feitas pensando no desktop (títulos text-5xl,
 * p-8/p-10...). As classes "[&_...]" abaixo ajustam esses elementos só aqui
 * dentro, sem mexer nas seções:
 *  - celular (<640px): títulos e espaços menores, imagens sem estourar a tela;
 *  - até tablet pequeno (<768px): tabelas com largura mínima, rolando na
 *    horizontal dentro do próprio quadro em vez de espremer as colunas.
 */

import { cn } from "@/utils/cn";

type Props = {
  children: React.ReactNode;
};

// Ajustes das seções no celular (as classes são escritas inteiras para o Tailwind achar)
const AJUSTES_CELULAR = [
  "max-sm:[&_.text-6xl]:text-[2rem] max-sm:[&_.text-6xl]:leading-[1.1]",
  "max-sm:[&_.text-5xl]:text-[1.75rem] max-sm:[&_.text-5xl]:leading-[1.15]",
  "max-sm:[&_.text-4xl]:text-2xl max-sm:[&_.text-4xl]:leading-[1.2]",
  "max-sm:[&_.p-10]:p-5 max-sm:[&_.p-8]:p-5",
  "max-sm:[&_.px-10]:px-4 max-sm:[&_.px-8]:px-4",
  "max-sm:[&_.rounded-4xl]:rounded-3xl",
  "max-sm:[&_img]:max-w-full max-sm:[&_video]:max-w-full max-sm:[&_iframe]:max-w-full",
  "max-sm:[&_pre]:whitespace-pre-wrap max-sm:[&_pre]:break-words",
];

// Tabelas: nunca mais estreitas que o quadro; abaixo de 768px rolam na horizontal
const AJUSTES_TABELA = [
  "[&_table]:min-w-full",
  "max-md:[&_table]:min-w-[720px]",
  "max-md:[&_th]:px-[0.85rem] max-md:[&_th]:py-3 max-md:[&_td]:px-[0.85rem] max-md:[&_td]:py-3",
  "[&_.overflow-x-auto]:[-webkit-overflow-scrolling:touch]",
];

export default function AdminContent({ children }: Props) {
  return (
    <main id="conteudo-admin" tabIndex={-1} className="outline-none">
      <div
        className={cn(
          "mx-auto max-w-[88rem] px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]",
          "sm:p-6 lg:px-8 lg:pt-8 lg:pb-12 xl:px-10",
          ...AJUSTES_CELULAR,
          ...AJUSTES_TABELA,
        )}
      >
        {children}
      </div>
    </main>
  );
}
