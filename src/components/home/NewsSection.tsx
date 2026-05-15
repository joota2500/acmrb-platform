export default function NewsSection() {
  return (
    <section
      id="noticias"
      className="bg-black py-28 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-end justify-between mb-14">

          <div>
            <span className="text-green-400 uppercase tracking-widest text-sm font-semibold">
              Notícias
            </span>

            <h2 className="text-4xl font-black text-white mt-4">
              Últimas atualizações
            </h2>
          </div>

        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {[1, 2, 3].map((item) => (
            <article
              key={item}
              className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-green-500/30 transition"
            >

              <div className="h-56 bg-linear-to-br from-green-500/20 to-green-900/20" />

              <div className="p-8">

                <span className="text-green-400 text-sm font-semibold">
                  Meio Ambiente
                </span>

                <h3 className="text-white text-2xl font-bold mt-4 leading-snug">
                  ACMRB fortalece ações de reciclagem em Baturité
                </h3>

                <p className="text-zinc-400 mt-4 leading-relaxed">
                  Associação amplia iniciativas ambientais e inclusão social.
                </p>

                <button className="mt-6 text-green-400 font-semibold">
                  Ler mais →
                </button>

              </div>

            </article>
          ))}

        </div>

      </div>
    </section>
  );
}