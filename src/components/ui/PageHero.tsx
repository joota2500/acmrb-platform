/**
 * PageHero — topo padrão das páginas internas
 * ------------------------------------------------------------
 * Etiqueta, título grande, descrição e (opcional) botões em "children".
 * O espaço de cima considera o header fixo do site.
 */
import Container from "@/components/ui/Container";
import { cn } from "@/utils/cn";

type Props = {
  etiqueta?: string;
  titulo: string;
  descricao?: string;
  children?: React.ReactNode;
  className?: string;
};

export default function PageHero({ etiqueta, titulo, descricao, children, className }: Props) {
  return (
    <section className={cn("bg-linear-to-b from-brand-soft to-transparent pb-12 pt-32 sm:pb-16 sm:pt-40", className)}>
      <Container>
        {etiqueta && (
          <span className="mb-5 inline-flex items-center rounded-full border border-leaf-bright/20 bg-leaf-bright/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-leaf">
            {etiqueta}
          </span>
        )}

        <h1 className="max-w-4xl text-display font-extrabold text-ink">{titulo}</h1>

        {descricao && <p className="mt-6 max-w-2xl text-base leading-8 text-ink-soft sm:text-lg">{descricao}</p>}

        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </Container>
    </section>
  );
}
