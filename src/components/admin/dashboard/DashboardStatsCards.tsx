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
  Lock,
} from "lucide-react";

import { useState } from "react";

import DashboardMetricModal from "./DashboardMetricModal";

type Props = {
  dados: any;
};

type Card = {
  id: string;
  title: string;
  field: string;
  value: string | number;
  rawValue: number;
  icon: any;
  color: string;
  editable: boolean;
  description: string;
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
  ] = useState<Card | null>(
    null,
  );

  const cards: Card[] = [

    /* =========================
       AUTOMÁTICOS
    ========================= */

    {
      id: dados.id,

      title:
        "Resíduos Reciclados",

      field:
        "residuos_reciclados",

      value:
        `${Number(
          dados.residuos_reciclados || 0,
        ).toFixed(0)}kg`,

      rawValue:
        Number(
          dados.residuos_reciclados || 0,
        ),

      icon: Recycle,

      editable: false,

      description:
        "Calculado automaticamente pelos materiais registrados.",

      color:
        "from-[#2E5E4E] to-[#5C9B80]",
    },

    {
      id: dados.id,

      title:
        "Renda Gerada",

      field:
        "renda_gerada",

      value:
        `R$ ${Number(
          dados.renda_gerada || 0,
        ).toFixed(2)}`,

      rawValue:
        Number(
          dados.renda_gerada || 0,
        ),

      icon: Coins,

      editable: false,

      description:
        "Valor calculado automaticamente a partir dos materiais.",

      color:
        "from-green-500 to-emerald-400",
    },

    /* =========================
       MANUAIS
    ========================= */

    {
      id: dados.id,

      title:
        "Famílias Impactadas",

      field:
        "familias_impactadas",

      value:
        dados.familias_impactadas || 0,

      rawValue:
        dados.familias_impactadas || 0,

      icon: Users,

      editable: true,

      description:
        "Indicador institucional editável.",

      color:
        "from-blue-500 to-cyan-400",
    },

    {
      id: dados.id,

      title:
        "CO₂ Evitado",

      field:
        "co2_evitado",

      value:
        `${Number(
          dados.co2_evitado || 0,
        ).toFixed(0)}kg`,

      rawValue:
        Number(
          dados.co2_evitado || 0,
        ),

      icon: Leaf,

      editable: true,

      description:
        "Indicador ESG institucional.",

      color:
        "from-emerald-500 to-lime-400",
    },

    {
      id: dados.id,

      title:
        "Empresas Parceiras",

      field:
        "empresas_parceiras",

      value:
        dados.empresas_parceiras || 0,

      rawValue:
        dados.empresas_parceiras || 0,

      icon: Handshake,

      editable: true,

      description:
        "Quantidade de parceiros ativos.",

      color:
        "from-orange-500 to-yellow-400",
    },

    {
      id: dados.id,

      title:
        "Coletas Realizadas",

      field:
        "coletas_realizadas",

      value:
        dados.coletas_realizadas || 0,

      rawValue:
        dados.coletas_realizadas || 0,

      icon: Truck,

      editable: true,

      description:
        "Total de operações realizadas.",

      color:
        "from-violet-500 to-fuchsia-400",
    },

    {
      id: dados.id,

      title:
        "Árvores Preservadas",

      field:
        "arvores_preservadas",

      value:
        dados.arvores_preservadas || 0,

      rawValue:
        dados.arvores_preservadas || 0,

      icon: Trees,

      editable: true,

      description:
        "Estimativa institucional de impacto ambiental.",

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
        `${Number(
          dados.energia_economizada || 0,
        ).toFixed(0)}kWh`,

      rawValue:
        Number(
          dados.energia_economizada || 0,
        ),

      icon: Zap,

      editable: true,

      description:
        "Indicador ESG de eficiência energética.",

      color:
        "from-yellow-500 to-orange-400",
    },

  ];

  return (

    <>

      <div
        className="
          grid
          sm:grid-cols-2
          xl:grid-cols-4
          gap-6
        "
      >

        {cards.map((item) => {

          const Icon =
            item.icon;

          return (

            <button
              key={item.title}
              disabled={!item.editable}
              onClick={() => {

                if (!item.editable)
                  return;

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
                hover:-translate-y-1
                hover:scale-[1.01]
                text-left
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

              {/* TOP ACTION */}

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

                {item.editable ? (
                  <Pencil size={18} />
                ) : (
                  <Lock size={18} />
                )}

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
                    wrap-break-word
                  "
                >

                  {item.value}

                </h2>

                <p
                  className="
                    mt-6
                    text-sm
                    text-white/75
                    leading-6
                  "
                >

                  {item.description}

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