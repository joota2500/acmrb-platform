"use client";

/**
 * Hook da página /transparencia
 * ------------------------------------------------------------
 * Busca, em paralelo e com tolerância a falhas (uma consulta falhar
 * não derruba as outras):
 *  - materiais_registros (+ materiais_tipos): pesagens lançadas no
 *    painel › Materiais. Daqui saem peso total, valor operacional
 *    (soma de subtotal = peso × valor_kg), ranking e evolução mensal.
 *  - dashboard_metricas: indicadores manuais preenchidos pelo ADM DEUS
 *    (CO₂, famílias, água, energia...) e metas meta_*. Usa select("*")
 *    para funcionar com ou sem as colunas novas das migrations.
 *  - associados (contagem de ativos) e parceiros (ativos).
 *  - transparencia_documentos (publicados). Se a tabela ainda não
 *    existir (migration 20261020210000 não rodada), vira lista vazia.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type RegistroMaterial = {
  id: string;
  peso: number;
  valorKg: number;
  subtotal: number;
  data: string;
  material: string;
  cor?: string;
};

export type DocumentoPublico = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  url_arquivo: string;
  ano: number | null;
};

export type Metas = { residuos: number; co2: number; familias: number; arvores: number };

/** Metas usadas quando o banco ainda não tem as colunas meta_* */
export const METAS_PADRAO: Metas = { residuos: 5000, co2: 10000, familias: 300, arvores: 500 };

export const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

type Tipo = { nome?: string; cor?: string } | null;

export function useTransparencia() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [registros, setRegistros] = useState<RegistroMaterial[]>([]);
  const [metricas, setMetricas] = useState<Record<string, unknown> | null>(null);
  const [metas, setMetas] = useState<Metas>(METAS_PADRAO);
  const [associadosAtivos, setAssociadosAtivos] = useState(0);
  const [parceirosAtivos, setParceirosAtivos] = useState(0);
  const [documentos, setDocumentos] = useState<DocumentoPublico[]>([]);
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    // Trava: se o Supabase não responder em 12s, mostra erro
    const limite = setTimeout(() => {
      setLoading(false);
      setErro("O servidor demorou para responder. Tente novamente.");
    }, 12000);

    try {
      const [regs, dash, assoc, parc, docs] = await Promise.all([
        supabase
          .from("materiais_registros")
          .select("id, peso, valor_kg, subtotal, created_at, materiais_tipos ( nome, cor )")
          .order("created_at", { ascending: true }),
        supabase
          .from("dashboard_metricas")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("associados").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("parceiros").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase
          .from("transparencia_documentos")
          .select("id, titulo, descricao, categoria, url_arquivo, ano")
          .eq("publicado", true)
          .order("ano", { ascending: false })
          .order("ordem", { ascending: true }),
      ]);

      let ultima: string | null = null;
      const marcar = (d?: unknown) => {
        if (typeof d === "string" && (!ultima || new Date(d) > new Date(ultima))) ultima = d;
      };

      if (regs.error) {
        console.log("ERRO MATERIAIS:", regs.error);
      } else {
        const lista = (regs.data || []).map((r: Record<string, unknown>) => {
          const t = (Array.isArray(r.materiais_tipos) ? r.materiais_tipos[0] : r.materiais_tipos) as Tipo;
          marcar(r.created_at);
          return {
            id: String(r.id),
            peso: num(r.peso),
            valorKg: num(r.valor_kg),
            subtotal: num(r.subtotal),
            data: String(r.created_at ?? ""),
            material: t?.nome || "Outros",
            cor: t?.cor,
          };
        });
        setRegistros(lista);
      }

      if (dash.error) {
        console.log("ERRO INDICADORES:", dash.error);
      } else if (dash.data) {
        const d = dash.data as Record<string, unknown>;
        setMetricas(d);
        setMetas({
          residuos: num(d.meta_residuos_kg) || METAS_PADRAO.residuos,
          co2: num(d.meta_co2_kg) || METAS_PADRAO.co2,
          familias: num(d.meta_familias) || METAS_PADRAO.familias,
          arvores: num(d.meta_arvores) || METAS_PADRAO.arvores,
        });
        marcar(d.updated_at);
      }

      setAssociadosAtivos(assoc.error ? 0 : assoc.count ?? 0);
      setParceirosAtivos(parc.error ? 0 : parc.count ?? 0);
      // Tabela pode não existir ainda: sem erro na tela, só lista vazia
      setDocumentos(docs.error ? [] : ((docs.data || []) as DocumentoPublico[]));

      setAtualizadoEm(ultima);
      if (regs.error && dash.error) setErro("Não foi possível carregar os dados de transparência agora.");
    } catch (e) {
      console.log("ERRO GERAL:", e);
      setErro("Não foi possível carregar os dados de transparência agora.");
    } finally {
      clearTimeout(limite);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    loading,
    erro,
    registros,
    metricas,
    metas,
    associadosAtivos,
    parceirosAtivos,
    documentos,
    atualizadoEm,
    recarregar: carregar,
  };
}
