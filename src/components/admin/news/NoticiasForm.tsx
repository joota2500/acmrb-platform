"use client";

import {
  ImagePlus,
  Sparkles,
  Eye,
  Star,
  Save,
  X,
} from "lucide-react";

type Props = {
  titulo: string;

  setTitulo: (
    value: string,
  ) => void;

  resumo: string;

  setResumo: (
    value: string,
  ) => void;

  categoria: string;

  setCategoria: (
    value: string,
  ) => void;

  conteudo: string;

  setConteudo: (
    value: string,
  ) => void;

  destaque: boolean;

  setDestaque: (
    value: boolean,
  ) => void;

  publicado: boolean;

  setPublicado: (
    value: boolean,
  ) => void;

  previewImagem: string;

  setImagem: (
    file: File | null,
  ) => void;

  setPreviewImagem: (
    value: string,
  ) => void;

  onSubmit: () => void;

  onCancel: () => void;

  loading: boolean;

  editing: boolean;
};

export default function NoticiasForm({
  titulo,
  setTitulo,

  resumo,
  setResumo,

  categoria,
  setCategoria,

  conteudo,
  setConteudo,

  destaque,
  setDestaque,

  publicado,
  setPublicado,

  previewImagem,

  setImagem,
  setPreviewImagem,

  onSubmit,
  onCancel,

  loading,
  editing,
}: Props) {

  return (

    <div
      className="
        bg-white
        rounded-4xl
        border
        border-black/5
        p-8
        shadow-sm
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-6
          flex-wrap
          mb-10
        "
      >

        <div>

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-[#E8F3EE]
              text-[#2E5E4E]
              font-black
              text-sm
              mb-5
            "
          >

            <Sparkles size={15} />

            Portal Institucional

          </div>

          <h2
            className="
              text-4xl
              font-black
              text-[#111827]
            "
          >

            {editing
              ? "Editar notícia"
              : "Nova notícia"}

          </h2>

          <p
            className="
              text-zinc-500
              mt-3
              leading-7
            "
          >

            Gerencie conteúdos,
            banners, destaques
            e publicação institucional.

          </p>

        </div>

      </div>

      {/* GRID */}

      <div
        className="
          grid
          md:grid-cols-2
          gap-6
        "
      >

        {/* TITULO */}

        <div className="space-y-3">

          <label
            className="
              text-sm
              font-black
              text-zinc-700
            "
          >

            Título da notícia

          </label>

          <input
            type="text"
            placeholder="Digite um título profissional..."
            value={titulo}
            onChange={(e) =>
              setTitulo(
                e.target.value,
              )
            }
            className="
              w-full
              h-14
              rounded-2xl
              border
              border-zinc-200
              bg-zinc-50
              px-5
              outline-none
              transition-all
              focus:bg-white
              focus:border-[#2E5E4E]
              focus:ring-4
              focus:ring-[#2E5E4E]/10
            "
          />

        </div>

        {/* CATEGORIA */}

        <div className="space-y-3">

          <label
            className="
              text-sm
              font-black
              text-zinc-700
            "
          >

            Categoria

          </label>

          <input
            type="text"
            placeholder="Ex: Sustentabilidade"
            value={categoria}
            onChange={(e) =>
              setCategoria(
                e.target.value,
              )
            }
            className="
              w-full
              h-14
              rounded-2xl
              border
              border-zinc-200
              bg-zinc-50
              px-5
              outline-none
              transition-all
              focus:bg-white
              focus:border-[#2E5E4E]
              focus:ring-4
              focus:ring-[#2E5E4E]/10
            "
          />

        </div>

        {/* RESUMO */}

        <div className="md:col-span-2 space-y-3">

          <label
            className="
              text-sm
              font-black
              text-zinc-700
            "
          >

            Resumo institucional

          </label>

          <textarea
            placeholder="Resumo curto da notícia..."
            value={resumo}
            onChange={(e) =>
              setResumo(
                e.target.value,
              )
            }
            className="
              w-full
              min-h-36
              rounded-2xl
              border
              border-zinc-200
              bg-zinc-50
              p-5
              outline-none
              resize-none
              leading-8
              transition-all
              focus:bg-white
              focus:border-[#2E5E4E]
              focus:ring-4
              focus:ring-[#2E5E4E]/10
            "
          />

        </div>

        {/* CONTEUDO */}

        <div className="md:col-span-2 space-y-3">

          <label
            className="
              text-sm
              font-black
              text-zinc-700
            "
          >

            Conteúdo completo

          </label>

          <textarea
            placeholder="Digite a notícia completa..."
            value={conteudo}
            onChange={(e) =>
              setConteudo(
                e.target.value,
              )
            }
            className="
              w-full
              min-h-125
              rounded-2xl
              border
              border-zinc-200
              bg-zinc-50
              p-5
              outline-none
              resize-none
              leading-9
              transition-all
              focus:bg-white
              focus:border-[#2E5E4E]
              focus:ring-4
              focus:ring-[#2E5E4E]/10
            "
          />

        </div>

        {/* UPLOAD */}

        <div className="md:col-span-2">

          <label
            className="
              text-sm
              font-black
              text-zinc-700
              mb-4
              block
            "
          >

            Banner da notícia

          </label>

          <label
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-4
              border-2
              border-dashed
              border-zinc-300
              rounded-[28px]
              p-10
              bg-zinc-50
              cursor-pointer
              transition-all
              hover:border-[#2E5E4E]
              hover:bg-[#F6FBF8]
            "
          >

            <div
              className="
                w-20
                h-20
                rounded-full
                bg-[#E8F3EE]
                flex
                items-center
                justify-center
                text-[#2E5E4E]
              "
            >

              <ImagePlus size={32} />

            </div>

            <div className="text-center">

              <h3
                className="
                  text-lg
                  font-black
                  text-zinc-900
                "
              >

                Clique para enviar imagem

              </h3>

              <p
                className="
                  text-zinc-500
                  mt-2
                "
              >

                PNG, JPG ou WEBP

              </p>

            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
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
            />

          </label>

          {/* PREVIEW */}

          {previewImagem && (

            <div
              className="
                mt-6
                overflow-hidden
                rounded-[28px]
                border
                border-black/5
              "
            >

              <img
                src={previewImagem}
                alt="Preview"
                className="
                  w-full
                  h-100
                  object-cover
                "
              />

            </div>

          )}

        </div>

        {/* SWITCHES */}

        <div
          className="
            md:col-span-2
            grid
            md:grid-cols-2
            gap-5
          "
        >

          {/* DESTAQUE */}

          <label
            className="
              flex
              items-center
              gap-5
              rounded-[28px]
              border
              border-zinc-200
              bg-zinc-50
              p-6
              cursor-pointer
              transition-all
              hover:border-yellow-300
              hover:bg-yellow-50
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
              className="
                w-5
                h-5
              "
            />

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-yellow-100
                text-yellow-700
                flex
                items-center
                justify-center
              "
            >

              <Star size={24} />

            </div>

            <div>

              <h3
                className="
                  font-black
                  text-zinc-900
                "
              >

                Notícia em destaque

              </h3>

              <p
                className="
                  text-zinc-500
                  text-sm
                  mt-1
                "
              >

                Mostrar na homepage.

              </p>

            </div>

          </label>

          {/* PUBLICADO */}

          <label
            className="
              flex
              items-center
              gap-5
              rounded-[28px]
              border
              border-zinc-200
              bg-zinc-50
              p-6
              cursor-pointer
              transition-all
              hover:border-blue-300
              hover:bg-blue-50
            "
          >

            <input
              type="checkbox"
              checked={publicado}
              onChange={(e) =>
                setPublicado(
                  e.target.checked,
                )
              }
              className="
                w-5
                h-5
              "
            />

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-blue-100
                text-blue-700
                flex
                items-center
                justify-center
              "
            >

              <Eye size={24} />

            </div>

            <div>

              <h3
                className="
                  font-black
                  text-zinc-900
                "
              >

                Publicar notícia

              </h3>

              <p
                className="
                  text-zinc-500
                  text-sm
                  mt-1
                "
              >

                Tornar visível no portal.

              </p>

            </div>

          </label>

        </div>

        {/* ACTIONS */}

        <div
          className="
            md:col-span-2
            flex
            gap-4
            pt-4
          "
        >

          <button
            onClick={onSubmit}
            disabled={loading}
            className="
              flex-1
              h-14
              rounded-2xl
              bg-[#2E5E4E]
              hover:bg-[#21463A]
              transition-all
              text-white
              font-black
              flex
              items-center
              justify-center
              gap-3
              disabled:opacity-50
            "
          >

            <Save size={18} />

            {loading
              ? (
                editing
                  ? "Atualizando..."
                  : "Publicando..."
              )
              : (
                editing
                  ? "Atualizar notícia"
                  : "Publicar notícia"
              )}

          </button>

          {editing && (

            <button
              onClick={onCancel}
              className="
                h-14
                px-8
                rounded-2xl
                bg-zinc-200
                hover:bg-zinc-300
                transition-all
                font-black
                flex
                items-center
                justify-center
                gap-2
              "
            >

              <X size={18} />

              Cancelar

            </button>

          )}

        </div>

      </div>

    </div>

  );

}