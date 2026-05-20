"use client";

import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  CalendarDays,
  BarChart3,
} from "lucide-react";

type Noticia = {
  id: string;

  titulo: string;

  resumo: string;

  conteudo?: string;

  categoria: string;

  imagem_url: string;

  destaque: boolean;

  publicado: boolean;

  slug?: string;

  visualizacoes?: number;

  created_at: string;
};

type Props = {
  noticia: Noticia;

  onEdit: (
    noticia: Noticia,
  ) => void;

  onDelete: (
    id: string,
  ) => void;
};

export default function NoticiasCard({
  noticia,
  onEdit,
  onDelete,
}: Props) {

  return (

    <div
      className="
        group
        bg-white
        rounded-4xl
        border
        border-black/5
        overflow-hidden
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-2xl
      "
    >

      {/* IMAGE */}

      <div
        className="
          relative
          h-72
          overflow-hidden
          bg-zinc-100
        "
      >

        {noticia.imagem_url ? (

          <img
            src={noticia.imagem_url}
            alt={noticia.titulo}
            className="
              w-full
              h-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />

        ) : (

          <div
            className="
              w-full
              h-full
              bg-linear-to-br
              from-[#2E5E4E]
              to-[#6FA58D]
            "
          />

        )}

        {/* OVERLAY */}

        <div
          className="
            absolute
            inset-0
            bg-linear-to-t 
            from-black/50
            to-transparent 
          "
        /> 

        {/* TOP BADGES */}

        <div
          className="
            absolute
            top-5
            left-5
            flex
            flex-wrap
            gap-2
          "
        >

          <span
            className="
              px-4
              py-2
              rounded-full
              bg-white/90
              backdrop-blur-sm
              text-[#1F2937]
              text-xs
              font-black
            "
          >

            {noticia.categoria}

          </span>

          {noticia.destaque && (

            <span
              className="
                px-4
                py-2
                rounded-full
                bg-yellow-400
                text-yellow-950
                text-xs
                font-black
                flex
                items-center
                gap-2
              "
            >

              <Star size={12} />

              Destaque

            </span>

          )}

        </div>

        {/* STATUS */}

        <div
          className="
            absolute
            bottom-5
            right-5
          "
        >

          {noticia.publicado ? (

            <div
              className="
                px-4
                py-2
                rounded-full
                bg-emerald-500
                text-white
                text-xs
                font-black
                flex
                items-center
                gap-2
                shadow-lg
              "
            >

              <Eye size={14} />

              Publicado

            </div>

          ) : (

            <div
              className="
                px-4
                py-2
                rounded-full
                bg-zinc-800
                text-white
                text-xs
                font-black
                flex
                items-center
                gap-2
                shadow-lg
              "
            >

              <EyeOff size={14} />

              Oculto

            </div>

          )}

        </div>

      </div>

      {/* CONTENT */}

      <div className="p-7">

        {/* TITLE */}

        <h2
          className="
            text-3xl
            font-black
            text-[#111827]
            leading-tight
            line-clamp-2
          "
        >

          {noticia.titulo}

        </h2>

        {/* RESUMO */}

        <p
          className="
            mt-5
            text-zinc-600
            leading-8
            line-clamp-3
          "
        >

          {noticia.resumo}

        </p>

        {/* METRICS */}

        <div
          className="
            mt-7
            grid
            grid-cols-2
            gap-4
          "
        >

          <div
            className="
              bg-zinc-50
              border
              border-zinc-100
              rounded-2xl
              p-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                text-zinc-500
                text-sm
                font-semibold
              "
            >

              <CalendarDays size={16} />

              Publicação

            </div>

            <p
              className="
                mt-2
                text-[#111827]
                font-black
              "
            >

              {new Date(
                noticia.created_at,
              ).toLocaleDateString(
                "pt-BR",
              )}

            </p>

          </div>

          <div
            className="
              bg-zinc-50
              border
              border-zinc-100
              rounded-2xl
              p-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                text-zinc-500
                text-sm
                font-semibold
              "
            >

              <BarChart3 size={16} />

              Visualizações

            </div>

            <p
              className="
                mt-2
                text-[#111827]
                font-black
              "
            >

              {noticia.visualizacoes || 0}

            </p>

          </div>

        </div>

        {/* ACTIONS */}

        <div
          className="
            mt-8
            flex
            gap-4
          "
        >

          <button
            onClick={() =>
              onEdit(noticia)
            }
            className="
              flex-1
              h-12
              rounded-2xl
              bg-blue-500
              hover:bg-blue-600
              transition
              text-white
              font-bold
              flex
              items-center
              justify-center
              gap-2
            "
          >

            <Pencil size={16} />

            Editar

          </button>

          <button
            onClick={() =>
              onDelete(
                noticia.id,
              )
            }
            className="
              flex-1
              h-12
              rounded-2xl
              bg-red-500
              hover:bg-red-600
              transition
              text-white
              font-bold
              flex
              items-center
              justify-center
              gap-2
            "
          >

            <Trash2 size={16} />

            Excluir

          </button>

        </div>

      </div>

    </div>

  );

}