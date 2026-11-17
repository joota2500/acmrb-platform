/**
 * Badge — selo pequeno de status ou categoria
 * ------------------------------------------------------------
 * tom: sucesso (padrão) | aviso | info | perigo | neutro | marca
 */
import { cn } from "@/utils/cn";

type Tom = "sucesso" | "aviso" | "info" | "perigo" | "neutro" | "marca";

type Props = React.ComponentProps<"span"> & {
  tom?: Tom;
  tamanho?: "pequeno" | "medio";
};

const TONS: Record<Tom, string> = {
  sucesso: "bg-emerald-100 text-emerald-700",
  aviso: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
  perigo: "bg-red-100 text-red-700",
  neutro: "bg-zinc-100 text-zinc-700",
  marca: "bg-brand-mint text-brand",
};

export default function Badge({ tom = "sucesso", tamanho = "medio", className, children, ...resto }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold",
        tamanho === "medio" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[0.7rem]",
        TONS[tom],
        className,
      )}
      {...resto}
    >
      {children}
    </span>
  );
}
