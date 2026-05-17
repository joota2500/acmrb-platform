"use client";

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
        p-7
        shadow-sm
      "
    >

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

        <div>

          <h2
            className="
              text-3xl
              font-black
              text-[#1F2937]
            "
          >

            {editing
              ? "Editar notícia"
              : "Nova notícia"}

          </h2>

          <p
            className="
              text-zinc-500
              mt-2
            "
          >

            Gerencie conteúdos,
            destaques e publicações.

          </p>

        </div>

      </div>

      {/* GRID */}

      <div
        className="
          grid
          md:grid-cols-2
          gap-5
        "
      >

        {/* TITULO */}

        <div className="space-y-2">

          <label
            className="
              text-sm
              font-bold
              text-zinc-700
            "
          >

            Título *

          </label>

          <input
            type="text"
            placeholder="Digite o título"
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
              px-5
              outline-none
              focus:border-[#2E5E4E]
            "
          />

        </div>

        {/* CATEGORIA */}

        <div className="space-y-2">

          <label
            className="
              text-sm
              font-bold
              text-zinc-700
            "
          >

            Categoria *

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
              px-5
              outline-none
              focus:border-[#2E5E4E]
            "
          />

        </div>

        {/* RESUMO */}

        <div className="md:col-span-2 space-y-2">

          <label
            className="
              text-sm
              font-bold
              text-zinc-700
            "
          >

            Resumo *

          </label>

          <textarea
            placeholder="Resumo da notícia"
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
              p-5
              outline-none
              resize-none
              focus:border-[#2E5E4E]
            "
          />

        </div>

        {/* CONTEUDO */}

        <div className="md:col-span-2 space-y-2">

          <label
            className="
              text-sm
              font-bold
              text-zinc-700
            "
          >

            Conteúdo completo *

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
              min-h-110
              rounded-2xl
              border
              border-zinc-200
              p-5
              outline-none
              resize-none
              focus:border-[#2E5E4E]
              leading-8
            "
          />

        </div>

        {/* IMAGEM */}

        <div className="md:col-span-2 space-y-3">

          <label
            className="
              text-sm
              font-bold
              text-zinc-700
            "
          >

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
                  h-80
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
            gap-4
          "
        >

          {/* DESTAQUE */}

          <label
            className="
              flex
              items-center
              gap-4
              bg-zinc-50
              border
              border-zinc-200
              rounded-2xl
              px-5
              py-5
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

            <div>

              <p
                className="
                  font-bold
                  text-zinc-800
                "
              >

                Destacar notícia

              </p>

              <p
                className="
                  text-sm
                  text-zinc-500
                  mt-1
                "
              >

                Mostrar na homepage

              </p>

            </div>

          </label>

          {/* PUBLICADO */}

          <label
            className="
              flex
              items-center
              gap-4
              bg-zinc-50
              border
              border-zinc-200
              rounded-2xl
              px-5
              py-5
              cursor-pointer
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
              className="w-5 h-5"
            />

            <div>

              <p
                className="
                  font-bold
                  text-zinc-800
                "
              >

                Publicar notícia

              </p>

              <p
                className="
                  text-sm
                  text-zinc-500
                  mt-1
                "
              >

                Tornar visível no portal

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
            pt-2
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
              transition
              text-white
              font-bold
              disabled:opacity-50
            "
          >

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
                px-7
                rounded-2xl
                bg-zinc-200
                hover:bg-zinc-300
                transition
                font-bold
              "
            >

              Cancelar

            </button>

          )}

        </div>

      </div>

    </div>

  );

}