"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Associado = {
  id: string;
  nome: string;
  cargo: string;
  tipo_associado: string;
  foto_url?: string;
  bio?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  ativo?: boolean;
  destaque?: boolean;
};

const initialForm = {
  nome: "",
  cargo: "",
  tipo_associado: "",
  bio: "",
  telefone: "",
  email: "",
  endereco: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  ativo: true,
  destaque: false,
};

export default function AssociadosSection() {

  const [associados, setAssociados] =
    useState<Associado[]>([]);

  const [loadingData, setLoadingData] =
    useState(true);

  const [loadingSave, setLoadingSave] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [fotoPreview, setFotoPreview] =
    useState("");

  const [fotoFile, setFotoFile] =
    useState<File | null>(null);

  const [formData, setFormData] =
    useState(initialForm);

  async function carregarAssociados() {

    try {

      setLoadingData(true);

      const { data, error } =
        await supabase
          .from("associados")
          .select("*")
          .order("destaque", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          });

      if (error) {

        alert(error.message);

        return;

      }

      setAssociados(
        (data as Associado[]) || [],
      );

    } catch {

      alert(
        "Erro ao carregar associados.",
      );

    } finally {

      setLoadingData(false);

    }

  }

  async function uploadFoto() {

    if (!fotoFile) return null;

    const extensao =
      fotoFile.name
        .split(".")
        .pop();

    const nomeArquivo =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extensao}`;

    const caminho =
      nomeArquivo;

    const { error } =
      await supabase.storage
        .from("associados")
        .upload(caminho, fotoFile, {
          upsert: true,
        });

    if (error) {

      alert(error.message);

      return null;

    }

    const { data } =
      supabase.storage
        .from("associados")
        .getPublicUrl(caminho);

    return data.publicUrl;

  }

  async function salvarAssociado() {

    if (
      !formData.nome.trim() ||
      !formData.cargo.trim() ||
      !formData.tipo_associado.trim()
    ) {

      alert(
        "Nome, cargo e tipo são obrigatórios.",
      );

      return;

    }

    try {

      setLoadingSave(true);
        let fotoUrl = null;

        if (fotoFile) {

          fotoUrl =
            await uploadFoto();

        } else if (editingId) {

          fotoUrl = fotoPreview;

        }

      const payload = {
        ...formData,
        foto_url: fotoUrl,
      };

      let error = null;

      if (editingId) {

        const response =
          await supabase
            .from("associados")
            .update(payload)
            .eq("id", editingId);

        error = response.error;

      } else {

        const response =
          await supabase
            .from("associados")
            .insert(payload);

        error = response.error;

      }

      if (error) {

        alert(error.message);

        return;

      }

      resetForm();

      carregarAssociados();

      alert(
        editingId
          ? "Associado atualizado."
          : "Associado criado.",
      );

    } catch {

      alert("Erro inesperado.");

    } finally {

      setLoadingSave(false);

    }

  }

  async function excluirAssociado(
    id: string,
  ) {

    const confirmar =
      confirm(
        "Deseja excluir este associado?",
      );

    if (!confirmar) return;

    const { error } =
      await supabase
        .from("associados")
        .delete()
        .eq("id", id);

    if (error) {

      alert(error.message);

      return;

    }

    carregarAssociados();

  }

  function editarAssociado(
    associado: Associado,
  ) {

    setEditingId(
      associado.id,
    );

    setFotoPreview(
      associado.foto_url || "",
    );

    setFormData({
      nome:
        associado.nome || "",

      cargo:
        associado.cargo || "",

      tipo_associado:
        associado.tipo_associado || "",

      bio:
        associado.bio || "",

      telefone:
        associado.telefone || "",

      email:
        associado.email || "",

      endereco:
        associado.endereco || "",

      instagram:
        associado.instagram || "",

      facebook:
        associado.facebook || "",

      linkedin:
        associado.linkedin || "",

      ativo:
        associado.ativo ?? true,

      destaque:
        associado.destaque ?? false,
    });

  }

  function resetForm() {

    setEditingId(null);

    setFotoFile(null);

    setFotoPreview("");

    setFormData(initialForm);

  }

  useEffect(() => {

    carregarAssociados();

  }, []);

  return (

    <div className="space-y-10">

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-6
        "
      >

        <div>

          <h1
            className="
              text-4xl
              font-black
              text-[#1F2937]
            "
          >
            Associados
          </h1>

          <p className="text-zinc-500 mt-2">
            Gestão institucional da ACMRB.
          </p>

        </div>

        <div
          className="
            bg-linear-to-br
            from-[#2E5E4E]
            to-[#21463A]
            rounded-3xl
            p-6
            text-white
            min-w-60
            shadow-xl
          "
        >

          <p className="opacity-80">
            Total de associados
          </p>

          <h2
            className="
              text-5xl
              font-black
              mt-2
            "
          >
            {associados.length}
          </h2>

        </div>

      </div>

      {/* FORM */}

      <div
        className="
          bg-white
          rounded-4xl
          border
          border-black/5
          shadow-sm
          p-8
          grid
          md:grid-cols-2
          gap-5
        "
      >

        {/* FOTO */}

        <label
          className="
            md:col-span-2
            border-2
            border-dashed
            border-zinc-300
            rounded-3xl
            p-10
            flex
            flex-col
            items-center
            justify-center
            cursor-pointer
            hover:border-[#2E5E4E]
            transition
            bg-zinc-50
          "
        >

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {

              const file =
                e.target.files?.[0];

              if (!file) return;

              setFotoFile(file);

              setFotoPreview(
                URL.createObjectURL(file),
              );

            }}
          />

          {fotoPreview ? (

            <img
              src={fotoPreview}
              alt="Preview"
              className="
                w-44
                h-44
                rounded-full
                object-cover
                border-4
                border-white
                shadow-xl
              "
            />

          ) : (

            <div className="text-center">

              <p
                className="
                  text-2xl
                  font-bold
                  text-[#1F2937]
                "
              >
                Upload da Foto
              </p>

              <p className="text-zinc-500 mt-2">
                Clique para selecionar
                uma imagem
              </p>

            </div>

          )}

        </label>

        {/* CAMPOS */}

        <input
          type="text"
          placeholder="Nome completo *"
          value={formData.nome}
          onChange={(e) =>
            setFormData({
              ...formData,
              nome: e.target.value,
            })
          }
          className="h-14 rounded-2xl border border-zinc-200 px-4"
        />

        <input
          type="text"
          placeholder="Cargo *"
          value={formData.cargo}
          onChange={(e) =>
            setFormData({
              ...formData,
              cargo: e.target.value,
            })
          }
          className="h-14 rounded-2xl border border-zinc-200 px-4"
        />

        <select
          value={
            formData.tipo_associado
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              tipo_associado:
                e.target.value,
            })
          }
          className="h-14 rounded-2xl border border-zinc-200 px-4"
        >

          <option value="">
            Tipo de associado *
          </option>

          <option value="Presidência">
            Presidência
          </option>

          <option value="Diretoria">
            Diretoria
          </option>

          <option value="Conselho Fiscal">
            Conselho Fiscal
          </option>

          <option value="Catador">
            Catador
          </option>

          <option value="Voluntário">
            Voluntário
          </option>

        </select>

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
          className="h-14 rounded-2xl border border-zinc-200 px-4"
        />

        <input
          type="text"
          placeholder="Telefone"
          value={formData.telefone}
          onChange={(e) =>
            setFormData({
              ...formData,
              telefone: e.target.value,
            })
          }
          className="h-14 rounded-2xl border border-zinc-200 px-4"
        />

        <input
          type="text"
          placeholder="Endereço"
          value={formData.endereco}
          onChange={(e) =>
            setFormData({
              ...formData,
              endereco: e.target.value,
            })
          }
          className="h-14 rounded-2xl border border-zinc-200 px-4"
        />

        <input
          type="text"
          placeholder="Instagram"
          value={formData.instagram}
          onChange={(e) =>
            setFormData({
              ...formData,
              instagram: e.target.value,
            })
          }
          className="h-14 rounded-2xl border border-zinc-200 px-4"
        />

        <input
          type="text"
          placeholder="Facebook"
          value={formData.facebook}
          onChange={(e) =>
            setFormData({
              ...formData,
              facebook: e.target.value,
            })
          }
          className="h-14 rounded-2xl border border-zinc-200 px-4"
        />

        <input
          type="text"
          placeholder="LinkedIn"
          value={formData.linkedin}
          onChange={(e) =>
            setFormData({
              ...formData,
              linkedin: e.target.value,
            })
          }
          className="
            md:col-span-2
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
          "
        />

        <textarea
          placeholder="Biografia"
          value={formData.bio}
          onChange={(e) =>
            setFormData({
              ...formData,
              bio: e.target.value,
            })
          }
          className="
            md:col-span-2
            min-h-40
            rounded-2xl
            border
            border-zinc-200
            p-4
          "
        />

        {/* CHECKBOXES */}

        <div
          className="
            md:col-span-2
            flex
            flex-wrap
            gap-8
          "
        >

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ativo:
                    e.target.checked,
                })
              }
            />

            <span>
              Associado ativo
            </span>

          </label>

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={
                formData.destaque
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  destaque:
                    e.target.checked,
                })
              }
            />

            <span>
              Colocar em destaque
            </span>

          </label>

        </div>

        {/* BOTÕES */}

        <div
          className="
            md:col-span-2
            flex
            gap-4
          "
        >

          <button
            onClick={salvarAssociado}
            disabled={loadingSave}
            className="
              flex-1
              h-14
              rounded-2xl
              bg-[#2E5E4E]
              hover:bg-[#21463A]
              transition
              text-white
              font-bold
            "
          >

            {loadingSave
              ? "Salvando..."
              : editingId
              ? "Atualizar Associado"
              : "Criar Associado"}

          </button>

          {editingId && (

            <button
              onClick={resetForm}
              className="
                h-14
                px-8
                rounded-2xl
                bg-zinc-200
                font-semibold
              "
            >
              Cancelar
            </button>

          )}

        </div>

      </div>

      {/* LOADING */}

      {loadingData && (

        <div
          className="
            bg-white
            rounded-3xl
            p-10
            border
            border-black/5
            text-center
          "
        >
          Carregando associados...
        </div>

      )}

      {/* LISTA */}

      {!loadingData && (

        <div
          className="
            grid
            md:grid-cols-2
            xl:grid-cols-3
            gap-6
          "
        >

          {associados.map(
            (item) => (

            <div
              key={item.id}
              className="
                bg-white
                rounded-4xl
                overflow-hidden
                border
                border-black/5
                shadow-sm
                hover:shadow-xl
                transition
              "
            >

              <div className="relative h-80 bg-zinc-100">

                {item.foto_url ? (

                  <img
                    src={item.foto_url || "/placeholder.png"}
                    alt={item.nome}
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.png";
                    }}
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />

                ) : (

                  <div
                    className="
                      w-full
                      h-full
                      flex
                      items-center
                      justify-center
                      text-zinc-400
                    "
                  >
                    Sem foto
                  </div>

                )}

                {item.destaque && (

                  <div
                    className="
                      absolute
                      top-4
                      right-4
                      bg-yellow-400
                      text-black
                      text-xs
                      font-bold
                      px-3
                      py-1
                      rounded-full
                    "
                  >
                    Destaque
                  </div>

                )}

              </div>

              <div className="p-6">

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <h2
                      className="
                        text-2xl
                        font-black
                        text-[#1F2937]
                      "
                    >
                      {item.nome}
                    </h2>

                    <p className="mt-2 text-zinc-500">
                      {item.cargo}
                    </p>

                    <p
                      className="
                        text-sm
                        text-[#2E5E4E]
                        font-semibold
                        mt-1
                      "
                    >
                      {
                        item.tipo_associado
                      }
                    </p>

                  </div>

                  <span
                    className={`
                      text-xs
                      px-3
                      py-1
                      rounded-full
                      font-semibold
                      ${
                        item.ativo
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >

                    {item.ativo
                      ? "Ativo"
                      : "Inativo"}

                  </span>

                </div>

                {item.bio && (

                  <p
                    className="
                      mt-5
                      text-zinc-600
                      leading-7
                      line-clamp-4
                    "
                  >
                    {item.bio}
                  </p>

                )}

                <div
                  className="
                    mt-6
                    space-y-2
                    text-sm
                    text-zinc-500
                  "
                >

                  {item.telefone && (
                    <p>
                      📞 {item.telefone}
                    </p>
                  )}

                  {item.email && (
                    <p>
                      ✉️ {item.email}
                    </p>
                  )}

                  {item.endereco && (
                    <p>
                      📍 {item.endereco}
                    </p>
                  )}

                </div>

                <div
                  className="
                    flex
                    gap-3
                    mt-6
                  "
                >

                  <button
                    onClick={() =>
                      editarAssociado(
                        item,
                      )
                    }
                    className="
                      flex-1
                      h-12
                      rounded-2xl
                      bg-blue-500
                      text-white
                      font-semibold
                    "
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      excluirAssociado(
                        item.id,
                      )
                    }
                    className="
                      flex-1
                      h-12
                      rounded-2xl
                      bg-red-500
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