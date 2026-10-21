/**
 * chatGeral — conversa geral visitante ↔ equipe ACMRB (separada das
 * conversas de coleta). Uma conversa por visitante.
 * Migration: supabase/migrations/20261021230000_chat_geral.sql
 */

import { supabase } from "@/lib/supabase";

export type LadoChat = "visitante" | "admin";

export interface MensagemChat {
  id: string;
  conversa_id: string;
  autor_id: string;
  autor_tipo: LadoChat;
  autor_nome: string | null;
  texto: string;
  created_at: string;
  lida_em: string | null;
}

export interface ConversaAdmin {
  conversa_id: string;
  auth_user_id: string;
  nome: string | null;
  telefone: string | null;
  cidade: string | null;
  bairro: string | null;
  contato_preferido: string | null;
  email: string | null;
  ultima_msg_em: string | null;
  ultima_msg_texto: string | null;
  ultima_msg_autor: LadoChat | null;
  nao_lidas: number;
}

/** Atualização de reserva quando o Realtime não estiver ligado */
export const INTERVALO_CHAT_MS = 12_000;

const semMigration = (msg: string) => /chat_|does not exist|schema cache|function/i.test(msg);
const erroChat = (msg: string) =>
  new Error(semMigration(msg) ? "O chat ainda não foi ativado no banco (migration pendente)." : "Não foi possível carregar a conversa.");

/** Conversa do visitante logado (cria na primeira vez) */
export async function minhaConversa(): Promise<string | null> {
  const { data, error } = await supabase.rpc("chat_minha_conversa");
  if (error) throw erroChat(error.message);
  return (data as string | null) ?? null;
}

export async function listarMensagensChat(conversaId: string): Promise<MensagemChat[]> {
  const { data, error } = await supabase
    .from("chat_mensagens")
    .select("*")
    .eq("conversa_id", conversaId)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw erroChat(error.message);
  return (data ?? []) as MensagemChat[];
}

export async function enviarMensagemChat(conversaId: string, autorId: string, lado: LadoChat, nome: string, texto: string) {
  const { error } = await supabase
    .from("chat_mensagens")
    .insert({ conversa_id: conversaId, autor_id: autorId, autor_tipo: lado, autor_nome: nome || null, texto: texto.trim().slice(0, 2000) });
  if (error) throw new Error("Não foi possível enviar a mensagem.");
}

export const marcarLidasChat = (conversaId: string) => supabase.rpc("chat_marcar_lidas", { p_conversa: conversaId });

export async function contarNaoLidasChat(): Promise<number> {
  const { data, error } = await supabase.rpc("chat_nao_lidas");
  if (error) return 0;
  return Number(data) || 0;
}

export async function listarConversasAdmin(): Promise<ConversaAdmin[]> {
  const { data, error } = await supabase.rpc("chat_admin_conversas");
  if (error) throw erroChat(error.message);
  return (data ?? []) as ConversaAdmin[];
}

/** "Hoje", "Ontem" ou dd/mm/aaaa — separadores de data */
export function rotuloDia(iso: string) {
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  if (d.toDateString() === hoje.toDateString()) return "Hoje";
  if (d.toDateString() === ontem.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: d.getFullYear() === hoje.getFullYear() ? undefined : "numeric" });
}

export const horaCurta = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** Lista do painel: hora se hoje, senão dd/mm */
export const quandoCurto = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString() ? horaCurta(iso) : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};
