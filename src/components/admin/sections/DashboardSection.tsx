export default function DashboardSection() {

  return (

    <div
      className="
        grid
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      "
    >

      {[
        {
          title: "Resíduos Reciclados",
          value: "12.4t",
        },
        {
          title: "Famílias Impactadas",
          value: "148",
        },
        {
          title: "CO₂ Evitado",
          value: "8.2t",
        },
        {
          title: "Parceiros",
          value: "26",
        },
      ].map((item) => (

        <div
          key={item.title}
          className="
            bg-white
            rounded-3xl
            border
            border-black/5
            p-8
          "
        >

          <p className="text-zinc-500">
            {item.title}
          </p>

          <h2
            className="
              text-4xl
              font-black
              text-[#1F2937]
              mt-4
            "
          >
            {item.value}
          </h2>

        </div>

      ))}

    </div>

  );

}