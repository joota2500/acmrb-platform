/**
 * Button — botão padrão do site
 * ------------------------------------------------------------
 * variante: primario | secundario | contorno | fantasma | perigo
 *           | destaque | claro | contornoClaro  (os 3 últimos são para fundo verde escuro)
 * tamanho:  pequeno | medio | grande
 * Passando "href" vira um link (next/link) com a mesma aparência.
 * "carregando" mostra o spinner e desativa o clique.
 */
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type Variante = "primario" | "secundario" | "contorno" | "fantasma" | "perigo" | "destaque" | "claro" | "contornoClaro";
type Tamanho = "pequeno" | "medio" | "grande";

type Props = Omit<React.ComponentProps<"button">, "type"> & {
  type?: "button" | "submit" | "reset";
  variante?: Variante;
  tamanho?: Tamanho;
  carregando?: boolean;
  larguraTotal?: boolean;
  href?: string;
  /** só vale com href (ex.: "_blank" para abrir em outra aba) */
  target?: string;
  rel?: string;
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
  // para usar em cima de fundo verde escuro
  destaque: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
  claro: "bg-white text-leaf shadow-sm hover:bg-emerald-50",
  contornoClaro: "border-2 border-white/70 bg-transparent text-white hover:bg-white/15",
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
  target,
  rel,
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
      <Link href={href} target={target} rel={target === "_blank" ? (rel ?? "noopener noreferrer") : rel} className={classes} {...(resto as Omit<React.ComponentProps<typeof Link>, "href" | "className">)}>
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
