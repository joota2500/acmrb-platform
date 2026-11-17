/**
 * Campo — rótulo + campo de formulário + dica/erro
 * ------------------------------------------------------------
 * Envolve um <Input />, <Textarea /> ou <Select /> e liga o rótulo
 * ao campo (acessibilidade).
 *   <Campo rotulo="E-mail" erro={erro}>
 *     <Input type="email" />
 *   </Campo>
 */
import { cloneElement, useId } from "react";
import { cn } from "@/utils/cn";

type Props = {
  rotulo: string;
  dica?: string;
  erro?: string;
  obrigatorio?: boolean;
  className?: string;
  /** Recebe o id para ligar o rótulo ao campo */
  children: React.ReactElement<{ id?: string }>;
};

export default function Campo({ rotulo, dica, erro, obrigatorio, className, children }: Props) {
  const id = useId();
  // Dá ao campo o id que o rótulo usa
  const campo = cloneElement(children, { id });

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {rotulo}
        {obrigatorio && <span className="ml-0.5 text-danger">*</span>}
      </label>

      {campo}

      {erro ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {erro}
        </p>
      ) : (
        dica && <p className="text-xs text-ink-muted">{dica}</p>
      )}
    </div>
  );
}
