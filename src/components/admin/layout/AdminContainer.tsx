/**
 * AdminContainer — moldura do painel
 * ------------------------------------------------------------
 * Fundo da página e reserva de espaço para a barra lateral fixa no desktop.
 * A largura da reserva fica na variável --admin-sidebar (barra larga 16,5rem /
 * recolhida 5rem): a barra e a coluna principal leem essa mesma variável,
 * então os dois andam juntos quando o menu é recolhido.
 * Também tem o link "Pular para o conteúdo" (aparece com a tecla Tab).
 * A classe "admin-shell" não tem CSS próprio: é só a marca usada pelas regras
 * de foco do painel em globals.css.
 */

import { cn } from "@/utils/cn";

type Props = {
  children: React.ReactNode;
  recolhida?: boolean;
};

export default function AdminContainer({ children, recolhida = false }: Props) {
  return (
    <div
      className={cn(
        "admin-shell min-h-dvh overflow-x-hidden bg-[#f5f7f4] text-ink",
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
