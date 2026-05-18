"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Hammer,
  Construction,
  Recycle,
  ArrowRight,
} from "lucide-react";

export default function ProjetosPage() {

  return (

    <main className="bg-[#F4F7F3] min-h-screen overflow-hidden">

      {/* HERO */}

      <section
        className="
          relative
          pt-28
          pb-24
        "
      >

        {/* FUNDO */}

        <div
          className="
            absolute
            inset-0
            bg-linear-to-b
            from-[#DDF5EC]
            to-transparent
            opacity-70
          "
        />

        <div
          className="
            relative
            max-w-7xl
            mx-auto
            px-4
            md:px-5
          "
        >

          {/* VOLTAR */}

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-3
              h-12
              px-5
              rounded-2xl
              bg-white
              border
              border-black/5
              shadow-sm
              hover:shadow-md
              transition
              text-[#111827]
              font-semibold
            "
          >

            <ArrowLeft size={18} />

            Voltar para início

          </Link>

          {/* CARD */}

          <div
            className="
              mt-8
              bg-white
              rounded-[42px]
              border
              border-black/5
              overflow-hidden
              shadow-xl
            "
          >

            <div
              className="
                grid
                xl:grid-cols-2
              "
            >

              {/* TEXTO */}

              <div
                className="
                  p-8
                  md:p-14
                  xl:p-16
                  flex
                  flex-col
                  justify-center
                "
              >

                {/* BADGE */}

                <div
                  className="
                    inline-flex
                    items-center
                    gap-3
                    px-5
                    py-3
                    rounded-full
                    bg-[#DDF5EC]
                    text-[#2E5E4E]
                    font-bold
                    text-sm
                    w-fit
                  "
                >

                  <Construction size={18} />

                  Plataforma em desenvolvimento

                </div>

                {/* TÍTULO */}

                <h1
                  className="
                    mt-8
                    text-4xl
                    md:text-6xl
                    font-black
                    leading-[1.05]
                    text-[#111827]
                  "
                >
                  Projetos e ações ambientais
                  da ACMRB.
                </h1>

                {/* TEXTO */}

                <p
                  className="
                    mt-8
                    text-base
                    md:text-xl
                    leading-8
                    md:leading-9
                    text-zinc-600
                    text-justify
                  "
                >
                  Esta área reunirá futuramente
                  projetos ambientais,
                  ações sociais,
                  campanhas educativas,
                  parcerias ESG,
                  relatórios institucionais,
                  indicadores ambientais
                  e iniciativas desenvolvidas
                  pela ACMRB em Baturité.
                </p>

                <p
                  className="
                    mt-6
                    text-base
                    md:text-lg
                    leading-8
                    text-zinc-500
                    text-justify
                  "
                >
                  A plataforma ainda está sendo
                  estruturada para apresentar
                  conteúdos completos,
                  métricas de impacto,
                  galerias,
                  documentos institucionais
                  e resultados ambientais.
                </p>

                {/* BOTÕES */}

                <div
                  className="
                    flex
                    flex-wrap
                    gap-4
                    mt-10
                  "
                >

                  <Link
                    href="/#parcerias"
                    className="
                      h-14
                      px-8
                      rounded-2xl
                      bg-[#2E5E4E]
                      hover:bg-[#21463A]
                      transition
                      text-white
                      font-bold
                      inline-flex
                      items-center
                      gap-3
                    "
                  >

                    Tornar-se parceiro

                    <ArrowRight size={18} />

                  </Link>

                  <Link
                    href="/quem-somos"
                    className="
                      h-14
                      px-8
                      rounded-2xl
                      bg-zinc-100
                      hover:bg-zinc-200
                      transition
                      text-[#111827]
                      font-bold
                      inline-flex
                      items-center
                    "
                  >

                    Conhecer a ACMRB

                  </Link>

                </div>

              </div>

              {/* LADO DIREITO */}

              <div
                className="
                  relative
                  min-h-125
                  bg-[#111827]
                  overflow-hidden
                "
              >

                {/* EFEITOS */}

                <div
                  className="
                    absolute
                    top-10
                    right-10
                    w-72
                    h-72
                    bg-[#2E5E4E]/30
                    blur-3xl
                    rounded-full
                  "
                />

                <div
                  className="
                    absolute
                    bottom-10
                    left-10
                    w-72
                    h-72
                    bg-cyan-400/10
                    blur-3xl
                    rounded-full
                  "
                />

                {/* CONTEÚDO */}

                <div
                  className="
                    relative
                    z-10
                    h-full
                    flex
                    flex-col
                    justify-center
                    items-center
                    text-center
                    p-10
                    text-white
                  "
                >

                  <div
                    className="
                      w-32
                      h-32
                      rounded-full
                      bg-white/10
                      border
                      border-white/10
                      flex
                      items-center
                      justify-center
                      backdrop-blur-md
                    "
                  >

                    <Hammer size={58} />

                  </div>

                  <h2
                    className="
                      mt-10
                      text-4xl
                      font-black
                      leading-tight
                    "
                  >
                    Em desenvolvimento
                  </h2>

                  <p
                    className="
                      mt-6
                      max-w-md
                      text-zinc-300
                      leading-8
                      text-base
                      md:text-lg
                    "
                  >
                    Novos projetos,
                    dashboards ESG,
                    relatórios ambientais
                    e ações institucionais
                    serão adicionados em breve.
                  </p>

                  {/* STATUS */}

                  <div
                    className="
                      mt-10
                      grid
                      grid-cols-2
                      gap-4
                      w-full
                      max-w-lg
                    "
                  >

                    <div
                      className="
                        rounded-3xl
                        bg-white/5
                        border
                        border-white/10
                        p-5
                      "
                    >

                      <Recycle
                        size={28}
                      />

                      <h3
                        className="
                          mt-4
                          text-3xl
                          font-black
                        "
                      >
                        ESG
                      </h3>

                      <p
                        className="
                          mt-2
                          text-sm
                          text-zinc-400
                        "
                      >
                        Sustentabilidade

                      </p>

                    </div>

                    <div
                      className="
                        rounded-3xl
                        bg-white/5
                        border
                        border-white/10
                        p-5
                      "
                    >

                      <Construction
                        size={28}
                      />

                      <h3
                        className="
                          mt-4
                          text-3xl
                          font-black
                        "
                      >
                        Beta
                      </h3>

                      <p
                        className="
                          mt-2
                          text-sm
                          text-zinc-400
                        "
                      >
                        Plataforma ativa

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}