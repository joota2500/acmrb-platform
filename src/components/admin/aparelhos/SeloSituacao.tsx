/** Selo colorido da situação do aparelho: ativo, suspenso (com tempo restante) ou bloqueado */
import { Ban, CheckCircle2, Clock } from "lucide-react";
import { ROTULO_SITUACAO, tempoRestante, type SituacaoAparelho } from "./tipos";

export default function SeloSituacao({ situacao, ate }: { situacao: SituacaoAparelho; ate?: string | null }) {
  const Icone = situacao === "bloqueado" ? Ban : situacao === "suspenso" ? Clock : CheckCircle2;
  return (
    <span className={`apa-selo apa-selo--${situacao}`}>
      <Icone size={13} aria-hidden="true" /> {ROTULO_SITUACAO[situacao]}
      {situacao === "suspenso" && ate ? ` · ${tempoRestante(ate)}` : ""}
    </span>
  );
}
