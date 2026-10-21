/**
 * contaVisitante — dados de contato do visitante logado (/minha-conta)
 * ------------------------------------------------------------
 * Lê e atualiza a PRÓPRIA linha em public.visitantes (RLS). Só envia
 * campos editáveis: o gatilho visitantes_proteger já bloqueia role,
 * ativo, email e auth_user_id. Migration: 20261021220000_visitantes_contato.sql
 * (bairro e contato_preferido; sem ela, salva só os campos antigos).
 */

import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { somenteDigitos } from "@/lib/validacao";

export const CANAIS_CONTATO = { whatsapp: "WhatsApp", ligacao: "Ligação", email: "E-mail" } as const;
export type CanalContato = keyof typeof CANAIS_CONTATO;

export interface ContaVisitante {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  cidade: string | null;
  bairro: string | null;
  contato_preferido: CanalContato | null;
}

/**
 * Telefone brasileiro plausível: DDD válido (11–99) + 8 ou 9 dígitos,
 * celular começando com 9, e sem números repetidos (ex.: 00000-0000).
 */
export function telefoneValido(v: string | null | undefined): boolean {
  const d = somenteDigitos(v);
  if (d.length !== 10 && d.length !== 11) return false;
  if (Number(d.slice(0, 2)) < 11 || d[2] === "0") return false;
  if (d.length === 11 && d[2] !== "9") return false;
  if (/^(\d)\1+$/.test(d.slice(2))) return false;
  return true;
}

export const esquemaConta = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo.").max(120),
    telefone: z.string().trim().refine(telefoneValido, "Informe um telefone/WhatsApp válido com DDD."),
    cidade: z.string().trim().min(2, "Informe sua cidade.").max(80),
    bairro: z.string().trim().max(80).optional(),
    contato_preferido: z.enum(["whatsapp", "ligacao", "email"]),
  });
export type DadosConta = z.infer<typeof esquemaConta>;

let temColunasNovas: boolean | null = null;

export async function carregarConta(userId: string): Promise<ContaVisitante | null> {
  const completo = await supabase
    .from("visitantes")
    .select("id, nome, email, telefone, cidade, bairro, contato_preferido")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (!completo.error) {
    temColunasNovas = true;
    return completo.data as ContaVisitante | null;
  }
  // Migration ainda não rodada: lê só as colunas antigas
  temColunasNovas = false;
  const { data, error } = await supabase.from("visitantes").select("id, nome, email, telefone, cidade").eq("auth_user_id", userId).maybeSingle();
  if (error) throw new Error("Não foi possível carregar seus dados.");
  return data ? ({ ...data, bairro: null, contato_preferido: null } as ContaVisitante) : null;
}

export async function salvarConta(id: string, d: DadosConta) {
  const base = { nome: d.nome, telefone: d.telefone, cidade: d.cidade, updated_at: new Date().toISOString() };
  const dados = temColunasNovas === false ? base : { ...base, bairro: d.bairro || null, contato_preferido: d.contato_preferido };
  const { error } = await supabase.from("visitantes").update(dados).eq("id", id);
  if (error) throw new Error("Não foi possível salvar. Tente novamente.");
  // mantém o nome do perfil no Auth em dia (usado como reserva no login)
  await supabase.auth.updateUser({ data: { nome_completo: d.nome, telefone: d.telefone, cidade: d.cidade } }).catch(() => undefined);
}

/** true se o visitante ainda precisa informar um telefone válido */
export async function precisaContato(userId: string): Promise<boolean> {
  const { data } = await supabase.from("visitantes").select("telefone").eq("auth_user_id", userId).maybeSingle();
  return !!data && !telefoneValido(data.telefone);
}

/** Links de contato (painel) */
export const linkWhats = (tel: string | null | undefined) => {
  const d = somenteDigitos(tel);
  return telefoneValido(d) ? `https://wa.me/55${d}` : null;
};
export const linkLigar = (tel: string | null | undefined) => {
  const d = somenteDigitos(tel);
  return d.length >= 10 ? `tel:+55${d}` : null;
};
