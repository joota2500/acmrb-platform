"use client";

import { motion } from "framer-motion";

import {
  ArrowRight,
  CalendarDays,
} from "lucide-react";

const news = [
  {
    category: "Sustentabilidade",
    date: "15 Maio 2026",
    title:
      "ACMRB amplia ações de coleta seletiva em Baturité",
    description:
      "Novas ações fortalecem a reciclagem, inclusão social e conscientização ambiental no município.",
  },

  {
    category: "Educação Ambiental",
    date: "10 Maio 2026",
    title:
      "Projeto ambiental promove conscientização em escolas",
    description:
      "Atividades educativas incentivam sustentabilidade e descarte correto de resíduos.",
  },

  {
    category: "Parcerias ESG",
    date: "02 Maio 2026",
    title:
      "Empresas fortalecem iniciativas sustentáveis da associação",
    description:
      "Parcerias ampliam impacto ambiental positivo e apoio às ações sociais.",
  },
];

export default function NewsSection() {
  return (
    <section className="section-spacing relative overflow-hidden">

      {/* BG */}

      <div className="absolute inset-0 bg-linear-to-b from-white to-emerald-50/40" />

      <div className="container-custom relative z-10">

        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10"
        >

          <div className="max-w-4xl">

            <div className="section-tag mb-6">
              Notícias e Atualizações
            </div>

            <h2 className="section-title">

              Transparência, ações ambientais
              e impacto social.

            </h2>

            <p className="section-description mt-8">

              Acompanhe notícias, projetos, iniciativas ambientais,
              ações sociais e parcerias desenvolvidas pela ACMRB.

            </p>

          </div>

          {/* BUTTON */}

          <a
            href="/noticias"
            className="primary-button whitespace-nowrap"
          >
            Ver todas
            <ArrowRight size={18} />
          </a>

        </motion.div>

        {/* GRID */}

        <div className="grid lg:grid-cols-3 gap-8 mt-20">

          {news.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              viewport={{ once: true }}
              className="glass-card rounded-4xl overflow-hidden group"
            >

              {/* IMAGE */}

              <div className="h-60 bg-linear-to-br from-emerald-200 to-teal-100 relative overflow-hidden">

                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-all duration-300" />

                <div className="absolute top-6 left-6">

                  <span className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-md text-sm font-semibold text-emerald-700">

                    {item.category}

                  </span>

                </div>

              </div>

              {/* CONTENT */}

              <div className="p-8">

                {/* DATE */}

                <div className="flex items-center gap-2 text-zinc-500 text-sm">

                  <CalendarDays size={16} />

                  <span>{item.date}</span>

                </div>

                {/* TITLE */}

                <h3 className="text-2xl font-bold text-zinc-900 mt-5 leading-tight">

                  {item.title}

                </h3>

                {/* DESCRIPTION */}

                <p className="text-zinc-600 leading-8 mt-5">

                  {item.description}

                </p>

                {/* LINK */}

                <a
                  href="/noticias"
                  className="inline-flex items-center gap-2 text-emerald-700 font-semibold mt-8 hover:gap-3 transition-all"
                >

                  Ler mais

                  <ArrowRight size={18} />

                </a>

              </div>

            </motion.article>
          ))}

        </div>

      </div>

    </section>
  );
}