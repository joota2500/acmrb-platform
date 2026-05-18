"use client";

import {
  Newspaper,
  Eye,
  Star,
  FileText,
} from "lucide-react";

type Props = {
  total: number;

  publicadas: number;

  destaques: number;

  visualizacoes: number;
};

export default function NoticiasStats({
  total,
  publicadas,
  destaques,
  visualizacoes,
}: Props) {

  const cards = [
    {
      title: "Total",
      value: total,
      icon: Newspaper,
      color: "text-[#2E5E4E]",
      bg: "bg-emerald-100",
    },

    {
      title: "Publicadas",
      value: publicadas,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },

    {
      title: "Destaques",
      value: destaques,
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },

    {
      title: "Visualizações",
      value: visualizacoes,
      icon: Eye,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (

    <div
      className="
        grid
        sm:grid-cols-2
        xl:grid-cols-4
        gap-5
      "
    >

      {cards.map((card) => {

        const Icon =
          card.icon;

        return (

          <div
            key={card.title}
            className="
              bg-white
              rounded-4xl
              border
              border-black/5
              p-6
              shadow-sm
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
                    text-zinc-500
                    font-medium
                  "
                >

                  {card.title}

                </p>

                <h2
                  className={`
                    text-4xl
                    font-black
                    mt-4
                    ${card.color}
                  `}
                >

                  {card.value}

                </h2>

              </div>

              <div
                className={`
                  w-14
                  h-14
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  ${card.bg}
                `}
              >

                <Icon
                  size={24}
                  className={
                    card.color
                  }
                />

              </div>

            </div>

          </div>

        );

      })}

    </div>

  ); 

}