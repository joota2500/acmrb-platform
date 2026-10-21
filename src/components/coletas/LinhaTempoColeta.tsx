"use client";

/**
 * LinhaTempoColeta — etapas do pedido: Enviado → Recebido → Agendado → Concluído
 * (Cancelado substitui as etapas restantes). CSS: src/styles/coleta-timeline.css.
 */

import { Check, X } from "lucide-react";
import "@/styles/coleta-timeline.css";
import { dataBR, dataHoraBR, type Solicitacao } from "@/lib/coletas";

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
    <ol className="ctl" aria-label="Andamento do pedido">
      {etapas.map((e) => {
        const pulada = cancelado && !e.feito;
        if (pulada) return null;
        return (
          <li key={e.chave} className={`ctl__etapa${e.feito ? " ctl__etapa--feita" : ""}`}>
            <span className="ctl__ponto" aria-hidden="true">{e.feito ? <Check size={13} /> : null}</span>
            <div className="ctl__texto">
              <strong>{e.rotulo}</strong>
              <span>{e.feito && e.quando ? dataHoraBR(e.quando) : e.feito ? "" : "aguardando"}</span>
              {"extra" in e && e.extra && <span className="ctl__extra">{e.extra}</span>}
            </div>
          </li>
        );
      })}
      {cancelado && (
        <li className="ctl__etapa ctl__etapa--cancelada">
          <span className="ctl__ponto" aria-hidden="true"><X size={13} /></span>
          <div className="ctl__texto">
            <strong>Cancelado</strong>
            <span>{dataHoraBR(s.cancelado_em)}</span>
          </div>
        </li>
      )}
    </ol>
  );
}
