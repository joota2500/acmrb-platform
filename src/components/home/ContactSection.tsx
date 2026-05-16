"use client";

import { motion } from "framer-motion";

import {
  Mail,
  Phone,
  MapPin,
  AtSign,
} from "lucide-react";

export default function ContactSection() {
  return (
    <section
      id="contato"
      className="section-spacing relative overflow-hidden"
    >

      {/* BG */}

      <div className="absolute inset-0 bg-linear-to-b from-white to-emerald-50/40" />

      <div className="container-custom relative z-10">

        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          viewport={{ once: true }}
          className="max-w-4xl"
        >

          <div className="section-tag mb-6">
            Contato Institucional
          </div>

          <h2 className="section-title">

            Conecte-se com
            a ACMRB.

          </h2>

          <p className="section-description mt-8">

            Entre em contato para parcerias institucionais,
            ações ambientais, projetos sustentáveis, logística reversa
            e iniciativas de impacto social.

          </p>

        </motion.div>

        {/* GRID */}

        <div className="grid lg:grid-cols-2 gap-10 mt-20">

          {/* LEFT */}

          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            viewport={{ once: true }}
            className="glass-card rounded-4xl p-8 md:p-10"
          >

            <div className="space-y-8">

              {/* ITEM */}

              <div className="flex gap-5 items-start">

                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">

                  <Phone size={26} />

                </div>

                <div>

                  <h3 className="text-xl font-bold text-zinc-900">
                    WhatsApp Institucional
                  </h3>

                  <p className="text-zinc-600 mt-2 leading-7">
                    (85) 98921-4864
                  </p>

                </div>

              </div>

              {/* ITEM */}

              <div className="flex gap-5 items-start">

                <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">

                  <AtSign size={26} />

                </div>

                <div>

                  <h3 className="text-xl font-bold text-zinc-900">
                    Instagram Oficial
                  </h3>

                  <p className="text-zinc-600 mt-2 leading-7">
                    @reciclaae
                  </p>

                </div>

              </div>

              {/* ITEM */}

              <div className="flex gap-5 items-start">

                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">

                  <Mail size={26} />

                </div>

                <div>

                  <h3 className="text-xl font-bold text-zinc-900">
                    E-mail Institucional
                  </h3>

                  <p className="text-zinc-600 mt-2 leading-7">
                    contato@acmrb.org
                  </p>

                </div>

              </div>

              {/* ITEM */}

              <div className="flex gap-5 items-start">

                <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">

                  <MapPin size={26} />

                </div>

                <div>

                  <h3 className="text-xl font-bold text-zinc-900">
                    Localização
                  </h3>

                  <p className="text-zinc-600 mt-2 leading-7">
                    Centro • Baturité/CE
                  </p>

                </div>

              </div>

            </div>

          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{
              opacity: 0,
              x: 30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            viewport={{ once: true }}
            className="glass-card rounded-4xl overflow-hidden"
          >

            {/* MAP */}

            <div className="h-full min-h-112.5 bg-linear-to-br from-emerald-100 to-teal-50 relative">

              <div className="absolute inset-0 flex items-center justify-center">

                <div className="text-center">

                  <div className="w-20 h-20 rounded-full bg-white shadow-xl mx-auto flex items-center justify-center text-emerald-700">

                    <MapPin size={34} />

                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 mt-6">

                    Mapa Institucional

                  </h3>

                  <p className="text-zinc-600 mt-4 max-w-sm leading-7 px-6">

                    Área reservada para integração futura
                    com Google Maps e localização institucional.

                  </p>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

        {/* CTA */}

       <motion.div
          id="projetos"
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.2,
          }}
          viewport={{ once: true }}
          className="mt-20 scroll-mt-40"
        >

          <div className="glass-card rounded-4xl p-10 md:p-14 text-center">

            <div className="max-w-4xl mx-auto">

              <div className="section-tag mb-6">
                Parcerias e Projetos
              </div>

              <h3 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.04em] text-zinc-900">

                Vamos construir soluções
                sustentáveis juntos.

              </h3>

              <p className="text-zinc-600 leading-8 text-lg mt-8">

                Entre em contato para desenvolver projetos,
                ações ambientais, campanhas educativas e
                parcerias institucionais.

              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">

                  {/* WHATSAPP */}

                  <a
                    href="https://wa.me/5585981214864"
                    target="_blank"
                    className="primary-button"
                  >
                    Entrar em contato
                  </a>

                  {/* PROJETOS */}

                  <a
                    href="/projetos"
                    className="
                      px-6
                      py-4
                      rounded-2xl
                      border
                      border-emerald-200
                      text-emerald-700
                      font-semibold
                      hover:bg-emerald-50
                      transition-all
                    "
                  >
                    Ver projetos desenvolvidos
                  </a>

                </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}