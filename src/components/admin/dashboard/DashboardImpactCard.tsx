export default function DashboardMaterialsCard() {

  return (

    <div
      className="
        bg-white
        rounded-4xl
        border
        border-black/5
        p-10
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          flex-wrap
        "
      >

        <div>

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-[#E8F3EE]
              text-[#2E5E4E]
              text-xs
              font-black
              mb-5
            "
          >

            ♻ Gestão Operacional

          </div>

          <h2
            className="
              text-4xl
              font-black
              text-[#111827]
            "
          >

            Materiais operacionais

          </h2>

          <p
            className="
              text-zinc-500
              leading-8
              mt-5
              max-w-2xl
            "
          >

            Os materiais recicláveis
            agora são gerenciados
            diretamente pelo módulo
            operacional de materiais,
            com registros dinâmicos,
            histórico completo
            e controle individual
            por tipo de resíduo.

          </p>
 
        </div>

      </div> 

    </div>

  );

}