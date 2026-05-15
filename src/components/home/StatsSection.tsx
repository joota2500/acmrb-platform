"use client";

import { motion } from "framer-motion";

import {
  Recycle,
  Leaf,
  Users,
  Building2,
} from "lucide-react";

const stats = [
  {
    number: "85",
    suffix: "t",
    label: "Resíduos Reciclados",
    icon: Recycle,
    color: "from-emerald-400 to-green-500",
  },
  {
    number: "120",
    suffix: "+",
    label: "Famílias Impactadas",
    icon: Users,
    color: "from-cyan-400 to-blue-500",
  },
  {
    number: "20",
    suffix: "+",
    label: "Parceiros ESG",
    icon: Building2,
    color: "from-lime-400 to-emerald-500",
  },
  {
    number: "48",
    suffix: "t",
    label: "CO₂ Evitado",
    icon: Leaf,
    color: "from-teal-400 to-cyan-500",
  },
];

export default function StatsSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        py-28
      "
    >

      {/* Glow Background */}
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
          w-[800px]
          h-[800px]
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
            ♻ Impacto ESG
          </span>

          <h2 className="
            mt-8
            text-4xl
            md:text-6xl
            font-black
            leading-tight
          ">
            Resultados ambientais e sociais que transformam comunidades
          </h2>

          <p className="
            mt-8
            text-gray-400
            text-lg
            md:text-xl
            leading-relaxed
          ">
            A ACMRB atua na valorização dos catadores, fortalecimento da
            economia circular e redução dos impactos ambientais.
          </p>

        </motion.div>

        {/* GRID */}
        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-8
        ">

          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -10,
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
                  shadow-2xl
                "
              >

                {/* Glow */}
                <div className={`
                  absolute
                  inset-0
                  opacity-10
                  bg-gradient-to-br
                  ${item.color}
                `} />

                <div className="relative">

                  {/* Icon */}
                  <div className={`
                    w-16
                    h-16
                    rounded-2xl
                    bg-gradient-to-br
                    ${item.color}
                    flex
                    items-center
                    justify-center
                    shadow-xl
                  `}>

                    <Icon size={30} className="text-black" />

                  </div>

                  {/* Number */}
                  <div className="mt-8 flex items-end gap-1">

                    <h3 className="
                      text-5xl
                      md:text-6xl
                      font-black
                    ">
                      {item.number}
                    </h3>

                    <span className="
                      text-2xl
                      text-emerald-400
                      font-bold
                    ">
                      {item.suffix}
                    </span>

                  </div>

                  {/* Label */}
                  <p className="
                    mt-4
                    text-gray-400
                    text-lg
                    leading-relaxed
                  ">
                    {item.label}
                  </p>

                </div>

              </motion.div>
            );
          })}

        </div>

      </div>

    </section>
  );
}