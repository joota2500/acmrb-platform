/**
 * Container — centraliza o conteúdo com a largura máxima do site
 * ------------------------------------------------------------
 * Tamanhos: "estreito" (leitura), "medio" e "largo" (padrão, 80rem).
 */
import { cn } from "@/utils/cn";

type Props = React.ComponentProps<"div"> & {
  tamanho?: "estreito" | "medio" | "largo";
};

const TAMANHOS = {
  estreito: "max-w-3xl",
  medio: "max-w-5xl",
  largo: "max-w-(--container-page)",
};

export default function Container({ tamanho = "largo", className, children, ...resto }: Props) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6", TAMANHOS[tamanho], className)} {...resto}>
      {children}
    </div>
  );
}
