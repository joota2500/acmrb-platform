"use client";

/**
 * usePainelResumo — dados reais da Visão Geral do painel
 * ------------------------------------------------------------
 * Cada consulta é independente: se uma tabela não existir (migration
 * não rodada) ou a RLS bloquear, o indicador fica null ("sem dados")
 * e entra na lista de pendências — nada é inventado.
 * Tabelas: materiais_registros (+ materiais_tipos), associados,
 * apoiadores, empresas_logistica, noticias, visitantes, denuncias,
 * dashboard_metricas e admin_auditoria (só deus).
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { comLimite } from "@/lib/associados";

export interface MesSerie { chave: string; rotulo: string; kg: number; valor: number }
export interface FatiaMaterial { nome: string; cor: string; kg: number }
export interface Atividade { id: number; ator_email: string; acao: string; alvo_email: string | null; created_at: string }
export interface Pendencia { nivel: "erro" | "aviso" | "info"; texto: string; secao?: string }

export interface Resumo {
  kgTotal: number | null;
  receitaTotal: number | null;
  kgMes: number | null;
  kgMesAnterior: number | null;
  registros: number | null;
  serie: MesSerie[];
  mix: FatiaMaterial[];
  associados: number | null;
  apoiadoresMapa: number | null;
  apoiadoresAtivos: number | null;
  empresasLogistica: number | null;
  noticiasPublicadas: number | null;
  noticiasMes: number | null;
  visitantes: number | null;
  visitantesMes: number | null;
  denunciasAbertas: number | null;
  mensagensNaoLidas: number | null;
  atividades: Atividade[] | null;
  pendencias: Pendencia[];
  atualizadoEm: Date;
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Tabela/coluna inexistente = migration pendente */
const faltaEstrutura = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || e.code === "42703" || /does not exist|schema cache/i.test(e.message ?? ""));

type Res<T> = { data: T | null; count?: number | null; error: { code?: string; message?: string } | null };

/** Executa com limite de tempo; erro de rede vira resultado com erro */
async function seguro<T>(p: PromiseLike<Res<T>>): Promise<Res<T>> {
  try {
    return await comLimite(p);
  } catch (e) {
    return { data: null, count: null, error: { message: (e as Error).message } };
  }
}

const inicioMes = (d: Date, delta = 0) => new Date(d.getFullYear(), d.getMonth() + delta, 1);

