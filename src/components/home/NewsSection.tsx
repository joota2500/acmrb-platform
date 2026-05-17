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
          .select("*")
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

    <section id="noticias" className="section-spacing relative overflow-hidden">

      {/* BG */}

      <div className="absolute inset-0 bg-linear-to-b from-white to-emerald-50/40" />

      <div className="container-custom relative z-10">

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
          viewport={{ once: true }}
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-end
            lg:justify-between
            gap-10
          "
        >

          <div className="max-w-4xl">

            <div className="section-tag mb-6">

              Notícias e Atualizações

            </div>

            <h2 className="section-title">

              Transparência, ações ambientais
              e impacto social.

            </h2>

            <p className="section-description mt-8">

              Acompanhe notícias,
              projetos, iniciativas ambientais,
              ações sociais e parcerias
              desenvolvidas pela ACMRB.

            </p>

          </div>

          {/* BUTTON */}

          <a
            href="/noticias"
            className="primary-button whitespace-nowrap"
          >

            Ver todas

            <ArrowRight size={18} />

          </a>

        </motion.div>

        {/* LOADING */}

        {loading && (

          <div
            className="
              grid
              lg:grid-cols-3
              gap-8
              mt-20
            "
          >

            {[1, 2, 3].map((item) => (

              <div
                key={item}
                className="
                  glass-card
                  rounded-4xl
                  overflow-hidden
                  animate-pulse
                "
              >

                <div className="h-60 bg-zinc-200" />

                <div className="p-8 space-y-4">

                  <div className="h-4 w-32 bg-zinc-200 rounded-full" />

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
          news.length === 0 && (

          <div
            className="
              mt-20
              glass-card
              rounded-4xl
              p-16
              text-center
            "
          >

            <h3 className="text-3xl font-black text-zinc-900">

              Nenhuma notícia publicada

            </h3>

            <p className="text-zinc-500 mt-4">

              As notícias aparecerão aqui
              automaticamente.

            </p>

          </div>

        )}

        {/* GRID */}

        {!loading &&
          news.length > 0 && (

          <div className="grid lg:grid-cols-3 gap-8 mt-20">

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
                viewport={{ once: true }}
                className="
                  glass-card
                  rounded-4xl
                  overflow-hidden
                  group
                  hover:-translate-y-2
                  transition-all
                  duration-300
                "
              >

                {/* IMAGE */}

                <div
                  className="
                    h-60
                    relative
                    overflow-hidden
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
                        to-teal-100
                      "
                    />

                  )}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-black/10
                      group-hover:bg-black/0
                      transition-all
                    "
                  />

                  <div className="absolute top-6 left-6 flex gap-3">

                    <span
                      className="
                        px-4
                        py-2
                        rounded-full
                        bg-white/80
                        backdrop-blur-md
                        text-sm
                        font-semibold
                        text-emerald-700
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
                          bg-yellow-400
                          text-yellow-950
                          text-sm
                          font-bold
                        "
                      >

                        Destaque

                      </span>

                    )}

                  </div>

                </div>

                {/* CONTENT */}

                <div className="p-8">

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

                    <CalendarDays size={16} />

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
                      text-2xl
                      font-bold
                      text-zinc-900
                      mt-5
                      leading-tight
                      line-clamp-2
                    "
                  >

                    {item.titulo}

                  </h3>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      text-zinc-600
                      leading-8
                      mt-5
                      line-clamp-3
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
                      font-semibold
                      mt-8
                      hover:gap-3
                      transition-all
                    "
                  >

                    Ler mais

                    <ArrowRight size={18} />

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