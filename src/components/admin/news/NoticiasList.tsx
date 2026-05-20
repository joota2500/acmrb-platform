"use client";

import NoticiasCard from "./NoticiasCard";

type Noticia = {
  id: string;

  titulo: string;

  resumo: string;

  conteudo: string;

  categoria: string;

  imagem_url: string;

  destaque: boolean;

  publicado: boolean;

  slug?: string;

  visualizacoes?: number;

  created_at: string;
};

type Props = {
  noticias: Noticia[]; 

  loading: boolean;
 
  onEdit: (
    noticia: Noticia,
  ) => void;

  onDelete: (
    id: string,
  ) => void;
};

export default function NoticiasList({
  noticias,
  loading,
  onEdit,
  onDelete,
}: Props) {

  /* LOADING */

  if (loading) {

    return (

      <div
        className="
          bg-white
          rounded-4xl
          border
          border-black/5
          p-16
          text-center
        "
      >

        <div
          className="
            w-14
            h-14
            border-4
            border-zinc-200
            border-t-[#2E5E4E]
            rounded-full
            animate-spin
            mx-auto
          "
        />

        <p className="text-zinc-500 mt-6">

          Carregando notícias...

        </p>

      </div>

    );

  }

  /* EMPTY */

  if (
    !loading &&
    noticias.length === 0
  ) {

    return (

      <div
        className="
          bg-white
          rounded-4xl
          border
          border-black/5
          p-16
          text-center
        "
      >

        <h2
          className="
            text-3xl
            font-black
            text-zinc-900
          "
        >

          Nenhuma notícia cadastrada

        </h2>

        <p
          className="
            text-zinc-500
            mt-4
            leading-8
            max-w-xl
            mx-auto
          "
        >

          As notícias criadas
          aparecerão aqui
          automaticamente.

        </p>

      </div>

    );

  }

  /* GRID */

  return (

    <div
      className="
        grid
        lg:grid-cols-2
        gap-6
      "
    >

      {noticias.map(
        (noticia) => (

          <NoticiasCard
            key={noticia.id}
            noticia={noticia}
            onEdit={onEdit}
            onDelete={onDelete}
          />

        ),
      )}

    </div>

  );

}