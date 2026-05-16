"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Flame, Trash2 } from "lucide-react";

const denuncias = [
  {
    icon: Trash2,
    title: "Descarte Irregular",
    description:
      "Denuncie descarte inadequado de resíduos em ruas, rios e áreas públicas.",
  },
  {
    icon: Flame,
    title: "Queimadas",
    description:
      "Ajude no combate a queimadas ilegais e danos ambientais na região.",
  },
  {
    icon: ShieldAlert,
    title: "Poluição Ambiental",
    description:
      "Informe casos de poluição hídrica, visual ou contaminação ambiental.",
  },
];

export default function DenunciasSection() {
  return (
    <section
      id="denuncias"
      className="
        py-28
        bg-[#F5F7F4]
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          md:px-10
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="
            text-center
            max-w-3xl
            mx-auto
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-[#E8F0EC]
              text-[#2E5E4E]
              font-semibold
              text-sm
              mb-6
            "
          >
            <AlertTriangle size={16} />
            Participação Ambiental
          </div>

          <h2
            className="
              text-4xl
              md:text-5xl
              font-black
              text-[#1F2937]
              leading-tight
            "
          >
            Denúncias Ambientais
          </h2>

          <p
            className="
              mt-6
              text-lg
              text-[#6B7280]
              leading-relaxed
            "
          >
            Ajude a combater descarte irregular, queimadas,
            poluição e crimes ambientais em Baturité e região.
          </p>
        </motion.div>

        <div
          className="
            grid
            md:grid-cols-3
            gap-6
            mt-16
          "
        >
          {denuncias.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                className="
                  bg-white
                  rounded-3xl
                  p-8
                  border
                  border-black/5
                  shadow-sm
                "
              >
                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-[#E8F0EC]
                    flex
                    items-center
                    justify-center
                    text-[#2E5E4E]
                    mb-6
                  "
                >
                  <Icon size={28} />
                </div>

                <h3
                  className="
                    text-2xl
                    font-bold
                    text-[#1F2937]
                  "
                >
                  {item.title}
                </h3>

                <p
                  className="
                    mt-4
                    text-[#6B7280]
                    leading-relaxed
                  "
                >
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="
            mt-16
            flex
            flex-col
            md:flex-row
            items-center
            justify-center
            gap-5
          "
        >
          <button
            className="
              h-14
              px-8
              rounded-2xl
              bg-[#2E5E4E]
              hover:bg-[#24473B]
              transition
              text-white
              font-semibold
              shadow-lg
            "
          >
            Fazer denúncia
          </button>

          <button
            className="
              h-14
              px-8
              rounded-2xl
              border
              border-[#2E5E4E]/20
              bg-white
              hover:bg-[#F3F6F4]
              transition
              text-[#2E5E4E]
              font-semibold
            "
          >
            Enviar anonimamente
          </button>
        </motion.div>
      </div>
    </section>
  );
}