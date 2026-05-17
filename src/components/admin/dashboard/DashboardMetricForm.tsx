"use client";

type DashboardMetricas = {

  id?: string;

  residuos_reciclados: number;

  co2_evitado: number;

  familias_impactadas: number;

  catadores_ativos: number;

  renda_gerada: number;

  empresas_parceiras: number;

  coletas_realizadas: number;

  bairros_atendidos: number;

  residuos_desviados_aterro: number;

  educacao_ambiental_acoes: number;

  pessoas_impactadas: number;

  toneladas_papelao: number;

  toneladas_plastico: number;

  toneladas_vidro: number;

  toneladas_metal: number;

  toneladas_eletronicos: number;

  arvores_preservadas: number;

  agua_economizada: number;

  energia_economizada: number;
};

type Props = {

  dados: DashboardMetricas;

  setDados: (
    dados: DashboardMetricas,
  ) => void;

  onSave: () => void;

  loading: boolean;
};

export default function DashboardMetricsForm({

  dados,

  setDados,

  onSave,

  loading,

}: Props) {

  function updateField(
    field: keyof DashboardMetricas,
    value: number,
  ) {

    setDados({

      ...dados,

      [field]: value,

    });

  }

  const fields = [

    {
      key: "residuos_reciclados",
      label: "Resíduos Reciclados (t)",
    },

    {
      key: "co2_evitado",
      label: "CO₂ Evitado (t)",
    },

    {
      key: "familias_impactadas",
      label: "Famílias Impactadas",
    },

    {
      key: "catadores_ativos",
      label: "Catadores Ativos",
    },

    {
      key: "renda_gerada",
      label: "Renda Gerada",
    },

    {
      key: "empresas_parceiras",
      label: "Empresas Parceiras",
    },

    {
      key: "coletas_realizadas",
      label: "Coletas Realizadas",
    },

    {
      key: "bairros_atendidos",
      label: "Bairros Atendidos",
    },

    {
      key: "residuos_desviados_aterro",
      label: "Resíduos Desviados",
    },

    {
      key: "educacao_ambiental_acoes",
      label: "Ações Ambientais",
    },

    {
      key: "pessoas_impactadas",
      label: "Pessoas Impactadas",
    },

    {
      key: "toneladas_papelao",
      label: "Papelão",
    },

    {
      key: "toneladas_plastico",
      label: "Plástico",
    },

    {
      key: "toneladas_vidro",
      label: "Vidro",
    },

    {
      key: "toneladas_metal",
      label: "Metal",
    },

    {
      key: "toneladas_eletronicos",
      label: "Eletrônicos",
    },

    {
      key: "arvores_preservadas",
      label: "Árvores Preservadas",
    },

    {
      key: "agua_economizada",
      label: "Água Economizada",
    },

    {
      key: "energia_economizada",
      label: "Energia Economizada",
    },

  ];

  return (

    <div
      className="
        bg-white
        rounded-4xl
        border
        border-black/5
        p-8
      "
    >

      <div className="mb-8">

        <h2
          className="
            text-3xl
            font-black
            text-[#111827]
          "
        >

          Editar Indicadores ESG

        </h2>

        <p
          className="
            text-zinc-500
            mt-3
          "
        >

          Atualize os dados públicos
          da plataforma ESG.

        </p>

      </div>

      <div
        className="
          grid
          md:grid-cols-2
          gap-5
        "
      >

        {fields.map((field) => (

          <div
            key={field.key}
            className="space-y-2"
          >

            <label
              className="
                text-sm
                font-bold
                text-zinc-700
              "
            >

              {field.label}

            </label>

            <input
              type="number"
              value={
                dados[
                  field.key as keyof DashboardMetricas
                ] as number
              }
              onChange={(e) =>
                updateField(
                  field.key as keyof DashboardMetricas,
                  Number(e.target.value),
                )
              }
              className="
                w-full
                h-14
                rounded-2xl
                border
                border-zinc-200
                px-5
                outline-none
                focus:border-[#2E5E4E]
              "
            />

          </div>

        ))}

      </div>

      <button
        onClick={onSave}
        disabled={loading}
        className="
          mt-8
          w-full
          h-14
          rounded-2xl
          bg-[#2E5E4E]
          hover:bg-[#21463A]
          transition
          text-white
          font-bold
        "
      >

        {loading
          ? "Salvando..."
          : "Salvar indicadores"}

      </button>

    </div>

  );

}