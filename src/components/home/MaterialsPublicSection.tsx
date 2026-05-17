"use client";

import {
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Recycle,
  Scale,
  Wallet,
  TrendingUp,
  Boxes,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type MaterialResumo = {
  nome: string;
  peso: number;
  valor: number;
  quantidade: number;
};

export default function MaterialsPublicSection() {

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    materiais,
    setMateriais,
  ] = useState<
    MaterialResumo[]
  >([]);

  const [
    totalPeso,
    setTotalPeso,
  ] = useState(0);

  const [
    totalValor,
    setTotalValor,
  ] = useState(0);

  useEffect(() => {

    carregarDados();

  }, []);

  async function carregarDados() {

    try {

      setLoading(true);

      const {
        data,
      } = await supabase
        .from(
          "materiais_registros",
        )
        .select(`
          peso,
          subtotal,
          materiais_tipos (
            nome
          )
        `);

      if (!data) return;

      const resumo:
        Record<
          string,
          MaterialResumo
        > = {};

      let pesoTotal = 0;

      let valorTotal = 0;

      data.forEach(
        (item: any) => {

          const nome =
            item
              ?.materiais_tipos
              ?.nome ||
            "Sem nome";

          const peso =
            Number(
              item.peso || 0,
            );

          const valor =
            Number(
              item.subtotal || 0,
            );

          pesoTotal += peso;

          valorTotal += valor;

          if (
            !resumo[nome]
          ) {

            resumo[nome] = {

              nome,

              peso: 0,

              valor: 0,

              quantidade: 0,

            };

          }

          resumo[nome].peso +=
            peso;

          resumo[nome].valor +=
            valor;

          resumo[
            nome
          ].quantidade += 1;

        },
      );

      const lista =
        Object.values(
          resumo,
        ).sort(
          (a, b) =>
            b.peso -
            a.peso,
        );

      setMateriais(
        lista,
      );

      setTotalPeso(
        pesoTotal,
      );

      setTotalValor(
        valorTotal,
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <section
      className="
        py-32
        relative
        overflow-hidden
        bg-[#F5F7F4]
      "
    >

      {/* BG */}

      <div className="absolute inset-0">

        <div className="absolute top-0 left-0 w-125 h-125 bg-emerald-200/20 blur-3xl rounded-full" />

        <div className="absolute bottom-0 right-0 w-100 h-100 bg-cyan-200/20 blur-3xl rounded-full" />

      </div>

      <div
        className="
          container-custom
          relative
          z-10
        "
      >

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
            max-w-5xl
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

            ♻ Transparência Operacional

          </div>

          <h2
            className="
              text-5xl
              md:text-6xl
              font-black
              leading-tight
              tracking-tighter
              text-[#111827]
            "
          >

            Materiais recicláveis
            recuperados pela ACMRB

          </h2>

          <p
            className="
              mt-8
              text-xl
              leading-9
              text-zinc-600
            "
          >

            Painel público de rastreabilidade
            ambiental com dados operacionais,
            indicadores ESG e volume
            de resíduos recicláveis
            recebidos pela associação.

          </p>

        </motion.div>

        {/* KPIS */}

        <div
          className="
            grid
            sm:grid-cols-2
            xl:grid-cols-4
            gap-8
            mt-24
          "
        >

          {/* PESO */}

          <div
            className="
              rounded-4xl
              p-8
              text-white
              shadow-2xl
              bg-linear-to-br
              from-[#2E5E4E]
              to-[#5C9B80]
            "
          >

            <div
              className="
                w-18
                h-18
                rounded-3xl
                bg-white/20
                flex
                items-center
                justify-center
                mb-8
              "
            >

              <Scale size={34} />

            </div>

            <p className="text-white/80">

              Peso total reciclado

            </p>

            <h3
              className="
                text-5xl
                font-black
                mt-4
              "
            >

              {loading
                ? "--"
                : `${totalPeso.toFixed(
                    0,
                  )}kg`}

            </h3>

          </div>

          {/* VALOR */}

          <div
            className="
              rounded-4xl
              p-8
              text-white
              shadow-2xl
              bg-linear-to-br
              from-cyan-500
              to-blue-500
            "
          >

            <div
              className="
                w-18
                h-18
                rounded-3xl
                bg-white/20
                flex
                items-center
                justify-center
                mb-8
              "
            >

              <Wallet size={34} />

            </div>

            <p className="text-white/80">

              Valor operacional

            </p>

            <h3
              className="
                text-5xl
                font-black
                mt-4
                wrap-break-word
              "
            >

              {loading
                ? "--"
                : `R$ ${totalValor.toFixed(
                    2,
                  )}`}

            </h3>

          </div>

          {/* MATERIAIS */}

          <div
            className="
              rounded-4xl
              p-8
              text-white
              shadow-2xl
              bg-linear-to-br
              from-orange-500
              to-yellow-400
            "
          >

            <div
              className="
                w-18
                h-18
                rounded-3xl
                bg-white/20
                flex
                items-center
                justify-center
                mb-8
              "
            >

              <Recycle size={34} />

            </div>

            <p className="text-white/80">

              Tipos de materiais

            </p>

            <h3
              className="
                text-5xl
                font-black
                mt-4
              "
            >

              {materiais.length}

            </h3>

          </div>

          {/* REGISTROS */}

          <div
            className="
              rounded-4xl
              p-8
              text-white
              shadow-2xl
              bg-linear-to-br
              from-violet-500
              to-fuchsia-500
            "
          >

            <div
              className="
                w-18
                h-18
                rounded-3xl
                bg-white/20
                flex
                items-center
                justify-center
                mb-8
              "
            >

              <Boxes size={34} />

            </div>

            <p className="text-white/80">

              Registros operacionais

            </p>

            <h3
              className="
                text-5xl
                font-black
                mt-4
              "
            >

              {materiais.reduce(
                (
                  acc,
                  item,
                ) =>
                  acc +
                  item.quantidade,
                0,
              )}

            </h3>

          </div>

        </div>

        {/* GRID MATERIAIS */}

        <div className="mt-28">

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              flex-wrap
              mb-10
            "
          >

            <div>

              <h3
                className="
                  text-4xl
                  font-black
                  text-[#111827]
                "
              >

                Ranking de materiais

              </h3>

              <p
                className="
                  text-zinc-500
                  mt-3
                "
              >

                Distribuição operacional
                dos resíduos recicláveis.

              </p>

            </div>

          </div>

          <div
            className="
              grid
              md:grid-cols-2
              xl:grid-cols-3
              gap-8
            "
          >

            {materiais.map(
              (
                item,
                index,
              ) => {

                const percentual =
                  totalPeso > 0
                    ? (
                        (item.peso /
                          totalPeso) *
                        100
                      ).toFixed(
                        1,
                      )
                    : "0";

                return (

                  <motion.div
                    key={item.nome}
                    initial={{
                      opacity: 0,
                      y: 40,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.5,
                      delay:
                        index * 0.08,
                    }}
                    viewport={{
                      once: true,
                    }}
                    className="
                      bg-white/80
                      backdrop-blur-xl
                      border
                      border-white/50
                      rounded-4xl
                      p-8
                      shadow-xl
                    "
                  >

                    {/* TOP */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >

                      <div
                        className="
                          w-16
                          h-16
                          rounded-3xl
                          bg-[#E8F3EE]
                          text-[#2E5E4E]
                          flex
                          items-center
                          justify-center
                        "
                      >

                        <Recycle
                          size={30}
                        />

                      </div>

                      <div
                        className="
                          px-4
                          py-2
                          rounded-full
                          bg-emerald-100
                          text-emerald-700
                          text-sm
                          font-black
                        "
                      >

                        #{index + 1}

                      </div>

                    </div>

                    {/* NOME */}

                    <h3
                      className="
                        text-3xl
                        font-black
                        text-[#111827]
                        mt-8
                      "
                    >

                      {item.nome}

                    </h3>

                    {/* GRID */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-6
                        mt-8
                      "
                    >

                      <div>

                        <p
                          className="
                            text-xs
                            uppercase
                            tracking-widest
                            text-zinc-400
                            font-bold
                          "
                        >

                          Peso

                        </p>

                        <h4
                          className="
                            text-3xl
                            font-black
                            text-[#2E5E4E]
                            mt-2
                          "
                        >

                          {item.peso.toFixed(
                            0,
                          )}kg

                        </h4>

                      </div>

                      <div>

                        <p
                          className="
                            text-xs
                            uppercase
                            tracking-widest
                            text-zinc-400
                            font-bold
                          "
                        >

                          Participação

                        </p>

                        <h4
                          className="
                            text-3xl
                            font-black
                            text-cyan-600
                            mt-2
                          "
                        >

                          {percentual}%

                        </h4>

                      </div>

                    </div>

                    {/* VALOR */}

                    <div className="mt-8">

                      <p
                        className="
                          text-xs
                          uppercase
                          tracking-widest
                          text-zinc-400
                          font-bold
                        "
                      >

                        Valor operacional

                      </p>

                      <h4
                        className="
                          text-4xl
                          font-black
                          text-[#111827]
                          mt-2
                        "
                      >

                        R$ {item.valor.toFixed(
                          2,
                        )}

                      </h4>

                    </div>

                    {/* REGISTROS */}

                    <div
                      className="
                        mt-8
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <span
                        className="
                          text-zinc-500
                          font-medium
                        "
                      >

                        Registros

                      </span>

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-emerald-700
                          font-black
                        "
                      >

                        <TrendingUp
                          size={18}
                        />

                        {
                          item.quantidade
                        }

                      </div>

                    </div>

                  </motion.div>

                );

              },
            )}

          </div>

        </div>

      </div>

    </section>

  );

}