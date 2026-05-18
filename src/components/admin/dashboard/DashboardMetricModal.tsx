"use client";

import {
  X,
  Save,
  RotateCcw,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;

  onClose: () => void;

  onUpdated?: () => void;

  metric: {
    id: string;

    field: string;

    title: string;

    rawValue: number;

    editable?: boolean;
  } | null;
};

export default function DashboardMetricModal({
  open,
  onClose,
  onUpdated,
  metric,
}: Props) {

  const [
    value,
    setValue,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  useEffect(() => {

    if (metric) {

      setValue(
        String(
          metric.rawValue || 0,
        ),
      );

    }

  }, [metric]);

  async function salvar() {

    if (!metric) return;

    try {

      setLoading(true);

      const numero =
        Number(value);

      if (
        Number.isNaN(numero)
      ) {

        alert(
          "Valor inválido.",
        );

        return;

      }

      const {
        error,
      } = await supabase
        .from(
          "dashboard_metricas",
        )
        .update({

          [metric.field]:
            numero,

        })
        .eq(
          "id",
          metric.id,
        );

      if (error) {

        alert(
          error.message,
        );

        return;

      }

      if (onUpdated) {

        await onUpdated();

      }

      alert(
        "Indicador atualizado com sucesso.",
      );

      onClose();

    } catch (error) {

      console.log(error);

      alert(
        "Erro ao atualizar indicador.",
      );

    } finally {

      setLoading(false);

    }

  }

  async function resetar() {

    if (!metric) return;

    const confirmar =
      confirm(
        "Deseja resetar este indicador?",
      );

    if (!confirmar) return;

    try {

      setLoading(true);

      const {
        error,
      } = await supabase
        .from(
          "dashboard_metricas",
        )
        .update({

          [metric.field]: 0,

        })
        .eq(
          "id",
          metric.id,
        );

      if (error) {

        alert(
          error.message,
        );

        return;

      }

      if (onUpdated) {

        await onUpdated();

      }

      alert(
        "Indicador resetado.",
      );

      onClose();

    } catch (error) {

      console.log(error);

      alert(
        "Erro ao resetar indicador.",
      );

    } finally {

      setLoading(false);

    }

  }

  if (
    !open ||
    !metric
  ) return null;

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-md
        p-4
      "
    >

      <div
        className="
          w-full
          max-w-2xl
          bg-white
          rounded-4xl
          overflow-hidden
          shadow-2xl
        "
      >

        {/* HEADER */}

        <div
          className="
            p-8
            border-b
            border-zinc-100
            flex
            items-center
            justify-between
            gap-6
          "
        >

          <div>

            <p
              className="
                text-sm
                font-semibold
                text-zinc-500
              "
            >

              Editando indicador ESG

            </p>

            <h2
              className="
                text-3xl
                md:text-4xl
                font-black
                text-[#111827]
                mt-2
              "
            >

              {metric.title}

            </h2>

          </div>

          <button
            onClick={onClose}
            className="
              shrink-0
              w-14
              h-14
              rounded-2xl
              bg-zinc-100
              hover:bg-zinc-200
              transition
              flex
              items-center
              justify-center
            "
          >

            <X size={24} />

          </button>

        </div>

        {/* BODY */}

        <div className="p-8">

          <div className="space-y-4">

            <label
              className="
                text-sm
                font-bold
                text-zinc-600
              "
            >

              Valor do indicador

            </label>

            <input
              type="number"
              value={value}
              onChange={(e) =>
                setValue(
                  e.target.value,
                )
              }
              className="
                w-full
                h-24
                rounded-3xl
                border-2
                border-zinc-200
                px-7
                text-4xl
                md:text-5xl
                font-black
                outline-none
                focus:border-[#2E5E4E]
              "
            />

          </div>

          {/* ACTIONS */}

          <div
            className="
              grid
              sm:grid-cols-2
              gap-4
              mt-10
            "
          >

            <button
              onClick={resetar}
              disabled={loading}
              className="
                h-16
                rounded-3xl
                bg-yellow-100
                hover:bg-yellow-200
                transition
                text-yellow-700
                font-black
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <RotateCcw
                size={20}
              />

              Resetar

            </button>

            <button
              onClick={salvar}
              disabled={loading}
              className="
                h-16
                rounded-3xl
                bg-[#2E5E4E]
                hover:bg-[#21463A]
                transition
                text-white
                font-black
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <Save size={20} />

              {loading
                ? "Salvando..."
                : "Salvar"}

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}