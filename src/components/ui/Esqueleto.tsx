/**
 * Esqueleto — formato do conteúdo piscando enquanto os dados chegam
 * ------------------------------------------------------------
 * Mesmo estilo dos esqueletos do painel (cartão branco + barrinhas cinza).
 *
 *   <EsqueletoCartoes quantidade={3} />                 → cartões com imagem
 *   <EsqueletoCartoes quantidade={4} foto="redonda" />  → pessoas (diretoria)
 *   <EsqueletoCartoes quantidade={5} foto="logo" />     → logos de parceiros
 *   <EsqueletoLista quantidade={3} />                   → lista (pedidos, dias...)
 */

import { cn } from "@/utils/cn";

/** Uma barrinha cinza piscando (use className para o tamanho) */
export function Esqueleto({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-full bg-zinc-200/80 motion-reduce:animate-none", className)} aria-hidden="true" />;
}

const CARTAO = "rounded-card border border-black/5 bg-white shadow-card";

interface PropsCartoes {
  quantidade?: number;
  foto?: "imagem" | "redonda" | "logo";
  /** classes da grade (colunas) */
  className?: string;
  rotulo?: string;
}

export function EsqueletoCartoes({ quantidade = 3, foto = "imagem", className, rotulo = "Carregando…" }: PropsCartoes) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={rotulo}
      className={cn(
        "grid gap-4",
        foto === "logo" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : foto === "redonda" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: quantidade }, (_, i) => (
        <div key={i} className={cn(CARTAO, foto === "logo" ? "grid h-28 place-items-center p-4" : "flex flex-col gap-3 p-4", foto === "redonda" && "items-center text-center")}>
          {foto === "logo" && <Esqueleto className="h-10 w-3/4 rounded-xl" />}
          {foto === "imagem" && <Esqueleto className="aspect-video w-full rounded-xl" />}
          {foto === "redonda" && <Esqueleto className="size-20" />}
          {foto !== "logo" && (
            <>
              <Esqueleto className="h-4 w-2/3" />
              <Esqueleto className="h-3 w-1/2" />
            </>
          )}
        </div>
      ))}
      <span className="sr-only">{rotulo}</span>
    </div>
  );
}

export function EsqueletoLista({ quantidade = 3, rotulo = "Carregando…", className }: { quantidade?: number; rotulo?: string; className?: string }) {
  return (
    <ul role="status" aria-busy="true" aria-label={rotulo} className={cn("flex list-none flex-col gap-3 p-0", className)}>
      {Array.from({ length: quantidade }, (_, i) => (
        <li key={i} className={cn(CARTAO, "flex items-center gap-3 p-4")}>
          <Esqueleto className="size-11 shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Esqueleto className="h-4 w-1/3" />
            <Esqueleto className="h-3 w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
