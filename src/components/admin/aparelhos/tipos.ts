/** Tipos e utilitários das telas de aparelhos (somente ADM DEUS) */

export type SituacaoAparelho = "ativo" | "bloqueado" | "suspenso";
export type AcaoAparelho = "bloquear" | "suspender" | "expulsar" | "desbloquear";

/** Uma linha da função aparelhos_lista() */
export interface AparelhoItem {
  anon_id: string;
  auth_user_id: string | null;
  nome: string | null;
  ultima_atividade: string | null;
  encerrada_em: string | null;
  dispositivo: string | null;
  navegador: string | null;
  sistema: string | null;
  cidade: string | null;
  regiao: string | null;
  pais: string | null;
  sessoes: number | null;
  paginas: number | null;
  duracao_seg: number | null;
  primeira: string | null;
  logado: boolean;
  bloqueio_id: string | null;
  bloqueio_tipo: "bloqueio" | "suspensao" | null;
  motivo: string | null;
  ate: string | null;
  bloqueado_em: string | null;
  bloqueado_por: string | null;
  com_rede: boolean;
  situacao: SituacaoAparelho;
  online: boolean;
}

/** Uma linha da tabela dispositivos_bloqueios (histórico) */
export interface BloqueioReg {
  id: string;
  tipo: "bloqueio" | "suspensao";
  motivo: string;
  ate: string | null;
  ativo: boolean;
  criado_em: string;
  criado_por: string;
  desbloqueado_em: string | null;
  desbloqueado_por: string | null;
  desbloqueio_motivo: string | null;
  ip_hash: string | null;
}

export interface ExpulsaoReg {
  id: string;
  motivo: string;
  criado_em: string;
  criado_por: string;
  entregue_em: string | null;
}

export const DURACOES = [
  { horas: 1, rotulo: "1 hora" },
  { horas: 6, rotulo: "6 horas" },
  { horas: 24, rotulo: "24 horas" },
  { horas: 168, rotulo: "7 dias" },
  { horas: 720, rotulo: "30 dias" },
];

export const ROTULO_SITUACAO: Record<SituacaoAparelho, string> = {
  ativo: "Ativo",
  bloqueado: "Bloqueado",
  suspenso: "Suspenso",
};

/** "faltam 3h 20min" / "faltam 2 dias" para o fim de uma suspensão */
export function tempoRestante(ate: string | null | undefined): string {
  if (!ate) return "";
  const ms = new Date(ate).getTime() - Date.now();
  if (ms <= 0) return "terminou";
  const min = Math.ceil(ms / 60_000);
  if (min < 60) return `faltam ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return `faltam ${h}h ${min % 60}min`;
  return `faltam ${Math.ceil(h / 24)} dias`;
}

/** Texto curto para o motivo na lista */
export const curto = (t: string | null | undefined, n = 60) => (!t ? "" : t.length > n ? `${t.slice(0, n - 1)}…` : t);
