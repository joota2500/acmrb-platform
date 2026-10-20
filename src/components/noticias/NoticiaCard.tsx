/**
 * NoticiaCard — cartão de notícia (resumo)
 * ------------------------------------------------------------
 * Usado na home, na página /noticias e em "relacionadas".
 * A imagem aparece INTEIRA (object-fit: contain) dentro de uma
 * moldura de proporção fixa com fundo neutro, sem cortar a foto.
 * Variantes: "grande" (manchete), "normal" e "compacto" (lista lateral).
 */

import Link from "next/link";
import { CalendarDays, Clock, Eye, ImageOff } from "lucide-react";
import { formatarData, textoPuro, type Noticia } from "@/lib/noticias";

import "@/styles/noticia-card.css";

interface Props {
  noticia: Noticia;
  variante?: "grande" | "normal" | "compacto";
  mostrarVisualizacoes?: boolean;
  nivelTitulo?: "h2" | "h3";
}

export default function NoticiaCard({ noticia: n, variante = "normal", mostrarVisualizacoes = false, nivelTitulo = "h3" }: Props) {
  const Titulo = nivelTitulo;
  const resumo = n.resumo || textoPuro(n.conteudo).slice(0, 220);

  return (
    <article className={`ncard ncard--${variante}`}>
      <Link href={`/noticias/${n.slug}`} className="ncard__link" aria-label={`Ler notícia: ${n.titulo}`}>
        <div className="ncard__moldura">
          {n.imagem_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={n.imagem_url} alt={n.imagem_alt} loading="lazy" className="ncard__img" />
          ) : (
            <span className="ncard__sem-img" aria-hidden="true">
              <ImageOff size={28} />
            </span>
          )}
          {n.destaque && <span className="ncard__selo">Destaque</span>}
        </div>

        <div className="ncard__corpo">
          <div className="ncard__meta">
            {n.categoria && <span className="ncard__categoria">{n.categoria}</span>}
            <span className="ncard__info">
              <CalendarDays size={13} aria-hidden="true" />
              <time dateTime={n.publicado_em}>{formatarData(n.publicado_em)}</time>
            </span>
            <span className="ncard__info">
              <Clock size={13} aria-hidden="true" />
              {n.tempo_leitura} min
            </span>
            {mostrarVisualizacoes && n.visualizacoes > 0 && (
              <span className="ncard__info">
                <Eye size={13} aria-hidden="true" />
                {n.visualizacoes}
              </span>
            )}
          </div>

          <Titulo className="ncard__titulo">{n.titulo}</Titulo>
          {variante !== "compacto" && resumo && <p className="ncard__resumo">{resumo}</p>}
          <span className="ncard__ler">Ler notícia →</span>
        </div>
      </Link>
    </article>
  );
}
