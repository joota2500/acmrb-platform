/** Tipos e utilitários da seção "Usuários / Visitantes" do painel */

export interface Visitante {
  id: string;
  auth_user_id: string | null;
  nome: string;
  email: string;
  telefone: string | null;
  cidade: string | null;
  data_nascimento: string | null;
  ativo: boolean;
  created_at: string;
}

export interface ResumoAtividade {
  auth_user_id: string;
  total_logins: number;
  total_seg: number;
  ultimo_acesso: string | null;
}

/** 3725 → "1h 2min" ; 45 → "45s" */
export function duracao(seg: number): string {
  if (!seg || seg < 0) return "0s";
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  if (h) return `${h}h ${m}min`;
  if (m) return `${m}min`;
  return `${Math.round(seg)}s`;
}

export const dataHoraCurta = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";
