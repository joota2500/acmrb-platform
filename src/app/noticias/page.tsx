"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import {
  ArrowRight,
  CalendarDays,
} from "lucide-react";

type Noticia = {
  id: string;

  titulo: string;

  resumo: string;

  categoria: string;

  imagem_url: string;

  slug: string;

  destaque: boolean;

  created_at: string;
};

export default function NoticiasPage() {

  const [noticias, setNoticias] =
    useState<Noticia[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function carregarNoticias() {

    try {

      setLoading(true);

      const { data, error } =
        await supabase
          .from("noticias")
          .select("*")
          .eq("publicado", true)
          .order("destaque", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          });

      if (error) {

        console.log(error);

        return;

      }

      setNoticias(data || []);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    carregarNoticias();

  }, []);

  return (

    <main className="min-h-screen bg-[#F7FAF8]">

      {/* HERO */}

      <section
        className="
          pt-40
          pb-24
          px-6
          relative
          overflow-hidden
        "
      >

        <div className="container-custom">

          <div className="max-w-4xl">

            <div className="section-tag mb-6">

              Portal de Notícias

            </div>

            <h1 className="section-title">

              Notícias, transparência
              e impacto ambiental.

            </h1>

            <p className="section-description mt-8">

              Acompanhe ações ambientais,
              projetos sociais,
              sustentabilidade e iniciativas
              desenvolvidas pela ACMRB.

            </p>

          </div>

        </div>

      </section>

      {/* GRID */}

      <section className="pb-32 px-6">

        <div className="container-custom">

          {loading && (

            <div className="text-center py-20">

              <p className="text-zinc-500">

                Carregando notícias...

              </p>

            </div>

          )}

          {!loading &&
            noticias.length === 0 && (

            <div
              className="
                bg-white
                rounded-4xl
                p-20
                text-center
                border
                border-black/5
              "
            >

              <h2 className="text-3xl font-black text-zinc-900">

                Nenhuma notícia encontrada

              </h2>

            </div>

          )}

          {!loading &&
            noticias.length > 0 && (

            <div
              className="
                grid
                md:grid-cols-2
                xl:grid-cols-3
                gap-8
              "
            >

              {noticias.map((item) => (

                <article
                  key={item.id}
                  className="
                    bg-white
                    rounded-4xl
                    overflow-hidden
                    border
                    border-black/5
                    hover:-translate-y-2
                    transition-all
                    duration-300
                  "
                >

                  {/* IMAGE */}

                  <div className="h-64 overflow-hidden">

                    <img
                      src={item.imagem_url}
                      alt={item.titulo}
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />

                  </div>

                  {/* CONTENT */}

                  <div className="p-8">

                    <div className="flex gap-3 flex-wrap">

                      <span
                        className="
                          px-4
                          py-2
                          rounded-full
                          bg-emerald-100
                          text-emerald-700
                          text-sm
                          font-semibold
                        "
                      >

                        {item.categoria}

                      </span>

                      {item.destaque && (

                        <span
                          className="
                            px-4
                            py-2
                            rounded-full
                            bg-yellow-300
                            text-yellow-950
                            text-sm
                            font-bold
                          "
                        >

                          Destaque

                        </span>

                      )}

                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-zinc-500
                        text-sm
                        mt-5
                      "
                    >

                      <CalendarDays size={16} />

                      <span>

                        {new Date(
                          item.created_at,
                        ).toLocaleDateString(
                          "pt-BR",
                        )}

                      </span>

                    </div>

                    <h2
                      className="
                        text-2xl
                        font-black
                        text-zinc-900
                        mt-5
                        leading-tight
                      "
                    >

                      {item.titulo}

                    </h2>

                    <p
                      className="
                        text-zinc-600
                        leading-8
                        mt-5
                      "
                    >

                      {item.resumo}

                    </p>

                    <a
                      href={`/noticias/${item.slug}`}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        text-emerald-700
                        font-semibold
                        mt-8
                      "
                    >

                      Ler notícia

                      <ArrowRight size={18} />

                    </a>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>

  );

}