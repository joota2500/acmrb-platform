/**
 * Button — botão padrão do site
 * ------------------------------------------------------------
 * variante: primario | secundario | contorno | fantasma | perigo
 * tamanho:  pequeno | medio | grande
 * Passando "href" vira um link (next/link) com a mesma aparência.
 * "carregando" mostra o spinner e desativa o clique.
 */
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type Variante = "primario" | "secundario" | "contorno" | "fantasma" | "perigo";
type Tamanho = "pequeno" | "medio" | "grande";

type Props = Omit<React.ComponentProps<"button">, "type"> & {
  type?: "button" | "submit" | "reset";
  variante?: Variante;
  tamanho?: Tamanho;
  carregando?: boolean;
  larguraTotal?: boolean;
  href?: string;
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition " +
  "disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-brand text-white shadow-sm hover:bg-brand-dark",
  secundario: "bg-brand-soft text-brand hover:bg-brand-mint",
  contorno: "border border-brand/30 bg-white text-brand hover:bg-brand-soft",
  fantasma: "text-brand hover:bg-brand-soft",
  perigo: "bg-red-600 text-white shadow-sm hover:bg-red-700",
};

const TAMANHOS: Record<Tamanho, string> = {
  pequeno: "h-9 px-3.5 text-sm",
  medio: "h-11 px-5 text-sm",
  grande: "h-14 px-7 text-base",
};

export default function Button({
  variante = "primario",
  tamanho = "medio",
  carregando = false,
  larguraTotal = false,
  href,
  type = "button",
  className,
  children,
  disabled,
  ...resto
}: Props) {
  const classes = cn(BASE, VARIANTES[variante], TAMANHOS[tamanho], larguraTotal && "w-full", className);

  // Como link: mesma cara de botão
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || carregando} aria-busy={carregando} {...resto}>
      {carregando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
