"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Star,
  MessageCircle,
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
            className="max-w-4xl"
          >

            {/* BACK BUTTON */}

            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-3
                text-zinc-600
                hover:text-[#2E5E4E]
                transition-all
                mb-8
                text-sm
                md:text-base
                font-semibold
              "
            >

              <ArrowLeft size={18} />

              Voltar ao portal

            </Link>

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

                <Link
                  key={item.id}
                  href={`/noticias/${item.slug}`}
                  className="block"
                >

                  <motion.article
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
                      h-full
                      rounded-4xl
                      overflow-hidden
                      border
                      border-black/5
                      bg-white/80
                      backdrop-blur-xl
                      hover:-translate-y-2
                      hover:border-emerald-200
                      hover:shadow-[0_25px_80px_rgba(16,24,40,0.08)]
                      transition-all
                      duration-500
                      cursor-pointer
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

                    </div>

                    {/* CONTENT */}

                    <div
                      className="
                        p-6
                        md:p-8
                      "
                    >

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

                      <h2
                        className="
                          text-[1.35rem]
                          md:text-[1.65rem]
                          font-black
                          text-zinc-900
                          mt-4
                          leading-[1.2]
                          line-clamp-2
                          group-hover:text-[#2E5E4E]
                          transition-all
                        "
                      >

                        {item.titulo}

                      </h2>

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

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          mt-8
                          pt-6
                          border-t
                          border-black/5
                        "
                      >

                        {/* ACTION */}

                        <div
                          className="
                            inline-flex
                            items-center
                            gap-2
                            text-emerald-700
                            text-sm
                            md:text-base
                            font-bold
                            group-hover:gap-4
                            transition-all
                          "
                        >

                          Ler notícia

                          <ArrowRight size={18} />

                        </div>

                        {/* SOCIAL */}

                        <div
                          className="
                            flex
                            items-center
                            gap-4
                          "
                        >

                          {/* STARS */}

                          <div
                            className="
                              flex
                              items-center
                              gap-1
                              text-yellow-500
                            "
                          >

                            <Star size={16} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                            <Star size={16} />

                          </div>

                          {/* COMMENT */}

                          <button
                            onClick={(e) => {

                              e.preventDefault();

                              alert(
                                "Área de comentários em desenvolvimento. Faça login para participar futuramente."
                              );

                            }}
                            className="
                              flex
                              items-center
                              gap-2
                              text-zinc-500
                              hover:text-emerald-700
                              transition-all
                            "
                          >

                            <MessageCircle size={18} />

                          </button>

                        </div>

                      </div>

                    </div>

                  </motion.article>

                </Link>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>

  );

}