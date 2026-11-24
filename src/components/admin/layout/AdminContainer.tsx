/**
 * AdminContainer — moldura do painel
 * ------------------------------------------------------------
 * Fundo da página e reserva de espaço para a barra lateral fixa no desktop.
 * A largura da reserva fica na variável --admin-sidebar (barra larga 16,5rem /
 * recolhida 5rem): a barra e a coluna principal leem essa mesma variável,
 * então os dois andam juntos quando o menu é recolhido.
 * Também tem o link "Pular para o conteúdo" (aparece com a tecla Tab).
 * ACABAMENTO (antes era CSS solto em globals.css, ".admin-shell"): foco
 * verde nos botões, links e campos, títulos equilibrados e cursor de mãozinha.
 */

import { cn } from "@/utils/cn";

// Acabamento de tudo que fica dentro do painel (escrito inteiro para o Tailwind achar)
const ACABAMENTO = [
  "[&_:is(h1,h2,h3)]:text-balance",
  "[&_:is(button,[role=button]):not(:disabled)]:cursor-pointer",
  "[&_:is(button,a):focus-visible]:outline-2 [&_:is(button,a):focus-visible]:outline-offset-2 [&_:is(button,a):focus-visible]:outline-brand",
  "[&_:is(input,select,textarea):not([type=checkbox],[type=radio],[type=file],[type=range]):focus-visible]:border-brand",
  "[&_:is(input,select,textarea):not([type=checkbox],[type=radio],[type=file],[type=range]):focus-visible]:shadow-focus",
  "[&_:is(input,select,textarea):not([type=checkbox],[type=radio],[type=file],[type=range]):focus-visible]:outline-none",
];

type Props = {
  children: React.ReactNode;
  recolhida?: boolean;
};

export default function AdminContainer({ children, recolhida = false }: Props) {
  return (
    <div
      className={cn(
        "min-h-dvh overflow-x-clip bg-[#f5f7f4] text-ink",
        ...ACABAMENTO,
        recolhida ? "[--admin-sidebar:5rem]" : "[--admin-sidebar:16.5rem]",
      )}
    >
      <a
        href="#conteudo-admin"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-100 focus:rounded-xl focus:bg-brand focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-pop"
      >
        Pular para o conteúdo
      </a>
      {children}
    </div>
  );
}
