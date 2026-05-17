"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Save,
  PackagePlus,
  DollarSign,
  Scale,
  Calculator,
  MapPin,
  Archive,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Props = {
  tipos: any[];

  onSuccess: () => void;
};

export default function MaterialsForm({
  tipos,
  onSuccess,
}: Props) {

  const [
    materialId,
    setMaterialId,
  ] = useState("");

  const [
    peso,
    setPeso,
  ] = useState("");

  const [
    valorKg,
    setValorKg,
  ] = useState("");

  const [
    unidade,
    setUnidade,
  ] = useState("kg");

  const [
    quantidade,
    setQuantidade,
  ] = useState("");

  const [
    armazenamento,
    setArmazenamento,
  ] = useState("");

  const [
    origem,
    setOrigem,
  ] = useState("");

  const [
    observacao,
    setObservacao,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =========================
     MATERIAL SELECIONADO
  ========================= */

  const materialSelecionado =
    tipos.find(
      (item) =>
        item.id === materialId,
    );

  /* =========================
     SUBTOTAL
  ========================= */

  const subtotal =
    useMemo(() => {

      const pesoNumber =
        Number(peso || 0);

      const valorKgNumber =
        Number(valorKg || 0);

      return (
        pesoNumber *
        valorKgNumber
      );

    }, [peso, valorKg]);

  async function salvarRegistro() {

    if (
      !materialId ||
      !peso
    ) {

      alert(
        "Material e peso são obrigatórios.",
      );

      return;

    }

    try {

      setLoading(true);

      const { error } =
        await supabase
          .from(
            "materiais_registros",
          )
          .insert({

            material_id:
              materialId,

            peso:
              Number(peso),

            valor_kg:
              valorKg
                ? Number(
                    valorKg,
                  )
                : 0,

            subtotal,

            unidade,

            quantidade:
              quantidade
                ? Number(
                    quantidade,
                  )
                : null,

            tipo_armazenamento:
              armazenamento,

            origem,

            observacao,

          });

      if (error) {

        alert(error.message);

        return;

      }

      /* RESET */

      setMaterialId("");

      setPeso("");

      setValorKg("");

      setQuantidade("");

      setArmazenamento("");

      setOrigem("");

      setObservacao("");

      setUnidade("kg");

      onSuccess();

      alert(
        "Registro adicionado com sucesso.",
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <div
      className="
        bg-white
        rounded-4xl
        border
        border-black/5
        shadow-sm
        overflow-hidden
      "
    >

      {/* HEADER */}

      <div
        className="
          px-8
          py-7
          border-b
          border-black/5
          bg-linear-to-r
          from-[#F7FBF8]
          to-white
        "
      >

        <div
          className="
            flex
            items-center
            gap-5
            flex-wrap
          "
        >

          <div
            className="
              w-18
              h-18
              rounded-[1.7rem]
              bg-[#E8F3EE]
              text-[#2E5E4E]
              flex
              items-center
              justify-center
              shadow-sm
            "
          >

            <PackagePlus
              size={34}
            />

          </div>

          <div>

            <h2
              className="
                text-4xl
                font-black
                text-[#111827]
              "
            >

              Novo Registro Operacional

            </h2>

            <p
              className="
                text-zinc-500
                mt-3
                leading-7
              "
            >

              Controle de entrada,
              pesagem,
              valor estimado
              e rastreabilidade
              dos resíduos recicláveis.

            </p>

          </div>

        </div>

      </div>

      {/* CONTENT */}

      <div className="p-8 space-y-8">

        {/* RESUMO */}

        <div
          className="
            grid
            md:grid-cols-3
            gap-5
          "
        >

          {/* MATERIAL */}

          <div
            className="
              rounded-3xl
              border
              border-black/5
              p-5
              bg-[#F9FBFA]
            "
          >

            <p
              className="
                text-sm
                font-bold
                text-zinc-500
              "
            >

              Material

            </p>

            <h3
              className="
                text-2xl
                font-black
                text-[#111827]
                mt-3
              "
            >

              {materialSelecionado
                ?.nome ||
                "--"}

            </h3>

          </div>

          {/* PESO */}

          <div
            className="
              rounded-3xl
              border
              border-black/5
              p-5
              bg-[#F9FBFA]
            "
          >

            <p
              className="
                text-sm
                font-bold
                text-zinc-500
              "
            >

              Peso Atual

            </p>

            <h3
              className="
                text-2xl
                font-black
                text-[#111827]
                mt-3
              "
            >

              {peso || 0}
              {" "}
              {unidade}

            </h3>

          </div>

          {/* SUBTOTAL */}

          <div
            className="
              rounded-3xl
              border
              border-emerald-200
              p-5
              bg-[#F2FBF6]
            "
          >

            <p
              className="
                text-sm
                font-bold
                text-emerald-700
              "
            >

              Valor Estimado

            </p>

            <h3
              className="
                text-3xl
                font-black
                text-[#2E5E4E]
                mt-3
              "
            >

              R$
              {" "}
              {subtotal.toFixed(
                2,
              )}

            </h3>

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

          {/* MATERIAL */}

          <div className="space-y-3">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Tipo de Material *

            </label>

            <select
              value={materialId}
              onChange={(e) =>
                setMaterialId(
                  e.target.value,
                )
              }
              className="
                w-full
                h-16
                rounded-3xl
                border
                border-zinc-200
                px-6
                outline-none
                focus:border-[#2E5E4E]
                bg-white
                font-semibold
              "
            >

              <option value="">
                Selecionar material
              </option>

              {tipos.map(
                (item) => (

                  <option
                    key={item.id}
                    value={item.id}
                  >

                    {item.nome}

                  </option>

                ),
              )}

            </select>

          </div>

          {/* PESO */}

          <div className="space-y-3">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Peso *

            </label>

            <div className="relative">

              <Scale
                size={20}
                className="
                  absolute
                  left-5
                  top-1/2
                  -translate-y-1/2
                  text-zinc-400
                "
              />

              <input
                type="number"
                value={peso}
                onChange={(e) =>
                  setPeso(
                    e.target.value,
                  )
                }
                placeholder="Ex: 120"
                className="
                  w-full
                  h-16
                  rounded-3xl
                  border
                  border-zinc-200
                  pl-14
                  pr-6
                  outline-none
                  focus:border-[#2E5E4E]
                  font-semibold
                "
              />

            </div>

          </div>

          {/* VALOR KG */}

          <div className="space-y-3">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Valor por KG

            </label>

            <div className="relative">

              <DollarSign
                size={20}
                className="
                  absolute
                  left-5
                  top-1/2
                  -translate-y-1/2
                  text-zinc-400
                "
              />

              <input
                type="number"
                value={valorKg}
                onChange={(e) =>
                  setValorKg(
                    e.target.value,
                  )
                }
                placeholder="Ex: 1.80"
                className="
                  w-full
                  h-16
                  rounded-3xl
                  border
                  border-zinc-200
                  pl-14
                  pr-6
                  outline-none
                  focus:border-[#2E5E4E]
                  font-semibold
                "
              />

            </div>

          </div>

          {/* UNIDADE */}

          <div className="space-y-3">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Unidade

            </label>

            <select
              value={unidade}
              onChange={(e) =>
                setUnidade(
                  e.target.value,
                )
              }
              className="
                w-full
                h-16
                rounded-3xl
                border
                border-zinc-200
                px-6
                bg-white
                font-semibold
              "
            >

              <option value="kg">
                Quilograma (kg)
              </option>

              <option value="ton">
                Tonelada (t)
              </option>

              <option value="saco">
                Saco
              </option>

              <option value="bag">
                Big Bag
              </option>

              <option value="fardo">
                Fardo
              </option>

            </select>

          </div>

          {/* QUANTIDADE */}

          <div className="space-y-3">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Quantidade

            </label>

            <input
              type="number"
              value={quantidade}
              onChange={(e) =>
                setQuantidade(
                  e.target.value,
                )
              }
              placeholder="Opcional"
              className="
                w-full
                h-16
                rounded-3xl
                border
                border-zinc-200
                px-6
                font-semibold
              "
            />

          </div>

          {/* ARMAZENAMENTO */}

          <div className="space-y-3">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Armazenamento

            </label>

            <div className="relative">

              <Archive
                size={20}
                className="
                  absolute
                  left-5
                  top-1/2
                  -translate-y-1/2
                  text-zinc-400
                "
              />

              <input
                type="text"
                value={armazenamento}
                onChange={(e) =>
                  setArmazenamento(
                    e.target.value,
                  )
                }
                placeholder="Ex: Big Bag"
                className="
                  w-full
                  h-16
                  rounded-3xl
                  border
                  border-zinc-200
                  pl-14
                  pr-6
                  font-semibold
                "
              />

            </div>

          </div>

          {/* ORIGEM */}

          <div className="space-y-3">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Origem

            </label>

            <div className="relative">

              <MapPin
                size={20}
                className="
                  absolute
                  left-5
                  top-1/2
                  -translate-y-1/2
                  text-zinc-400
                "
              />

              <input
                type="text"
                value={origem}
                onChange={(e) =>
                  setOrigem(
                    e.target.value,
                  )
                }
                placeholder="Ex: Centro"
                className="
                  w-full
                  h-16
                  rounded-3xl
                  border
                  border-zinc-200
                  pl-14
                  pr-6
                  font-semibold
                "
              />

            </div>

          </div>

          {/* SUBTOTAL */}

          <div className="space-y-3">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Subtotal Calculado

            </label>

            <div
              className="
                h-16
                rounded-3xl
                border
                border-emerald-200
                bg-[#F2FBF6]
                px-6
                flex
                items-center
                gap-3
              "
            >

              <Calculator
                size={20}
                className="
                  text-[#2E5E4E]
                "
              />

              <span
                className="
                  text-xl
                  font-black
                  text-[#2E5E4E]
                "
              >

                R$
                {" "}
                {subtotal.toFixed(
                  2,
                )}

              </span>

            </div>

          </div>

          {/* OBS */}

          <div className="md:col-span-2 space-y-3">

            <label
              className="
                text-sm
                font-black
                text-zinc-700
              "
            >

              Observação

            </label>

            <textarea
              value={observacao}
              onChange={(e) =>
                setObservacao(
                  e.target.value,
                )
              }
              placeholder="Observações internas..."
              className="
                w-full
                min-h-40
                rounded-3xl
                border
                border-zinc-200
                p-6
                resize-none
                outline-none
                leading-8
              "
            />

          </div>

        </div>

        {/* ACTION */}

        <div
          className="
            flex
            justify-end
          "
        >

          <button
            onClick={
              salvarRegistro
            }
            disabled={loading}
            className="
              h-16
              px-10
              rounded-3xl
              bg-[#2E5E4E]
              hover:bg-[#21463A]
              transition
              text-white
              font-black
              text-lg
              flex
              items-center
              gap-4
              disabled:opacity-50
              shadow-lg
            "
          >

            <Save size={22} />

            {loading
              ? "Salvando..."
              : "Salvar registro"}

          </button>

        </div>

      </div>

    </div>

  );

}