export default function AboutSection() {
  return (
    <section
      id="quem-somos"
      className="bg-[#04130c] py-28 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-3xl">

          <span className="text-green-400 font-semibold uppercase tracking-widest text-sm">
            Quem Somos
          </span>

          <h2 className="text-4xl lg:text-5xl font-black text-white mt-4 leading-tight">
            Transformando resíduos em impacto ambiental e social
          </h2>

          <p className="text-zinc-400 text-lg mt-8 leading-relaxed">
            A ACMRB atua na coleta seletiva, logística reversa e valorização
            dos catadores de materiais recicláveis, promovendo inclusão social,
            sustentabilidade e desenvolvimento ambiental em Baturité e região.
          </p>

        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-white font-bold text-xl mb-4">
              Planejamento
            </h3>

            <p className="text-zinc-400 leading-relaxed">
              Organização operacional e gestão ambiental eficiente.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-white font-bold text-xl mb-4">
              Formação
            </h3>

            <p className="text-zinc-400 leading-relaxed">
              Capacitação de catadores e educação ambiental contínua.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-white font-bold text-xl mb-4">
              Sustentabilidade
            </h3>

            <p className="text-zinc-400 leading-relaxed">
              Impacto positivo através da reciclagem e logística reversa.
            </p>
          </div>

        </div>

        <div className="mt-12">
          <a
            href="/sobre"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 transition px-8 py-4 rounded-full text-black font-bold"
          >
            Saiba Mais
          </a>
        </div>

      </div>
    </section>
  );
}