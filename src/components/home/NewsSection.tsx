"use client";

import { motion } from "framer-motion";

const news = [
  {
    category: "Sustentabilidade",
    title:
      "ACMRB fortalece ações ambientais em Baturité",
    description:
      "Projetos de reciclagem e inclusão social ampliam impacto ambiental positivo.",
    featured: true,
  },
  {
    category: "Educação Ambiental",
    title:
      "Escolas recebem ações de conscientização",
  },
  {
    category: "Parcerias ESG",
    title:
      "Novos parceiros fortalecem logística reversa",
  },
  {
    category: "Impacto Social",
    title:
      "Famílias catadoras ampliam geração de renda",
  },
];

export default function NewsSection() {
  return (
    <section
      id="noticias"
      className="
        relative
        overflow-hidden
        py-32
      "
    >

      {/* Background */}
      <div className="
        absolute
        inset-0
        overflow-hidden
      ">

        <div className="
          absolute
          top-1/2
          right-0
          w-[700px]
          h-[700px]
          bg-cyan-500/10
          blur-[140px]
          rounded-full
        " />

      </div>

      <div className="
        relative
        max-w-7xl
        mx-auto
        px-6
        md:px-10
      ">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-end
            lg:justify-between
            gap-8
            mb-20
          "
        >

          <div>

            <span className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              border
              border-cyan-400/20
              bg-cyan-400/10
              text-cyan-300
              text-sm
            ">
              📰 Portal Institucional
            </span>

            <h2 className="
              mt-8
              text-4xl
              md:text-6xl
              font-black
              leading-tight
            ">
              Últimas notícias e ações da associação
            </h2>

          </div>

          <button className="
            px-8
            py-4
            rounded-2xl
            border
            border-white/10
            hover:border-cyan-400
            transition
            backdrop-blur-xl
            text-white
            font-semibold
          ">
            Ver todas notícias
          </button>

        </motion.div>

        {/* GRID */}
        <div className="
          grid
          lg:grid-cols-3
          gap-8
        ">

          {/* FEATURED */}
          <motion.article
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -8 }}
            className="
              lg:col-span-2
              relative
              overflow-hidden
              rounded-[40px]
              border
              border-white/10
              bg-white/5
              backdrop-blur-2xl
              shadow-2xl
            "
          >

            {/* Image */}
            <div className="
              h-[300px]
              md:h-[420px]
              bg-gradient-to-br
              from-emerald-500/20
              via-cyan-500/10
              to-blue-500/20
              relative
              overflow-hidden
            ">

              <div className="
                absolute
                inset-0
                bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]
              " />

            </div>

            {/* Content */}
            <div className="p-8 md:p-10">

              <span className="
                inline-flex
                px-4
                py-2
                rounded-full
                bg-emerald-400/10
                border
                border-emerald-400/20
                text-emerald-300
                text-sm
              ">
                {news[0].category}
              </span>

              <h3 className="
                mt-6
                text-3xl
                md:text-5xl
                font-black
                leading-tight
              ">
                {news[0].title}
              </h3>

              <p className="
                mt-6
                text-gray-400
                text-lg
                leading-relaxed
                max-w-3xl
              ">
                {news[0].description}
              </p>

              <button className="
                mt-8
                px-7
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-emerald-400
                to-cyan-500
                text-black
                font-bold
                shadow-xl
                shadow-cyan-500/20
              ">
                Ler matéria completa
              </button>

            </div>

          </motion.article>

          {/* SIDE NEWS */}
          <div className="space-y-8">

            {news.slice(1).map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                whileHover={{ x: 5 }}
                className="
                  group
                  rounded-[32px]
                  border
                  border-white/10
                  bg-white/5
                  backdrop-blur-xl
                  overflow-hidden
                  hover:border-cyan-400/30
                  transition
                "
              >

                <div className="
                  h-36
                  bg-gradient-to-br
                  from-cyan-500/20
                  to-emerald-500/20
                " />

                <div className="p-6">

                  <span className="
                    text-cyan-300
                    text-sm
                    font-medium
                  ">
                    {item.category}
                  </span>

                  <h3 className="
                    mt-4
                    text-xl
                    font-bold
                    leading-snug
                    group-hover:text-cyan-300
                    transition
                  ">
                    {item.title}
                  </h3>

                  <button className="
                    mt-5
                    text-sm
                    text-gray-400
                    hover:text-cyan-300
                    transition
                  ">
                    Ler notícia →
                  </button>

                </div>

              </motion.article>
            ))}

          </div>

        </div>

      </div>

    </section>
  );
}