const stats = [
  {
    number: "+1.250",
    label: "Toneladas recicladas",
  },
  {
    number: "+320",
    label: "Famílias impactadas",
  },
  {
    number: "12",
    label: "Cidades atendidas",
  },
  {
    number: "+40",
    label: "Parceiros institucionais",
  },
];

export default function StatsSection() {
  return (
    <section className="bg-[#02110b] py-24 border-y border-white/5">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center max-w-3xl mx-auto mb-20">

          <span className="text-green-400 uppercase tracking-[0.3em] text-sm font-semibold">
            Impacto ESG
          </span>

          <h2 className="text-white text-4xl lg:text-5xl font-black mt-6 leading-tight">
            Transformando resíduos em desenvolvimento sustentável
          </h2>

          <p className="text-zinc-400 mt-6 text-lg leading-relaxed">
            Resultados ambientais, sociais e econômicos através da reciclagem
            e fortalecimento dos catadores.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {stats.map((item, index) => (
            <div
              key={index}
              className="
                bg-white/5
                border
                border-white/10
                rounded-3xl
                p-10
                backdrop-blur-xl
                hover:border-green-500/40
                hover:-translate-y-2
                transition-all
                duration-300
              "
            >

              <h3 className="text-5xl font-black text-green-400">
                {item.number}
              </h3>

              <p className="text-zinc-300 mt-5 text-lg">
                {item.label}
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}