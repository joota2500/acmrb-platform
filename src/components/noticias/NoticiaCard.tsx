/**
 * NoticiaCard — cartão de notícia (resumo), em Tailwind
 * ------------------------------------------------------------
 * Usado na home, na página /noticias, em "relacionadas" e na prévia
 * do editor do painel admin.
 * A imagem aparece INTEIRA (object-contain) dentro de uma moldura de
 * proporção fixa (16:10), sem cortar a foto; por trás, a mesma imagem
 * desfocada preenche as laterais (sem faixa vazia).
 * Variantes:
 *  - "normal":   cartão vertical (padrão)
 *  - "grande":   manchete; foto ao lado do texto a partir de 1024px
 *  - "compacto": foto pequena à esquerda (lista "Mais lidas")
 */

import Link from "next/link";
import { CalendarDays, Clock, Eye, ImageOff } from "lucide-react";
import { formatarData, textoPuro, type Noticia } from "@/utils/noticias";
import { cn } from "@/utils/cn";

interface Props {
  noticia: Noticia;
  variante?: "grande" | "normal" | "compacto";
  mostrarVisualizacoes?: boolean;
  nivelTitulo?: "h2" | "h3";
}

export default function NoticiaCard({ noticia: n, variante = "normal", mostrarVisualizacoes = false, nivelTitulo = "h3" }: Props) {
  const Titulo = nivelTitulo;
  const resumo = n.resumo || textoPuro(n.conteudo).slice(0, 220);

  const grande = variante === "grande";
  const compacto = variante === "compacto";

  return (
    <article className="h-full">
      <Link
        href={`/noticias/${n.slug}`}
        aria-label={`Ler notícia: ${n.titulo}`}
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-card border border-black/5 bg-white shadow-card",
          "transition duration-300 hover:-translate-y-1 hover:border-brand-line hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          grande && "lg:flex-row",
          compacto && "flex-row",
        )}
      >
        {/* ---------- Moldura da imagem (16:10) ---------- */}
        <div
          className={cn(
            "relative flex aspect-16/10 flex-none items-center justify-center overflow-hidden bg-line",
            grande && "lg:w-[55%]",
            compacto && "w-[34%] sm:w-[38%]",
          )}
        >
          {n.imagem_url ? (
            <>
              {/* fundo desfocado com a própria imagem */}
              <span
                aria-hidden="true"
                className="absolute -inset-[12%] scale-105 bg-cover bg-center blur-xl brightness-80 saturate-110"
                style={{ backgroundImage: `url("${n.imagem_url}")` }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={n.imagem_url} alt={n.imagem_alt} loading="lazy" className="relative z-10 size-full object-contain" />
            </>
          ) : (
            <span aria-hidden="true" className="text-zinc-400">
              <ImageOff size={28} />
            </span>
          )}
          {n.destaque && (
            <span className="absolute left-2.5 top-2.5 z-20 rounded-full bg-sun px-2.5 py-1 text-[11px] font-black text-ink shadow-md">
              Destaque
            </span>
          )}
        </div>

        {/* ---------- Texto ---------- */}
        <div
          className={cn(
            "flex flex-1 flex-col gap-2.5 p-4 sm:p-5",
            grande && "lg:justify-center lg:p-8",
            compacto && "gap-1.5 p-3 sm:p-4",
          )}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-muted">
            {n.categoria && (
              <span className="rounded-full bg-brand-mint px-2.5 py-0.5 font-bold text-leaf">{n.categoria}</span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={13} aria-hidden="true" />
              <time dateTime={n.publicado_em}>{formatarData(n.publicado_em)}</time>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={13} aria-hidden="true" />
              {n.tempo_leitura} min
            </span>
            {mostrarVisualizacoes && n.visualizacoes > 0 && (
              <span className="inline-flex items-center gap-1">
                <Eye size={13} aria-hidden="true" />
                {n.visualizacoes}
              </span>
            )}
          </div>

          <Titulo
            className={cn(
              "line-clamp-3 text-base font-black leading-snug text-ink transition group-hover:text-leaf sm:text-lg",
              grande && "text-xl sm:text-2xl lg:line-clamp-4 lg:text-3xl",
              compacto && "text-sm sm:text-base",
            )}
          >
            {n.titulo}
          </Titulo>

          {!compacto && resumo && (
            <p lang="pt-BR" className={cn("line-clamp-3 text-sm leading-relaxed text-ink-soft", grande && "lg:line-clamp-4 lg:text-base")}>
              {resumo}
            </p>
          )}

          {!compacto && (
            <span className="mt-auto pt-1 text-sm font-bold text-leaf-bright">
              <span className="inline-flex items-center gap-1 text-leaf">
                Ler notícia <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
              </span>
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
