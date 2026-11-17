"use client";

/**
 * LinhaTempoColeta — etapas do pedido: Enviado → Recebido → Agendado → Concluído
 * (Cancelado substitui as etapas restantes). Visual: Tailwind.
 */

import { Check, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { dataBR, dataHoraBR, type Solicitacao } from "@/services/coletas";

export default function LinhaTempoColeta({ s }: { s: Solicitacao }) {
  const etapas = [
    { chave: "enviado", rotulo: "Enviado", quando: s.created_at, feito: true },
    { chave: "recebido", rotulo: "Recebido", quando: s.recebido_em, feito: !!s.recebido_em || ["agendado", "concluido"].includes(s.status) },
    {
      chave: "agendado",
      rotulo: "Agendado",
      quando: s.agendado_em,
      feito: !!s.agendado_em || s.status === "concluido",
      extra: s.data_agendada ? `Coleta em ${dataBR(s.data_agendada)}${s.janela_agendada ? ` · ${s.janela_agendada}` : ""}` : null,
    },
    { chave: "concluido", rotulo: "Concluído", quando: s.concluido_em, feito: s.status === "concluido" },
  ];
  const cancelado = s.status === "cancelado";

  return (
    <ol className="m-0 flex list-none gap-2 p-0 max-[560px]:flex-col max-[560px]:gap-3" aria-label="Andamento do pedido">
      {etapas.map((e) => {
        const pulada = cancelado && !e.feito;
        if (pulada) return null;
        return (
          <li key={e.chave} className={ETAPA(e.feito)}>
            <span className={PONTO(e.feito ? "feita" : "pendente")} aria-hidden="true">{e.feito ? <Check size={13} /> : null}</span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <strong className={cn("text-[0.82rem] font-extrabold", e.feito ? "text-zinc-900" : "text-zinc-400")}>{e.rotulo}</strong>
              <span className="text-[0.72rem] text-zinc-500">{e.feito && e.quando ? dataHoraBR(e.quando) : e.feito ? "" : "aguardando"}</span>
              {"extra" in e && e.extra && <span className="text-[0.72rem] font-bold text-brand">{e.extra}</span>}
            </div>
          </li>
        );
      })}
      {cancelado && (
        <li className={ETAPA(false)}>
          <span className={PONTO("cancelada")} aria-hidden="true"><X size={13} /></span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <strong className="text-[0.82rem] font-extrabold text-zinc-900">Cancelado</strong>
            <span className="text-[0.72rem] text-zinc-500">{dataHoraBR(s.cancelado_em)}</span>
          </div>
        </li>
      )}
    </ol>
  );
}

// Cada etapa tem um trilho (linha) ligando ao próximo ponto; no celular a lista fica vertical
const ETAPA = (feita: boolean) =>
  cn(
    "relative flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center",
    "max-[560px]:flex-row max-[560px]:items-start max-[560px]:gap-2.5 max-[560px]:text-left",
    "not-last:after:absolute not-last:after:top-[0.8rem] not-last:after:right-[calc(-50%+0.95rem)] not-last:after:left-[calc(50%+0.95rem)] not-last:after:h-0.5",
    "max-[560px]:not-last:after:top-[1.7rem] max-[560px]:not-last:after:right-auto max-[560px]:not-last:after:-bottom-3 max-[560px]:not-last:after:left-3 max-[560px]:not-last:after:h-auto max-[560px]:not-last:after:w-0.5",
    feita ? "not-last:after:bg-brand" : "not-last:after:bg-zinc-200",
  );

const PONTO = (estado: "feita" | "pendente" | "cancelada") =>
  cn(
    "inline-flex size-[1.6rem] shrink-0 items-center justify-center rounded-full border-2 text-white",
    estado === "feita" && "border-brand bg-brand",
    estado === "cancelada" && "border-red-600 bg-red-600",
    estado === "pendente" && "border-zinc-300 bg-white",
  );
