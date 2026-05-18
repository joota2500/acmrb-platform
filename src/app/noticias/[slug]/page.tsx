"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase";

import {
  ArrowLeft,
  CalendarDays,
  Eye,
} from "lucide-react";

type Noticia = {
  id: string;

  titulo: string;

  resumo: string;

  conteudo: string;

  categoria: string;

  imagem_url: string;

  slug: string;

  visualizacoes?: number;

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
          .eq("publicado", true)
          .single();

      if (error) {

        console.log(error);

        return;

      }

      setNoticia(data);

      // VISUALIZAÇÕES

      await supabase
        .from("noticias")
        .update({
          visualizacoes:
            (data.visualizacoes || 0) + 1,
        })
        .eq("id", data.id);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    if (slug) {

      carregarNoticia();

    }

  }, [slug]);

  // LOADING

  if (loading) {

    return (

      <main
        className="
          min-h-screen
          bg-[#F7FAF8]
          flex
          items-center
          justify-center
        "
      >

        <div className="text-center">

          <div
            className="
              w-14
              h-14
              border-4
              border-emerald-200
              border-t-emerald-700
              rounded-full
              animate-spin
              mx-auto
            "
          />

          <p
            className="
              text-zinc-500
              mt-6
              text-sm
              md:text-base
            "
          >

            Carregando notícia...

          </p>

        </div>

      </main>

    );

  }

  // NOT FOUND

  if (!noticia) {

    return (

      <main
        className="
          min-h-screen
          bg-[#F7FAF8]
          flex
          items-center
          justify-center
          px-6
        "
      >

        <div
          className="
            bg-white
            rounded-4xl
            border
            border-black/5
            p-8
            md:p-14
            text-center
            max-w-2xl
            shadow-[0_20px_80px_rgba(15,23,42,0.04)]
          "
        >

          <h1
            className="
              text-3xl
              md:text-5xl
              font-black
              text-zinc-900
              leading-tight
            "
          >

            Notícia não encontrada

          </h1>

          <p
            className="
              text-zinc-500
              mt-5
              leading-7
              text-sm
              md:text-base
            "
          >

            A publicação solicitada
            não existe ou foi removida.

          </p>

          <Link
            href="/noticias"
            className="
              inline-flex
              items-center
              gap-3
              mt-8
              px-6
              py-4
              rounded-2xl
              bg-[#2E5E4E]
              hover:bg-[#23473A]
              transition-all
              text-white
              font-bold
            "
          >

            <ArrowLeft size={18} />

            Voltar para notícias

          </Link>

        </div>

      </main>

    );

  }

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
          relative
          min-h-[72vh]
          md:min-h-[82vh]
          overflow-hidden
        "
      >

        {/* IMAGE */}

        {noticia.imagem_url ? (

          <img
            src={noticia.imagem_url}
            alt={noticia.titulo}
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
            "
          />

        ) : (

          <div
            className="
              absolute
              inset-0
              bg-linear-to-br
              from-emerald-300
              via-teal-200
              to-cyan-200
            "
          />

        )}

        {/* OVERLAY */}

        <div
          className="
            absolute
            inset-0
            bg-black/65
          "
        />

        {/* CONTENT */}

        <div
          className="
            relative
            z-10
            min-h-[72vh]
            md:min-h-[82vh]
            flex
            items-end
          "
        >

          <div
            className="
              container-custom
              pb-14
              md:pb-24
            "
          >

            {/* VOLTAR */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >

              <Link
                href="/noticias"
                className="
                  inline-flex
                  items-center
                  gap-3
                  text-white/90
                  hover:text-white
                  transition-all
                  mb-8
                  text-sm
                  md:text-base
                "
              >

                <ArrowLeft size={18} />

                Voltar para notícias

              </Link>

            </motion.div>

            {/* CATEGORIA */}

            <motion.span
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="
                inline-flex
                px-4
                py-2
                rounded-full
                bg-white/15
                backdrop-blur-xl
                text-white
                text-xs
                md:text-sm
                font-bold
                border
                border-white/10
              "
            >

              {noticia.categoria}

            </motion.span>

            {/* TITULO */}

            <motion.h1
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="
                text-[2.3rem]
                sm:text-[3rem]
                md:text-[4.5rem]
                xl:text-[5.5rem]
                font-black
                leading-none
                tracking-[-0.03em]
                text-white
                mt-6
                max-w-6xl
              "
            >

              {noticia.titulo}

            </motion.h1>

            {/* INFO */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
              }}
              className="
                flex
                flex-wrap
                items-center
                gap-5
                md:gap-8
                mt-8
                text-white/80
                text-sm
                md:text-base
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
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

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <Eye size={18} />

                <span>

                  {noticia.visualizacoes || 0}
                  {" "}
                  visualizações

                </span>

              </div>

            </motion.div>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <section
        className="
          py-16
          md:py-24
          px-5
          relative
          z-10
        "
      >

        <div
          className="
            max-w-4xl
            mx-auto
          "
        >

          {/* RESUMO */}

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            className="
              bg-white/80
              backdrop-blur-xl
              border
              border-black/5
              rounded-4xl
              p-6
              md:p-10
              shadow-[0_20px_80px_rgba(15,23,42,0.05)]
            "
          >

            <p
              className="
                text-[1.05rem]
                md:text-[1.45rem]
                leading-8
                md:leading-10
                text-zinc-700
                font-medium
                text-justify
              "
            >

              {noticia.resumo}

            </p>

          </motion.div>

          {/* CONTEUDO */}

          <motion.article
            initial={{
              opacity: 0,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              delay: 0.1,
            }}
            className="
              mt-10
              md:mt-14
              bg-white
              rounded-4xl
              border
              border-black/5
              p-6
              md:p-12
              shadow-[0_20px_80px_rgba(15,23,42,0.05)]
            "
          >

            <div
              className="
                text-zinc-700
                text-[1rem]
                md:text-[1.1rem]
                leading-8
                md:leading-9
                whitespace-pre-line
                text-justify
                wrap-break-word
              "
            >

              {noticia.conteudo}

            </div>

          </motion.article>

        </div>

      </section>

    </main>

  );

}