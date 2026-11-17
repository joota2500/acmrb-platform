/**
 * EmptyState — aviso quando não há nada para mostrar
 */
import Card from "@/components/ui/Card";

type Props = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: Props) {
  return (
    <Card espaco="grande" className="text-center sm:p-16">
      <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl leading-8 text-ink-soft">{description}</p>
    </Card>
  );
}
