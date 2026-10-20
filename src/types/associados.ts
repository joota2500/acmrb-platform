/**
 * Tipos de associados
 * ------------------------------------------------------------
 * AssociadoPublico → SOMENTE campos que podem aparecer no site público.
 *   Nunca inclui CPF, e-mail, telefone, endereço ou data de nascimento.
 * AssociadoAdmin   → todos os campos, usados apenas no painel admin.
 */

export interface AssociadoPublico {
  id: string;
  nome: string;
  slug: string | null;
  cargo: string | null;
  tipo_associado: string | null;
  foto_url: string | null;
  bio: string | null;
  instagram: string | null;
  linkedin: string | null;
  facebook: string | null;
  destaque: boolean | null;
  ordem_exibicao: number | null;
}

export type StatusAssociado = "ativo" | "inativo" | "afastado";

export interface AssociadoAdmin extends AssociadoPublico {
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  endereco: string | null;
  bairro: string | null;
  data_nascimento: string | null;
  data_entrada: string | null;
  status: StatusAssociado | null;
  ativo: boolean;
  created_at?: string;
}

/** Cargos da diretoria, na ordem em que aparecem no site. */
export type CargoDiretoria = "presidente" | "secretario" | "tesoureiro";
