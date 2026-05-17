"use client";

import {
  Recycle,
  Users,
  Leaf,
  Handshake,
  Truck,
  Coins,
  Trees,
  Zap,
  Pencil,
} from "lucide-react";

import {
  useState,
} from "react";

import DashboardMetricModal from "./DashboardMetricModal";

type Props = {
  dados: any;
};

export default function DashboardStatsCards({
  dados,
}: Props) {

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    selectedMetric,
    setSelectedMetric,
  ] = useState<any>(null);

  const cards = [

    {
      id: dados.id,
      title: "Resíduos Reciclados",
      field: "residuos_reciclados",
      value: `${dados.residuos_reciclados}t`,
      rawValue:
        dados.residuos_reciclados,
      icon: Recycle,
      color:
        "from-[#2E5E4E] to-[#5C9B80]",
    },

    {
      id: dados.id,
      title: "Famílias Impactadas",
      field:
        "familias_impactadas",
      value:
        dados.familias_impactadas,
      rawValue:
        dados.familias_impactadas,
      icon: Users,
      color:
        "from-blue-500 to-cyan-400",
    },

    {
      id: dados.id,
      title: "CO₂ Evitado",
      field: "co2_evitado",
      value: `${dados.co2_evitado}t`,
      rawValue:
        dados.co2_evitado,
      icon: Leaf,
      color:
        "from-emerald-500 to-lime-400",
    },

    {
      id: dados.id,
      title: "Empresas Parceiras",
      field:
        "empresas_parceiras",
      value:
        dados.empresas_parceiras,
      rawValue:
        dados.empresas_parceiras,
      icon: Handshake,
      color:
        "from-orange-500 to-yellow-400",
    },

    {
      id: dados.id,
      title: "Coletas Realizadas",
      field:
        "coletas_realizadas",
      value:
        dados.coletas_realizadas,
      rawValue:
        dados.coletas_realizadas,
      icon: Truck,
      color:
        "from-violet-500 to-fuchsia-400",
    },

    {
      id: dados.id,
      title: "Renda Gerada",
      field: "renda_gerada",
      value:
        `R$ ${dados.renda_gerada}`,
      rawValue:
        dados.renda_gerada,
      icon: Coins,
      color:
        "from-green-500 to-emerald-400",
    },

    {
      id: dados.id,
      title: "Árvores Preservadas",
      field:
        "arvores_preservadas",
      value:
        dados.arvores_preservadas,
      rawValue:
        dados.arvores_preservadas,
      icon: Trees,
      color:
        "from-lime-500 to-green-400",
    },

    {
      id: dados.id,
      title:
        "Energia Economizada",
      field:
        "energia_economizada",
      value:
        `${dados.energia_economizada}kWh`,
      rawValue:
        dados.energia_economizada,
      icon: Zap,
      color:
        "from-yellow-500 to-orange-400",
    },

  ];

  return (

    <>

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

            <button
              key={item.title}
              onClick={() => {

                setSelectedMetric(
                  item,
                );

                setModalOpen(true);

              }}
              className="
                relative
                overflow-hidden
                rounded-4xl
                p-7
                text-white
                shadow-xl
                transition-all
                duration-300
                hover:-translate-y-2
                hover:scale-[1.02]
                text-left
                cursor-pointer
              "
            >

              {/* BACKGROUND */}

              <div
                className={`
                  absolute
                  inset-0
                  bg-linear-to-br
                  ${item.color}
                `}
              />

              {/* EDIT BUTTON */}

              <div
                className="
                  absolute
                  top-5
                  right-5
                  w-11
                  h-11
                  rounded-2xl
                  bg-white/15
                  backdrop-blur-md
                  flex
                  items-center
                  justify-center
                "
              >

                <Pencil size={18} />

              </div>

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
                    text-5xl
                    font-black
                    mt-4
                  "
                >

                  {item.value}

                </h2>

                <p
                  className="
                    mt-6
                    text-sm
                    text-white/70
                  "
                >

                  Clique para editar

                </p>

              </div>

            </button>

          );

        })}

      </div>

      <DashboardMetricModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        metric={selectedMetric}
      />

    </>

  );

}