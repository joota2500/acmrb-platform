"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

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
          .select(`
            id,
            titulo,
            resumo,
            categoria,
            imagem_url,
            slug,
            destaque,
            created_at
          `)
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

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    carregarNoticias();

  }, []);

  return (

    <main
      className="
        min-h-screen
        bg-[#F7FAF8]
        overflow-hidden
      "
    >

      {/* BACKGROUND */}

      <div
        className="
          fixed
          top-0
          left-1/2
          -translate-x-1/2
          w-225
          h-225
          bg-emerald-400/10
          blur-[160px]
          rounded-full
          pointer-events-none
        "
      />

      {/* HERO */}

      <section
        className="
          pt-32
          md:pt-40
          pb-16
          md:pb-24
          px-5
          relative
        "
      >

        <div className="container-custom">

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            className="
              max-w-4xl
            "
          >

            <div
              className="
                section-tag
                mb-5
              "
            >

              Portal de Notícias

            </div>

            <h1
              className="
                text-[2.5rem]
                sm:text-[3.2rem]
                md:text-[4.5rem]
                leading-none
                tracking-[-0.04em]
                font-black
                text-zinc-900
                max-w-5xl
              "
            >

              Transparência,
              impacto ambiental
              e ações sociais.

            </h1>

            <p
              className="
                mt-6
                max-w-2xl
                text-sm
                sm:text-base
                md:text-lg
                leading-7
                md:leading-8
                text-zinc-600
                text-justify
              "
            >

              Acompanhe projetos,
              sustentabilidade,
              educação ambiental,
              logística reversa e
              iniciativas desenvolvidas
              pela ACMRB.

            </p>

          </motion.div>

        </div>

      </section>

      {/* GRID */}

      <section
        className="
          pb-20
          md:pb-32
          px-5
          relative
          z-10
        "
      >

        <div className="container-custom">

          {/* LOADING */}

          {loading && (

            <div
              className="
                grid
                md:grid-cols-2
                xl:grid-cols-3
                gap-6
                md:gap-8
              "
            >

              {[1, 2, 3, 4, 5, 6].map((item) => (

                <div
                  key={item}
                  className="
                    rounded-4xl
                    overflow-hidden
                    border
                    border-black/5
                    bg-white/80
                    backdrop-blur-xl
                    animate-pulse
                  "
                >

                  <div className="h-64 md:h-72 bg-zinc-200" />

                  <div className="p-6 md:p-8 space-y-5">

                    <div className="h-5 w-32 bg-zinc-200 rounded-full" />

                    <div className="h-8 w-full bg-zinc-200 rounded-2xl" />

                    <div className="h-4 w-full bg-zinc-200 rounded-full" />

                    <div className="h-4 w-2/3 bg-zinc-200 rounded-full" />

                  </div>

                </div>

              ))}

            </div>

          )}

          {/* EMPTY */}

          {!loading &&
            noticias.length === 0 && (

            <div
              className="
                rounded-4xl
                bg-white/80
                backdrop-blur-xl
                border
                border-black/5
                p-10
                md:p-20
                text-center
              "
            >

              <h2
                className="
                  text-3xl
                  md:text-5xl
                  font-black
                  text-zinc-900
                  leading-tight
                "
              >

                Nenhuma notícia encontrada

              </h2>

              <p
                className="
                  text-zinc-500
                  mt-5
                  text-sm
                  md:text-lg
                  leading-7
                  max-w-2xl
                  mx-auto
                "
              >

                As publicações institucionais
                aparecerão aqui automaticamente.

              </p>

            </div>

          )}

          {/* GRID */}

          {!loading &&
            noticias.length > 0 && (

            <div
              className="
                grid
                md:grid-cols-2
                xl:grid-cols-3
                gap-6
                md:gap-8
              "
            >

              {noticias.map((item, index) => (

                <motion.article
                  key={item.id}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  viewport={{ once: true }}
                  className="
                    group
                    rounded-4xl
                    overflow-hidden
                    border
                    border-black/5
                    bg-white/80
                    backdrop-blur-xl
                    hover:-translate-y-2
                    hover:shadow-[0_25px_80px_rgba(16,24,40,0.08)]
                    transition-all
                    duration-500
                  "
                >

                  {/* IMAGE */}

                  <div
                    className="
                      h-60
                      md:h-72
                      overflow-hidden
                      relative
                      bg-zinc-100
                    "
                  >

                    {item.imagem_url ? (

                      <img
                        src={item.imagem_url}
                        alt={item.titulo}
                        className="
                          w-full
                          h-full
                          object-cover
                          group-hover:scale-105
                          transition-all
                          duration-700
                        "
                      />

                    ) : (

                      <div
                        className="
                          w-full
                          h-full
                          bg-linear-to-br
                          from-emerald-200
                          via-teal-100
                          to-cyan-100
                        "
                      />

                    )}

                    {/* OVERLAY */}

                    <div
                      className="
                        absolute
                        inset-0
                        bg-linear-to-t
                        from-black/35
                        via-black/5
                        to-transparent
                      "
                    />

                    {/* TAGS */}

                    <div
                      className="
                        absolute
                        top-5
                        left-5
                        flex
                        gap-2
                        flex-wrap
                      "
                    >

                      <span
                        className="
                          px-3
                          py-2
                          rounded-full
                          bg-white/90
                          backdrop-blur-md
                          text-[0.72rem]
                          md:text-xs
                          font-bold
                          text-emerald-700
                          shadow-lg
                        "
                      >

                        {item.categoria}

                      </span>

                      {item.destaque && (

                        <span
                          className="
                            px-3
                            py-2
                            rounded-full
                            bg-yellow-400
                            text-yellow-950
                            text-[0.72rem]
                            md:text-xs
                            font-black
                            shadow-lg
                          "
                        >

                          Destaque

                        </span>

                      )}

                    </div>

                  </div>

                  {/* CONTENT */}

                  <div
                    className="
                      p-6
                      md:p-8
                    "
                  >

                    {/* DATE */}

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-zinc-500
                        text-xs
                        md:text-sm
                      "
                    >

                      <CalendarDays size={15} />

                      <span>

                        {new Date(
                          item.created_at,
                        ).toLocaleDateString(
                          "pt-BR",
                        )}

                      </span>

                    </div>

                    {/* TITLE */}

                    <h2
                      className="
                        text-[1.35rem]
                        md:text-[1.65rem]
                        font-black
                        text-zinc-900
                        mt-4
                        leading-[1.2]
                        line-clamp-2
                      "
                    >

                      {item.titulo}

                    </h2>

                    {/* RESUMO */}

                    <p
                      className="
                        text-zinc-600
                        text-sm
                        md:text-[0.98rem]
                        leading-7
                        mt-4
                        text-justify
                        line-clamp-4
                      "
                    >

                      {item.resumo}

                    </p>

                    {/* LINK */}

                    <a
                      href={`/noticias/${item.slug}`}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        text-emerald-700
                        text-sm
                        md:text-base
                        font-bold
                        mt-7
                        hover:gap-4
                        transition-all
                      "
                    >

                      Ler notícia

                      <ArrowRight
                        size={18}
                      />

                    </a>

                  </div>

                </motion.article>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>

  );

}