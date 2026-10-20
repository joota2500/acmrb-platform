"use client";

/**
 * Apoiadores e logística reversa — operações do painel (somente ADM DEUS)
 * ------------------------------------------------------------
 * Lê e grava nas TABELAS BASE (a RLS só permite is_deus()).
 * Validação com zod antes de enviar. CNPJ/CPF são gravados só com dígitos.
 */

import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS, TIPOS_APOIO, cnpjValido, cpfValido, soDigitos } from "@/lib/apoiadores";

// ---------- Tipos das tabelas base ----------

export interface Apoiador {
  id: string;
  tipo_pessoa: "juridica" | "fisica";
  nome: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  cpf: string | null;
  categoria: string;
  tipos_apoio: string[];
  descricao: string | null;
  logo_url: string | null;
  site: string | null;
  instagram: string | null;
  telefone_publico: string | null;
  email_publico: string | null;
  endereco: string | null;
  bairro: string | null;
  latitude: number | null;
  longitude: number | null;
  mostrar_no_mapa: boolean;
  exibir_publicamente: boolean;
  anonimo: boolean;
  ativo: boolean;
  desde: string | null;
  ordem: number;
  observacoes_internas: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmpresaLogistica {
  id: string;
  nome: string;
  cnpj: string | null;
  logo_url: string | null;
  responsavel_nome: string | null;
  responsavel_cargo: string | null;
  telefone_publico: string | null;
  email_publico: string | null;
  site: string | null;
  descricao: string | null;
  materiais_aceitos: string[];
  parceria_desde: string | null;
  status: string;
  exibir_publicamente: boolean;
  observacoes_internas: string | null;
  ordem: number;
}

export interface Repasse {
  id: string;
  empresa_id: string;
  data: string;
  material: string;
  peso_kg: number;
  valor: number | null;
  documento_url: string | null;
  observacao: string | null;
  publico: boolean;
}

// ---------- Schemas zod ----------

const textoOpc = z.string().trim().max(500).optional().transform((v) => (v ? v : null));
const emailOpc = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || z.string().email().safeParse(v).success, "E-mail inválido")
  .transform((v) => (v ? v : null));
const dataOpc = z.string().optional().transform((v) => (v ? v : null));

export const apoiadorSchema = z
  .object({
    tipo_pessoa: z.enum(["juridica", "fisica"]),
    nome: z.string().trim().min(2, "Informe o nome").max(200),
    nome_fantasia: textoOpc,
    cnpj: z.string().optional(),
    cpf: z.string().optional(),
    categoria: z.enum(CATEGORIAS),
    tipos_apoio: z.array(z.enum(TIPOS_APOIO)),
    descricao: z.string().trim().max(2000).optional().transform((v) => (v ? v : null)),
    logo_url: textoOpc,
    site: textoOpc,
    instagram: textoOpc,
    telefone_publico: textoOpc,
    email_publico: emailOpc,
    endereco: textoOpc,
    bairro: textoOpc,
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    mostrar_no_mapa: z.boolean(),
    exibir_publicamente: z.boolean(),
    anonimo: z.boolean(),
    ativo: z.boolean(),
    desde: dataOpc,
    ordem: z.number().int().min(0).max(9999),
    observacoes_internas: z.string().trim().max(2000).optional().transform((v) => (v ? v : null)),
  })
  .superRefine((v, ctx) => {
    const cnpj = soDigitos(v.cnpj ?? "");
    const cpf = soDigitos(v.cpf ?? "");
    if (v.tipo_pessoa === "juridica" && cnpj && !cnpjValido(cnpj))
      ctx.addIssue({ code: "custom", path: ["cnpj"], message: "CNPJ inválido (confira os dígitos)" });
    if (v.tipo_pessoa === "fisica" && cpf && !cpfValido(cpf))
      ctx.addIssue({ code: "custom", path: ["cpf"], message: "CPF inválido (confira os dígitos)" });
    if (v.mostrar_no_mapa && (v.latitude == null || v.longitude == null))
      ctx.addIssue({ code: "custom", path: ["latitude"], message: "Marque o ponto no mapa para exibi-lo" });
  })
  .transform((v) => ({
    ...v,
    // só guarda o documento do tipo escolhido
    cnpj: v.tipo_pessoa === "juridica" ? soDigitos(v.cnpj ?? "") || null : null,
    cpf: v.tipo_pessoa === "fisica" ? soDigitos(v.cpf ?? "") || null : null,
    // anonimato só faz sentido para pessoa física
    anonimo: v.tipo_pessoa === "fisica" ? v.anonimo : false,
  }));

