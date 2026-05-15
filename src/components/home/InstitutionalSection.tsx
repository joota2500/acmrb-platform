export default function InstitutionalSection() {
  return (
    <section
      id="contato"
      className="
        relative
        overflow-hidden
        bg-[#02110b]
        border-t
        border-white/5
        py-32
      "
    >

      <div className="
        absolute
        top-0
        left-1/2
        -translate-x-1/2
        w-[700px]
        h-[700px]
        bg-green-500/10
        blur-3xl
        rounded-full
      " />

      <div className="relative max-w-7xl mx-auto px-6">

        <div className="
          grid
          lg:grid-cols-4
          gap-14
          border
          border-white/10
          bg-white/5
          backdrop-blur-2xl
          rounded-[40px]
          p-12
        ">

          <div>

            <div className="flex items-center gap-4 mb-8">

              <div className="
                w-14
                h-14
                rounded-2xl
                bg-green-500
                flex
                items-center
                justify-center
                text-black
                font-black
                text-xl
              ">
                A
              </div>

              <div>
                <h2 className="text-white font-black text-2xl">
                  ACMRB
                </h2>

                <p className="text-green-400 text-sm">
                  Plataforma ESG Institucional
                </p>
              </div>

            </div>

            <p className="text-zinc-400 leading-relaxed">
              Associação dos Catadores de Materiais Recicláveis de Baturité,
              promovendo sustentabilidade, logística reversa e inclusão social.
            </p>

            <div className="mt-8 space-y-3 text-zinc-300 text-sm">

              <p>Baturité • Ceará • Brasil</p>

              <p>(85) 99999-9999</p>

              <p>contato@acmrb.org</p>

            </div>

          </div>

          <div>

            <h3 className="text-white font-bold text-xl mb-8">
              Institucional
            </h3>

            <div className="space-y-4 text-zinc-400">

              <a href="#" className="block hover:text-green-400 transition">
                Início
              </a>

              <a
                href="#quem-somos"
                className="block hover:text-green-400 transition"
              >
                Quem Somos
              </a>

              <a href="#" className="block hover:text-green-400 transition">
                Transparência
              </a>

              <a href="#" className="block hover:text-green-400 transition">
                Projetos
              </a>

              <a
                href="#noticias"
                className="block hover:text-green-400 transition"
              >
                Notícias
              </a>

            </div>

          </div>

          <div>

            <h3 className="text-white font-bold text-xl mb-8">
              ESG & Sustentabilidade
            </h3>

            <div className="space-y-4 text-zinc-400">

              <p>Logística Reversa</p>

              <p>Economia Circular</p>

              <p>Educação Ambiental</p>

              <p>Gestão de Resíduos</p>

              <p>Impacto Social</p>

            </div>

          </div>

          <div>

            <h3 className="text-white font-bold text-xl mb-8">
              Certificação Institucional
            </h3>

            <div className="
              border
              border-green-500/30
              bg-green-500/10
              rounded-3xl
              p-8
            ">

              <span className="text-green-400 text-sm uppercase tracking-widest">
                ESG VERIFIED
              </span>

              <h4 className="text-white font-black text-3xl mt-4">
                Plataforma Sustentável
              </h4>

              <p className="text-zinc-300 mt-4 leading-relaxed">
                Compromisso com desenvolvimento sustentável, inclusão social e
                impacto ambiental positivo.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}