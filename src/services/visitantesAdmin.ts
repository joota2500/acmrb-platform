/**
 * visitantesAdmin — números e histórico dos visitantes (somente ADM DEUS)
 * ------------------------------------------------------------
 * Tudo aqui é LEITURA com o cliente normal do Supabase, então vale o RLS:
 *  - visitantes, visitante_sessoes, visitante_eventos, acessos_sessoes → is_deus()
 *  - coleta_solicitacoes, chat_conversas, chat_mensagens → admin ativo
 * Escrita (criar, editar, excluir, senha) continua só pela rota /api/admin/visitantes.
 * Nada de número inventado: o que não vem do banco aparece como 0 ou "—".
 * Os erros viram texto amigável (mensagemErro), sem mostrar a mensagem crua do banco.
 */

import { supabase } from "@/lib/supabase";
import { mensagemErro } from "@/types/acessos";

const DIA = 24 * 60 * 60 * 1000;
const MIGRATION = "20261020270000_visitantes_atividade";

/** "Mozilla/5.0 (... Android ...) Chrome/..." → "Chrome · Android" */
export function navegadorDe(ua: string | null) {
  if (!ua) return "Não informado";
  const nav = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navegador";
  const so = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return so ? `${nav} · ${so}` : nav;
}

/** Contagem decrescente (top N) */
export function ranking(itens: string[], n = 6): [string, number][] {
  const mapa = new Map<string, number>();
  for (const i of itens) mapa.set(i, (mapa.get(i) ?? 0) + 1);
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

/** Dados pessoais mascarados na lista: "maria.silva@gmail.com" → "ma•••@gmail.com" */
export function mascararEmail(email: string | null | undefined) {
  if (!email) return "—";
  const [u, d] = email.split("@");
  return d ? `${u.slice(0, 2)}•••@${d}` : "•••";
}
/** "(85) 99999-8888" → "(85) 9••••-8888" */
export function mascararTelefone(tel: string | null | undefined) {
  const n = (tel ?? "").replace(/\D/g, "");
  if (n.length < 8) return "—";
  return `(${n.slice(0, 2)}) ${n.slice(2, 3)}••••-${n.slice(-4)}`;
}

// chave "aaaa-mm-dd" no fuso de Fortaleza (para juntar por dia)
export const diaChave = (d: Date | string) =>
  new Date(d).toLocaleDateString("sv-SE", { timeZone: "America/Fortaleza" });

export interface PainelVisitantes {
  total: number;
  ativos: number;
  inativos: number;
  novosHoje: number;
  novos7: number;
  novos30: number;
  onlineAgora: number;
  comColeta: number;
  comChat: number;
  logins30: number;
  // últimos 30 dias: [dia, cadastros, logins]
  porDia: { dia: string; cadastros: number; logins: number }[];
  cidades: [string, number][];
  bairros: [string, number][];
  aparelhos: [string, number][];
  paginas: [string, number][];
}

/** Junta tudo da aba "Visão geral" (algumas consultas em paralelo) */
export async function carregarPainelVisitantes(): Promise<PainelVisitantes> {
  const agora = Date.now();
  const desde30 = new Date(agora - 30 * DIA).toISOString();
  const desde15min = new Date(agora - 15 * 60 * 1000).toISOString();

  const [vis, online, sess, evs, col, chat] = await Promise.all([
    supabase.from("visitantes").select("auth_user_id, cidade, bairro, ativo, created_at").limit(10000),
    supabase.from("visitante_sessoes").select("auth_user_id").gte("ultima_atividade", desde15min).is("encerrada_em", null).limit(2000),
    supabase.from("visitante_sessoes").select("iniciada_em, user_agent").gte("iniciada_em", desde30).limit(10000),
    supabase.from("visitante_eventos").select("caminho").eq("tipo", "pagina").gte("criado_em", desde30).limit(10000),
    supabase.from("coleta_solicitacoes").select("auth_user_id").limit(10000),
    supabase.from("chat_conversas").select("auth_user_id").not("ultima_msg_em", "is", null).limit(10000),
  ]);
  // a tabela principal é obrigatória; as outras, se faltarem, só ficam zeradas
  if (vis.error) throw new Error(mensagemErro(vis.error, MIGRATION));

  const lista = (vis.data ?? []) as { auth_user_id: string | null; cidade: string | null; bairro: string | null; ativo: boolean; created_at: string }[];
  const contas = new Set(lista.map((v) => v.auth_user_id).filter(Boolean) as string[]);
  const hoje = diaChave(new Date());
  const idade = (iso: string) => agora - new Date(iso).getTime();

  // 30 dias zerados e depois soma o que veio do banco
  const dias = new Map<string, { cadastros: number; logins: number }>();
  for (let i = 29; i >= 0; i--) dias.set(diaChave(new Date(agora - i * DIA)), { cadastros: 0, logins: 0 });
  for (const v of lista) { const d = dias.get(diaChave(v.created_at)); if (d) d.cadastros++; }
  const sessoes = (sess.data ?? []) as { iniciada_em: string; user_agent: string | null }[];
  for (const s of sessoes) { const d = dias.get(diaChave(s.iniciada_em)); if (d) d.logins++; }

  // conta só quem ainda tem cadastro (coleta/chat de conta apagada não entra)
  const distintos = (linhas: { auth_user_id: string | null }[] | null) =>
    new Set((linhas ?? []).map((l) => l.auth_user_id).filter((id): id is string => !!id && contas.has(id))).size;

  return {
    total: lista.length,
    ativos: lista.filter((v) => v.ativo).length,
    inativos: lista.filter((v) => !v.ativo).length,
    novosHoje: lista.filter((v) => diaChave(v.created_at) === hoje).length,
    novos7: lista.filter((v) => idade(v.created_at) <= 7 * DIA).length,
    novos30: lista.filter((v) => idade(v.created_at) <= 30 * DIA).length,
    onlineAgora: distintos(online.data as { auth_user_id: string | null }[] | null),
    comColeta: distintos(col.data as { auth_user_id: string | null }[] | null),
    comChat: distintos(chat.data as { auth_user_id: string | null }[] | null),
    logins30: sessoes.length,
    porDia: [...dias.entries()].map(([dia, n]) => ({ dia, ...n })),
    cidades: ranking(lista.map((v) => v.cidade?.trim() || "Não informada")),
    bairros: ranking(lista.map((v) => v.bairro?.trim()).filter((b): b is string => !!b)),
    aparelhos: ranking(sessoes.map((s) => navegadorDe(s.user_agent))),
    paginas: ranking(((evs.data ?? []) as { caminho: string }[]).map((e) => e.caminho)),
  };
}

/** Extras da página atual da lista: quem está online, quantas coletas e se usa o chat */
export interface ExtrasVisitante { online: boolean; coletas: number; chat: boolean; naoLidas: number }

export async function carregarExtras(ids: string[]): Promise<Record<string, ExtrasVisitante>> {
  const mapa: Record<string, ExtrasVisitante> = {};
  if (!ids.length) return mapa;
  for (const id of ids) mapa[id] = { online: false, coletas: 0, chat: false, naoLidas: 0 };
  const desde15min = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const [on, col, chat] = await Promise.all([
    supabase.from("visitante_sessoes").select("auth_user_id").in("auth_user_id", ids).gte("ultima_atividade", desde15min).is("encerrada_em", null),
    supabase.from("coleta_solicitacoes").select("auth_user_id").in("auth_user_id", ids),
    supabase.from("chat_conversas").select("id, auth_user_id, ultima_msg_em").in("auth_user_id", ids),
  ]);
  for (const s of (on.data ?? []) as { auth_user_id: string }[]) if (mapa[s.auth_user_id]) mapa[s.auth_user_id].online = true;
  for (const c of (col.data ?? []) as { auth_user_id: string }[]) if (mapa[c.auth_user_id]) mapa[c.auth_user_id].coletas++;
  const conversas = (chat.data ?? []) as { id: string; auth_user_id: string; ultima_msg_em: string | null }[];
  for (const c of conversas) if (mapa[c.auth_user_id] && c.ultima_msg_em) mapa[c.auth_user_id].chat = true;
  // mensagens do visitante ainda não lidas pela equipe
  if (conversas.length) {
    const { data } = await supabase.from("chat_mensagens").select("conversa_id")
      .in("conversa_id", conversas.map((c) => c.id)).eq("autor_tipo", "visitante").is("lida_em", null).limit(2000);
    const dono = new Map(conversas.map((c) => [c.id, c.auth_user_id]));
    for (const m of (data ?? []) as { conversa_id: string }[]) {
      const id = dono.get(m.conversa_id);
      if (id && mapa[id]) mapa[id].naoLidas++;
    }
  }
  return mapa;
}

/** Histórico do visitante na gaveta: pedidos de coleta e últimas mensagens do chat */
export interface ColetaResumo { id: string; bairro: string; status: string; materiais: string[]; created_at: string; data_agendada: string | null }
export interface MensagemResumo { id: string; autor_tipo: "visitante" | "admin"; texto: string; created_at: string }

export async function carregarHistorico(authUserId: string) {
  const [col, conv] = await Promise.all([
    supabase.from("coleta_solicitacoes").select("id, bairro, status, materiais, created_at, data_agendada")
      .eq("auth_user_id", authUserId).order("created_at", { ascending: false }).limit(20),
    supabase.from("chat_conversas").select("id").eq("auth_user_id", authUserId).maybeSingle(),
  ]);
  let mensagens: MensagemResumo[] = [];
  const conversaId = (conv.data as { id: string } | null)?.id;
  if (conversaId) {
    const { data } = await supabase.from("chat_mensagens").select("id, autor_tipo, texto, created_at")
      .eq("conversa_id", conversaId).order("created_at", { ascending: false }).limit(15);
    mensagens = (data ?? []) as MensagemResumo[];
  }
  return { coletas: (col.data ?? []) as ColetaResumo[], mensagens, erro: col.error ? mensagemErro(col.error, "20261021110000_coletas_agendamento") : "" };
}
