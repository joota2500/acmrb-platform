"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

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

export default function NewsSection() {

  const [news, setNews] =
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
          })
          .limit(3);

      if (error) {

        console.log(error);

        return;

      }

      setNews(data || []);

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

    <section
      id="noticias"
      className="
        section-spacing
        relative
        overflow-hidden
      "
    >

      {/* BG */}

      <div
        className="
          absolute
          inset-0
          bg-linear-to-b
          from-white
          via-emerald-50/30
          to-white
        "
      />

      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-175
          h-175
          bg-emerald-400/10
          blur-[140px]
          rounded-full
        "
      />

      <div
        className="
          container-custom
          relative
          z-10
        "
      >

        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          viewport={{
            once: true,
          }}
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-end
            lg:justify-between
            gap-8
          "
        >

          <div className="max-w-3xl">

            <div className="section-tag mb-5">

              Notícias e Atualizações

            </div>

            <h2
              className="
                section-title
                max-w-3xl
              "
            >

              Transparência,
              impacto ambiental
              e ações sociais.

            </h2>

            <p
              className="
                mt-6
                text-[0.97rem]
                md:text-[1.05rem]
                text-zinc-600
                leading-8
                text-justify
                max-w-2xl
              "
            >

              Acompanhe projetos,
              iniciativas ambientais,
              ações sociais,
              educação ambiental
              e parcerias ESG
              desenvolvidas pela ACMRB.

            </p>

          </div>

          <a
            href="/noticias"
            className="
              primary-button
              whitespace-nowrap
              group
            "
          >

            Ver todas

            <ArrowRight
              size={18}
              className="
                group-hover:translate-x-1
                transition-all
              "
            />

          </a>

        </motion.div>

        {/* GRID */}

        {!loading &&
          news.length > 0 && (

          <div
            className="
              grid
              md:grid-cols-2
              xl:grid-cols-3
              gap-6
              xl:gap-8
              mt-14
            "
          >

            {news.map((item, index) => (

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
                  delay: index * 0.1,
                }}
                viewport={{
                  once: true,
                }}
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
                    relative
                    overflow-hidden
                    bg-zinc-100
                    h-56
                    md:h-60
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

                  {/* TAG */}

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
                        py-1.5
                        rounded-full
                        bg-white/90
                        backdrop-blur-md
                        text-[12px]
                        font-bold
                        text-emerald-700
                      "
                    >

                      {item.categoria}

                    </span>

                    {item.destaque && (

                      <span
                        className="
                          px-3
                          py-1.5
                          rounded-full
                          bg-yellow-400
                          text-yellow-950
                          text-[12px]
                          font-black
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
                    md:p-7
                  "
                >

                  {/* DATE */}

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-zinc-500
                      text-sm
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

                  <h3
                    className="
                      text-[1.35rem]
                      md:text-[1.55rem]
                      font-black
                      text-zinc-900
                      mt-4
                      leading-[1.2]
                      tracking-[-0.02em]
                      line-clamp-2
                    "
                  >

                    {item.titulo}

                  </h3>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      text-[0.96rem]
                      md:text-[1rem]
                      text-zinc-600
                      leading-8
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
                      font-bold
                      mt-7
                      hover:gap-3
                      transition-all
                    "
                  >

                    Ler mais

                    <ArrowRight
                      size={17}
                    />

                  </a>

                </div>

              </motion.article>

            ))}

          </div>

        )}

      </div>

    </section>

  );

}