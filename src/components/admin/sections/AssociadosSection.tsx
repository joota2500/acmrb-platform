"use client";

import { useEffect, useState } from "react";

import {
  Mail,
  MapPin,
  Phone,
  Star,
  Trash2,
  Pencil,
  Upload,
  User,
  Users,
  ShieldCheck,
  ImageIcon,
  Loader2,
} from "lucide-react";

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
  slug?: string;
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

function limparTexto(
  texto: string,
) {

  return texto
    .replace(/\s+/g, " ")
    .trim();

}

function formatarTelefone(
  valor: string,
) {

  return valor
    .replace(/\D/g, "")
    .replace(
      /^(\d{2})(\d)/g,
      "($1) $2",
    )
    .replace(
      /(\d{5})(\d)/,
      "$1-$2",
    )
    .slice(0, 15);

}

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

        console.error(error);

        alert(error.message);

        return;

      }

      setAssociados(
        (data as Associado[]) || [],
      );

    } catch (err) {

      console.error(err);

      alert(
        "Erro ao carregar associados.",
      );

    } finally {

      setLoadingData(false);

    }

  }

  async function uploadFoto() {

    if (!fotoFile) return null;

    try {

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
          .upload(
            caminho,
            fotoFile,
            {
              upsert: true,
            },
          );

      if (error) {

        console.error(error);

        alert(error.message);

        return null;

      }

      const { data } =
        supabase.storage
          .from("associados")
          .getPublicUrl(
            caminho,
          );

      return data.publicUrl;

    } catch (err) {

      console.error(err);

      return null;

    }

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

      let fotoUrl =
        fotoPreview || null;

      if (fotoFile) {

        const uploaded =
          await uploadFoto();

        if (uploaded) {

          fotoUrl = uploaded;

        }

      }

      const payload = {
  ...formData,

  slug:
    formData.nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-"),

  bio:
    formData.bio?.trim() || "",

  foto_url: fotoUrl,
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

        error =
          response.error;

      } else {

        const response =
          await supabase
            .from("associados")
            .insert(payload);

        error =
          response.error;

      }

      if (error) {

        console.error(error);

        alert(error.message);

        return;

      }

      await carregarAssociados();

      resetForm();

      alert(
        editingId
          ? "Associado atualizado."
          : "Associado criado.",
      );

    } catch (err) {

      console.error(err);

      alert(
        "Erro ao salvar associado.",
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
        "Deseja excluir este associado?",
      );

    if (!confirmar) return;

    try {

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

    } catch (err) {

      console.error(err);

      alert(
        "Erro ao excluir associado.",
      );

    }

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

    setFotoFile(null);

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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
          xl:flex-row
          xl:items-center
          xl:justify-between
          gap-8
        "
      >

        <div>

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
              text-sm
            "
          >

            <ShieldCheck size={18} />

            Painel institucional ACMRB

          </div>

          <h1
            className="
              mt-6
              text-5xl
              md:text-6xl
              font-black
              text-[#111827]
              leading-none
            "
          >
            Gestão de Associados
          </h1>

          <p
            className="
              mt-5
              text-zinc-500
              text-lg
              leading-8
              max-w-3xl
            "
          >
            Controle completo dos
            associados da associação,
            informações institucionais,
            destaques públicos e gestão
            organizacional da ACMRB.
          </p>

        </div>

        <div
          className="
            bg-linear-to-br
            from-[#2E5E4E]
            to-[#21463A]
            rounded-[40px]
            p-8
            text-white
            shadow-2xl
            min-w-70
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div>

              <p className="opacity-80">
                Total cadastrados
              </p>

              <h2
                className="
                  text-6xl
                  font-black
                  mt-3
                "
              >
                {
                  associados.length
                }
              </h2>

            </div>

            <Users size={70} />

          </div>

        </div>

      </div>

      {/* FORM */}

      <div
        className="
          bg-white
          rounded-[42px]
          border
          border-black/5
          shadow-sm
          overflow-hidden
        "
      >

        <div
          className="
            p-8
            border-b
            border-zinc-100
          "
        >

          <h2
            className="
              text-3xl
              font-black
              text-[#111827]
            "
          >

            {editingId
              ? "Editar associado"
              : "Novo associado"}

          </h2>

          <p
            className="
              mt-2
              text-zinc-500
            "
          >
            Informações públicas,
            institucionais e exibição
            no portal oficial.
          </p>

        </div>

        <div
          className="
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
              rounded-4xl
              p-10
              bg-zinc-50
              cursor-pointer
              hover:border-[#2E5E4E]
              transition
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

                if (
                  file.size >
                  5 *
                    1024 *
                    1024
                ) {

                  alert(
                    "Imagem máxima de 5MB.",
                  );

                  return;

                }

                const allowedTypes =
                  [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                  ];

                if (
                  !allowedTypes.includes(
                    file.type,
                  )
                ) {

                  alert(
                    "Formato inválido.",
                  );

                  return;

                }

                setFotoFile(file);

                setFotoPreview(
                  URL.createObjectURL(
                    file,
                  ),
                );

              }}
            />

            {fotoPreview ? (

              <div
                className="
                  relative
                  group
                  w-fit
                  mx-auto
                "
              >

                <img
                  src={
                    fotoPreview
                  }
                  alt="Preview"
                  className="
                    w-52
                    h-52
                    rounded-full
                    object-cover
                    border-6
                    border-white
                    shadow-2xl
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    rounded-full
                    bg-black/50
                    opacity-0
                    group-hover:opacity-100
                    transition
                    flex
                    items-center
                    justify-center
                    text-white
                    font-bold
                  "
                >
                  Alterar foto
                </div>

              </div>

            ) : (

              <div className="text-center">

                <div
                  className="
                    w-24
                    h-24
                    rounded-full
                    bg-[#DDF5EC]
                    flex
                    items-center
                    justify-center
                    mx-auto
                  "
                >

                  <ImageIcon
                    size={40}
                    className="
                      text-[#2E5E4E]
                    "
                  />

                </div>

                <h3
                  className="
                    mt-6
                    text-2xl
                    font-black
                    text-[#111827]
                  "
                >
                  Upload da foto
                </h3>

                <p
                  className="
                    mt-2
                    text-zinc-500
                  "
                >
                  JPG, PNG ou WEBP •
                  Máx 5MB
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
              setFormData(
                (
                  prev,
                ) => ({
                  ...prev,
                  nome:
                    e.target
                      .value,
                }),
              )
            }
            className="
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-5
              focus:border-[#2E5E4E]
              outline-none
            "
          />

          <input
            type="text"
            placeholder="Cargo *"
            value={formData.cargo}
            onChange={(e) =>
              setFormData(
                (
                  prev,
                ) => ({
                  ...prev,
                  cargo:
                    e.target
                      .value,
                }),
              )
            }
            className="
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-5
              outline-none
            "
          />

          <select
            value={
              formData.tipo_associado
            }
            onChange={(e) =>
              setFormData(
                (
                  prev,
                ) => ({
                  ...prev,
                  tipo_associado:
                    e.target
                      .value,
                }),
              )
            }
            className="
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-5
            "
          >

            <option value="">
              Tipo de associado
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
              setFormData(
                (
                  prev,
                ) => ({
                  ...prev,
                  email:
                    e.target
                      .value,
                }),
              )
            }
            className="
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-5
            "
          />

          <input
            type="text"
            placeholder="Telefone"
            value={
              formData.telefone
            }
            onChange={(e) =>
              setFormData(
                (
                  prev,
                ) => ({
                  ...prev,
                  telefone:
                    formatarTelefone(
                      e
                        .target
                        .value,
                    ),
                }),
              )
            }
            className="
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-5
            "
          />

          <input
            type="text"
            placeholder="Endereço"
            value={
              formData.endereco
            }
            onChange={(e) =>
              setFormData(
                (
                  prev,
                ) => ({
                  ...prev,
                  endereco:
                    e.target
                      .value,
                }),
              )
            }
            className="
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-5
            "
          />

          <input
            type="text"
            placeholder="@instagram"
            value={
              formData.instagram
            }
            onChange={(e) =>
              setFormData(
                (
                  prev,
                ) => ({
                  ...prev,
                  instagram:
                    e.target
                      .value,
                }),
              )
            }
            className="
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-5
            "
          />

          <input
            type="text"
            placeholder="Facebook"
            value={
              formData.facebook
            }
            onChange={(e) =>
              setFormData(
                (
                  prev,
                ) => ({
                  ...prev,
                  facebook:
                    e.target
                      .value,
                }),
              )
            }
            className="
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-5
            "
          />

          <input
            type="text"
            placeholder="LinkedIn"
            value={
              formData.linkedin
            }
            onChange={(e) =>
              setFormData(
                (
                  prev,
                ) => ({
                  ...prev,
                  linkedin:
                    e.target
                      .value,
                }),
              )
            }
            className="
              md:col-span-2
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-5
            "
          />

          {/* BIO */}

          <div className="md:col-span-2">

            <textarea
              placeholder="Biografia institucional"
              value={
                formData.bio
              }
              maxLength={3000}
              onChange={(e) =>
                setFormData(
                  (
                    prev,
                  ) => ({
                    ...prev,
                    bio:
                      e.target
                        .value,
                  }),
                )
              }
              className="
                w-full
                min-h-52
                rounded-[28px]
                border
                border-zinc-200
                p-5
                resize-none
              "
            />

            <div
              className="
                flex
                justify-end
                mt-2
              "
            >

              <span
                className="
                  text-xs
                  text-zinc-400
                "
              >
                {
                  formData.bio
                    .length
                }
                /3000
              </span>

            </div>

          </div>

          {/* STATUS */}

          <div
            className="
              md:col-span-2
              flex
              flex-wrap
              gap-8
            "
          >

            <label
              className="
                flex
                items-center
                gap-3
              "
            >

              <input
                type="checkbox"
                checked={
                  formData.ativo
                }
                onChange={(e) =>
                  setFormData(
                    (
                      prev,
                    ) => ({
                      ...prev,
                      ativo:
                        e
                          .target
                          .checked,
                    }),
                  )
                }
              />

              Associado ativo

            </label>

            <label
              className="
                flex
                items-center
                gap-3
              "
            >

              <input
                type="checkbox"
                checked={
                  formData.destaque
                }
                onChange={(e) =>
                  setFormData(
                    (
                      prev,
                    ) => ({
                      ...prev,
                      destaque:
                        e
                          .target
                          .checked,
                    }),
                  )
                }
              />

              Destacar associado

            </label>

          </div>

          {/* BOTÕES */}

          <div
            className="
              md:col-span-2
              flex
              gap-4
              pt-4
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
                shadow-xl
                flex
                items-center
                justify-center
                gap-3
              "
            >

              {loadingSave ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Salvando...
                </>
              ) : editingId ? (
                "Atualizar associado"
              ) : (
                "Salvar associado"
              )}

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
                  hover:bg-zinc-300
                  transition
                  font-semibold
                "
              >
                Cancelar
              </button>

            )}

          </div>

        </div>

      </div>

      {/* LOADING */}

      {loadingData && (

        <div
          className="
            bg-white
            rounded-[40px]
            p-16
            text-center
          "
        >

          <Loader2
            size={40}
            className="
              animate-spin
              mx-auto
              text-[#2E5E4E]
            "
          />

          <p className="mt-5">
            Carregando associados...
          </p>

        </div>

      )}

      {/* EMPTY */}

      {!loadingData &&
        associados.length ===
          0 && (

        <div
          className="
            bg-white
            rounded-[40px]
            p-16
            border
            border-dashed
            border-zinc-200
            text-center
          "
        >

          <Users
            size={60}
            className="
              mx-auto
              text-zinc-300
            "
          />

          <h3
            className="
              mt-6
              text-2xl
              font-black
            "
          >
            Nenhum associado
          </h3>

          <p className="mt-3 text-zinc-500">
            Cadastre o primeiro
            associado da ACMRB.
          </p>

        </div>

      )}

    </div>

  );

}