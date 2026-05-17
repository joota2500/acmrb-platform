"use client";

import {
  Package,
  TrendingUp,
  Scale,
  Boxes,
} from "lucide-react";

type Props = {
  dados: any;
};

export default function DashboardMaterialsCard({
  dados,
}: Props) {

  return (

    <div
      className="
        relative
        overflow-hidden
        bg-white
        rounded-4xl
        border
        border-black/5
        p-8
      "
    >

      {/* BG */}

      <div
        className="
          absolute
          top-0
          right-0
          w-72
          h-72
          bg-[#E8F3EE]
          rounded-full
          blur-3xl
          opacity-50
        "
      />

      {/* HEADER */}

      <div className="relative z-10">

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
            text-sm
            font-black
          "
        >

          ♻ Resumo Operacional

        </div>

        <h2
          className="
            text-4xl
            font-black
            text-[#111827]
            mt-5
          "
        >

          Gestão Inteligente
          de Materiais

        </h2>

        <p
          className="
            text-zinc-500
            leading-8
            mt-4
            max-w-2xl
          "
        >

          Controle operacional,
          rastreabilidade,
          impacto ambiental
          e monitoramento ESG
          da associação.

        </p>

      </div>

      {/* GRID */}

      <div
        className="
          relative
          z-10
          grid
          md:grid-cols-2
          gap-5
          mt-10
        "
      >

        {/* CARD */}

        <div
          className="
            rounded-3xl
            border
            border-black/5
            p-5
            bg-[#FAFAFA]
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-[#E8F3EE]
              text-[#2E5E4E]
              flex
              items-center
              justify-center
            "
          >

            <Scale size={24} />

          </div>

          <p
            className="
              text-zinc-500
              mt-5
              text-sm
            "
          >

            Resíduos Reciclados

          </p>

          <h3
            className="
              text-4xl
              font-black
              text-[#111827]
              mt-2
            "
          >

            {dados.residuos_reciclados}t

          </h3>

        </div>

        {/* CARD */}

        <div
          className="
            rounded-3xl
            border
            border-black/5
            p-5
            bg-[#FAFAFA]
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-blue-100
              text-blue-600
              flex
              items-center
              justify-center
            "
          >

            <Boxes size={24} />

          </div>

          <p
            className="
              text-zinc-500
              mt-5
              text-sm
            "
          >

            Coletas Realizadas

          </p>

          <h3
            className="
              text-4xl
              font-black
              text-[#111827]
              mt-2
            "
          >

            {dados.coletas_realizadas}

          </h3>

        </div>

        {/* CARD */}

        <div
          className="
            rounded-3xl
            border
            border-black/5
            p-5
            bg-[#FAFAFA]
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-emerald-100
              text-emerald-600
              flex
              items-center
              justify-center
            "
          >

            <TrendingUp size={24} />

          </div>

          <p
            className="
              text-zinc-500
              mt-5
              text-sm
            "
          >

            Impacto Ambiental

          </p>

          <h3
            className="
              text-4xl
              font-black
              text-[#111827]
              mt-2
            "
          >

            {dados.co2_evitado}t

          </h3>

        </div>

        {/* CARD */}

        <div
          className="
            rounded-3xl
            border
            border-black/5
            p-5
            bg-[#FAFAFA]
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-orange-100
              text-orange-600
              flex
              items-center
              justify-center
            "
          >

            <Package size={24} />

          </div>

          <p
            className="
              text-zinc-500
              mt-5
              text-sm
            "
          >

            Famílias Impactadas

          </p>

          <h3
            className="
              text-4xl
              font-black
              text-[#111827]
              mt-2
            "
          >

            {dados.familias_impactadas}

          </h3>

        </div>

      </div>

    </div>

  );

}