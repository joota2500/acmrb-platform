"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Recycle,
  Scale,
  Wallet,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

import {
  supabase,
} from "@/lib/supabase";

type MaterialResumo = {
  nome: string;
  peso: number;
  valor: number;
  quantidade: number;
  percentual: number;
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
        error,
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

      if (
        error ||
        !data
      ) {

        console.error(error);

        return;

      }

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

              percentual: 0,

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
        )
          .map(
            (item) => ({

              ...item,

              percentual:
                pesoTotal > 0
                  ? Number(
                      (
                        (item.peso /
                          pesoTotal) *
                        100
                      ).toFixed(1),
                    )
                  : 0,

            }),
          )
          .sort(
            (a, b) =>
              b.peso -
              a.peso,
          );

      setMateriais(lista);

      setTotalPeso(
        pesoTotal,
      );

      setTotalValor(
        valorTotal,
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }

  const topMateriais =
    useMemo(
      () =>
        materiais.slice(0, 3),
      [materiais],
    );

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

        <div className="absolute top-0 left-0 w-137.5 h-137.5 bg-emerald-200/20 blur-3xl rounded-full" />

        <div className="absolute bottom-0 right-0 w-112.5 h-112.5 bg-cyan-200/20 blur-3xl rounded-full" />

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
              max-w-4xl
              mx-auto
            "
          >

            Resumo operacional público
            com dados de reciclagem,
            logística reversa
            e materiais processados
            pela associação.

          </p>

        </motion.div>

        {/* KPIS */}

        <div
          className="
            grid
            md:grid-cols-2
            gap-8
            mt-24
          "
        >

          {/* PESO */}

          <motion.div
            whileHover={{
              y: -5,
            }}
            className="
              rounded-4xl
              p-10
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
                text-6xl
                font-black
                mt-4
              "
            >

              {loading
                ? "--"
                : `${totalPeso.toFixed(0)}kg`}

            </h3>

          </motion.div>

          {/* VALOR */}

          <motion.div
            whileHover={{
              y: -5,
            }}
            className="
              rounded-4xl
              p-10
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
                text-6xl
                font-black
                mt-4
              "
            >

              {loading
                ? "--"
                : `R$ ${totalValor.toFixed(2)}`}

            </h3>

          </motion.div>

        </div>

        {/* TOP MATERIAIS */}

        <div className="mt-28">

          <div
            className="
              flex
              items-center
              justify-between
              gap-6
              flex-wrap
              mb-12
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

                Materiais em destaque

              </h3>

              <p
                className="
                  text-zinc-500
                  mt-3
                "
              >

                Ranking baseado
                no maior volume
                operacional reciclado.

              </p>

            </div>

            <Link
              href="/transparencia"
              className="
                h-14
                px-8
                rounded-2xl
                bg-[#2E5E4E]
                hover:bg-[#23473A]
                transition-all
                text-white
                font-black
                flex
                items-center
                gap-3
                shadow-lg
              "
            >

              Ver relatório completo

              <ArrowRight size={20} />

            </Link>

          </div>

          <div
            className="
              grid
              md:grid-cols-2
              xl:grid-cols-3
              gap-8
            "
          >

            {topMateriais.map(
              (
                item,
                index,
              ) => (

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
                  whileHover={{
                    y: -5,
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

                  <div
                    className="
                      flex
                      items-center
                      justify-between
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

                        {item.peso.toFixed(0)}kg

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

                        {item.percentual}%

                      </h4>

                    </div>

                  </div>

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

                      R$ {item.valor.toFixed(2)}

                    </h4>

                  </div>

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

                      {item.quantidade}

                    </div>

                  </div>

                </motion.div>

              ),
            )}

          </div>

        </div>

      </div>

    </section>

  );

}