"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Associado = {
  id: string;
  nome: string;
  cargo: string;
  tipo_associado: string;
};

export default function AssociadosSection() {

  const [associados, setAssociados] =
    useState<Associado[]>([]);

  const [nome, setNome] =
    useState("");

  const [cargo, setCargo] =
    useState("");

  const [tipo, setTipo] =
    useState("");

  async function carregarAssociados() {

    const { data, error } =
      await supabase
        .from("associados")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {

      console.log(error);

      return;

    }

    setAssociados(data || []);

  }

  async function criarAssociado() {

    if (!nome || !cargo || !tipo) {

      alert("Preencha tudo.");

      return;

    }

    const { error } =
      await supabase
        .from("associados")
        .insert({
          nome,
          cargo,
          tipo_associado: tipo,
        });

    if (error) {

      alert(error.message);

      return;

    }

    setNome("");
    setCargo("");
    setTipo("");

    carregarAssociados();

  }

  async function excluirAssociado(id: string) {

    const confirmar =
      confirm("Excluir associado?");

    if (!confirmar) return;

    await supabase
      .from("associados")
      .delete()
      .eq("id", id);

    carregarAssociados();

  }

  useEffect(() => {

    carregarAssociados();

  }, []);

  return (

    <div className="space-y-10">

      {/* HEADER */}

      <div>

        <h1 className="text-4xl font-black text-[#1F2937]">
          Associados
        </h1>

        <p className="text-zinc-500 mt-2">
          Gerenciamento institucional
          da ACMRB.
        </p>

      </div>

      {/* FORM */}

      <div
        className="
          bg-white
          rounded-3xl
          p-6
          border
          border-black/5
          grid
          md:grid-cols-3
          gap-4
        "
      >

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
          className="
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
          "
        />

        <input
          type="text"
          placeholder="Cargo"
          value={cargo}
          onChange={(e) =>
            setCargo(e.target.value)
          }
          className="
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
          "
        />

        <input
          type="text"
          placeholder="Tipo"
          value={tipo}
          onChange={(e) =>
            setTipo(e.target.value)
          }
          className="
            h-14
            rounded-2xl
            border
            border-zinc-200
            px-4
          "
        />

        <button
          onClick={criarAssociado}
          className="
            md:col-span-3
            h-14
            rounded-2xl
            bg-[#2E5E4E]
            text-white
            font-bold
          "
        >
          Adicionar Associado
        </button>

      </div>

      {/* LISTA */}

      <div
        className="
          grid
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >

        {associados.map((item) => (

          <div
            key={item.id}
            className="
              bg-white
              rounded-3xl
              p-6
              border
              border-black/5
            "
          >

            <h2 className="text-2xl font-bold">
              {item.nome}
            </h2>

            <p className="text-zinc-500 mt-2">
              {item.cargo}
            </p>

            <p className="text-zinc-400 mt-1">
              {item.tipo_associado}
            </p>

            <button
              onClick={() =>
                excluirAssociado(item.id)
              }
              className="
                mt-5
                px-4
                py-2
                rounded-xl
                bg-red-500
                text-white
                text-sm
              "
            >
              Excluir
            </button>

          </div>

        ))}

      </div>

    </div>

  );

}