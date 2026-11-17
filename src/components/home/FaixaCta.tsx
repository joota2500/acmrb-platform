/**
 * FaixaCta — faixa de chamada para ação (fundo verde com degradê)
 * ------------------------------------------------------------
 * Usada no fim das seções da home. Os botões entram como "children".
 * Texto à esquerda e botões à direita no desktop; empilhados no celular.
 */
import { cn } from "@/utils/cn";

type Props = {
  titulo: string;
  texto: string;
  children: React.ReactNode;
  className?: string;
};

export default function FaixaCta({ titulo, texto, children, className }: Props) {
  return (
    <div
      className={cn(
        "relative isolate mt-14 overflow-hidden rounded-3xl bg-linear-to-br from-brand-dark via-brand to-leaf p-7 shadow-pop sm:mt-20 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-12",
        className,
      )}
    >
      {/* círculos decorativos no fundo */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 -z-10 size-56 rounded-full bg-white/10" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 size-48 rounded-full bg-emerald-400/10" />

      <div className="max-w-2xl">
        <h3 className="text-balance text-2xl font-black leading-tight text-white sm:text-3xl">{titulo}</h3>
        <p lang="pt-BR" className="mt-3 leading-relaxed text-emerald-100">
          {texto}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-0 lg:shrink-0 lg:flex-col xl:flex-row">
        {children}
      </div>
    </div>
  );
}
