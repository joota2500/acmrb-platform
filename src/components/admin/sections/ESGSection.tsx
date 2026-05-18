"use client";

import {
  motion,
} from "framer-motion";

import {
  Recycle,
  Leaf,
  Users,
  Trees,
  Factory,
  Zap,
  ArrowUpRight,
} from "lucide-react";

type Props = {
  dados?: any;
};

export default function ESGSection({
  dados,
}: Props) {

  const indicadores = [

    {
      titulo:
        "Resíduos Reciclados",

      valor:
        `${Number(
          dados?.residuos_reciclados || 0,
        ).toFixed(0)}kg`,

      descricao:
        "Total operacional consolidado dos materiais recicláveis.",

      icon: Recycle,

      color:
        "from-[#2E5E4E] to-[#5C9B80]",
    },

    {
      titulo:
        "CO₂ Evitado",

      valor:
        `${Number(
          dados?.co2_evitado || 0,
        ).toFixed(0)}kg`,

      descricao:
        "Estimativa institucional de emissões reduzidas.",

      icon: Leaf,

      color:
        "from-cyan-500 to-blue-500",
    },

    {
      titulo:
        "Famílias Impactadas",

      valor:
        `${dados?.familias_impactadas || 0}`,

      descricao:
        "Famílias beneficiadas pelas operações da associação.",

      icon: Users,

      color:
        "from-violet-500 to-fuchsia-500",
    },

    {
      titulo:
        "Árvores Preservadas",

      valor:
        `${dados?.arvores_preservadas || 0}`,

      descricao:
        "Estimativa equivalente de preservação ambiental.",

      icon: Trees,

      color:
        "from-emerald-500 to-green-500",
    },

    {
      titulo:
        "Empresas Parceiras",

      valor:
        `${dados?.empresas_parceiras || 0}`,

      descricao:
        "Instituições apoiando iniciativas ESG da ACMRB.",

      icon: Factory,

      color:
        "from-orange-500 to-yellow-400",
    },

    {
      titulo:
        "Energia Economizada",

      valor:
        `${Number(
          dados?.energia_economizada || 0,
        ).toFixed(0)}kWh`,

      descricao:
        "Impacto energético positivo gerado pela reciclagem.",

      icon: Zap,

      color:
        "from-yellow-500 to-orange-500",
    },

  ];

  return (

    <section
      className="
        space-y-8
      "
    >

      {/* HEADER */}

      <div
        className="
          bg-white
          rounded-4xl
          border
          border-black/5
          p-8
          md:p-10
        "
      >

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
            text-xs
            font-black
            mb-6
          "
        >

          🌎 Indicadores ESG

        </div>

        <h2
          className="
            text-4xl
            md:text-5xl
            font-black
            text-[#111827]
            leading-tight
          "
        >

          Inteligência ambiental
          e impacto institucional

        </h2>

        <p
          className="
            text-zinc-600
            leading-8
            mt-6
            max-w-4xl
            text-lg
          "
        >

          Monitoramento estratégico
          dos indicadores ambientais,
          sociais e operacionais
          utilizados pela ACMRB
          para rastreabilidade ESG,
          transparência pública
          e gestão de impacto.

        </p>

      </div>

      {/* GRID */}

      <div
        className="
          grid
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >

        {indicadores.map(
          (
            item,
            index,
          ) => {

            const Icon =
              item.icon;

            return (

              <motion.div
                key={item.titulo}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay:
                    index * 0.05,
                }}
                viewport={{
                  once: true,
                }}
                className="
                  relative
                  overflow-hidden
                  rounded-4xl
                  p-8
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

                {/* GLOW */}

                <div
                  className="
                    absolute
                    -top-10
                    -right-10
                    w-40
                    h-40
                    rounded-full
                    bg-white/10
                    blur-3xl
                  "
                />

                {/* CONTENT */}

                <div className="relative z-10">

                  <div
                    className="
                      w-16
                      h-16
                      rounded-3xl
                      bg-white/20
                      backdrop-blur-md
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
                      text-white/75
                      text-sm
                      font-semibold
                    "
                  >

                    {item.titulo}

                  </p>

                  <h3
                    className="
                      text-5xl
                      font-black
                      mt-4
                      wrap-break-word
                    "
                  >

                    {item.valor}

                  </h3>

                  <p
                    className="
                      mt-6
                      text-white/80
                      leading-7
                    "
                  >

                    {item.descricao}

                  </p>

                  <div
                    className="
                      mt-8
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-black
                    "
                  >

                    Indicador institucional

                    <ArrowUpRight
                      size={16}
                    />

                  </div>

                </div>

              </motion.div>

            );

          },
        )}

      </div>

    </section>

  );

}