/**
 * SectionTitle — título de seção com etiqueta opcional e descrição
 * ------------------------------------------------------------
 * Use no começo de cada bloco da página para manter o mesmo padrão
 * de tamanho, cor e espaçamento.
 */
import { cn } from "@/utils/cn";

type Props = {
  titulo: string;
  descricao?: string;
  /** Etiqueta pequena acima do título (ex.: "Transparência") */
  etiqueta?: string;
  alinhamento?: "esquerda" | "centro";
  className?: string;
};

export default function SectionTitle({ titulo, descricao, etiqueta, alinhamento = "esquerda", className }: Props) {
  const centro = alinhamento === "centro";

  return (
    <div className={cn("mb-8", centro && "text-center", className)}>
      {etiqueta && (
        <span className="mb-3 inline-flex items-center rounded-full border border-leaf-bright/20 bg-leaf-bright/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-leaf">
          {etiqueta}
        </span>
      )}

      <h2 className="text-headline font-extrabold text-ink">{titulo}</h2>

      {descricao && (
        <p className={cn("mt-3 max-w-3xl leading-8 text-ink-soft", centro && "mx-auto")}>{descricao}</p>
      )}
    </div>
  );
}
