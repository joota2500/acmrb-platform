/**
 * Card — caixa branca padrão (borda suave, raio e sombra da marca)
 * ------------------------------------------------------------
 * espaco:      nenhum | pequeno | medio (padrão) | grande
 * interativo:  sobe um pouco ao passar o mouse (para cards clicáveis)
 */
import { cn } from "@/utils/cn";

type Props = React.ComponentProps<"div"> & {
  espaco?: "nenhum" | "pequeno" | "medio" | "grande";
  interativo?: boolean;
};

const ESPACOS = {
  nenhum: "",
  pequeno: "p-4",
  medio: "p-5 sm:p-6",
  grande: "p-6 sm:p-10",
};

export default function Card({ espaco = "medio", interativo = false, className, children, ...resto }: Props) {
  return (
    <div
      className={cn(
        "rounded-card border border-black/5 bg-surface shadow-card",
        ESPACOS[espaco],
        interativo && "transition duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        className,
      )}
      {...resto}
    >
      {children}
    </div>
  );
}
