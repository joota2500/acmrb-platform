"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#07111F] text-white min-h-screen flex items-center">
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full" />

        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24 w-full">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 text-sm mb-6">
              ♻ Plataforma ESG • Baturité/CE
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              Transformando resíduos em{" "}
              <span className="text-emerald-400">
                impacto ambiental
              </span>
            </h1>

            <p className="mt-8 text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl">
              A ACMRB fortalece a reciclagem, gera renda para famílias
              catadoras e promove sustentabilidade através da logística
              reversa e educação ambiental.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">

              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 transition rounded-2xl font-semibold text-lg shadow-2xl shadow-emerald-500/30">
                Seja Parceiro
              </button>

              <button className="px-8 py-4 border border-white/20 hover:border-emerald-400 transition rounded-2xl font-semibold text-lg backdrop-blur-xl">
                Conheça a Associação
              </button>

            </div>

            {/* ESG Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">

              {[
                ["+120", "Famílias Impactadas"],
                ["+85t", "Reciclados"],
                ["+20", "Parceiros"],
                ["100%", "Compromisso ESG"],
              ].map(([number, label]) => (
                <div key={label}>
                  <h3 className="text-3xl font-black text-emerald-400">
                    {number}
                  </h3>

                  <p className="text-sm text-gray-400 mt-1">
                    {label}
                  </p>
                </div>
              ))}

            </div>

          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative flex justify-center"
          >

            <div className="relative w-full max-w-[500px]">

              <div className="absolute inset-0 bg-emerald-500 blur-[100px] opacity-20 rounded-full" />

              <div className="relative rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl">

                <div className="space-y-6">

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <p className="text-gray-400 text-sm">
                      Resíduos coletados
                    </p>

                    <h2 className="text-5xl font-black mt-2">
                      5 Toneladas
                    </h2>

                    <div className="w-full bg-white/10 rounded-full h-3 mt-4">
                      <div className="bg-emerald-400 h-3 rounded-full w-[78%]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                      <p className="text-gray-400 text-sm">
                        CO₂ evitado
                      </p>

                      <h3 className="text-3xl font-black mt-2 text-cyan-400">
                        48t
                      </h3>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                      <p className="text-gray-400 text-sm">
                        Educação Ambiental
                      </p>

                      <h3 className="text-3xl font-black mt-2 text-emerald-400">
                        32 ações
                      </h3>
                    </div>

                  </div>

                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl p-6 text-black">
                    <p className="font-semibold">
                      Plataforma institucional ESG em desenvolvimento.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}