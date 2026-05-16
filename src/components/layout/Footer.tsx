"use client";

import {
  AtSign,
  Globe,
  Mail,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-emerald-100 bg-white">

      {/* BG */}

      <div className="absolute inset-0 bg-linear-to-b from-emerald-50/50 to-white" />

      <div className="container-custom relative z-10">

        {/* TOP */}

        <div className="grid lg:grid-cols-4 gap-12 py-20">

          {/* BRAND */}

          <div>

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xl">

                ♻

              </div>

              <div>

                <h3 className="text-2xl font-black text-zinc-900">
                  ACMRB
                </h3>

                <p className="text-zinc-500 text-sm mt-1">
                  Plataforma ESG Institucional
                </p>

              </div>

            </div>

            <p className="text-zinc-600 leading-8 mt-8">

              Associação dos Catadores de Materiais
              Recicláveis de Baturité atuando em sustentabilidade,
              inclusão social e logística reversa.

            </p>

          </div>

          {/* LINKS */}

          <div>

            <h4 className="text-lg font-bold text-zinc-900">
              Institucional
            </h4>

            <div className="space-y-4 mt-8">

              <a href="#" className="block text-zinc-600 hover:text-emerald-700 transition">
                Quem Somos
              </a>

              <a href="#" className="block text-zinc-600 hover:text-emerald-700 transition">
                Projetos
              </a>

              <a href="#" className="block text-zinc-600 hover:text-emerald-700 transition">
                Transparência
              </a>

              <a href="#" className="block text-zinc-600 hover:text-emerald-700 transition">
                Notícias
              </a>

            </div>

          </div>

          {/* ESG */}

          <div>

            <h4 className="text-lg font-bold text-zinc-900">
              Sustentabilidade
            </h4>

            <div className="space-y-4 mt-8">

              <a href="#" className="block text-zinc-600 hover:text-emerald-700 transition">
                Logística Reversa
              </a>

              <a href="#" className="block text-zinc-600 hover:text-emerald-700 transition">
                Educação Ambiental
              </a>

              <a href="#" className="block text-zinc-600 hover:text-emerald-700 transition">
                Economia Circular
              </a>

              <a href="#" className="block text-zinc-600 hover:text-emerald-700 transition">
                Indicadores ESG
              </a>

            </div>

          </div>

          {/* CONTACT */}

          <div>

            <h4 className="text-lg font-bold text-zinc-900">
              Contato
            </h4>

            <div className="space-y-6 mt-8">

              <div className="flex gap-4">

                <PhoneFallback />

                <div>

                  <p className="text-sm text-zinc-500">
                    WhatsApp
                  </p>

                  <p className="text-zinc-700 font-medium">
                    (85) 98121-4864
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <Mail className="text-emerald-700 shrink-0" size={22} />

                <div>

                  <p className="text-sm text-zinc-500">
                    E-mail
                  </p>

                  <p className="text-zinc-700 font-medium">
                    contato@acmrb.org
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <MapPin className="text-emerald-700 shrink-0" size={22} />

                <div>

                  <p className="text-sm text-zinc-500">
                    Localização
                  </p>

                  <p className="text-zinc-700 font-medium">
                    Baturité • Ceará
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* BOTTOM */}

        <div className="border-t border-emerald-100 py-8 flex flex-col md:flex-row gap-6 items-center justify-between">

          {/* COPYRIGHT */}

          <div>

            <p className="text-zinc-500 text-sm text-center md:text-left">

              © 2026 ACMRB — Associação dos Catadores de Materiais Recicláveis de Baturité.
              Todos os direitos reservados.

            </p>

          </div>

          {/* DEV */}

          <div className="flex items-center gap-5">

            <p className="text-zinc-500 text-sm">

              Desenvolvido por
              <span className="font-semibold text-emerald-700 ml-1">
                DevJ-2500
              </span>

            </p>

            {/* INSTAGRAM */}

            <a
              href="https://www.instagram.com/devjunior2500?igsh=dGpqdHZ5bWFqODM1&utm_source=qr"
              target="_blank"
              className="w-10 h-10 rounded-xl bg-emerald-100 hover:bg-emerald-200 transition flex items-center justify-center text-emerald-700"
            >

              <AtSign size={18} />

            </a>

            {/* GITHUB */}

            <a
              href="https://github.com/joota2500"
              target="_blank"
              className="w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition flex items-center justify-center text-zinc-700"
            >

              <Globe size={18} />

            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}

/* FALLBACK PHONE ICON */

function PhoneFallback() {
  return (
    <div className="text-emerald-700 shrink-0 text-[22px] leading-none">
      ☎
    </div>
  );
}