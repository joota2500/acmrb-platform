/**
 * Acesso aos dados de associados no PAINEL ADMIN
 * ------------------------------------------------------------
 * Leitura: view "associados_admin" (todos os campos, só para admins).
 *   Se a migration associados_v2 ainda não rodou, a view não existe e
 *   usamos a tabela "associados" (select *), como era antes.
 * Escrita: tabela "associados" (RLS: só admins ativos).
 *
 * Também traz:
 *  - verificarDuplicados(): checa CPF, e-mail e nome + nascimento ANTES
 *    de salvar, com mensagens claras.
 *  - slugUnico(): gera um slug que ainda não existe ("jose", "jose-2"...).
 *  - mensagemErroBanco(): traduz erros do Postgres (ex.: 23505) para
 *    mensagens em português.
 */

import { supabase } from "@/lib/supabase";
import { comLimite } from "@/lib/associados";
import { gerarSlug, somenteDigitos } from "@/lib/validacao";
import type { AssociadoAdmin } from "@/types/associados";

/** Escapa % e _ (curingas do ILIKE) para comparar o texto exato. */
const exato = (v: string) => v.replace(/[\\%_]/g, (c) => `\\${c}`);

let fonteLeitura: "associados_admin" | "associados" | null = null;

/** Descobre (uma vez) se a view admin já existe. */
async function fonte() {
  if (fonteLeitura) return fonteLeitura;
  const teste = await comLimite(supabase.from("associados_admin").select("id").limit(1));
  fonteLeitura = teste.error ? "associados" : "associados_admin";
  return fonteLeitura;
}

export async function listarAssociadosAdmin(): Promise<AssociadoAdmin[]> {
  const tabela = await fonte();
  const { data, error } = await comLimite(
    supabase.from(tabela).select("*").order("nome"),
  );
  if (error) throw error;
  return (data ?? []) as AssociadoAdmin[];
}

/**
 * Procura registros que colidem com o que vai ser salvo.
 * Retorna a mensagem do primeiro conflito encontrado, ou null.
 */
export async function verificarDuplicados(dados: {
  id?: string | null;
  cpf?: string | null;
  email?: string | null;
  nome: string;
  data_nascimento?: string | null;
}): Promise<string | null> {
  const tabela = await fonte();
  const outro = (q: any) => (dados.id ? q.neq("id", dados.id) : q);

  const cpf = somenteDigitos(dados.cpf);
  if (cpf && tabela === "associados_admin") {
    const { data } = await outro(supabase.from(tabela).select("id").eq("cpf", cpf).limit(1));
    if (data?.length) return "Já existe um associado com este CPF.";
  }

  const email = dados.email?.trim().toLowerCase();
  if (email) {
    const { data } = await outro(supabase.from(tabela).select("id").ilike("email", exato(email)).limit(1));
    if (data?.length) return "Já existe um associado com este e-mail.";
  }

  if (dados.data_nascimento) {
    const { data } = await outro(
      supabase
        .from(tabela)
        .select("id")
        .ilike("nome", exato(dados.nome.trim()))
        .eq("data_nascimento", dados.data_nascimento)
        .limit(1),
    );
    if (data?.length) {
      return "Já existe um associado com este nome e esta data de nascimento.";
    }
  }

  return null;
}

/** Gera um slug que ainda não está em uso (ignora o próprio registro). */
export async function slugUnico(nome: string, id?: string | null): Promise<string> {
  const base = gerarSlug(nome) || "associado";
  const { data } = await supabase.from("associados").select("id, slug").like("slug", `${base}%`);
  const usados = new Set(
    (data ?? []).filter((r: any) => r.id !== id).map((r: any) => r.slug as string),
  );
  if (!usados.has(base)) return base;
  let n = 2;
  while (usados.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** Converte erros do banco em mensagens amigáveis. */
export function mensagemErroBanco(err: { code?: string; message?: string; details?: string } | null): string {
  if (!err) return "Erro desconhecido.";
  const texto = `${err.message ?? ""} ${err.details ?? ""}`.toLowerCase();

  if (err.code === "23505") {
    if (texto.includes("cpf")) return "Já existe um associado com este CPF.";
    if (texto.includes("email")) return "Já existe um associado com este e-mail.";
    if (texto.includes("slug")) return "Já existe um associado com este endereço de perfil. Tente salvar novamente.";
    return "Já existe um associado com estes dados.";
  }
  if (err.code === "23514") {
    if (texto.includes("cpf")) return "CPF inválido: informe os 11 dígitos.";
    if (texto.includes("nome")) return "O nome precisa ter pelo menos 3 letras.";
    if (texto.includes("status")) return "Situação inválida.";
    return "Algum campo está em formato inválido.";
  }
  if (err.code === "42501" || texto.includes("row-level security")) {
    return "Você não tem permissão para esta ação. Entre com uma conta de administrador.";
  }
  if (err.code === "PGRST204" || texto.includes("could not find the") || texto.includes("column")) {
    return "O banco ainda não tem os novos campos. Rode a migration 20261020160000_associados_v2.sql no Supabase.";
  }
  if (texto.includes("tempo esgotado") || texto.includes("fetch")) {
    return "Sem conexão com o banco de dados. Verifique a internet e tente novamente.";
  }
  return "Não foi possível salvar. Tente novamente.";
}
