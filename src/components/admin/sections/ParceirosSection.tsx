"use client";

import { useState } from "react";

import {
  Plus,
  Trash2,
} from "lucide-react";

type Parceiro = {
  id: number;
  nome: string;
  categoria: string;
};

export default function ParceirosSection() {

  const [
    parceiros,
    setParceiros,
  ] = useState<Parceiro[]>([
    {
      id: 1,
      nome: "Prefeitura de Baturité",
      categoria: "Institucional",
    },
    {
      id: 2,
      nome: "IFCE Baturité",
      categoria: "Educação",
    },
  ]);

  const [
    nome,
    setNome,
  ] = useState("");

  const [
    categoria,
    setCategoria,
  ] = useState("");

  function adicionarParceiro() {

    if (!nome || !categoria) return;

    const novoParceiro = {
      id: Date.now(),
      nome,
      categoria,
    };

    setParceiros([
      novoParceiro,
      ...parceiros,
    ]);

    setNome("");

    setCategoria("");

  }

  function removerParceiro(id: number) {

    setParceiros(
      parceiros.filter(
        (item) => item.id !== id
      )
    );

  }

  return (

    <div className="space-y-8">

      {/* HEADER */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-black/5
          p-10
        "
      >

        <h2
          className="
            text-3xl
            font-black
            text-[#1F2937]
          "
        >
          Gestão de Parceiros
        </h2>

        <p
          className="
            text-zinc-500
            mt-4
            leading-7
          "
        >
          Gerencie parceiros,
          patrocinadores e organizações
          apoiadoras da ACMRB.
        </p>

      </div>

      {/* FORM */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-black/5
          p-8
        "
      >

        <div
          className="
            grid
            md:grid-cols-3
            gap-4
          "
        >

          <input
            type="text"
            placeholder="Nome do parceiro"
            value={nome}
            onChange={(e) =>
              setNome(e.target.value)
            }
            className="
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-5
              outline-none
              focus:border-[#2E5E4E]
            "
          />

          <input
            type="text"
            placeholder="Categoria"
            value={categoria}
            onChange={(e) =>
              setCategoria(e.target.value)
            }
            className="
              h-14
              rounded-2xl
              border
              border-zinc-200
              px-5
              outline-none
              focus:border-[#2E5E4E]
            "
          />

          <button
            onClick={adicionarParceiro}
            className="
              h-14
              rounded-2xl
              bg-[#2E5E4E]
              hover:bg-[#24473B]
              transition
              text-white
              font-semibold
              flex
              items-center
              justify-center
              gap-3
            "
          >

            <Plus size={20} />

            Adicionar parceiro

          </button>

        </div>

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

        {parceiros.map((item) => (

          <div
            key={item.id}
            className="
              bg-white
              rounded-3xl
              border
              border-black/5
              p-8
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-[#2E5E4E]
                    font-semibold
                  "
                >
                  {item.categoria}
                </p>

                <h3
                  className="
                    text-2xl
                    font-bold
                    text-[#1F2937]
                    mt-2
                  "
                >
                  {item.nome}
                </h3>

              </div>

              <button
                onClick={() =>
                  removerParceiro(item.id)
                }
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-red-50
                  text-red-500
                  hover:bg-red-100
                  transition
                  flex
                  items-center
                  justify-center
                "
              >

                <Trash2 size={18} />

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}