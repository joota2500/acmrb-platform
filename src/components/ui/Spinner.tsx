/**
 * Spinner — ícone girando para "carregando"
 * ------------------------------------------------------------
 * "centralizado" coloca o círculo no meio, com espaço em volta
 * (bom para o carregamento de uma página inteira).
 */
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type Props = {
  tamanho?: number;
  centralizado?: boolean;
  rotulo?: string;
  className?: string;
};

export default function Spinner({ tamanho = 24, centralizado = false, rotulo = "Carregando", className }: Props) {
  const icone = (
    <Loader2 size={tamanho} className={cn("animate-spin text-brand motion-reduce:animate-none", className)} aria-label={rotulo} />
  );

  if (!centralizado) return icone;
  return (
    <div className="flex justify-center p-12" role="status">
      {icone}
    </div>
  );
}
