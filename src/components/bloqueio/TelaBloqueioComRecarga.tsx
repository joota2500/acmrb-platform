"use client";

/** Versão da tela para a página /acesso-bloqueado: recarrega quando o prazo termina */
import TelaBloqueio, { type TipoBloqueio } from "./TelaBloqueio";

interface Props { tipo: TipoBloqueio; motivo: string; ate: string | null; codigo: string | null }

export default function TelaBloqueioComRecarga(props: Props) {
  return <TelaBloqueio {...props} onTerminou={() => window.location.reload()} />;
}
