export default function ReverseLogisticsSection() {
  return (
    <section
      id="logistica"
      className="bg-black py-28"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>

            <span className="text-green-400 uppercase tracking-[0.3em] text-sm font-semibold">
              Logística Reversa
            </span>

            <h2 className="text-white text-4xl lg:text-5xl font-black mt-6 leading-tight">
              Soluções ambientais para empresas e instituições
            </h2>

            <p className="text-zinc-400 mt-8 text-lg leading-relaxed">
              A ACMRB atua na coleta seletiva, destinação correta de resíduos,
              fortalecimento da economia circular e geração de impacto ESG.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <button className="
                bg-green-500
                hover:bg-green-400
                transition
                text-black
                font-bold
                px-8
                py-4
                rounded-full
              ">
                Seja Parceiro
              </button>

              <button className="
                border
                border-white/20
                text-white
                hover:border-green-400
                transition
                px-8
                py-4
                rounded-full
              ">
                Solicitar Contato
              </button>

            </div>

          </div>

          <div className="
            relative
            h-125
            rounded-[40px]
            overflow-hidden
            border
            border-white/10
            bg-liner-to-br
            from-green-500/20
            to-black
          ">

            <div className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.3),transparent_70%)]
            " />

          </div>

        </div>

      </div>
    </section>
  );
}