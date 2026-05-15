"use client";

import { motion } from "framer-motion";

import {
  Leaf,
  Recycle,
  Users,
  Globe2,
} from "lucide-react";

const pillars = [
  {
    title: "Sustentabilidade",
    description:
      "Fortalecimento da reciclagem e redução de impactos ambientais.",
    icon: Leaf,
  },
  {
    title: "Economia Circular",
    description:
      "Transformação de resíduos em oportunidades sociais e econômicas.",
    icon: Recycle,
  },
  {
    title: "Inclusão Social",
    description:
      "Valorização dos catadores e geração de renda para famílias.",
    icon: Users,
  },
  {
    title: "Impacto ESG",
    description:
      "Projetos ambientais voltados para desenvolvimento sustentável.",
    icon: Globe2,
  },
];

export default function AboutSection() {
  return (
    <section
      id="quem-somos"
      className="
        relative
        overflow-hidden
        py-32
      "
    >

      {/* Background Glow */}
      <div className="
        absolute
        inset-0
        overflow-hidden
      ">

        <div className="
          absolute
          top-1/2
          left-0
          w-[600px]
          h-[600px]
          bg-emerald-500/10
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

        <div className="
          grid
          lg:grid-cols-2
          gap-20
          items-center
        ">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >

            <span className="
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
            ">
              🌱 Quem Somos
            </span>

            <h2 className="
              mt-8
              text-4xl
              md:text-6xl
              font-black
              leading-tight
            ">
              Transformando reciclagem em impacto social e ambiental
            </h2>

            <p className="
              mt-8
              text-gray-400
              text-lg
              md:text-xl
              leading-relaxed
            ">
              A ACMRB atua no fortalecimento da coleta seletiva, logística
              reversa e valorização dos catadores, promovendo inclusão social,
              sustentabilidade e desenvolvimento ambiental em Baturité e região.
            </p>

            {/* Timeline */}
            <div className="mt-12 space-y-8">

              {[
                "Fortalecimento da coleta seletiva",
                "Projetos de educação ambiental",
                "Parcerias institucionais ESG",
                "Valorização dos catadores",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-5"
                >

                  <div className="
                    mt-1
                    w-4
                    h-4
                    rounded-full
                    bg-emerald-400
                    shadow-lg
                    shadow-emerald-500/40
                  " />

                  <div>

                    <h3 className="
                      text-white
                      font-semibold
                      text-lg
                    ">
                      {item}
                    </h3>

                    <p className="
                      text-gray-500
                      mt-1
                    ">
                      Desenvolvimento sustentável e impacto positivo.
                    </p>

                  </div>

                </div>
              ))}

            </div>

            {/* Buttons */}
            <div className="
              flex
              flex-col
              sm:flex-row
              gap-4
              mt-12
            ">

              <button className="
                px-8
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-emerald-400
                to-cyan-500
                text-black
                font-bold
                shadow-xl
                shadow-emerald-500/20
                hover:scale-105
                transition
              ">
                Conheça Nossa História
              </button>

              <button className="
                px-8
                py-4
                rounded-2xl
                border
                border-white/10
                hover:border-emerald-400
                transition
                backdrop-blur-xl
              ">
                Transparência
              </button>

            </div>

          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >

            {/* Main Card */}
            <div className="
              relative
              rounded-[40px]
              border
              border-white/10
              bg-white/5
              backdrop-blur-2xl
              p-8
              overflow-hidden
            ">

              {/* Glow */}
              <div className="
                absolute
                inset-0
                bg-gradient-to-br
                from-emerald-500/10
                to-cyan-500/10
              " />

              <div className="relative">

                <div className="
                  h-[300px]
                  rounded-3xl
                  bg-gradient-to-br
                  from-emerald-500/20
                  to-cyan-500/20
                  border
                  border-white/10
                  flex
                  items-center
                  justify-center
                  text-6xl
                ">
                  ♻
                </div>

                {/* Cards */}
                <div className="
                  grid
                  sm:grid-cols-2
                  gap-5
                  mt-8
                ">

                  {pillars.map((pillar) => {
                    const Icon = pillar.icon;

                    return (
                      <div
                        key={pillar.title}
                        className="
                          rounded-3xl
                          border
                          border-white/10
                          bg-white/5
                          p-5
                          hover:border-emerald-400/30
                          transition
                        "
                      >

                        <div className="
                          w-12
                          h-12
                          rounded-2xl
                          bg-gradient-to-br
                          from-emerald-400
                          to-cyan-500
                          flex
                          items-center
                          justify-center
                        ">

                          <Icon
                            size={24}
                            className="text-black"
                          />

                        </div>

                        <h3 className="
                          mt-5
                          text-white
                          font-bold
                          text-lg
                        ">
                          {pillar.title}
                        </h3>

                        <p className="
                          mt-3
                          text-gray-400
                          text-sm
                          leading-relaxed
                        ">
                          {pillar.description}
                        </p>

                      </div>
                    );
                  })}

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}