"use client";

import { motion } from "framer-motion";

export default function InstitutionalSection() {
  return (
    <section
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
          top-0
          left-1/2
          -translate-x-1/2
          w-[1000px]
          h-[1000px]
          bg-emerald-500/10
          blur-[180px]
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

        {/* TOP CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="
            relative
            overflow-hidden
            rounded-[40px]
            border
            border-white/10
            bg-white/5
            backdrop-blur-2xl
            p-10
            md:p-16
          "
        >

          {/* Glow */}
          <div className="
            absolute
            inset-0
            bg-gradient-to-br
            from-emerald-500/10
            to-cyan-500/10
          " />

          <div className="
            relative
            grid
            lg:grid-cols-2
            gap-16
            items-center
          ">

            <div>

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
                ♻ Plataforma Institucional ESG
              </span>

              <h2 className="
                mt-8
                text-4xl
                md:text-6xl
                font-black
                leading-tight
              ">
                Juntos pela reciclagem e transformação social
              </h2>

              <p className="
                mt-8
                text-gray-400
                text-lg
                md:text-xl
                leading-relaxed
                max-w-2xl
              ">
                A ACMRB promove inclusão social, sustentabilidade e
                logística reversa através de ações ambientais,
                educação ecológica e fortalecimento dos catadores.
              </p>

              <div className="
                flex
                flex-col
                sm:flex-row
                gap-5
                mt-10
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
                  Seja Parceiro
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
                  Conhecer Projetos
                </button>

              </div>

            </div>

            {/* Right Grid */}
            <div className="
              grid
              grid-cols-2
              gap-5
            ">

              {[
                "Logística Reversa",
                "Educação Ambiental",
                "Economia Circular",
                "Inclusão Social",
              ].map((item) => (
                <div
                  key={item}
                  className="
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/5
                    backdrop-blur-xl
                    p-6
                    min-h-[140px]
                    flex
                    items-end
                    text-lg
                    font-semibold
                    hover:border-emerald-400/30
                    transition
                  "
                >
                  {item}
                </div>
              ))}

            </div>

          </div>

        </motion.div>

        {/* INSTITUTIONAL GRID */}
        <div className="
          grid
          md:grid-cols-2
          xl:grid-cols-4
          gap-8
          mt-20
        ">

          {/* COLUNA 1 */}
          <div>

            <h3 className="
              text-white
              font-black
              text-xl
              mb-6
            ">
              Institucional
            </h3>

            <div className="
              flex
              flex-col
              gap-4
              text-gray-400
            ">

              <a href="#" className="hover:text-white transition">
                Quem Somos
              </a>

              <a href="#" className="hover:text-white transition">
                Transparência
              </a>

              <a href="#" className="hover:text-white transition">
                Relatórios ESG
              </a>

              <a href="#" className="hover:text-white transition">
                Certificações
              </a>

            </div>

          </div>

          {/* COLUNA 2 */}
          <div>

            <h3 className="
              text-white
              font-black
              text-xl
              mb-6
            ">
              Projetos
            </h3>

            <div className="
              flex
              flex-col
              gap-4
              text-gray-400
            ">

              <a href="#" className="hover:text-white transition">
                Coleta Seletiva
              </a>

              <a href="#" className="hover:text-white transition">
                Educação Ambiental
              </a>

              <a href="#" className="hover:text-white transition">
                Logística Reversa
              </a>

              <a href="#" className="hover:text-white transition">
                Voluntariado
              </a>

            </div>

          </div>

          {/* COLUNA 3 */}
          <div>

            <h3 className="
              text-white
              font-black
              text-xl
              mb-6
            ">
              Compliance
            </h3>

            <div className="
              flex
              flex-col
              gap-4
              text-gray-400
            ">

              <a href="#" className="hover:text-white transition">
                LGPD
              </a>

              <a href="#" className="hover:text-white transition">
                Denúncias
              </a>

              <a href="#" className="hover:text-white transition">
                Integridade
              </a>

              <a href="#" className="hover:text-white transition">
                Transparência
              </a>

            </div>

          </div>

          {/* COLUNA 4 */}
          <div>

            <h3 className="
              text-white
              font-black
              text-xl
              mb-6
            ">
              Parceiros
            </h3>

            <div className="
              grid
              grid-cols-2
              gap-4
            ">

              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="
                    h-20
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    backdrop-blur-xl
                    flex
                    items-center
                    justify-center
                    text-gray-500
                    text-sm
                  "
                >
                  Logo
                </div>
              ))}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}