"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Noticia = {
  id: string;

  titulo: string;

  resumo: string;

  categoria: string;

  imagem_url: string;

  destaque: boolean;

  publicado: boolean;

  slug?: string;

  created_at: string;
};

export default function NoticiasSection() {

  const [noticias, setNoticias] =
    useState<Noticia[]>([]);

  const [titulo, setTitulo] =
    useState("");

  const [resumo, setResumo] =
    useState("");

  const [categoria, setCategoria] =
    useState("");

  const [imagem, setImagem] =
    useState<File | null>(null);

  const [previewImagem, setPreviewImagem] =
    useState("");

  const [destaque, setDestaque] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [loadingNoticias, setLoadingNoticias] =
    useState(true);

  async function carregarNoticias() {

    try {

      setLoadingNoticias(true);

      const { data, error } =
        await supabase
          .from("noticias")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (error) {

        console.log(error);

        return;

      }

      setNoticias(data || []);

    } finally {

      setLoadingNoticias(false);

    }

  }

  function gerarSlug(texto: string) {

    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  }

  async function criarNoticia() {

    if (
      !titulo ||
      !resumo ||
      !categoria
    ) {

      alert(
        "Preencha os campos obrigatórios.",
      );

      return;

    }

    try {

      setLoading(true);

      const slug =
        gerarSlug(titulo);

      let imagemPublica = "";

      if (imagem) {

        const nomeArquivo =
          `${Date.now()}-${imagem.name}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("noticias")
          .upload(
            `banners/${nomeArquivo}`,
            imagem,
          );

        if (uploadError) {

          alert(uploadError.message);

          return;

        }

        const {
          data: imagemData,
        } = supabase.storage
          .from("noticias")
          .getPublicUrl(
            `banners/${nomeArquivo}`,
          );

        imagemPublica =
          imagemData.publicUrl;

      }

      const { error } =
        await supabase
          .from("noticias")
          .insert({

            titulo,

            resumo,

            categoria,

            imagem_url:
              imagemPublica,

            destaque,

            slug,

          });

      if (error) {

        alert(error.message);

        return;

      }

      setTitulo("");

      setResumo("");

      setCategoria("");

      setImagem(null);

      setPreviewImagem("");

      setDestaque(false);

      await carregarNoticias();

      alert(
        "Notícia publicada com sucesso.",
      );

    } catch {

      alert(
        "Erro inesperado ao criar notícia.",
      );

    } finally {

      setLoading(false);

    }

  }

  async function excluirNoticia(
    id: string,
  ) {

    const confirmar =
      confirm(
        "Deseja excluir esta notícia?",
      );

    if (!confirmar) return;

    const { error } =
      await supabase
        .from("noticias")
        .delete()
        .eq("id", id);

    if (error) {

      alert(error.message);

      return;

    }

    carregarNoticias();

  }

  useEffect(() => {

    carregarNoticias();

  }, []);

  return (

    <div className="space-y-10">

      {/* HEADER */}

      <div className="flex items-center justify-between flex-wrap gap-6">

        <div>

          <h1 className="text-4xl font-black text-[#1F2937]">

            Notícias

          </h1>

          <p className="text-zinc-500 mt-2">

            Gerenciamento institucional
            das notícias da ACMRB.

          </p>

        </div>

        <div
          className="
            bg-white
            rounded-3xl
            border
            border-black/5
            px-6
            py-5
            min-w-55
          "
        >

          <p className="text-zinc-500 text-sm">

            Total de notícias

          </p>

          <h2 className="text-4xl font-black text-[#2E5E4E] mt-2">

            {noticias.length}

          </h2>

        </div>

      </div>

      {/* FORM */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-black/5
          p-6
          grid
          md:grid-cols-2
          gap-5
        "
      >

        {/* TITULO */}

        <div className="space-y-2">

          <label className="text-sm font-semibold text-zinc-700">

            Título *

          </label>

          <input
            type="text"
            placeholder="Digite o título"
            value={titulo}
            onChange={(e) =>
              setTitulo(e.target.value)
            }
            className="
              w-full
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-4
              outline-none
              focus:border-[#2E5E4E]
            "
          />

        </div>

        {/* CATEGORIA */}

        <div className="space-y-2">

          <label className="text-sm font-semibold text-zinc-700">

            Categoria *

          </label>

          <input
            type="text"
            placeholder="Ex: Sustentabilidade"
            value={categoria}
            onChange={(e) =>
              setCategoria(e.target.value)
            }
            className="
              w-full
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-4
              outline-none
              focus:border-[#2E5E4E]
            "
          />

        </div>

        {/* RESUMO */}

        <div className="md:col-span-2 space-y-2">

          <label className="text-sm font-semibold text-zinc-700">

            Resumo *

          </label>

          <textarea
            placeholder="Resumo da notícia"
            value={resumo}
            onChange={(e) =>
              setResumo(e.target.value)
            }
            className="
              w-full
              min-h-40
              rounded-2xl
              border
              border-zinc-200
              p-4
              outline-none
              resize-none
              focus:border-[#2E5E4E]
            "
          />

        </div>

        {/* IMAGEM */}

        <div className="md:col-span-2 space-y-3">

          <label className="text-sm font-semibold text-zinc-700">

            Banner da notícia

          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {

              const arquivo =
                e.target.files?.[0];

              if (!arquivo) return;

              setImagem(arquivo);

              setPreviewImagem(
                URL.createObjectURL(
                  arquivo,
                ),
              );

            }}
            className="
              w-full
              rounded-2xl
              border
              border-zinc-200
              p-4
              bg-white
            "
          />

          {previewImagem && (

            <div
              className="
                overflow-hidden
                rounded-3xl
                border
                border-black/5
              "
            >

              <img
                src={previewImagem}
                alt="Preview"
                className="
                  w-full
                  h-72
                  object-cover
                "
              />

            </div>

          )}

        </div>

        {/* CHECKBOX */}

        <label
          className="
            md:col-span-2
            flex
            items-center
            gap-3
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            px-5
            py-4
            cursor-pointer
          "
        >

          <input
            type="checkbox"
            checked={destaque}
            onChange={(e) =>
              setDestaque(
                e.target.checked,
              )
            }
            className="w-5 h-5"
          />

          <span className="font-medium text-zinc-700">

            Destacar notícia
            na página inicial

          </span>

        </label>

        {/* BOTAO */}

        <button
          onClick={criarNoticia}
          disabled={loading}
          className="
            md:col-span-2
            h-14
            rounded-2xl
            bg-[#2E5E4E]
            hover:bg-[#21463A]
            transition
            text-white
            font-bold
            disabled:opacity-50
          "
        >

          {loading
            ? "Publicando..."
            : "Publicar notícia"}

        </button>

      </div>

      {/* LOADING */}

      {loadingNoticias && (

        <div
          className="
            bg-white
            rounded-3xl
            border
            border-black/5
            p-10
            text-center
          "
        >

          <p className="text-zinc-500">

            Carregando notícias...

          </p>

        </div>

      )}

      {/* LISTA */}

      {!loadingNoticias && (

        <div className="grid lg:grid-cols-2 gap-6">

          {noticias.map((item) => (

            <div
              key={item.id}
              className="
                bg-white
                rounded-3xl
                border
                border-black/5
                overflow-hidden
              "
            >

              {item.imagem_url && (

                <img
                  src={item.imagem_url}
                  alt={item.titulo}
                  className="
                    w-full
                    h-64
                    object-cover
                  "
                />

              )}

              <div className="p-6">

                <div className="flex items-center gap-3 flex-wrap">

                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      bg-emerald-100
                      text-emerald-700
                      text-xs
                      font-bold
                    "
                  >

                    {item.categoria}

                  </span>

                  {item.destaque && (

                    <span
                      className="
                        px-3
                        py-1
                        rounded-full
                        bg-yellow-100
                        text-yellow-700
                        text-xs
                        font-bold
                      "
                    >

                      Destaque

                    </span>

                  )}

                </div>

                <h2
                  className="
                    text-2xl
                    font-black
                    text-[#1F2937]
                    mt-5
                  "
                >

                  {item.titulo}

                </h2>

                <p
                  className="
                    text-zinc-600
                    leading-7
                    mt-4
                  "
                >

                  {item.resumo}

                </p>

                <div className="mt-6 flex items-center justify-between gap-4">

                  <span className="text-sm text-zinc-400">

                    {new Date(
                      item.created_at,
                    ).toLocaleDateString(
                      "pt-BR",
                    )}

                  </span>

                  <button
                    onClick={() =>
                      excluirNoticia(
                        item.id,
                      )
                    }
                    className="
                      h-11
                      px-5
                      rounded-2xl
                      bg-red-500
                      hover:bg-red-600
                      transition
                      text-white
                      font-semibold
                    "
                  >

                    Excluir

                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}