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
  Star,
  MessageCircle,
  Share2,
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

  const [rating, setRating] =
    useState(4);

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
              border-t-[#2E5E4E]
              rounded-full
              animate-spin
              mx-auto
            "
          />

          <p
            className="
              mt-6
              text-zinc-500
            "
          >

            Carregando notícia...

          </p>

        </div>

      </main>

    );

  }

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
            p-10
            md:p-14
            max-w-2xl
            text-center
            shadow-[0_20px_80px_rgba(15,23,42,0.06)]
          "
        >

          <h1
            className="
              text-4xl
              font-black
              text-zinc-900
            "
          >

            Notícia não encontrada

          </h1>

          <p
            className="
              mt-5
              text-zinc-500
              leading-8
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
              mt-10
              px-7
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
          blur-[180px]
          rounded-full
          pointer-events-none
        "
      />

      {/* HERO */}

      <section
        className="
          relative
          min-h-[75vh]
          md:min-h-[90vh]
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
              scale-105
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
            bg-black/70
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-linear-to-t
            from-black
            via-black/40
            to-black/10
          "
        />

        {/* CONTENT */}

        <div
          className="
            relative
            z-10
            min-h-[75vh]
            md:min-h-[90vh]
            flex
            items-end
          "
        >

          <div
            className="
              container-custom
              pb-16
              md:pb-24
            "
          >

            {/* TOP ACTIONS */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                flex-wrap
                mb-8
              "
            >

              <Link
                href="/noticias"
                className="
                  inline-flex
                  items-center
                  gap-3
                  px-5
                  py-3
                  rounded-2xl
                  bg-white/10
                  hover:bg-white/20
                  backdrop-blur-xl
                  border
                  border-white/10
                  text-white
                  transition-all
                "
              >

                <ArrowLeft size={18} />

                Voltar

              </Link>

              <button
                onClick={() => {

                  navigator.share?.({
                    title: noticia.titulo,
                    text: noticia.resumo,
                    url: window.location.href,
                  });

                }}
                className="
                  inline-flex
                  items-center
                  gap-3
                  px-5
                  py-3
                  rounded-2xl
                  bg-white/10
                  hover:bg-white/20
                  backdrop-blur-xl
                  border
                  border-white/10
                  text-white
                  transition-all
                "
              >

                <Share2 size={18} />

                Compartilhar

              </button>

            </div>

            {/* CATEGORY */}

            <span
              className="
                inline-flex
                px-5
                py-3
                rounded-full
                bg-white/15
                backdrop-blur-xl
                border
                border-white/10
                text-white
                text-sm
                font-black
                uppercase
                tracking-wide
              "
            >

              {noticia.categoria}

            </span>

            {/* TITLE */}

            <motion.h1
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                mt-8
                max-w-6xl
                text-[2.7rem]
                sm:text-[3.5rem]
                md:text-[5rem]
                xl:text-[6rem]
                leading-[0.92]
                tracking-tighter
                font-black
                text-white
              "
            >

              {noticia.titulo}

            </motion.h1>

            {/* INFO */}

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-6
                mt-8
                text-white/80
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

            </div>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <section
        className="
          relative
          z-10
          px-5
          py-16
          md:py-24
        "
      >

        <div
          className="
            max-w-4xl
            mx-auto
          "
        >

          {/* RESUMO */}

          <div
            className="
              bg-white/80
              backdrop-blur-xl
              border
              border-black/5
              rounded-4xl
              p-7
              md:p-10
              shadow-[0_20px_80px_rgba(15,23,42,0.05)]
            "
          >

            <p
              className="
                text-[1.05rem]
                md:text-[1.45rem]
                leading-9
                md:leading-10
                text-zinc-700
                font-medium
                text-justify
              "
            >

              {noticia.resumo}

            </p>

          </div>

          {/* ARTICLE */}

          <article
            className="
              mt-10
              bg-white
              rounded-4xl
              border
              border-black/5
              p-7
              sm:p-10
              md:p-14
              shadow-[0_20px_80px_rgba(15,23,42,0.05)]
            "
          >

            <div
              className="
                text-zinc-700
                text-[1rem]
                md:text-[1.08rem]
                leading-8
                md:leading-9
                whitespace-pre-line
                text-justify
              "
            >

              {noticia.conteudo}

            </div>

          </article>

          {/* SOCIAL */}

          <div
            className="
              mt-10
              bg-white/90
              backdrop-blur-xl
              border
              border-black/5
              rounded-4xl
              p-7
              md:p-10
              shadow-[0_20px_80px_rgba(15,23,42,0.05)]
            "
          >

            <div
              className="
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-8
              "
            >

              <div>

                <h3
                  className="
                    text-2xl
                    font-black
                    text-zinc-900
                  "
                >

                  Avalie esta notícia

                </h3>

                <p
                  className="
                    text-zinc-500
                    mt-2
                    leading-7
                  "
                >

                  Sua opinião ajuda
                  a fortalecer a
                  transparência da ACMRB.

                </p>

              </div>

              {/* STARS */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                {[1, 2, 3, 4, 5].map((star) => (

                  <button
                    key={star}
                    onClick={() =>
                      setRating(star)
                    }
                    className="
                      transition-all
                      hover:scale-110
                    "
                  >

                    <Star
                      size={30}
                      className={
                        star <= rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-zinc-300"
                      }
                    />

                  </button>

                ))}

              </div>

            </div>

            {/* COMMENT */}

            <div
              className="
                mt-8
                pt-8
                border-t
                border-black/5
              "
            >

              <button
                onClick={() => {

                  alert(
                    "Área de comentários em desenvolvimento."
                  );

                }}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  px-7
                  py-4
                  rounded-2xl
                  bg-[#2E5E4E]
                  hover:bg-[#23473A]
                  transition-all
                  text-white
                  font-bold
                  shadow-xl
                "
              >

                <MessageCircle size={20} />

                Comentar notícia

              </button>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}