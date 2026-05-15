"use client";

import { motion } from "framer-motion";

const partners = [
  "Prefeitura",
  "Universidade",
  "Empresa ESG",
  "Instituição",
  "Cooperativa",
  "Apoiador",
  "Parceiro Ambiental",
  "Projeto Social",
];

export default function PartnersSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        py-32
      "
    >

      {/* BACKGROUND */}
      <div
        className="
          absolute
          inset-0
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-[1000px]
            h-[1000px]
            bg-emerald-500/10
            blur-[180px]
            rounded-full
          "
        />

      </div>

      <div
        className="
          relative
          max-w-7xl
          mx-auto
          px-6
          md:px-10
        "
      >

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="
            text-center
            max-w-4xl
            mx-auto
            mb-20
          "
        >

          <span
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              border
              border-emerald-400/20
              bg-emerald-400/10
              text-emerald-300
              text-sm
            "
          >
            🤝 Rede Institucional
          </span>

          <h2
            className="
              mt-8
              text-4xl
              md:text-6xl
              font-black
              leading-tight
            "
          >
            Parceiros, apoiadores e instituições conectadas
          </h2>

          <p
            className="
              mt-8
              text-gray-400
              text-lg
              md:text-xl
              leading-relaxed
            "
          >
            A ACMRB fortalece conexões institucionais voltadas para
            sustentabilidade, impacto social e desenvolvimento ambiental.
          </p>

        </motion.div>

        {/* GRID */}
        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
            gap-6
          "
        >

          {partners.map((partner, index) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
              }}
              whileHover={{
                y: -6,
                scale: 1.02,
              }}
              className="
                relative
                overflow-hidden
                rounded-[32px]
                border
                border-white/10
                bg-white/5
                backdrop-blur-2xl
                h-48
                flex
                items-center
                justify-center
                text-center
                p-6
                hover:border-emerald-400/30
                transition
              "
            >

              {/* CARD GLOW */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-emerald-500/10
                  to-cyan-500/10
                "
              />

              <div className="relative">

                {/* LOGO */}
                <div
                  className="
                    w-20
                    h-20
                    rounded-3xl
                    mx-auto
                    bg-gradient-to-br
                    from-emerald-400
                    to-cyan-500
                    flex
                    items-center
                    justify-center
                    text-black
                    font-black
                    text-xl
                    shadow-xl
                  "
                >
                  Logo
                </div>

                {/* NAME */}
                <p
                  className="
                    mt-6
                    text-gray-300
                    font-medium
                    leading-relaxed
                  "
                >
                  {partner}
                </p>

              </div>

            </motion.div>
          ))}

        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="
            mt-20
            rounded-[40px]
            border
            border-white/10
            bg-white/5
            backdrop-blur-2xl
            p-10
            md:p-16
            text-center
            relative
            overflow-hidden
          "
        >

          {/* GLOW */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-cyan-500/10
              to-emerald-500/10
            "
          />

          <div className="relative">

            <h3
              className="
                text-3xl
                md:text-5xl
                font-black
                leading-tight
              "
            >
              Sua instituição também pode apoiar essa transformação
            </h3>

            <p
              className="
                mt-6
                text-gray-400
                text-lg
                max-w-3xl
                mx-auto
                leading-relaxed
              "
            >
              Fortaleça práticas ESG, sustentabilidade e impacto social
              através de parcerias ambientais e projetos colaborativos.
            </p>

            <button
              className="
                mt-10
                px-10
                py-5
                rounded-2xl
                bg-gradient-to-r
                from-emerald-400
                to-cyan-500
                text-black
                font-bold
                text-lg
                shadow-xl
                shadow-emerald-500/20
                hover:scale-105
                transition
              "
            >
              Tornar-se Parceiro
            </button>

          </div>

        </motion.div>

      </div>

    </section>
  );
}