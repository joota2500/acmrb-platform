/**
 * LoadingState — círculo girando enquanto os dados carregam
 */
import Card from "@/components/ui/Card";

type Props = {
  text?: string;
};

export default function LoadingState({ text = "Carregando..." }: Props) {
  return (
    <Card espaco="grande" className="text-center sm:p-16" role="status" aria-live="polite">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-brand" />
      <p className="mt-6 text-ink-soft">{text}</p>
    </Card>
  );
}
