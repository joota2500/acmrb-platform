/**
 * Acesso aos dados PÚBLICOS de associados
 * ------------------------------------------------------------
 * 1. Tenta a view "associados_publicos" (criada pela migration
 *    20261020160000_associados_v2.sql), que só expõe campos públicos.
 * 2. Se a view ainda não existir (migration não rodada), usa a tabela
 *    "associados" pedindo apenas as colunas públicas.
 * Todas as consultas têm limite de 10s para a página nunca travar.
 */

import { supabase } from "@/lib/supabase";
import type { AssociadoPublico, CargoDiretoria } from "@/types/associados";

/** Colunas públicas (as mesmas da view). */
export const COLUNAS_PUBLICAS =
  "id, nome, slug, cargo, tipo_associado, foto_url, bio, instagram, linkedin, facebook, destaque, ordem_exibicao";

/** Colunas que existem em qualquer versão da tabela (antes da migration). */
const COLUNAS_PUBLICAS_MINIMAS =
  "id, nome, slug, cargo, tipo_associado, foto_url, bio, instagram, linkedin, destaque";

const LIMITE_MS = 10000;

/** Rejeita se a consulta demorar mais que 10s. */
export function comLimite<T>(p: PromiseLike<T>, ms = LIMITE_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("tempo esgotado")), ms);
    Promise.resolve(p).then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

/** Remove acentos e deixa minúsculo: "Secretária" → "secretaria". */
export const normalizar = (s: string | null | undefined) =>
  (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/**
 * Descobre se o cargo é da diretoria. Aceita variações como
 * "Presidente", "Secretária", "Secretário(a)", "Tesoureira".
 * "Vice-presidente" NÃO conta como presidente.
 */
export function cargoDiretoria(cargo: string | null): CargoDiretoria | null {
  const c = normalizar(cargo);
  if (/^president/.test(c)) return "presidente";
  if (/^secretari/.test(c)) return "secretario";
  if (/^tesoureir/.test(c)) return "tesoureiro";
  return null;
}

const ORDEM_DIRETORIA: CargoDiretoria[] = ["presidente", "secretario", "tesoureiro"];

/** Retorna no máximo 1 pessoa por cargo, na ordem presidente → secretário → tesoureiro. */
export function filtrarDiretoria(lista: AssociadoPublico[]): AssociadoPublico[] {
  return ORDEM_DIRETORIA.map((cargo) =>
    lista.find((a) => cargoDiretoria(a.cargo) === cargo),
  ).filter((a): a is AssociadoPublico => Boolean(a));
}

type Resultado<T> = { data: T; erro: string | null };

const MSG_ERRO = "Não foi possível conectar ao banco de dados no momento.";

/** Completa campos que não existem antes da migration. */
const completar = (rows: Partial<AssociadoPublico>[]): AssociadoPublico[] =>
  rows.map((r) => ({
    facebook: null,
    ordem_exibicao: null,
    ...r,
  })) as AssociadoPublico[];

/** Lista todos os associados ativos (somente campos públicos). */
export async function listarAssociadosPublicos(): Promise<Resultado<AssociadoPublico[]>> {
  try {
    const view = await comLimite(
      supabase.from("associados_publicos").select(COLUNAS_PUBLICAS).order("nome"),
    );
    if (!view.error) return { data: completar(view.data ?? []), erro: null };

    // View ainda não existe → tabela com colunas públicas
    const tabela = await comLimite(
      supabase
        .from("associados")
        .select(COLUNAS_PUBLICAS_MINIMAS)
        .eq("ativo", true)
        .order("nome"),
    );
    if (tabela.error) return { data: [], erro: MSG_ERRO };
    return { data: completar(tabela.data ?? []), erro: null };
  } catch {
    return { data: [], erro: MSG_ERRO };
  }
}

/** Busca um associado ativo pelo slug (somente campos públicos). */
export async function buscarAssociadoPublico(
  slug: string,
): Promise<Resultado<AssociadoPublico | null>> {
  try {
    const view = await comLimite(
      supabase.from("associados_publicos").select(COLUNAS_PUBLICAS).eq("slug", slug).maybeSingle(),
    );
    if (!view.error) {
      return { data: view.data ? completar([view.data])[0] : null, erro: null };
    }
    const tabela = await comLimite(
      supabase
        .from("associados")
        .select(COLUNAS_PUBLICAS_MINIMAS)
        .eq("slug", slug)
        .eq("ativo", true)
        .maybeSingle(),
    );
    if (tabela.error) return { data: null, erro: MSG_ERRO };
    return { data: tabela.data ? completar([tabela.data])[0] : null, erro: null };
  } catch {
    return { data: null, erro: MSG_ERRO };
  }
}

/** Ordena: diretoria primeiro, depois ordem_exibicao, destaque e nome. */
export function ordenarAssociados(lista: AssociadoPublico[]): AssociadoPublico[] {
  const peso = (a: AssociadoPublico) => {
    const d = cargoDiretoria(a.cargo);
    return d ? ORDEM_DIRETORIA.indexOf(d) : 10;
  };
  return [...lista].sort(
    (a, b) =>
      peso(a) - peso(b) ||
      (a.ordem_exibicao ?? 9999) - (b.ordem_exibicao ?? 9999) ||
      Number(b.destaque ?? false) - Number(a.destaque ?? false) ||
      a.nome.localeCompare(b.nome, "pt-BR"),
  );
}
