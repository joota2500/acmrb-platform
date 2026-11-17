/**
 * TituloSecao — cabeçalho padrão das seções da home
 * ------------------------------------------------------------
 * Etiqueta pequena (com ícone opcional), título grande e texto de apoio.
 * O título aceita JSX, então dá para destacar uma parte com <span>.
 *   escuro: usa cores claras (para seção de fundo verde escuro)
 *   alinhamento: "centro" (padrão) ou "esquerda"
 */
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

type Props = {
  etiqueta: string;
  icone?: LucideIcon;
  titulo: React.ReactNode;
  descricao?: string;
  id?: string;
  escuro?: boolean;
  alinhamento?: "centro" | "esquerda";
  className?: string;
};

export default function TituloSecao({
  etiqueta,
  icone: Icone,
  titulo,
  descricao,
  id,
  escuro = false,
  alinhamento = "centro",
  className,
}: Props) {
  const centro = alinhamento === "centro";

  return (
    <header className={cn("mb-10 max-w-3xl sm:mb-14", centro && "mx-auto text-center", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest",
          escuro
            ? "border-white/20 bg-white/10 text-emerald-200"
            : "border-leaf-bright/25 bg-leaf-bright/10 text-leaf",
        )}
      >
        {Icone && <Icone size={14} aria-hidden="true" />}
        {etiqueta}
      </span>

      <h2
        id={id}
        className={cn(
          "mt-4 text-balance text-headline font-black",
          escuro ? "text-white" : "text-ink",
          // a parte em <span> do título ganha a cor de destaque
          escuro ? "[&_span]:text-emerald-300" : "[&_span]:text-leaf",
          !centro && "text-left",
        )}
      >
        {titulo}
      </h2>

      {descricao && (
        <p
          lang="pt-BR"
          className={cn(
            "mt-4 text-pretty text-base leading-relaxed sm:text-lg",
            escuro ? "text-emerald-100/90" : "text-ink-soft",
          )}
        >
          {descricao}
        </p>
      )}
    </header>
  );
}
