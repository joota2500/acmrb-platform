"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

import {
  CalendarDays,
} from "lucide-react";

type Noticia = {
  id: string;

  titulo: string;

  resumo: string;

  conteudo: string;

  categoria: string;

  imagem_url: string;

  slug: string;

  created_at: string;
};

export default function NoticiaPage() {

  const params = useParams();

  const slug =
    params.slug as string;

  const [noticia, setNoticia] =
    useState<Noticia | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function carregarNoticia() {

    try {

      setLoading(true);

      const { data, error } =
        await supabase
          .from("noticias")
          .select("*")
          .eq("slug", slug)
          .single();

      if (error) {

        console.log(error);

        return;

      }

      setNoticia(data);

      await supabase
        .from("noticias")
        .update({
          visualizacoes:
            (data.visualizacoes || 0) + 1,
        })
        .eq("id", data.id);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    if (slug) {

      carregarNoticia();

    }

  }, [slug]);

  if (loading) {

    return (

      <main
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
      >

        <p className="text-zinc-500">

          Carregando notícia...

        </p>

      </main>

    );

  }

  if (!noticia) {

    return (

      <main
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
      >

        <p className="text-zinc-500">

          Notícia não encontrada.

        </p>

      </main>

    );

  }

  return (

    <main className="min-h-screen bg-white">

      {/* HERO */}

      <section className="relative h-125 overflow-hidden">

        <img
          src={noticia.imagem_url}
          alt={noticia.titulo}
          className="
            w-full
            h-full
            object-cover
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-black/50
          "
        />

        <div
          className="
            absolute
            inset-0
            flex
            items-end
          "
        >

          <div
            className="
              container-custom
              pb-20
              text-white
            "
          >

            <span
              className="
                inline-flex
                px-4
                py-2
                rounded-full
                bg-white/20
                backdrop-blur-md
                text-sm
                font-semibold
              "
            >

              {noticia.categoria}

            </span>

            <h1
              className="
                text-5xl
                md:text-6xl
                font-black
                leading-tight
                mt-8
                max-w-5xl
              "
            >

              {noticia.titulo}

            </h1>

            <div
              className="
                flex
                items-center
                gap-3
                mt-8
                text-white/80
              "
            >

              <CalendarDays size={18} />

              <span>

                {new Date(
                  noticia.created_at,
                ).toLocaleDateString(
                  "pt-BR",
                )}

              </span>

            </div>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <section className="py-24 px-6">

        <div
          className="
            max-w-4xl
            mx-auto
          "
        >

          <p
            className="
              text-2xl
              text-zinc-600
              leading-relaxed
              font-medium
            "
          >

            {noticia.resumo}

          </p>

          <div
            className="
              mt-14
              prose
              prose-lg
              max-w-none
            "
          >

            <p
              className="
                text-zinc-700
                leading-9
                whitespace-pre-line
              "
            >

              {noticia.conteudo}

            </p>

          </div>

        </div>

      </section>

    </main>

  );

}