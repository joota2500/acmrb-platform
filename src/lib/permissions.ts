/**
 * Matriz de permissões do painel administrativo
 * ------------------------------------------------------------
 * Só existem dois papéis (coluna admins.role):
 *   - "deus":  o programador (Artur). Acesso total. Único.
 *   - "admin": administrador normal. No máximo um.
 *
 * Esta matriz controla o que aparece no menu e o que cada seção
 * permite. O banco reforça as regras críticas por RLS
 * (migration 20261020180000_admins_papeis.sql): tabela admins,
 * dashboard_metricas (escrita só deus) e fotos; notícias pela
 * migration 20261020220000_noticias_completo.sql (escrita só deus).
 */

import type { SecaoId } from "@/components/admin/layout/adminNav";

export type PapelAdmin = "deus" | "admin";

/** Nível de acesso a uma seção */
export type Acesso = "nenhum" | "ver" | "total";

const MATRIZ: Record<SecaoId, Record<PapelAdmin, Acesso>> = {
  dashboard:       { deus: "total", admin: "ver" },   // métricas manuais: só deus edita
  noticias:        { deus: "total", admin: "nenhum" }, // só o deus publica notícias (RLS is_deus)
  projetos:        { deus: "total", admin: "ver" },   // admin: somente leitura
  parceiros:       { deus: "total", admin: "total" },
  associados:      { deus: "total", admin: "total" },
  denuncias:       { deus: "total", admin: "total" }, // ver + responder
  materiais:       { deus: "total", admin: "total" },
  coletas:         { deus: "total", admin: "nenhum" },
  esg:             { deus: "total", admin: "nenhum" },
  relatorios:      { deus: "total", admin: "total" }, // emitir
  administradores: { deus: "total", admin: "nenhum" },
  configuracoes:   { deus: "total", admin: "nenhum" }, // configurações do sistema
  "minha-conta":   { deus: "total", admin: "total" },
};

/** Normaliza o valor vindo do banco (qualquer coisa ≠ "deus" é "admin") */
export function papelDe(role?: string | null): PapelAdmin {
  return role === "deus" ? "deus" : "admin";
}

export function acesso(papel: PapelAdmin, secao: SecaoId): Acesso {
  return MATRIZ[secao]?.[papel] ?? "nenhum";
}

/** Pode abrir a seção (aparece no menu) */
export const podeVer = (papel: PapelAdmin, secao: SecaoId) => acesso(papel, secao) !== "nenhum";

/** Pode criar/editar/excluir na seção */
export const podeEditar = (papel: PapelAdmin, secao: SecaoId) => acesso(papel, secao) === "total";

export const ROTULO_PAPEL: Record<PapelAdmin, string> = {
  deus: "ADM DEUS",
  admin: "Administrador",
};
