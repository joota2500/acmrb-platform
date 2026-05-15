"use client";

import { motion } from "framer-motion";

import {
  MapPin,
  Phone,
  Mail,
  AtSign,
} from "lucide-react";

export default function ContactSection() {
  return (
    <section
      id="contato"
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
            bottom-0
            left-1/2
            -translate-x-1/2
            w-[1000px]
            h-[1000px]
            bg-cyan-500/10
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
              border-cyan-400/20
              bg-cyan-400/10
              text-cyan-300
              text-sm
            "
          >
            📍 Contato Institucional
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
            Entre em contato com a ACMRB
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
            Conecte-se com nossa equipe institucional para parcerias,
            projetos ambientais, ações ESG e iniciativas sustentáveis.
          </p>

        </motion.div>

        <div
          className="
            grid
            lg:grid-cols-2
            gap-10
          "
        >

          {/* MAP */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
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
              min-h-[500px]
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

            <div
              className="
                relative
                h-full
                flex
                flex-col
              "
            >

              {/* MAP PLACEHOLDER */}
              <div
                className="
                  flex-1
                  flex
                  items-center
                  justify-center
                  text-7xl
                "
              >
                🗺
              </div>

              {/* ADDRESS */}
              <div
                className="
                  border-t
                  border-white/10
                  p-8
                "
              >

                <div className="flex items-start gap-4">

                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-gradient-to-br
                      from-cyan-400
                      to-emerald-400
                      flex
                      items-center
                      justify-center
                      shadow-xl
                    "
                  >

                    <MapPin
                      size={24}
                      className="text-black"
                    />

                  </div>

                  <div>

                    <h3
                      className="
                        text-xl
                        font-bold
                      "
                    >
                      Localização
                    </h3>

                    <p
                      className="
                        mt-2
                        text-gray-400
                        leading-relaxed
                      "
                    >
                      Centro • Baturité • Ceará
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </motion.div>

          {/* CONTACT CARDS */}
          <div className="space-y-6">

            {[
              {
                title: "WhatsApp",
                value: "(85) 98121-4864",
                icon: Phone,
              },
              {
                title: "Instagram",
                value: "@reciclae",
                icon: AtSign,
              },
              {
                title: "Email Institucional",
                value: "contato@acmrb.org",
                icon: Mail,
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                  }}
                  whileHover={{
                    y: -5,
                  }}
                  className="
                    relative
                    overflow-hidden
                    rounded-[32px]
                    border
                    border-white/10
                    bg-white/5
                    backdrop-blur-2xl
                    p-8
                    hover:border-cyan-400/30
                    transition
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

                  <div className="relative flex items-start gap-5">

                    <div
                      className="
                        w-16
                        h-16
                        rounded-2xl
                        bg-gradient-to-br
                        from-cyan-400
                        to-emerald-400
                        flex
                        items-center
                        justify-center
                        shadow-xl
                      "
                    >

                      <Icon
                        size={28}
                        className="text-black"
                      />

                    </div>

                    <div>

                      <h3
                        className="
                          text-2xl
                          font-bold
                        "
                      >
                        {item.title}
                      </h3>

                      <p
                        className="
                          mt-3
                          text-gray-400
                          text-lg
                          break-all
                        "
                      >
                        {item.value}
                      </p>

                    </div>

                  </div>

                </motion.div>
              );
            })}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
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
                text-center
              "
            >

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

                <h3
                  className="
                    text-3xl
                    font-black
                    leading-tight
                  "
                >
                  Vamos construir impacto ambiental juntos
                </h3>

                <p
                  className="
                    mt-5
                    text-gray-400
                    leading-relaxed
                  "
                >
                  Entre em contato para desenvolver ações ambientais,
                  projetos ESG e parcerias sustentáveis.
                </p>

                <button
                  className="
                    mt-8
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
                    shadow-cyan-500/20
                    hover:scale-105
                    transition
                  "
                >
                  Falar com a ACMRB
                </button>

              </div>

            </motion.div>

          </div>

        </div>

      </div>

    </section>
  );
}