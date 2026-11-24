/**
 * LoadingState — esqueleto genérico enquanto os dados carregam
 * (antes era um círculo girando; agora mostra o formato de um bloco de conteúdo)
 */

import { Esqueleto } from "@/components/ui/Esqueleto";

type Props = {
  text?: string;
};

export default function LoadingState({ text = "Carregando..." }: Props) {
  return (
    <div role="status" aria-busy="true" aria-label={text} className="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-card border border-black/5 bg-white p-5 shadow-card sm:p-8">
      <Esqueleto className="h-6 w-1/3" />
      <Esqueleto className="h-4 w-full" />
      <Esqueleto className="h-4 w-5/6" />
      <div className="mt-2 grid gap-4 sm:grid-cols-3">
        <Esqueleto className="h-28 rounded-xl" />
        <Esqueleto className="h-28 rounded-xl" />
        <Esqueleto className="h-28 rounded-xl" />
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
}
