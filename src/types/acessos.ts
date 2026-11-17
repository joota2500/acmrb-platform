/** Tipos e utilitários das telas de acessos/segurança (somente ADM DEUS) */

export interface Totais {
  sessoes: number;
  visitantes: number;
  paginas: number;
  duracao_seg: number;
  anonimas: number;
  logadas: number;
}

export interface ItemRanking {
  nome: string;
  total: number;
  regiao?: string;
  media_seg?: number;
}

export interface PainelAcessos {
  dias: number;
  online_agora: number;
  logados_agora: number;
  hoje: Totais;
  periodo: Totais;
  cadastrados_total: number;
  cadastrados_ativos: number;
  novos_cadastros: number;
  serie: { dia: string; sessoes: number; visitantes: number; logadas: number }[];
  dispositivos: ItemRanking[];
  origens: ItemRanking[];
  paises: ItemRanking[];
  cidades: ItemRanking[];
  paginas: ItemRanking[];
}

export interface SessaoOnline {
  id: string;
  anon_id: string;
  auth_user_id: string | null;
  nome: string | null;
  iniciada_em: string;
  ultima_atividade: string;
  duracao_seg: number;
  paginas: number;
  pagina_atual: string | null;
  origem: string | null;
  referrer_host: string | null;
  dispositivo: string | null;
  navegador: string | null;
  sistema: string | null;
  cidade: string | null;
  regiao: string | null;
  pais: string | null;
}

/** "a1b2c3d4-..." → "a1b2c3d4" (id curto para exibir) */
export const idCurto = (id: string) => id.slice(0, 8);

/** Cidade · UF · País, só com o que existe (nunca inventa) */
export function localDe(s: { cidade?: string | null; regiao?: string | null; pais?: string | null }) {
  const partes = [s.cidade, s.regiao, s.pais].filter(Boolean);
  return partes.length ? partes.join(" · ") : "Local não informado";
}

export const aparelhoDe = (s: { dispositivo?: string | null; navegador?: string | null; sistema?: string | null }) =>
  [s.dispositivo, s.navegador, s.sistema].filter(Boolean).join(" · ") || "—";

export const origemDe = (s: { origem?: string | null; referrer_host?: string | null }) =>
  s.referrer_host ? `${s.origem ?? "outros sites"} (${s.referrer_host})` : s.origem ?? "direto";

/** Mensagem amigável quando a migration ainda não foi rodada */
export function mensagemErro(e: { code?: string; message?: string } | null | undefined, migration: string) {
  if (!e) return "";
  if (e.code === "42501") return "Somente o ADM DEUS pode ver esta tela.";
  if (e.code === "42883" || e.code === "42P01" || e.code === "PGRST202" || e.code === "PGRST205" || /does not exist|Could not find/i.test(e.message ?? ""))
    return `A estrutura do banco ainda não existe. Rode a migration ${migration} no Supabase (SQL Editor).`;
  return "Não foi possível carregar os dados agora. Tente atualizar.";
}