export type ApoiadorEntrada = z.input<typeof apoiadorSchema>;

export const empresaSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome").max(200),
    cnpj: z.string().optional(),
    logo_url: textoOpc,
    responsavel_nome: textoOpc,
    responsavel_cargo: textoOpc,
    telefone_publico: textoOpc,
    email_publico: emailOpc,
    site: textoOpc,
    descricao: z.string().trim().max(2000).optional().transform((v) => (v ? v : null)),
    materiais_aceitos: z.array(z.string().trim().min(1).max(60)).max(30),
    parceria_desde: dataOpc,
    status: z.enum(["ativa", "em_negociacao", "pausada", "encerrada"]),
    exibir_publicamente: z.boolean(),
    observacoes_internas: z.string().trim().max(2000).optional().transform((v) => (v ? v : null)),
    ordem: z.number().int().min(0).max(9999),
  })
  .superRefine((v, ctx) => {
    const d = soDigitos(v.cnpj ?? "");
    if (d && !cnpjValido(d)) ctx.addIssue({ code: "custom", path: ["cnpj"], message: "CNPJ inválido (confira os dígitos)" });
  })
  .transform((v) => ({ ...v, cnpj: soDigitos(v.cnpj ?? "") || null }));

export type EmpresaEntrada = z.input<typeof empresaSchema>;

export const repasseSchema = z.object({
  empresa_id: z.string().uuid(),
  data: z.string().min(10, "Informe a data"),
  material: z.string().trim().min(2, "Informe o material").max(80),
  peso_kg: z.number({ invalid_type_error: "Informe o peso" }).min(0, "Peso não pode ser negativo").max(10_000_000),
  valor: z.number().min(0).nullable(),
  documento_url: textoOpc,
  observacao: z.string().trim().max(1000).optional().transform((v) => (v ? v : null)),
  publico: z.boolean(),
});

export type RepasseEntrada = z.input<typeof repasseSchema>;

/** Primeira mensagem de erro do zod (para o Toast) */
export function primeiroErro(e: z.ZodError) {
  return e.issues[0]?.message ?? "Dados inválidos";
}

// ---------- Erros amigáveis ----------

function traduzir(err: { code?: string; message?: string }) {
  if (err.code === "23505") return "Já existe um cadastro com este documento (CNPJ/CPF).";
  if (err.code === "42501" || /row-level security/i.test(err.message ?? "")) return "Sem permissão: apenas o ADM DEUS pode alterar.";
  if (err.code === "42P01" || err.code === "PGRST205") return "Tabela não encontrada. Rode a migration 20261020240000_apoiadores_mapa.sql.";
  if (err.code === "23514") return "Algum campo não passou na validação do banco (documento, categoria ou coordenadas).";
  return err.message || "Erro ao salvar.";
}

async function exec<T>(p: PromiseLike<{ data: T | null; error: { code?: string; message?: string } | null }>) {
  const { data, error } = await p;
  if (error) throw new Error(traduzir(error));
  return data as T;
}

// ---------- Apoiadores ----------

export const listarApoiadores = () =>
  exec<Apoiador[]>(supabase.from("apoiadores").select("*").order("ordem").order("nome"));

export const salvarApoiador = (dados: ReturnType<typeof apoiadorSchema.parse>, id?: string) =>
  id
    ? exec(supabase.from("apoiadores").update(dados).eq("id", id).select().single())
    : exec(supabase.from("apoiadores").insert(dados).select().single());

export const excluirApoiador = (id: string) => exec(supabase.from("apoiadores").delete().eq("id", id));

