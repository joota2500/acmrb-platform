"use client";

import {
  X,
  Save,
} from "lucide-react";

import {
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;

  onClose: () => void;

  onSuccess: () => void;
};

export default function MaterialTypeModal({
  open,
  onClose,
  onSuccess,
}: Props) {

  const [
    nome,
    setNome,
  ] = useState("");

  const [
    cor,
    setCor,
  ] = useState("");

  const [
    descricao,
    setDescricao,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function salvar() {

    if (!nome) {

      alert(
        "Nome obrigatório.",
      );

      return;

    }

    try {

      setLoading(true);

      const { error } =
        await supabase
          .from(
            "materiais_tipos",
          )
          .insert({

            nome,

            cor,

            descricao,

          });

      if (error) {

        alert(error.message);

        return;

      }

      setNome("");

      setCor("");

      setDescricao("");

      onSuccess();

      onClose();

      alert(
        "Tipo criado com sucesso.",
      );

    } finally {

      setLoading(false);

    }

  }

  if (!open) return null;

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/70
        backdrop-blur-md
        flex
        items-center
        justify-center
        p-6
      "
    >

      <div
        className="
          w-full
          max-w-2xl
          bg-white
          rounded-4xl
          overflow-hidden
        "
      >

        {/* HEADER */}

        <div
          className="
            p-8
            border-b
            border-zinc-100
            flex
            items-center
            justify-between
          "
        >

          <div>

            <p
              className="
                text-sm
                font-bold
                text-zinc-500
              "
            >

              Cadastro

            </p>

            <h2
              className="
                text-4xl
                font-black
                text-[#111827]
                mt-2
              "
            >

              Novo Tipo de Material

            </h2>

          </div>

          <button
            onClick={onClose}
            className="
              w-14
              h-14
              rounded-2xl
              bg-zinc-100
              flex
              items-center
              justify-center
            "
          >

            <X size={24} />

          </button>

        </div>

        {/* BODY */}

        <div className="p-8 space-y-6">

          {/* NOME */}

          <div className="space-y-2">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Nome *

            </label>

            <input
              type="text"
              value={nome}
              onChange={(e) =>
                setNome(
                  e.target.value,
                )
              }
              placeholder="Ex: Papelão"
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

          {/* COR */}

          <div className="space-y-2">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Cor

            </label>

            <input
              type="text"
              value={cor}
              onChange={(e) =>
                setCor(
                  e.target.value,
                )
              }
              placeholder="Ex: Azul"
              className="
                w-full
                h-14
                rounded-2xl
                border
                border-zinc-200
                px-5
              "
            />

          </div>

          {/* DESC */}

          <div className="space-y-2">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Descrição

            </label>

            <textarea
              value={descricao}
              onChange={(e) =>
                setDescricao(
                  e.target.value,
                )
              }
              placeholder="Descrição opcional..."
              className="
                w-full
                min-h-32
                rounded-2xl
                border
                border-zinc-200
                p-5
                resize-none
              "
            />

          </div>

          {/* ACTION */}

          <button
            onClick={salvar}
            disabled={loading}
            className="
              w-full
              h-16
              rounded-2xl
              bg-[#2E5E4E]
              hover:bg-[#21463A]
              transition
              text-white
              font-black
              flex
              items-center
              justify-center
              gap-3
            "
          >

            <Save size={20} />

            {loading
              ? "Salvando..."
              : "Salvar tipo"}

          </button>

        </div>

      </div>

    </div>

  );

}