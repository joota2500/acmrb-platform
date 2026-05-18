import Link from "next/link";

import {
  ArrowLeft,
  Mail,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

async function getAssociado(
  slug: string,
) {

  const { data } =
    await supabase
      .from("associados")
      .select("*")
      .eq("slug", slug)
      .single();

  return data;

}

export default async function AssociadoDetalhe({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {

  const { slug } =
  await params;

const associado =
  await getAssociado(
    slug,
  );

  if (!associado) {

    return (
      <main className="p-20">
        Associado não encontrado.
      </main>
    );

  }

  return (

    <main className="bg-[#F5F7F4] min-h-screen">

      <section
        className="
          pt-28
          pb-24
        "
      >

        <div
          className="
            max-w-6xl
            mx-auto
            px-5
          "
        >

          <Link
            href="/associados"
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
              font-semibold
            "
          >

            <ArrowLeft size={18} />

            Voltar

          </Link>

          <div
            className="
              mt-10
              bg-white
              rounded-[40px]
              overflow-hidden
              border
              border-black/5
              shadow-sm
            "
          >

            <div
              className="
                grid
                xl:grid-cols-2
              "
            >

              <div className="relative min-h-175">

                <img
                  src={
                    associado.foto_url ||
                    "/placeholder.png"
                  }
                  alt={
                    associado.nome
                  }
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

              </div>

              <div
                className="
                  p-8
                  md:p-14
                "
              >

                <span
                  className="
                    px-5
                    py-3
                    rounded-full
                    bg-[#DDF5EC]
                    text-[#2E5E4E]
                    font-bold
                    text-sm
                  "
                >
                  {
                    associado.tipo_associado
                  }
                </span>

                <h1
                  className="
                    mt-8
                    text-5xl
                    font-black
                    text-[#111827]
                  "
                >
                  {associado.nome}
                </h1>

                <p
                  className="
                    mt-4
                    text-2xl
                    font-semibold
                    text-[#2E5E4E]
                  "
                >
                  {associado.cargo}
                </p>

                {associado.bio && (

                  <div
                    className="
                      mt-10
                      text-zinc-600
                      leading-9
                      text-lg
                      space-y-6
                    "
                  >

                    <p>
                      {associado.bio}
                    </p>

                  </div>

                )}

                {associado.email && (

                  <div
                    className="
                      mt-10
                      flex
                      items-center
                      gap-4
                      text-zinc-600
                    "
                  >

                    <Mail size={18} />

                    {associado.email}

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}