export function usePainelResumo(ehDeus: boolean) {
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const agora = new Date();
    const mesAtual = inicioMes(agora).toISOString();
    const pend: Pendencia[] = [];
    const contar = (t: string) => supabase.from(t).select("id", { count: "exact", head: true });

    const [reg, assoc, apoMapa, apoAtivos, apoSemCoord, emp, notPub, notMes, notSemImg, vis, visMes, den, metr, aud] = await Promise.all([
      seguro(supabase.from("materiais_registros").select("peso, subtotal, created_at, materiais_tipos(nome, cor)").limit(10000)),
      seguro(contar("associados").eq("status", "ativo")),
      seguro(contar("apoiadores").eq("ativo", true).eq("mostrar_no_mapa", true).not("latitude", "is", null)),
      seguro(contar("apoiadores").eq("ativo", true)),
      seguro(contar("apoiadores").eq("ativo", true).eq("mostrar_no_mapa", true).is("latitude", null)),
      seguro(contar("empresas_logistica").eq("status", "ativa")),
      seguro(contar("noticias").eq("publicado", true)),
      seguro(contar("noticias").eq("publicado", true).gte("created_at", mesAtual)),
      seguro(supabase.from("noticias").select("id, titulo").eq("publicado", true).or("imagem_url.is.null,imagem_url.eq.").limit(5)),
      ehDeus ? seguro(contar("visitantes")) : Promise.resolve(null),
      ehDeus ? seguro(contar("visitantes").gte("created_at", mesAtual)) : Promise.resolve(null),
      seguro(contar("denuncias").not("status", "in", "(resolvida,arquivada,concluida,encerrada)")),
      seguro(supabase.from("dashboard_metricas").select("*").limit(1).maybeSingle()),
      ehDeus
        ? seguro(supabase.from("admin_auditoria").select("id, ator_email, acao, alvo_email, created_at").order("created_at", { ascending: false }).limit(8))
        : Promise.resolve(null),
    ]);

    // Chat geral: mensagens de visitantes ainda não lidas
    const chat = await seguro(supabase.rpc("chat_nao_lidas") as unknown as PromiseLike<Res<number>>);
    const mensagensNaoLidas = chat.error ? null : Number(chat.data) || 0;

    const n = (r: Res<unknown> | null) => (r && !r.error ? r.count ?? 0 : null);

    // ---- Materiais: totais, série de 6 meses e mix ----
    type Linha = { peso: number | null; subtotal: number | null; created_at: string; materiais_tipos: { nome: string; cor: string } | { nome: string; cor: string }[] | null };
    const linhas = (reg.error ? null : (reg.data as Linha[] | null)) ?? null;
    const serie: MesSerie[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = inicioMes(agora, -i);
      serie.push({ chave: `${d.getFullYear()}-${d.getMonth()}`, rotulo: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, kg: 0, valor: 0 });
    }
    const mixMapa = new Map<string, FatiaMaterial>();
    let kgTotal = 0, receita = 0;
    if (linhas) {
      for (const l of linhas) {
        const kg = Number(l.peso || 0);
        const v = Number(l.subtotal || 0);
        kgTotal += kg;
        receita += v;
        const d = new Date(l.created_at);
        const s = serie.find((x) => x.chave === `${d.getFullYear()}-${d.getMonth()}`);
        if (s) { s.kg += kg; s.valor += v; }
        const tipo = Array.isArray(l.materiais_tipos) ? l.materiais_tipos[0] : l.materiais_tipos;
        const nome = tipo?.nome ?? "Sem tipo";
        const f = mixMapa.get(nome) ?? { nome, cor: tipo?.cor ?? "#a1a1aa", kg: 0 };
        f.kg += kg;
        mixMapa.set(nome, f);
      }
    }
    const mix = [...mixMapa.values()].filter((f) => f.kg > 0).sort((a, b) => b.kg - a.kg);

    // ---- Pendências ----
    if (reg.error) pend.push({ nivel: faltaEstrutura(reg.error) ? "erro" : "aviso", texto: faltaEstrutura(reg.error) ? "Tabela de materiais não encontrada (migration pendente)." : "Não foi possível ler os registros de materiais.", secao: "materiais" });
    else if (!linhas?.length) pend.push({ nivel: "info", texto: "Nenhum registro de material cadastrado ainda.", secao: "materiais" });
    else if (serie[5].kg === 0) pend.push({ nivel: "aviso", texto: "Nenhuma coleta registrada neste mês.", secao: "materiais" });

    const metricas = metr.error ? null : (metr.data as Record<string, unknown> | null);
    if (metr.error && faltaEstrutura(metr.error)) pend.push({ nivel: "erro", texto: "Tabela de indicadores ESG não encontrada (migration pendente).", secao: "esg" });
    else if (!metricas) pend.push({ nivel: "aviso", texto: "Indicadores ESG ainda não foram preenchidos.", secao: "esg" });
    else {
      const numeros = Object.entries(metricas).filter(([k, v]) => typeof v === "number" || (typeof v === "string" && k !== "id" && !isNaN(Number(v)) && !/_at$/.test(k)));
      if (numeros.length && numeros.every(([, v]) => Number(v) === 0)) pend.push({ nivel: "aviso", texto: "Indicadores ESG estão todos zerados.", secao: "esg" });
    }

    const semImg = notSemImg.error ? [] : ((notSemImg.data as { id: string; titulo: string }[] | null) ?? []);
    if (semImg.length) pend.push({ nivel: "aviso", texto: `${semImg.length}${semImg.length === 5 ? "+" : ""} notícia(s) publicada(s) sem imagem: ${semImg.slice(0, 2).map((x) => `“${x.titulo}”`).join(", ")}${semImg.length > 2 ? "…" : ""}`, secao: "noticias" });
    if (notPub.error && faltaEstrutura(notPub.error)) pend.push({ nivel: "erro", texto: "Tabela de notícias incompleta (migration pendente).", secao: "noticias" });

    const semCoord = n(apoSemCoord);
    if (semCoord) pend.push({ nivel: "aviso", texto: `${semCoord} apoiador(es) marcado(s) para o mapa sem localização.`, secao: "visao-mapa" });
    if (apoAtivos.error && faltaEstrutura(apoAtivos.error)) pend.push({ nivel: "erro", texto: "Tabelas de apoiadores/mapa não encontradas (migration pendente).", secao: "apoiadores" });
    if (emp.error && faltaEstrutura(emp.error)) pend.push({ nivel: "erro", texto: "Tabela de logística reversa não encontrada (migration pendente).", secao: "logistica" });
    if (ehDeus && vis?.error && faltaEstrutura(vis.error)) pend.push({ nivel: "erro", texto: "Tabela de visitantes não encontrada: rode a migration 20261020260000_visitantes_perfil.sql.", secao: "visitantes" });
    if (ehDeus && aud?.error && faltaEstrutura(aud.error)) pend.push({ nivel: "info", texto: "Auditoria do painel indisponível (migration admin_auditoria pendente)." });

    if (mensagensNaoLidas) pend.push({ nivel: "aviso", texto: `${mensagensNaoLidas} mensagem(ns) de visitantes sem resposta lida.`, secao: "mensagens" });
    if (chat.error && /chat_nao_lidas|function|schema cache/i.test(chat.error.message ?? "")) pend.push({ nivel: "info", texto: "Chat com visitantes indisponível: rode a migration 20261021230000_chat_geral.sql.", secao: "mensagens" });

    const abertas = n(den);
    if (abertas) pend.push({ nivel: "aviso", texto: `${abertas} denúncia(s) aguardando atendimento.`, secao: "denuncias" });

    setResumo({
      kgTotal: linhas ? kgTotal : null,
      receitaTotal: linhas ? receita : null,
      kgMes: linhas ? serie[5].kg : null,
      kgMesAnterior: linhas ? serie[4].kg : null,
      registros: linhas ? linhas.length : null,
      serie,
      mix,
      associados: n(assoc),
      apoiadoresMapa: n(apoMapa),
      apoiadoresAtivos: n(apoAtivos),
      empresasLogistica: n(emp),
      noticiasPublicadas: n(notPub),
      noticiasMes: n(notMes),
      visitantes: n(vis),
      visitantesMes: n(visMes),
      denunciasAbertas: abertas,
      mensagensNaoLidas,
      atividades: aud && !aud.error ? ((aud.data as Atividade[] | null) ?? []) : null,
      pendencias: pend,
      atualizadoEm: new Date(),
    });
    setCarregando(false);
  }, [ehDeus]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return { resumo, carregando, recarregar: carregar };
}
