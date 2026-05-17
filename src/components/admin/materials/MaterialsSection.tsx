"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import MaterialsForm from "./MaterialsForm";
import MaterialsTable from "./MaterialsTable";
import MaterialTypeModal from "./MaterialsTypeModal";
import MaterialEditModal from "./MaterialsEditModal";

import {
  Package,
  Recycle,
  Boxes,
  Plus,
  Pencil,
  DollarSign,
  Scale,
  TrendingUp,
} from "lucide-react";

type ResumoMaterial = {
  peso: number;
  valor: number;
  quantidade: number;
};

export default function MaterialsSection() {

  const [
    tipos,
    setTipos,
  ] = useState<any[]>([]);

  const [
    registros,
    setRegistros,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    openCreateModal,
    setOpenCreateModal,
  ] = useState(false);

  const [
    openEditModal,
    setOpenEditModal,
  ] = useState(false);

  const [
    selectedTipo,
    setSelectedTipo,
  ] = useState<any>(null);

  async function carregarDados() {

    try {

      setLoading(true);

      const {
        data: tiposData,
      } = await supabase
        .from("materiais_tipos")
        .select("*")
        .order("nome");

      const {
        data: registrosData,
      } = await supabase
        .from(
          "materiais_registros",
        )
        .select(`
          *,
          materiais_tipos (
            nome,
            cor
          )
        `)
        .order(
          "created_at",
          {
            ascending: false,
          },
        );

      setTipos(
        tiposData || [],
      );

      setRegistros(
        registrosData || [],
      );

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    carregarDados();

  }, []);

  /* KPIS */

  const totalRegistros =
    registros.length;

  const totalHoje =
    registros.filter(
      (item) => {

        const hoje =
          new Date().toDateString();

        const dataItem =
          new Date(
            item.created_at,
          ).toDateString();

        return (
          hoje === dataItem
        );

      },
    ).length;

  const pesoTotal =
    registros.reduce(
      (total, item) => {

        return (
          total +
          Number(item.peso || 0)
        );

      },
      0,
    );

  const valorEstimado =
    registros.reduce(
      (total, item) => {

        const peso =
          Number(item.peso || 0);

        const valorKg =
          Number(
            item.valor_kg || 0,
          );

        return (
          total +
          peso * valorKg
        );

      },
      0,
    );

  /* RESUMO */

  const pesoPorMaterial =
    registros.reduce(
      (
        acc: Record<
          string,
          ResumoMaterial
        >,
        item,
      ) => {

        const nome =
          item
            ?.materiais_tipos
            ?.nome || "Sem nome";

        if (!acc[nome]) {

          acc[nome] = {

            peso: 0,
            valor: 0,
            quantidade: 0,

          };

        }

        const peso =
          Number(
            item.peso || 0,
          );

        const valorKg =
          Number(
            item.valor_kg || 0,
          );

        acc[nome].peso +=
          peso;

        acc[nome].valor +=
          peso * valorKg;

        acc[nome].quantidade += 1;

        return acc;

      },
      {},
    );

  return (

    <div className="space-y-8">

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-6
        "
      >

        <div>

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-[#E8F3EE]
              text-[#2E5E4E]
              font-black
              text-xs
              md:text-sm
              mb-4
            "
          >

            ♻ Gestão de Materiais

          </div>

          <h1
            className="
              text-3xl
              md:text-5xl
              font-black
              text-[#111827]
              leading-tight
            "
          >

            Materiais Recuperados

          </h1>

          <p
            className="
              text-zinc-500
              mt-4
              max-w-2xl
              leading-7
              text-sm
              md:text-base
            "
          >

            Controle operacional,
            financeiro e ambiental
            dos resíduos sólidos
            recicláveis recebidos
            pela associação.

          </p>

        </div>

        <button
          onClick={() =>
            setOpenCreateModal(
              true,
            )
          }
          className="
            h-12
            md:h-14
            px-5
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
            shadow-lg
          "
        >

          <Plus size={18} />

          Novo tipo

        </button>

      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >

        {/* VALOR */}

        <div
          className="
            rounded-4xl
            p-6
            bg-linear-to-br
            from-[#2E5E4E]
            to-[#5C9B80]
            text-white
            shadow-xl
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-white/20
              flex
              items-center
              justify-center
              mb-5
            "
          >

            <DollarSign size={26} />

          </div>

          <p className="text-white/80 text-sm">

            Valor estimado

          </p>

          <h2
            className="
              text-2xl
              md:text-3xl
              font-black
              mt-2
              wrap-break-word
            "
          >

            R$
            {" "}
            {valorEstimado.toFixed(
              2,
            )}

          </h2>

        </div>

        {/* PESO */}

        <div
          className="
            rounded-4xl
            p-6
            bg-linear-to-br
            from-blue-500
            to-cyan-400
            text-white
            shadow-xl
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-white/20
              flex
              items-center
              justify-center
              mb-5
            "
          >

            <Scale size={26} />

          </div>

          <p className="text-white/80 text-sm">

            Peso total

          </p>

          <h2
            className="
              text-2xl
              md:text-3xl
              font-black
              mt-2
            "
          >

            {pesoTotal.toFixed(
              2,
            )}
            kg

          </h2>

        </div>

        {/* REGISTROS */}

        <div
          className="
            rounded-4xl
            p-6
            bg-linear-to-br
            from-orange-500
            to-yellow-400
            text-white
            shadow-xl
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-white/20
              flex
              items-center
              justify-center
              mb-5
            "
          >

            <Package size={26} />

          </div>

          <p className="text-white/80 text-sm">

            Registros

          </p>

          <h2
            className="
              text-2xl
              md:text-3xl
              font-black
              mt-2
            "
          >

            {totalRegistros}

          </h2>

        </div>

        {/* HOJE */}

        <div
          className="
            rounded-4xl
            p-6
            bg-linear-to-br
            from-violet-500
            to-fuchsia-400
            text-white
            shadow-xl
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-white/20
              flex
              items-center
              justify-center
              mb-5
            "
          >

            <Boxes size={26} />

          </div>

          <p className="text-white/80 text-sm">

            Entradas hoje

          </p>

          <h2
            className="
              text-2xl
              md:text-3xl
              font-black
              mt-2
            "
          >

            {totalHoje}

          </h2>

        </div>

      </div>

      {/* TIPOS */}

      <div className="space-y-4">

        <div
          className="
            flex
            items-center
            justify-between
            flex-wrap
            gap-4
          "
        >

          <div>

            <h2
              className="
                text-2xl
                md:text-3xl
                font-black
                text-[#111827]
              "
            >

              Tipos de Materiais

            </h2>

            <p
              className="
                text-zinc-500
                mt-2
                text-sm
              "
            >

              Categorias cadastradas.

            </p>

          </div>

          <div
            className="
              px-4
              py-2
              rounded-2xl
              bg-white
              border
              border-black/5
              text-sm
              font-black
              text-zinc-600
            "
          >

            {tipos.length}
            {" "}
            tipos

          </div>

        </div>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-5
          "
        >

          {tipos.map(
            (item) => (

              <button
                key={item.id}
                onClick={() => {

                  setSelectedTipo(
                    item,
                  );

                  setOpenEditModal(
                    true,
                  );

                }}
                className="
                  bg-white
                  rounded-4xl
                  border
                  border-black/5
                  p-5
                  text-left
                  hover:shadow-lg
                  transition
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
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

                    <Recycle
                      size={20}
                    />

                  </div>

                  <div
                    className="
                      w-10
                      h-10
                      rounded-2xl
                      bg-zinc-100
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <Pencil
                      size={16}
                    />

                  </div>

                </div>

                <h3
                  className="
                    text-xl
                    font-black
                    text-[#111827]
                    mt-5
                    wrap-break-word
                  "
                >

                  {item.nome}

                </h3>

                <p
                  className="
                    text-zinc-500
                    mt-3
                    leading-6
                    text-sm
                    line-clamp-3
                  "
                >

                  {item.descricao ||
                    "Sem descrição"}

                </p>

              </button>

            ),
          )}

        </div>

      </div>

      {/* RESUMO */}

      <div className="space-y-5">

        <div>

          <h2
            className="
              text-2xl
              md:text-3xl
              font-black
              text-[#111827]
            "
          >

            Resumo por Material

          </h2>

          <p
            className="
              text-zinc-500
              mt-2
              text-sm
            "
          >

            Peso acumulado e valor
            estimado por categoria.

          </p>

        </div>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-5
          "
        >

          {(
            Object.entries(
              pesoPorMaterial,
            ) as [
              string,
              ResumoMaterial,
            ][]
          ).map(
            ([
              nome,
              dados,
            ]) => (

              <div
                key={nome}
                className="
                  bg-white
                  rounded-4xl
                  border
                  border-black/5
                  p-5
                  hover:shadow-lg
                  transition
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
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

                    <Recycle
                      size={20}
                    />

                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-emerald-600
                      font-bold
                      text-xs
                    "
                  >

                    <TrendingUp
                      size={14}
                    />

                    {dados.quantidade}
                    {" "}
                    registros

                  </div>

                </div>

                <h3
                  className="
                    text-xl
                    font-black
                    text-[#111827]
                    mt-5
                    wrap-break-word
                  "
                >

                  {nome}

                </h3>

                <div className="mt-5 space-y-4">

                  <div>

                    <p
                      className="
                        text-xs
                        uppercase
                        tracking-wider
                        text-zinc-400
                        font-bold
                      "
                    >

                      Peso total

                    </p>

                    <h2
                      className="
                        text-2xl
                        font-black
                        text-[#2E5E4E]
                        mt-1
                      "
                    >

                      {dados.peso.toFixed(
                        2,
                      )}
                      kg

                    </h2>

                  </div>

                  <div>

                    <p
                      className="
                        text-xs
                        uppercase
                        tracking-wider
                        text-zinc-400
                        font-bold
                      "
                    >

                      Valor estimado

                    </p>

                    <h3
                      className="
                        text-lg
                        font-black
                        text-[#111827]
                        mt-1
                        wrap-break-word
                      "
                    >

                      R$
                      {" "}
                      {dados.valor.toFixed(
                        2,
                      )}

                    </h3>

                  </div>

                </div>

              </div>

            ),
          )}

        </div>

      </div>

      {/* FORM */}

      <MaterialsForm
        tipos={tipos}
        onSuccess={
          carregarDados
        }
      />

      {/* TABLE */}

      {!loading && (

        <MaterialsTable
          registros={
            registros
          }
          onReload={
            carregarDados
          }
        />

      )}

      {/* MODALS */}

      <MaterialTypeModal
        open={
          openCreateModal
        }
        onClose={() =>
          setOpenCreateModal(
            false,
          )
        }
        onSuccess={
          carregarDados
        }
      />

      <MaterialEditModal
        open={
          openEditModal
        }
        onClose={() =>
          setOpenEditModal(
            false,
          )
        }
        material={
          selectedTipo
        }
        onSuccess={
          carregarDados
        }
      />

    </div>

  );

}