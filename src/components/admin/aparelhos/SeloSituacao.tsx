/** Selo colorido da situação do aparelho: ativo, suspenso (com tempo restante) ou bloqueado */
import { Ban, CheckCircle2, Clock } from "lucide-react";
import * as E from "@/components/admin/acessos/estilos";
import { cn } from "@/utils/cn";
import { ROTULO_SITUACAO, tempoRestante, type SituacaoAparelho } from "@/types/aparelhos";

export default function SeloSituacao({ situacao, ate }: { situacao: SituacaoAparelho; ate?: string | null }) {
  const Icone = situacao === "bloqueado" ? Ban : situacao === "suspenso" ? Clock : CheckCircle2;
  return (
    <span className={cn(E.SELO_SITUACAO, E.COR_SELO_SITUACAO[situacao])}>
      <Icone size={13} aria-hidden="true" /> {ROTULO_SITUACAO[situacao]}
      {ate && situacao !== "ativo" ? ` · ${tempoRestante(ate)}` : ""}
    </span>
  );
}
