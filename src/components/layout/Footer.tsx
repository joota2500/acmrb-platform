"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer
      className="
        relative
        overflow-hidden
        pt-28
        pb-10
        border-t
        border-white/10
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
            bottom-0
            left-1/2
            -translate-x-1/2
            w-[1200px]
            h-[700px]
            bg-cyan-500/5
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

        {/* TOP */}
        <div
          className="
            grid
            md:grid-cols-2
            xl:grid-cols-4
            gap-14
            pb-20
          "
        >

          {/* BRAND */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
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
                ♻
              </div>

              <div>

                <h2
                  className="
                    text-2xl
                    font-black
                  "
                >
                  ACMRB
                </h2>

                <p className="text-emerald-300 text-sm">
                  Plataforma ESG
                </p>

              </div>

            </div>

            <p
              className="
                mt-8
                text-gray-400
                leading-relaxed
              "
            >
              Associação dos Catadores de Materiais Recicláveis
              de Baturité promovendo sustentabilidade, inclusão
              social e impacto ambiental positivo.
            </p>

          </motion.div>

          {/* LINKS */}
          {[
            {
              title: "Institucional",
              items: [
                "Quem Somos",
                "Transparência",
                "Projetos",
                "Parceiros",
              ],
            },
            {
              title: "ESG",
              items: [
                "Impacto Ambiental",
                "Logística Reversa",
                "Educação Ambiental",
                "Sustentabilidade",
              ],
            },
            {
              title: "Contato",
              items: [
                "(85) 98121-4864",
                "@reciclae",
                "Centro • Baturité",
                "contato@acmrb.org",
              ],
            },
          ].map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
              }}
            >

              <h3
                className="
                  text-xl
                  font-bold
                  mb-6
                "
              >
                {group.title}
              </h3>

              <div className="space-y-4">

                {group.items.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="
                      block
                      text-gray-400
                      hover:text-cyan-300
                      transition
                    "
                  >
                    {item}
                  </a>
                ))}

              </div>

            </motion.div>
          ))}

        </div>

        {/* BOTTOM */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="
            border-t
            border-white/10
            pt-8
            flex
            flex-col
            lg:flex-row
            items-center
            justify-between
            gap-5
          "
        >

          <p className="text-gray-500 text-sm text-center">
            © 2026 ACMRB • Associação dos Catadores de Materiais
            Recicláveis de Baturité • Todos os direitos reservados.
          </p>

          <div
            className="
              flex
              items-center
              gap-6
              text-sm
              text-gray-500
            "
          >

            <a
              href="#"
              className="hover:text-cyan-300 transition"
            >
              LGPD
            </a>

            <a
              href="#"
              className="hover:text-cyan-300 transition"
            >
              Privacidade
            </a>

            <a
              href="#"
              className="hover:text-cyan-300 transition"
            >
              Transparência
            </a>

          </div>

        </motion.div>

      </div>

    </footer>
  );
}