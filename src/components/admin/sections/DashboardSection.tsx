"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  RefreshCcw,
  BarChart3,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { comLimite } from "@/lib/associados";

import DashboardStatsCards from "@/components/admin/dashboard/DashboardStatsCards";

import DashboardImpactCard from "@/components/admin/dashboard/DashboardImpactCard";

import DashboardMaterialsCard from "@/components/admin/dashboard/DashboardMaterialsCard";

type DashboardMetricas = {
  /* Calculados no carregamento (não existem na tabela) */
  residuos_kg?: number;
  renda_materiais?: number;
  total_registros?: number;
  parceiros_ativos?: number | null;


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

type DashboardSectionProps = {
  /** Só o deus edita as métricas manuais; o admin normal só visualiza */
  podeEditar?: boolean;
};

export default function DashboardSection({ podeEditar = true }: DashboardSectionProps) {

  const [
    dados,
    setDados,
  ] = useState<DashboardMetricas | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    atualizando,
    setAtualizando,
  ] = useState(false);

    // Mensagem de erro exibida na tela (antes só ia para o console)
  const [erro, setErro] = useState<string | null>(null);

/**
   * Carrega os indicadores. Correções (auditoria):
   *  - "Resíduos reciclados" e "Renda gerada" eram lidos de campos
   *    manuais de dashboard_metricas (residuos_reciclados / renda_gerada,
   *    ambos 0 no banco), embora o card dissesse "calculado
   *    automaticamente". Agora são somados de materiais_registros
   *    (peso em KG e subtotal em R$).
   *  - "Empresas parceiras" passa a contar a tabela parceiros (ativos).
   *  - Erros não ficam mais só no console: aparecem na tela.
   *  - Limite de 10s em cada consulta (comLimite).
   */
  async function carregarDados() {
    setAtualizando(true);
    setErro(null);
    try {
      const [metricas, registros, parceiros] = await Promise.all([
        comLimite(supabase.from("dashboard_metricas").select("*").limit(1).maybeSingle()),
        comLimite(supabase.from("materiais_registros").select("peso, subtotal")),
        comLimite(
          supabase.from("parceiros").select("id", { count: "exact", head: true }).eq("ativo", true),
        ),
      ]);

      if (metricas.error) throw metricas.error;
      if (!metricas.data) {
        setDados(null);
        return;
      }

      const lista = registros.error ? [] : registros.data ?? [];
      const soma = (campo: "peso" | "subtotal") =>
        lista.reduce((acc: number, r: any) => acc + Number(r[campo] || 0), 0);

      setDados({
        ...metricas.data,
        residuos_kg: soma("peso"),
        renda_materiais: soma("subtotal"),
        total_registros: lista.length,
        parceiros_ativos: parceiros.error ? null : parceiros.count ?? 0,
      });

      if (registros.error) {
        setErro("Os registros de materiais não puderam ser carregados; os totais automáticos podem estar incompletos.");
      }
    } catch {
      setErro("Não foi possível carregar os indicadores. Verifique a conexão e tente novamente.");
    } finally {
      setLoading(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {

    carregarDados();

  }, []);

  if (loading) {

    return (

      <div
        className="
          bg-white
          rounded-4xl
          border
          border-black/5
          p-16
          text-center
        "
      >

        <div
          className="
            w-16
            h-16
            border-4
            border-zinc-200
            border-t-[#2E5E4E]
            rounded-full
            animate-spin
            mx-auto
          "
        />

        <p
          className="
            text-zinc-500
            mt-6
            text-lg
          "
        >

          Carregando indicadores ESG...

        </p>

      </div>

    );

  }

  // Erro sem dados: mensagem + tentar de novo
  if (erro && !dados) {
    return (
      <div role="alert" className="bg-white rounded-3xl border border-red-100 p-6 sm:p-10 text-center">
        <p className="font-bold text-red-600">{erro}</p>
        <button
          type="button"
          onClick={carregarDados}
          className="mt-4 h-12 px-6 rounded-2xl bg-[#2E5E4E] text-white font-bold hover:bg-[#21463A]"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!dados) {

    return (

      <div
        className="
          bg-white
          rounded-4xl
          border
          border-red-100
          p-16
          text-center
        "
      >

        <h2
          className="
            text-4xl
            font-black
            text-red-500
          "
        >

          Nenhum dado encontrado

        </h2>

        <p
          className="
            text-zinc-500
            mt-4
          "
        >

          Cadastre métricas ESG
          no banco de dados.

        </p>

      </div>

    );

  }

  return (

    <div className="space-y-8">

      {/* HERO */}

      <div
        className="
          relative
          overflow-hidden
          rounded-4xl
          bg-linear-to-br
          from-[#1E3A34]
          via-[#24463E]
          to-[#2E5E4E]
          p-10
          text-white
        "
      >

        <div
          className="
            absolute
            inset-0
            opacity-10
            bg-[radial-gradient(circle_at_top_right,white,transparent_40%)]
          "
        />

        <div
          className="
            relative
            z-10
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-8
          "
        >

          <div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-5
                py-3
                rounded-full
                bg-white/10
                backdrop-blur-md
                text-sm
                font-black
                mb-6
              "
            >

              ♻ Plataforma ESG

            </div>

            <h1
              className="
                text-5xl
                font-black
                leading-tight
              "
            >

              Dashboard Ambiental ACMRB

            </h1>

            <p
              className="
                text-white/70
                mt-5
                max-w-3xl
                leading-8
                text-lg
              "
            >

              Gestão estratégica
              de indicadores ESG,
              impacto ambiental
              e logística reversa.

            </p>

          </div>

          <div
            className="
              flex
              flex-col
              md:flex-row
              gap-4
            "
          >

            <button
              onClick={carregarDados}
              disabled={atualizando}
              className="
                h-16
                px-8
                rounded-3xl
                bg-white/10
                hover:bg-white/20
                transition
                backdrop-blur-md
                font-black
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <RefreshCcw
                size={20}
                className={
                  atualizando
                    ? "animate-spin"
                    : ""
                }
              />

              Atualizar dados

            </button>

            <div
              className="
                h-16
                px-8
                rounded-3xl
                bg-white
                text-[#1E3A34]
                font-black
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <BarChart3 size={22} />

              Painel ESG Ativo

            </div>

          </div>

        </div>

      </div>

      {/* Aviso de carregamento parcial */}
      {erro && (
        <p role="alert" className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
          {erro}
        </p>
      )}

      {/* STATS */}

      <DashboardStatsCards
        dados={dados}
        podeEditar={podeEditar}
        onAtualizado={carregarDados}
      />

      {/* DETAILS */}

      <DashboardMaterialsCard dados={dados} />

    </div>

  );

}