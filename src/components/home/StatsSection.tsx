"use client";

import {
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Recycle,
  Trees,
  Users,
  Factory,
  Wallet,
  Cloud,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function StatsSection() {

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    totalPeso,
    setTotalPeso,
  ] = useState(0);

  const [
    totalValor,
    setTotalValor,
  ] = useState(0);

  const [
    metricas,
    setMetricas,
  ] = useState<any[]>([]);

  useEffect(() => {

    carregarDados();

  }, []);

  async function carregarDados() {

    try {

      setLoading(true);

      /* =========================
         MATERIAIS
      ========================= */

      const {
        data: materiais,
      } = await supabase
        .from("materiais_registros")
        .select(`
          peso,
          subtotal
        `);

      const peso =
        materiais?.reduce(
          (
            acc,
            item,
          ) =>
            acc +
            Number(
              item.peso || 0,
            ),
          0,
        ) || 0;

      const valor =
        materiais?.reduce(
          (
            acc,
            item,
          ) =>
            acc +
            Number(
              item.subtotal || 0,
            ),
          0,
        ) || 0;

      setTotalPeso(peso);

      setTotalValor(valor);

      /* =========================
         DASHBOARD METRICAS
      ========================= */

      const {
        data: dashboard,
      } = await supabase
        .from("dashboard_metricas")
        .select("*");

      setMetricas(
        dashboard || [],
      );

    } finally {

      setLoading(false);

    }

  }

  /* =========================
     ESG CALCULATIONS
  ========================= */

  const co2 =
    totalPeso * 1.8;

  const arvores =
    totalPeso * 0.12;

  /* =========================
     DASHBOARD VALUES
  ========================= */

  function getMetricValue(
    titulo: string,
  ) {

    const metrica =
      metricas.find(
        (item) =>
          item.titulo ===
          titulo,
      );

    return (
      metrica?.valor || 0
    );

  }

  const stats = [

    {
      icon: Recycle,
      value:
        `${totalPeso.toFixed(0)}kg`,
      title:
        "Resíduos reciclados",
      description:
        "Materiais recuperados e desviados do descarte inadequado.",
      color:
        "from-[#2E5E4E] to-[#5C9B80]",
    },

    {
      icon: Cloud,
      value:
        `${co2.toFixed(0)}kg`,
      title:
        "CO₂ evitado",
      description:
        "Redução estimada de emissões através da reciclagem.",
      color:
        "from-cyan-500 to-blue-500",
    },

    {
      icon: Trees,
      value:
        `${arvores.toFixed(0)}`,
      title:
        "Árvores preservadas",
      description:
        "Impacto ambiental equivalente estimado.",
      color:
        "from-emerald-500 to-green-500",
    },

    {
      icon: Users,
      value:
        getMetricValue(
          "Famílias Impactadas",
        ) || "0",
      title:
        "Famílias impactadas",
      description:
        "Pessoas beneficiadas diretamente pelas ações da associação.",
      color:
        "from-violet-500 to-fuchsia-500",
    },

    {
      icon: Factory,
      value:
        getMetricValue(
          "Empresas Parceiras",
        ) || "0",
      title:
        "Parcerias institucionais",
      description:
        "Empresas e instituições conectadas ao ecossistema ESG.",
      color:
        "from-orange-500 to-yellow-400",
    },

    {
      icon: Wallet,
      value:
        `R$ ${totalValor.toFixed(2)}`,
      title:
        "Renda gerada",
      description:
        "Valor operacional movimentado pelos materiais recicláveis.",
      color:
        "from-teal-500 to-cyan-400",
    },

  ];

  return (

    <section
      className="
        py-32
        relative
        overflow-hidden
        bg-linear-to-b
        from-[#F5F7F4]
        to-white
      "
    >

      {/* BG */}

      <div className="absolute inset-0">

        <div className="absolute top-0 left-0 w-125 h-125 bg-emerald-200/20 blur-3xl rounded-full" />

        <div className="absolute bottom-0 right-0 w-112.5 h-112.5 bg-cyan-200/20 blur-3xl rounded-full" />

      </div>

      <div className="container-custom relative z-10">

        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          viewport={{
            once: true,
          }}
          className="
            text-center
            max-w-4xl
            mx-auto
          "
        >

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-5
              py-3
              rounded-full
              bg-[#E8F3EE]
              text-[#2E5E4E]
              font-black
              text-sm
              mb-8
            "
          >

            📊 Indicadores ESG

          </div>

          <h2
            className="
              text-5xl
              md:text-6xl
              font-black
              text-[#111827]
              leading-tight
            "
          >

            Transparência,
            impacto e
            sustentabilidade

          </h2>

          <p
            className="
              text-zinc-600
              text-xl
              leading-9
              mt-8
            "
          >

            Métricas ambientais,
            sociais e operacionais
            geradas em tempo real
            a partir das atividades
            da ACMRB.

          </p>

        </motion.div>

        {/* GRID */}

        <div
          className="
            grid
            sm:grid-cols-2
            xl:grid-cols-3
            gap-8
            mt-24
          "
        >

          {stats.map(
            (
              item,
              index,
            ) => {

              const Icon =
                item.icon;

              return (

                <motion.div
                  key={item.title}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    delay:
                      index * 0.08,
                  }}
                  viewport={{
                    once: true,
                  }}
                  className={`
                    rounded-4xl
                    p-8
                    text-white
                    shadow-2xl
                    bg-linear-to-br
                    ${item.color}
                  `}
                >

                  {/* ICON */}

                  <div
                    className="
                      w-18
                      h-18
                      rounded-3xl
                      bg-white/20
                      backdrop-blur-md
                      flex
                      items-center
                      justify-center
                      mb-8
                    "
                  >

                    <Icon size={34} />

                  </div>

                  {/* VALUE */}

                  <h3
                    className="
                      text-5xl
                      font-black
                      wrap-break-word
                    "
                  >

                    {loading
                      ? "--"
                      : item.value}

                  </h3>

                  {/* TITLE */}

                  <h4
                    className="
                      text-2xl
                      font-black
                      mt-6
                    "
                  >

                    {item.title}

                  </h4>

                  {/* DESC */}

                  <p
                    className="
                      text-white/80
                      leading-8
                      mt-5
                    "
                  >

                    {item.description}

                  </p>

                </motion.div>

              );

            },
          )}

        </div>

      </div>

    </section>

  );

}