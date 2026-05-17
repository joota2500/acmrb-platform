"use client";

import {
  Recycle,
  Weight,
  Package,
  TrendingUp,
} from "lucide-react";

type Props = {
  registros: any[];
};

export default function MaterialsStats({
  registros,
}: Props) {

  /* TOTAL PESO */

  const pesoTotal =
    registros.reduce(
      (
        total,
        item,
      ) =>
        total +
        Number(
          item.peso || 0,
        ),
      0,
    );

  /* TOTAL REGISTROS */

  const totalRegistros =
    registros.length;

  /* AGRUPAR MATERIAIS */

  const materiaisMap =
    registros.reduce(
      (
        acc: any,
        item,
      ) => {

        const nome =
          item
            ?.materiais_tipos
            ?.nome ||
          "Sem nome";

        acc[nome] =
          (acc[nome] || 0) +
          Number(
            item.peso || 0,
          );

        return acc;

      },
      {},
    );

  /* MATERIAL DOMINANTE */

  let materialDominante =
    "-";

  let maiorPeso = 0;

  Object.entries(
    materiaisMap,
  ).forEach(
    ([nome, peso]) => {

      if (
        Number(peso) >
        maiorPeso
      ) {

        maiorPeso =
          Number(peso);

        materialDominante =
          nome;

      }

    },
  );

  /* MEDIA */

  const mediaPeso =

    totalRegistros > 0
      ? (
          pesoTotal /
          totalRegistros
        ).toFixed(1)
      : "0";

  const cards = [

    {
      title:
        "Peso Total Recuperado",
      value: `${pesoTotal.toFixed(1)} kg`,
      icon: Weight,
      color:
        "from-[#2E5E4E] to-[#5C9B80]",
    },

    {
      title:
        "Registros Operacionais",
      value: totalRegistros,
      icon: Package,
      color:
        "from-blue-500 to-cyan-400",
    },

    {
      title:
        "Material Dominante",
      value: materialDominante,
      icon: Recycle,
      color:
        "from-emerald-500 to-lime-400",
    },

    {
      title:
        "Média por Registro",
      value: `${mediaPeso} kg`,
      icon: TrendingUp,
      color:
        "from-orange-500 to-yellow-400",
    },

  ];

  return (

    <div
      className="
        grid
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      "
    >

      {cards.map((item) => {

        const Icon = item.icon;

        return (

          <div
            key={item.title}
            className="
              relative
              overflow-hidden
              rounded-4xl
              p-7
              text-white
              shadow-xl
            "
          >

            {/* BG */}

            <div
              className={`
                absolute
                inset-0
                bg-linear-to-br
                ${item.color}
              `}
            />

            {/* CONTENT */}

            <div className="relative z-10">

              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-white/20
                  backdrop-blur-sm
                  flex
                  items-center
                  justify-center
                  mb-8
                "
              >

                <Icon size={30} />

              </div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-white/80
                "
              >

                {item.title}

              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-4
                  leading-tight
                "
              >

                {item.value}

              </h2>

            </div>

          </div>

        );

      })}

    </div>

  );

}