"use client";

import { motion } from "framer-motion";

import {
  Truck,
  Factory,
  Recycle,
  ShieldCheck,
} from "lucide-react";

const services = [
  {
    title: "Coleta Seletiva",
    description:
      "Soluções sustentáveis de coleta seletiva para empresas, escolas e instituições públicas.",
    icon: Truck,
  },
  {
    title: "Logística Reversa",
    description:
      "Gestão ambiental inteligente voltada para descarte correto e reaproveitamento de resíduos.",
    icon: Recycle,
  },
  {
    title: "ESG Corporativo",
    description:
      "Projetos ambientais alinhados às metas ESG e sustentabilidade empresarial.",
    icon: Factory,
  },
  {
    title: "Compliance Ambiental",
    description:
      "Fortalecimento de práticas ambientais responsáveis e regulamentação sustentável.",
    icon: ShieldCheck,
  },
];

export default function ReverseLogisticsSections() {
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
            w-[900px]
            h-[900px]
            bg-cyan-500/10
            blur-[160px]
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

        <div
          className="
            grid
            lg:grid-cols-2
            gap-20
            items-center
          "
        >

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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
              🚛 Logística Reversa
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
              Soluções ambientais para empresas e instituições
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
              A ACMRB desenvolve soluções sustentáveis voltadas para
              coleta seletiva, logística reversa, educação ambiental
              e fortalecimento de práticas ESG em empresas,
              instituições e órgãos públicos.
            </p>

            {/* FEATURES */}
            <div
              className="
                mt-10
                grid
                sm:grid-cols-2
                gap-5
              "
            >

              {[
                "Coleta sustentável",
                "Redução de impactos ambientais",
                "Projetos ESG",
                "Educação ambiental",
              ].map((item) => (
                <div
                  key={item}
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    backdrop-blur-xl
                    px-5
                    py-4
                    text-gray-300
                    text-sm
                  "
                >
                  {item}
                </div>
              ))}

            </div>

            {/* BUTTONS */}
            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-5
                mt-12
              "
            >

              <button
                className="
                  px-8
                  py-4
                  rounded-2xl
                  bg-gradient-to-r
                  from-cyan-400
                  to-emerald-400
                  text-black
                  font-bold
                  shadow-xl
                  shadow-cyan-500/20
                  hover:scale-105
                  transition
                "
              >
                Solicitar Parceria
              </button>

              <button
                className="
                  px-8
                  py-4
                  rounded-2xl
                  border
                  border-white/10
                  hover:border-cyan-400
                  transition
                  backdrop-blur-xl
                "
              >
                Falar com Especialista
              </button>

            </div>

          </motion.div>

          {/* RIGHT SIDE */}
          <div
            className="
              grid
              sm:grid-cols-2
              gap-6
            "
          >

            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                  }}
                  whileHover={{
                    y: -8,
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

                  {/* CARD GLOW */}
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

                    {/* ICON */}
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

                    {/* TITLE */}
                    <h3
                      className="
                        mt-8
                        text-2xl
                        font-bold
                      "
                    >
                      {service.title}
                    </h3>

                    {/* DESCRIPTION */}
                    <p
                      className="
                        mt-4
                        text-gray-400
                        leading-relaxed
                      "
                    >
                      {service.description}
                    </p>

                  </div>

                </motion.div>
              );
            })}

          </div>

        </div>

      </div>

    </section>
  );
}