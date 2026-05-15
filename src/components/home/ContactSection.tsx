export default function ContactSection() {
  return (
    <section
      className="
        bg-black
        border-t
        border-white/5
        py-28
      "
    >

      <div className="max-w-7xl mx-auto px-6">

        <div className="
          grid
          lg:grid-cols-2
          gap-14
          items-center
        ">

          <div>

            <span className="
              text-green-400
              uppercase
              tracking-[0.3em]
              text-sm
              font-semibold
            ">
              Contato Institucional
            </span>

            <h2 className="
              text-white
              text-4xl
              lg:text-5xl
              font-black
              mt-6
              leading-tight
            ">
              Entre em contato com a ACMRB
            </h2>

            <p className="
              text-zinc-400
              mt-8
              text-lg
              leading-relaxed
            ">
              Faça parcerias, projetos ambientais, logística reversa
              e ações sustentáveis junto à associação.
            </p>

            <div className="mt-10 space-y-6">

              <div className="
                border
                border-white/10
                bg-white/5
                rounded-3xl
                p-6
              ">
                <h3 className="text-green-400 font-bold text-lg">
                  WhatsApp
                </h3>

                <p className="text-white mt-2">
                  (85) 98121-4864
                </p>
              </div>

              <div className="
                border
                border-white/10
                bg-white/5
                rounded-3xl
                p-6
              ">
                <h3 className="text-green-400 font-bold text-lg">
                  Instagram
                </h3>

                <p className="text-white mt-2">
                  @reciclae
                </p>
              </div>

              <div className="
                border
                border-white/10
                bg-white/5
                rounded-3xl
                p-6
              ">
                <h3 className="text-green-400 font-bold text-lg">
                  Endereço
                </h3>

                <p className="text-white mt-2">
                  Centro • Baturité • Ceará
                </p>
              </div>

            </div>

          </div>

          <div className="
            overflow-hidden
            rounded-[40px]
            border
            border-white/10
            h-[500px]
          ">

            <iframe
              src="https://www.google.com/maps?q=Baturité%20Centro&output=embed"
              width="100%"
              height="100%"
              loading="lazy"
              className="border-0"
            />

          </div>

        </div>

      </div>

    </section>
  );
}