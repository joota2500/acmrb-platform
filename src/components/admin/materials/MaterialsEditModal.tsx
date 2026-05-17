"use client";

import {
  X,
  Save,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;

  onClose: () => void;

  material: any;

  onSuccess: () => void;
};

export default function MaterialEditModal({
  open,
  onClose,
  material,
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

  useEffect(() => {

    if (material) {

      setNome(
        material.nome || "",
      );

      setCor(
        material.cor || "",
      );

      setDescricao(
        material.descricao || "",
      );

    }

  }, [material]);

  async function salvar() {

    try {

      setLoading(true);

      const { error } =
        await supabase
          .from(
            "materiais_tipos",
          )
          .update({

            nome,

            cor,

            descricao,

          })
          .eq(
            "id",
            material.id,
          );

      if (error) {

        alert(error.message);

        return;

      }

      onSuccess();

      onClose();

    } finally {

      setLoading(false);

    }

  }

  async function excluir() {

    const confirmar =
      confirm(
        "Deseja excluir este tipo?",
      );

    if (!confirmar) return;

    const { error } =
      await supabase
        .from(
          "materiais_tipos",
        )
        .delete()
        .eq(
          "id",
          material.id,
        );

    if (error) {

      alert(error.message);

      return;

    }

    onSuccess();

    onClose();

  }

  if (
    !open ||
    !material
  ) return null;

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

              Editando

            </p>

            <h2
              className="
                text-4xl
                font-black
                text-[#111827]
                mt-2
              "
            >

              {material.nome}

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

          <input
            type="text"
            value={nome}
            onChange={(e) =>
              setNome(
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
            "
          />

          <input
            type="text"
            value={cor}
            onChange={(e) =>
              setCor(
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
            "
          />

          <textarea
            value={descricao}
            onChange={(e) =>
              setDescricao(
                e.target.value,
              )
            }
            className="
              w-full
              min-h-32
              rounded-2xl
              border
              border-zinc-200
              p-5
            "
          />

          {/* ACTIONS */}

          <div
            className="
              grid
              md:grid-cols-2
              gap-4
            "
          >

            <button
              onClick={excluir}
              className="
                h-16
                rounded-2xl
                bg-red-100
                hover:bg-red-200
                transition
                text-red-600
                font-black
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <Trash2 size={20} />

              Excluir

            </button>

            <button
              onClick={salvar}
              disabled={loading}
              className="
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
                : "Salvar"}

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}