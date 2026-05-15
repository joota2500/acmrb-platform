const partners = [
  "RECICLAÊ",
  "ACMRB",
  "PREFEITURA",
  "IFCE",
  "PARCEIRO ESG",
  "COOPERATIVA",
];

export default function PartnersSection() {
  return (
    <section className="bg-[#03150d] py-24 border-t border-white/5">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="text-green-400 uppercase tracking-[0.3em] text-sm font-semibold">
            Parceiros
          </span>

          <h2 className="text-white text-4xl font-black mt-6">
            Instituições e apoiadores
          </h2>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

          {partners.map((partner, index) => (
            <div
              key={index}
              className="
                h-28
                rounded-2xl
                border
                border-white/10
                bg-white/5
                flex
                items-center
                justify-center
                text-zinc-300
                font-bold
                hover:border-green-500/30
                transition
              "
            >
              {partner}
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}