export default function HeroSection() {
  return (
    <section className="min-h-screen bg-linear-to-br from-green-950 via-green-900 to-black flex items-center pt-32">

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        <div>

          <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm">
            Plataforma Institucional ESG
          </span>

          <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mt-6">
            Associação dos Catadores de Materiais Recicláveis De Baturité
          </h1>

          <p className="text-zinc-300 text-lg mt-6 leading-relaxed">
            Transparência, impacto ambiental e logística reversa.
          </p>

          <div className="flex gap-4 mt-8">

            <button className="bg-green-500 hover:bg-green-400 transition text-black font-bold px-8 py-4 rounded-full">
              Seja Parceiro
            </button>

            <button className="border border-white/20 text-white px-8 py-4 rounded-full">
              Transparência
            </button>

          </div>

        </div>

        <div className="hidden lg:flex justify-center">

          <div className="relative w-96 h-96 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center">

            <span className="text-green-300 text-7xl font-black">
              ACMRB
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}