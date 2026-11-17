/**
 * Input, Textarea e Select — campos de formulário com o mesmo visual
 * ------------------------------------------------------------
 * "invalido" deixa a borda vermelha. Aceitam todas as props normais
 * do HTML (value, onChange, placeholder, required...).
 */
import { cn } from "@/utils/cn";

const CAMPO =
  "w-full rounded-control border bg-white px-4 text-sm text-ink placeholder:text-ink-muted " +
  "transition focus:border-brand focus:shadow-focus focus:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-ink-muted";

const bordaCampo = (invalido?: boolean) => (invalido ? "border-danger" : "border-line");

type InputProps = React.ComponentProps<"input"> & { invalido?: boolean };

export default function Input({ invalido, className, ...resto }: InputProps) {
  return <input aria-invalid={invalido || undefined} className={cn(CAMPO, "h-11", bordaCampo(invalido), className)} {...resto} />;
}

type TextareaProps = React.ComponentProps<"textarea"> & { invalido?: boolean };

export function Textarea({ invalido, className, ...resto }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalido || undefined}
      className={cn(CAMPO, "min-h-28 py-3", bordaCampo(invalido), className)}
      {...resto}
    />
  );
}

type SelectProps = React.ComponentProps<"select"> & { invalido?: boolean };

export function Select({ invalido, className, children, ...resto }: SelectProps) {
  return (
    <select aria-invalid={invalido || undefined} className={cn(CAMPO, "h-11", bordaCampo(invalido), className)} {...resto}>
      {children}
    </select>
  );
}
