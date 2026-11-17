"use client";

/**
 * Coletas — tipos, constantes, validação (zod) e acesso ao Supabase
 * ------------------------------------------------------------
 * Tabelas: coleta_calendario, coleta_solicitacoes, coleta_mensagens
 * (migrations 20261021100000 e 20261021110000). Fotos no bucket
 * privado "coletas" (pasta = id do usuário), exibidas por URL assinada.
 */

import { z } from "zod";
import { supabase } from "@/lib/supabase";

/* ---------- Constantes ---------- */

export const MATERIAIS_COLETA = [
  "Papel/Papelão",
  "Plástico",
  "Vidro",
  "Metal/Alumínio",
  "Óleo de cozinha",
  "Eletrônicos",
  "Outros",
] as const;

export const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;
export const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export const PERIODOS = { manha: "Manhã", tarde: "Tarde", qualquer: "Qualquer horário" } as const;
export type Periodo = keyof typeof PERIODOS;

export const STATUS_COLETA = ["enviado", "recebido", "agendado", "concluido", "cancelado"] as const;
export type StatusColeta = (typeof STATUS_COLETA)[number];

export const ROTULO_STATUS: Record<StatusColeta, string> = {
  enviado: "Enviado",
  recebido: "Recebido",
  agendado: "Agendado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const BUCKET_COLETAS = "coletas";

/* ---------- Tipos ---------- */

export interface CalendarioBairro {
  id: string;
  bairro: string;
  dias_semana: number[];
  hora_inicio: string | null;
  hora_fim: string | null;
  materiais: string[];
  observacoes: string | null;
  ativo: boolean;
  ordem: number;
}

export interface Solicitacao {
  id: string;
  auth_user_id: string;
  endereco: string;
  bairro: string;
  latitude: number | null;
  longitude: number | null;
  materiais: string[];
  quantidade: string;
  data_preferida: string | null;
  periodo: Periodo;
  observacoes: string | null;
  foto_path: string | null;
  status: StatusColeta;
  data_agendada: string | null;
  janela_agendada: string | null;
  recebido_em: string | null;
  agendado_em: string | null;
  concluido_em: string | null;
  cancelado_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface Mensagem {
  id: number;
  solicitacao_id: string;
  autor_id: string;
  autor_tipo: "visitante" | "admin";
  autor_nome: string | null;
  texto: string;
  lida_em: string | null;
  created_at: string;
}

/* ---------- Formatação ---------- */

/** "08:00:00" → "08h" ; "08:30:00" → "08h30" */
export const hora = (h: string | null) => {
  if (!h) return "";
  const [hh, mm] = h.split(":");
  return mm && mm !== "00" ? `${hh}h${mm}` : `${hh}h`;
};

export const janelaHorario = (c: Pick<CalendarioBairro, "hora_inicio" | "hora_fim">) =>
  c.hora_inicio && c.hora_fim ? `${hora(c.hora_inicio)} às ${hora(c.hora_fim)}` : c.hora_inicio ? `a partir de ${hora(c.hora_inicio)}` : "horário a confirmar";

/** "2026-10-21" → "21/10/2026" (sem fuso) */
export const dataBR = (d: string | null) => (d ? d.split("-").reverse().join("/") : "—");

export const dataHoraBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

/** Link do Google Maps com rota encadeando os endereços (origem = 1º) */
export function linkRota(paradas: { endereco: string; latitude: number | null; longitude: number | null }[]) {
  const ponto = (p: (typeof paradas)[number]) =>
    p.latitude != null && p.longitude != null ? `${p.latitude},${p.longitude}` : p.endereco;
  if (!paradas.length) return null;
  if (paradas.length === 1) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ponto(paradas[0]))}`;
  const destino = ponto(paradas[paradas.length - 1]);
  const meio = paradas.slice(0, -1).map(ponto).join("|");
  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encodeURIComponent(destino)}&waypoints=${encodeURIComponent(meio)}`;
}

/* ---------- Validação do pedido ---------- */

const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const esquemaSolicitacao = z.object({
  endereco: z.string().trim().min(5, "Informe o endereço com rua e número.").max(200, "Endereço muito longo."),
  bairro: z.string().trim().min(2, "Escolha ou informe o bairro.").max(80),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  materiais: z.array(z.string()).min(1, "Escolha pelo menos um tipo de material.").max(15),
  quantidade: z.string().trim().min(1, "Informe a quantidade aproximada.").max(60),
  data_preferida: z
    .string()
    .refine((v) => !v || v >= hojeISO(), "A data preferida não pode estar no passado.")
    .nullable(),
  periodo: z.enum(["manha", "tarde", "qualquer"]),
  observacoes: z.string().trim().max(1000, "Máximo de 1000 caracteres.").nullable(),
});
export type DadosSolicitacao = z.infer<typeof esquemaSolicitacao>;

export const FOTO_MAX_MB = 5;
export function validarFoto(f: File): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return "Envie uma foto JPG, PNG ou WEBP.";
  if (f.size > FOTO_MAX_MB * 1024 * 1024) return `A foto pode ter no máximo ${FOTO_MAX_MB} MB.`;
  return null;
}

/* ---------- Acesso ao banco ---------- */

export async function listarCalendario(incluirInativos = false) {
  let q = supabase.from("coleta_calendario").select("*").order("ordem").order("bairro");
  if (!incluirInativos) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) throw new Error("Calendário indisponível (a migration já foi rodada?).");
  return (data ?? []) as CalendarioBairro[];
}

export async function enviarFoto(userId: string, f: File) {
  const ext = f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
  const caminho = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET_COLETAS).upload(caminho, f, { contentType: f.type, upsert: false });
  if (error) throw new Error("Não foi possível enviar a foto.");
  return caminho;
}

export async function urlFoto(caminho: string | null) {
  if (!caminho) return null;
  const { data } = await supabase.storage.from(BUCKET_COLETAS).createSignedUrl(caminho, 60 * 60);
  return data?.signedUrl ?? null;
}

export async function listarMensagens(solicitacaoId: string) {
  const { data, error } = await supabase
    .from("coleta_mensagens")
    .select("*")
    .eq("solicitacao_id", solicitacaoId)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw new Error("Não foi possível carregar as mensagens.");
  return (data ?? []) as Mensagem[];
}

export async function enviarMensagem(solicitacaoId: string, autorId: string, tipo: Mensagem["autor_tipo"], nome: string, texto: string) {
  const { error } = await supabase.from("coleta_mensagens").insert({
    solicitacao_id: solicitacaoId,
    autor_id: autorId,
    autor_tipo: tipo,
    autor_nome: nome.slice(0, 80),
    texto: texto.trim().slice(0, 2000),
  });
  if (error) throw new Error("Mensagem não enviada. Tente de novo.");
}

export const marcarLidas = (solicitacaoId: string) =>
  supabase.rpc("coleta_marcar_lidas", { p_solicitacao: solicitacaoId }).then(() => undefined);