// ---------- Empresas de logística ----------

export const listarEmpresas = () =>
  exec<EmpresaLogistica[]>(supabase.from("empresas_logistica").select("*").order("ordem").order("nome"));

export const salvarEmpresa = (dados: ReturnType<typeof empresaSchema.parse>, id?: string) =>
  id
    ? exec(supabase.from("empresas_logistica").update(dados).eq("id", id).select().single())
    : exec(supabase.from("empresas_logistica").insert(dados).select().single());

export const excluirEmpresa = (id: string) => exec(supabase.from("empresas_logistica").delete().eq("id", id));

// ---------- Repasses ----------

export const listarRepasses = (empresaId: string) =>
  exec<Repasse[]>(supabase.from("repasses_logistica").select("*").eq("empresa_id", empresaId).order("data", { ascending: false }));

export const salvarRepasse = (dados: z.output<typeof repasseSchema>, id?: string) =>
  id
    ? exec(supabase.from("repasses_logistica").update(dados).eq("id", id).select().single())
    : exec(supabase.from("repasses_logistica").insert(dados).select().single());

export const excluirRepasse = (id: string) => exec(supabase.from("repasses_logistica").delete().eq("id", id));

// ---------- Upload de logo (bucket "parceiros", até 2 MB) ----------

export const LIMITE_LOGO = 2 * 1024 * 1024;
const TIPOS_LOGO = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export async function enviarLogo(arquivo: File, pasta: "apoiadores" | "logistica") {
  if (!TIPOS_LOGO.includes(arquivo.type)) throw new Error("Use PNG, JPG, WEBP ou SVG.");
  if (arquivo.size > LIMITE_LOGO) throw new Error("A imagem precisa ter até 2 MB.");
  const ext = arquivo.name.split(".").pop()?.toLowerCase() || "png";
  const caminho = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("parceiros")
    .upload(caminho, arquivo, { cacheControl: "31536000", upsert: false, contentType: arquivo.type });
  if (error) throw new Error(error.message || "Falha ao enviar a logo.");
  return supabase.storage.from("parceiros").getPublicUrl(caminho).data.publicUrl;
}

// ---------- Serviços externos (só ao clicar) ----------

export interface DadosCnpj {
  razao_social?: string;
  nome_fantasia?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  ddd_telefone_1?: string;
  email?: string | null;
  data_inicio_atividade?: string;
}

/** Consulta pública da BrasilAPI (dados da Receita Federal) */
export async function buscarCnpj(cnpj: string): Promise<DadosCnpj> {
  const d = soDigitos(cnpj);
  if (!cnpjValido(d)) throw new Error("Digite um CNPJ válido antes de buscar.");
  const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`);
  if (r.status === 404) throw new Error("CNPJ não encontrado na Receita.");
  if (!r.ok) throw new Error("Serviço de CNPJ indisponível agora. Tente mais tarde.");
  return r.json();
}

/**
 * Busca de endereço no Nominatim (OpenStreetMap).
 * Política de uso: 1 requisição por ação do usuário, sem autocompletar,
 * com identificação da aplicação (o navegador envia o Referer do site;
 * o User-Agent não pode ser alterado no navegador) e idioma pt-BR.
 */
export async function buscarEndereco(texto: string): Promise<{ lat: number; lng: number; nome: string }[]> {
  const q = texto.trim();
  if (q.length < 4) throw new Error("Digite um endereço mais completo.");
  const consulta = /baturit/i.test(q) ? q : `${q}, Baturité, Ceará, Brasil`;
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=br&accept-language=pt-BR&q=" +
    encodeURIComponent(consulta);
  const r = await fetch(url, { headers: { Accept: "application/json" }, referrerPolicy: "strict-origin-when-cross-origin" });
  if (!r.ok) throw new Error("Busca de endereço indisponível agora.");
  const lista = (await r.json()) as { lat: string; lon: string; display_name: string }[];
  return lista.map((i) => ({ lat: Number(i.lat), lng: Number(i.lon), nome: i.display_name }));
}
