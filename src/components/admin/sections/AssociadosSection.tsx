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
    useState({

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

    });

  async function carregarAssociados() {

    try {

      setLoadingData(true);

      const {
        data,
        error,
      } = await supabase
        .from("associados")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {

        alert(error.message);

        return;

      }

      setAssociados(data || []);

    } catch {

      alert(
        "Erro ao carregar associados."
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
      `${Date.now()}.${extensao}`;

    const caminho =
      `associados/${nomeArquivo}`;

    const { error } =
      await supabase.storage
        .from("acmrb")
        .upload(
          caminho,
          fotoFile,
        );

    if (error) {

      alert(error.message);

      return null;

    }

    const { data } =
      supabase.storage
        .from("acmrb")
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
        "Nome, cargo e tipo são obrigatórios."
      );

      return;

    }

    try {

      setLoadingSave(true);

      let fotoUrl = null;

      if (fotoFile) {

        fotoUrl =
          await uploadFoto();

      }

      const payload = {

        ...formData,

        foto_url:
          fotoUrl ||
          fotoPreview ||
          null,

      };

      let error = null;

      if (editingId) {

        const response =
          await supabase
            .from("associados")
            .update(payload)
            .eq(
              "id",
              editingId,
            );

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
          : "Associado criado."
      );

    } catch {

      alert(
        "Erro inesperado."
      );

    } finally {

      setLoadingSave(false);

    }

  }

  async function excluirAssociado(
    id: string,
  ) {

    const confirmar =
      confirm(
        "Deseja excluir este associado?"
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

    setFormData({

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

    });

  }

  useEffect(() => {

    carregarAssociados();

  }, []);

  return (

    <div className="space-y-10">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-black text-[#1F2937]">
            Associados
          </h1>

          <p className="text-zinc-500 mt-2">
            Gestão institucional da ACMRB.
          </p>

        </div>

        <div
          className="
            bg-white
            rounded-3xl
            p-6
            border
            border-black/5
            min-w-55
          "
        >

          <p className="text-zinc-500">
            Total de associados
          </p>

          <h2
            className="
              text-4xl
              font-black
              text-[#2E5E4E]
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
          rounded-3xl
          border
          border-black/5
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
            p-8
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
                e.target
                  .files?.[0];

              if (!file) return;

              setFotoFile(file);

              setFotoPreview(
                URL.createObjectURL(
                  file,
                ),
              );

            }}
          />

          {fotoPreview ? (

            <img
              src={fotoPreview}
              alt="Preview"
              className="
                w-40
                h-40
                rounded-full
                object-cover
                border-4
                border-white
                shadow-lg
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

        {/* NOME */}

        <input
          type="text"
          placeholder="Nome completo *"
          value={formData.nome}
          onChange={(e) =>
            setFormData({
              ...formData,
              nome:
                e.target.value,
            })
          }
          className="
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
            outline-none
          "
        />

        {/* CARGO */}

        <input
          type="text"
          placeholder="Cargo *"
          value={formData.cargo}
          onChange={(e) =>
            setFormData({
              ...formData,
              cargo:
                e.target.value,
            })
          }
          className="
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
            outline-none
          "
        />

        {/* TIPO */}

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
          className="
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
            outline-none
          "
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

        {/* EMAIL */}

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email:
                e.target.value,
            })
          }
          className="
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
          "
        />

        {/* TELEFONE */}

        <input
          type="text"
          placeholder="Telefone"
          value={
            formData.telefone
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              telefone:
                e.target.value,
            })
          }
          className="
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
          "
        />

        {/* ENDEREÇO */}

        <input
          type="text"
          placeholder="Endereço"
          value={
            formData.endereco
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              endereco:
                e.target.value,
            })
          }
          className="
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
          "
        />

        {/* INSTAGRAM */}

        <input
          type="text"
          placeholder="Instagram"
          value={
            formData.instagram
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              instagram:
                e.target.value,
            })
          }
          className="
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
          "
        />

        {/* FACEBOOK */}

        <input
          type="text"
          placeholder="Facebook"
          value={
            formData.facebook
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              facebook:
                e.target.value,
            })
          }
          className="
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
          "
        />

        {/* BIO */}

        <textarea
          placeholder="Biografia"
          value={formData.bio}
          onChange={(e) =>
            setFormData({
              ...formData,
              bio:
                e.target.value,
            })
          }
          className="
            md:col-span-2
            min-h-40
            rounded-2xl
            border
            border-zinc-200
            p-4
            outline-none
          "
        />

        {/* CHECKBOXES */}

        <div
          className="
            md:col-span-2
            flex
            flex-wrap
            gap-6
          "
        >

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={
                formData.ativo
              }
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
            onClick={
              salvarAssociado
            }
            disabled={
              loadingSave
            }
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
              onClick={
                resetForm
              }
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
                rounded-3xl
                overflow-hidden
                border
                border-black/5
                shadow-sm
              "
            >

              <div className="h-72 bg-zinc-100">

                {item.foto_url ? (

                  <img
                    src={
                      item.foto_url
                    }
                    alt={
                      item.nome
                    }
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

              </div>

              <div className="p-6">

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <h2
                    className="
                      text-2xl
                      font-bold
                    "
                  >
                    {item.nome}
                  </h2>

                  {item.ativo ? (

                    <span
                      className="
                        text-xs
                        bg-emerald-100
                        text-emerald-700
                        px-3
                        py-1
                        rounded-full
                      "
                    >
                      Ativo
                    </span>

                  ) : (

                    <span
                      className="
                        text-xs
                        bg-red-100
                        text-red-700
                        px-3
                        py-1
                        rounded-full
                      "
                    >
                      Inativo
                    </span>

                  )}

                </div>

                <p className="mt-3 text-zinc-500">
                  {item.cargo}
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-zinc-400
                  "
                >
                  {
                    item.tipo_associado
                  }
                </p>

                {item.bio && (

                  <p
                    className="
                      mt-5
                      text-zinc-600
                      leading-7
                    "
                  >
                    {item.bio}
                  </p>

                )}

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