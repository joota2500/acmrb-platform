"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Star,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Associado = {
  id: string;
  nome: string;
  cargo: string;
  tipo_associado: string;
  foto_url?: string;
  destaque?: boolean;
  slug?: string;
};

export default function AssociadosPage() {

  const [associados, setAssociados] =
    useState<Associado[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function carregar() {

    try {

      setLoading(true);

      const { data, error } =
        await supabase
          .from("associados")
          .select(`
            id,
            nome,
            cargo,
            tipo_associado,
            foto_url,
            destaque,
            slug
          `)
          .eq("ativo", true)
          .order("destaque", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          });

      if (error) {

        console.error(error);

        return;

      }

      setAssociados(
        (data as Associado[]) || [],
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    carregar();

  }, []);

  return (

    <main className="bg-[#F5F7F4] min-h-screen">

      {/* HERO */}

      <section
        className="
          pt-28
          pb-20
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-5
          "
        >

          {/* VOLTAR */}

          <Link
            href="/quem-somos"
            className="
              inline-flex
              items-center
              gap-3
              px-5
              h-12
              rounded-2xl
              bg-white
              border
              border-black/5
              shadow-sm
              hover:shadow-lg
              transition
              font-semibold
            "
          >

            <ArrowLeft size={18} />

            Voltar

          </Link>

          {/* HERO CARD */}

          <div
            className="
              mt-10
              bg-white
              rounded-[40px]
              p-8
              md:p-14
              border
              border-black/5
              shadow-sm
            "
          >

            <div
              className="
                inline-flex
                items-center
                gap-3
                px-5
                py-3
                rounded-full
                bg-[#DDF5EC]
                text-[#2E5E4E]
                font-bold
              "
            >

              <Users size={18} />

              Equipe ACMRB

            </div>

            <h1
              className="
                mt-8
                text-5xl
                md:text-6xl
                font-black
                leading-none
                text-[#111827]
              "
            >
              Todos os associados
              da ACMRB.
            </h1>

            <p
              className="
                mt-8
                max-w-4xl
                text-lg
                leading-9
                text-zinc-600
              "
            >
              Conheça as pessoas que
              fazem parte da Associação
              dos Catadores de Materiais
              Recicláveis de Baturité,
              fortalecendo diariamente a
              reciclagem, inclusão social
              e transformação ambiental.
            </p>

          </div>

        </div>

      </section>

      {/* LISTA */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-5
          pb-24
        "
      >

        {loading ? (

          <div
            className="
              bg-white
              rounded-[40px]
              p-16
              text-center
              border
              border-black/5
            "
          >
            Carregando associados...
          </div>

        ) : (

          <div
            className="
              grid
              md:grid-cols-2
              xl:grid-cols-3
              gap-8
            "
          >

            {associados.map(
              (item) => (

              <Link
                key={item.id}
                href={`/associados/${item.slug}`}
                className="
                  bg-white
                  rounded-[36px]
                  overflow-hidden
                  border
                  border-black/5
                  shadow-sm
                  hover:shadow-2xl
                  transition
                  group
                "
              >

                {/* FOTO */}

                <div
                  className="
                    relative
                    h-85
                    bg-zinc-100
                    overflow-hidden
                  "
                >

                  <img
                    src={
                      item.foto_url ||
                      "/placeholder.png"
                    }
                    alt={item.nome}
                    className="
                      w-full
                      h-full
                      object-cover
                      group-hover:scale-105
                      transition
                      duration-500
                    "
                  />

                  {item.destaque && (

                    <div
                      className="
                        absolute
                        top-5
                        right-5
                        bg-yellow-400
                        text-black
                        px-4
                        py-2
                        rounded-full
                        text-xs
                        font-bold
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <Star size={14} />

                      Destaque

                    </div>

                  )}

                </div>

                {/* INFO */}

                <div className="p-7">

                  <p
                    className="
                      text-sm
                      font-bold
                      text-[#2E5E4E]
                    "
                  >
                    {item.tipo_associado}
                  </p>

                  <h2
                    className="
                      mt-3
                      text-3xl
                      font-black
                      text-[#111827]
                    "
                  >
                    {item.nome}
                  </h2>

                  <p
                    className="
                      mt-3
                      text-zinc-600
                      font-semibold
                    "
                  >
                    {item.cargo}
                  </p>

                  <div
                    className="
                      mt-8
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <span
                      className="
                        text-sm
                        text-zinc-500
                        font-semibold
                      "
                    >
                      Ver perfil
                    </span>

                    <div
                      className="
                        w-11
                        h-11
                        rounded-2xl
                        bg-[#2E5E4E]
                        text-white
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <ArrowRight size={18} />

                    </div>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

    </main>

  );

}