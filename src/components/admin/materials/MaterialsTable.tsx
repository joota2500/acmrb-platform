"use client";

import {
  Pencil,
  Trash2,
  Package,
  CalendarDays,
  DollarSign,
  MapPin,
  X,
  Save,
} from "lucide-react";

import {
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type Registro = {

  id: string;

  peso: number;

  valor_kg?: number;

  subtotal?: number;

  unidade: string;

  quantidade?: number;

  tipo_armazenamento?: string;

  origem?: string;

  observacao?: string;

  created_at: string;

  materiais_tipos: {

    nome: string;

    cor?: string;

  };

};

type Props = {

  registros: Registro[];

  onReload: () => void;

};

export default function MaterialsTable({

  registros,
  onReload,

}: Props) {

  const [
    editandoId,
    setEditandoId,
  ] = useState<string | null>(
    null,
  );

  const [
    peso,
    setPeso,
  ] = useState("");

  const [
    valorKg,
    setValorKg,
  ] = useState("");

  const [
    origem,
    setOrigem,
  ] = useState("");

  const [
    armazenamento,
    setArmazenamento,
  ] = useState("");

  const [
    quantidade,
    setQuantidade,
  ] = useState("");

  const [
    observacao,
    setObservacao,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  function iniciarEdicao(
    item: Registro,
  ) {

    setEditandoId(item.id);

    setPeso(
      String(item.peso),
    );

    setValorKg(
      String(
        item.valor_kg || "",
      ),
    );

    setOrigem(
      item.origem || "",
    );

    setArmazenamento(
      item.tipo_armazenamento ||
        "",
    );

    setQuantidade(
      item.quantidade
        ? String(
            item.quantidade,
          )
        : "",
    );

    setObservacao(
      item.observacao || "",
    );

  }

  function cancelarEdicao() {

    setEditandoId(null);

    setPeso("");

    setValorKg("");

    setOrigem("");

    setArmazenamento("");

    setQuantidade("");

    setObservacao("");

  }

  async function salvarEdicao(
    id: string,
  ) {

    try {

      setLoading(true);

      const subtotal =
        Number(peso || 0) *
        Number(valorKg || 0);

      const { error } =
        await supabase
          .from(
            "materiais_registros",
          )
          .update({

            peso:
              Number(peso),

            valor_kg:
              valorKg
                ? Number(
                    valorKg,
                  )
                : null,

            subtotal,

            origem,

            quantidade:
              quantidade
                ? Number(
                    quantidade,
                  )
                : null,

            tipo_armazenamento:
              armazenamento,

            observacao,

          })
          .eq("id", id);

      if (error) {

        alert(error.message);

        return;

      }

      cancelarEdicao();

      onReload();

    } finally {

      setLoading(false);

    }

  }

  async function excluirRegistro(
    id: string,
  ) {

    const confirmar =
      confirm(
        "Deseja excluir este registro?",
      );

    if (!confirmar) return;

    const { error } =
      await supabase
        .from(
          "materiais_registros",
        )
        .delete()
        .eq("id", id);

    if (error) {

      alert(error.message);

      return;

    }

    onReload();

  }

  if (
    registros.length === 0
  ) {

    return (

      <div
        className="
          bg-white
          rounded-4xl
          border
          border-black/5
          p-12
          text-center
        "
      >

        <div
          className="
            w-20
            h-20
            rounded-3xl
            bg-[#E8F3EE]
            text-[#2E5E4E]
            flex
            items-center
            justify-center
            mx-auto
          "
        >

          <Package size={34} />

        </div>

        <h2
          className="
            text-3xl
            font-black
            text-[#111827]
            mt-6
          "
        >

          Nenhum registro encontrado

        </h2>

      </div>

    );

  }

  return (

    <div
      className="
        bg-white
        rounded-4xl
        border
        border-black/5
        overflow-hidden
      "
    >

      {/* HEADER */}

      <div
        className="
          px-6
          py-6
          border-b
          border-zinc-100
          flex
          items-center
          justify-between
          gap-4
          flex-wrap
        "
      >

        <div>

          <h2
            className="
              text-3xl
              font-black
              text-[#111827]
            "
          >

            Histórico Operacional

          </h2>

          <p
            className="
              text-zinc-500
              mt-2
            "
          >

            Registros de pesagem
            e movimentação.

          </p>

        </div>

        <div
          className="
            px-5
            py-3
            rounded-2xl
            bg-[#E8F3EE]
            text-[#2E5E4E]
            font-black
          "
        >

          {registros.length}
          {" "}
          registros

        </div>

      </div>

      {/* DESKTOP */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-[#F8FAF9]">

            <tr>

              <th className="text-left p-5 text-sm font-black text-zinc-600">
                Material
              </th>

              <th className="text-left p-5 text-sm font-black text-zinc-600">
                Peso
              </th>

              <th className="text-left p-5 text-sm font-black text-zinc-600">
                Valor/KG
              </th>

              <th className="text-left p-5 text-sm font-black text-zinc-600">
                Subtotal
              </th>

              <th className="text-left p-5 text-sm font-black text-zinc-600">
                Origem
              </th>

              <th className="text-left p-5 text-sm font-black text-zinc-600">
                Data
              </th>

              <th className="text-right p-5 text-sm font-black text-zinc-600">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {registros.map(
              (item) => {

                const subtotal =
                  Number(
                    item.peso || 0,
                  ) *
                  Number(
                    item.valor_kg || 0,
                  );

                return (

                  <>
                    {/* LINHA */}

                    <tr
                      key={item.id}
                      className="
                        border-t
                        border-zinc-100
                      "
                    >

                      {/* MATERIAL */}

                      <td className="p-5">

                        <div
                          className="
                            flex
                            items-center
                            gap-4
                          "
                        >

                          <div
                            className="
                              w-12
                              h-12
                              rounded-2xl
                              bg-[#E8F3EE]
                              text-[#2E5E4E]
                              flex
                              items-center
                              justify-center
                            "
                          >

                            <Package
                              size={20}
                            />

                          </div>

                          <div>

                            <h3
                              className="
                                font-black
                                text-[#111827]
                              "
                            >

                              {
                                item
                                  .materiais_tipos
                                  ?.nome
                              }

                            </h3>

                            <p
                              className="
                                text-sm
                                text-zinc-500
                                mt-1
                              "
                            >

                              {
                                item.unidade
                              }

                            </p>

                          </div>

                        </div>

                      </td>

                      {/* PESO */}

                      <td className="p-5">

                        <strong
                          className="
                            text-lg
                            text-[#111827]
                          "
                        >

                          {item.peso}
                          {" "}
                          {
                            item.unidade
                          }

                        </strong>

                      </td>

                      {/* VALOR */}

                      <td className="p-5">

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            font-bold
                          "
                        >

                          <DollarSign
                            size={16}
                          />

                          {Number(
                            item.valor_kg ||
                              0,
                          ).toFixed(2)}

                        </div>

                      </td>

                      {/* SUBTOTAL */}

                      <td className="p-5">

                        <div
                          className="
                            inline-flex
                            items-center
                            px-4
                            py-2
                            rounded-2xl
                            bg-[#F2FBF6]
                            text-[#2E5E4E]
                            font-black
                          "
                        >

                          R$
                          {" "}
                          {subtotal.toFixed(
                            2,
                          )}

                        </div>

                      </td>

                      {/* ORIGEM */}

                      <td className="p-5">

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            text-zinc-600
                          "
                        >

                          <MapPin
                            size={16}
                          />

                          {item.origem ||
                            "Sem origem"}

                        </div>

                      </td>

                      {/* DATA */}

                      <td className="p-5">

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            text-zinc-500
                          "
                        >

                          <CalendarDays
                            size={16}
                          />

                          {new Date(
                            item.created_at,
                          ).toLocaleDateString(
                            "pt-BR",
                          )}

                        </div>

                      </td>

                      {/* ACTIONS */}

                      <td className="p-5">

                        <div
                          className="
                            flex
                            justify-end
                            gap-3
                          "
                        >

                          <button
                            onClick={() =>
                              iniciarEdicao(
                                item,
                              )
                            }
                            className="
                              w-11
                              h-11
                              rounded-2xl
                              bg-blue-100
                              text-blue-600
                              flex
                              items-center
                              justify-center
                            "
                          >

                            <Pencil
                              size={18}
                            />

                          </button>

                          <button
                            onClick={() =>
                              excluirRegistro(
                                item.id,
                              )
                            }
                            className="
                              w-11
                              h-11
                              rounded-2xl
                              bg-red-100
                              text-red-600
                              flex
                              items-center
                              justify-center
                            "
                          >

                            <Trash2
                              size={18}
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                    {/* EDIÇÃO */}

                    {editandoId ===
                      item.id && (

                      <tr
                        className="
                          bg-[#F8FAF9]
                          border-t
                          border-zinc-100
                        "
                      >

                        <td
                          colSpan={7}
                          className="p-6"
                        >

                          <div
                            className="
                              grid
                              grid-cols-2
                              gap-5
                            "
                          >

                            <input
                              type="number"
                              value={peso}
                              onChange={(
                                e,
                              ) =>
                                setPeso(
                                  e.target
                                    .value,
                                )
                              }
                              placeholder="Peso"
                              className="
                                h-14
                                rounded-2xl
                                border
                                border-zinc-200
                                px-5
                                bg-white
                              "
                            />

                            <input
                              type="number"
                              value={valorKg}
                              onChange={(
                                e,
                              ) =>
                                setValorKg(
                                  e.target
                                    .value,
                                )
                              }
                              placeholder="Valor/KG"
                              className="
                                h-14
                                rounded-2xl
                                border
                                border-zinc-200
                                px-5
                                bg-white
                              "
                            />

                            <input
                              type="text"
                              value={origem}
                              onChange={(
                                e,
                              ) =>
                                setOrigem(
                                  e.target
                                    .value,
                                )
                              }
                              placeholder="Origem"
                              className="
                                h-14
                                rounded-2xl
                                border
                                border-zinc-200
                                px-5
                                bg-white
                              "
                            />

                            <input
                              type="text"
                              value={
                                armazenamento
                              }
                              onChange={(
                                e,
                              ) =>
                                setArmazenamento(
                                  e.target
                                    .value,
                                )
                              }
                              placeholder="Armazenamento"
                              className="
                                h-14
                                rounded-2xl
                                border
                                border-zinc-200
                                px-5
                                bg-white
                              "
                            />

                          </div>

                          <textarea
                            value={
                              observacao
                            }
                            onChange={(
                              e,
                            ) =>
                              setObservacao(
                                e.target
                                  .value,
                              )
                            }
                            placeholder="Observação"
                            className="
                              w-full
                              min-h-32
                              rounded-2xl
                              border
                              border-zinc-200
                              p-5
                              bg-white
                              mt-5
                            "
                          />

                          <div
                            className="
                              flex
                              justify-end
                              gap-4
                              mt-5
                            "
                          >

                            <button
                              onClick={
                                cancelarEdicao
                              }
                              className="
                                h-14
                                px-6
                                rounded-2xl
                                bg-zinc-200
                                font-black
                                flex
                                items-center
                                gap-2
                              "
                            >

                              <X
                                size={18}
                              />

                              Cancelar

                            </button>

                            <button
                              onClick={() =>
                                salvarEdicao(
                                  item.id,
                                )
                              }
                              disabled={
                                loading
                              }
                              className="
                                h-14
                                px-8
                                rounded-2xl
                                bg-[#2E5E4E]
                                text-white
                                font-black
                                flex
                                items-center
                                gap-2
                              "
                            >

                              <Save
                                size={18}
                              />

                              {loading
                                ? "Salvando..."
                                : "Salvar"}

                            </button>

                          </div>

                        </td>

                      </tr>

                    )}

                  </>

                );

              },
            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}