"use client";

/**
 * Painel › Indicadores ESG (somente ADM DEUS — ver src/lib/permissions.ts;
 * o banco reforça por RLS: só is_deus() escreve em dashboard_metricas).
 *
 * Formulário dos indicadores MANUAIS exibidos em /transparencia.
 * Resíduos coletados e valor operacional NÃO ficam aqui: são calculados
 * automaticamente a partir de Painel › Materiais (peso × valor por kg).
 *
 * Fallback: só envia ao banco as colunas que já existem na linha lida.
 * Campos novos (migration 20261020210000) aparecem desativados com aviso
 * até a migration ser rodada.
 */

import { useEffect, useState } from "react";
import { Leaf, Loader2, RefreshCw, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Campo = { key: string; label: string; tipo?: "texto" | "area"; ajuda?: string };

const GRUPOS: { titulo: string; campos: Campo[] }[] = [
  {
    titulo: "Ambientais",
    campos: [
      { key: "co2_evitado", label: "CO₂ evitado (kg)" },
      { key: "arvores_preservadas", label: "Árvores preservadas (equivalente)" },
      { key: "agua_economizada", label: "Água economizada (litros)" },
      { key: "energia_economizada", label: "Energia economizada (kWh)" },
      { key: "residuos_desviados_aterro", label: "Desviado do aterro (kg)" },
    ],
  },
  {
    titulo: "Sociais e operação",
    campos: [
      { key: "familias_impactadas", label: "Famílias impactadas" },
      { key: "catadores_ativos", label: "Catadores em atividade" },
      { key: "pessoas_impactadas", label: "Pessoas alcançadas" },
      { key: "educacao_ambiental_acoes", label: "Ações educativas" },
      { key: "escolas_atendidas", label: "Escolas atendidas" },
      { key: "coletas_realizadas", label: "Coletas realizadas" },
      { key: "bairros_atendidos", label: "Bairros atendidos" },
      { key: "pontos_coleta", label: "Pontos de coleta" },
      { key: "empresas_parceiras", label: "Empresas parceiras" },
    ],
  },
  {
    titulo: "Metas públicas (barras de progresso)",
    campos: [
      { key: "meta_residuos_kg", label: "Meta de resíduos (kg)" },
      { key: "meta_co2_kg", label: "Meta de CO₂ (kg)" },
      { key: "meta_familias", label: "Meta de famílias" },
      { key: "meta_arvores", label: "Meta de árvores" },
    ],
  },
  {
    titulo: "Textos públicos",
    campos: [
      { key: "periodo_referencia", label: "Período de referência", tipo: "texto", ajuda: "Ex.: Jan–Out/2026" },
      { key: "observacao_publica", label: "Nota pública da associação", tipo: "area", ajuda: "Aparece abaixo dos indicadores em /transparencia" },
    ],
  },
];

export default function ESGSection() {
  const [linha, setLinha] = useState<Record<string, unknown> | null>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function carregar() {
    setLoading(true);
    setMsg(null);
    const { data, error } = await supabase
      .from("dashboard_metricas")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) setMsg({ tipo: "erro", texto: error.message });
    const d = (data as Record<string, unknown>) ?? null;
    setLinha(d);
    const v: Record<string, string> = {};
    if (d) for (const k of Object.keys(d)) v[k] = d[k] == null ? "" : String(d[k]);
    setValores(v);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  const existe = (k: string) => !!linha && k in linha;

  async function salvar() {
    setSalvando(true);
    setMsg(null);
    try {
      const dados: Record<string, unknown> = {};
      for (const g of GRUPOS)
        for (const c of g.campos) {
          if (linha && !existe(c.key)) continue; // coluna ainda não criada
          const bruto = (valores[c.key] ?? "").trim();
          if (c.tipo) dados[c.key] = bruto || null;
          else {
            const n = bruto === "" ? 0 : Number(bruto.replace(",", "."));
            if (!Number.isFinite(n) || n < 0) throw new Error(`Valor inválido em “${c.label}”.`);
            // metas vazias = usar meta padrão do site
            dados[c.key] = c.key.startsWith("meta_") && bruto === "" ? null : n;
          }
        }
      if (linha && existe("updated_at")) dados.updated_at = new Date().toISOString();

      const { error } = linha?.id
        ? await supabase.from("dashboard_metricas").update(dados).eq("id", String(linha.id))
        : await supabase.from("dashboard_metricas").insert({});
      if (error) throw error;
      if (!linha?.id) {
        await carregar();
        setMsg({ tipo: "ok", texto: "Registro de indicadores criado. Preencha e salve novamente." });
        return;
      }
      await carregar();
      setMsg({ tipo: "ok", texto: "Indicadores salvos. Já aparecem em /transparencia." });
    } catch (e) {
      setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao salvar." });
    } finally {
      setSalvando(false);
    }
  }

  const faltando = GRUPOS.flatMap((g) => g.campos).filter((c) => linha && !existe(c.key));

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-[#064e3b] to-[#047857] p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3">
          <Leaf className="h-6 w-6" />
          <h2 className="text-xl sm:text-2xl font-black">Indicadores ESG públicos</h2>
        </div>
        <p className="mt-3 text-sm sm:text-base text-emerald-50/90 text-justify hyphens-auto" lang="pt-BR">
          Estes números aparecem na página Transparência. Preencha apenas dados reais e
          verificáveis; campos com zero ficam ocultos ou aparecem como “Em apuração”. Peso e valor
          dos materiais são calculados sozinhos a partir de Materiais.
        </p>
      </div>

      {msg && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${msg.tipo === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
          {msg.texto}
        </div>
      )}

      {faltando.length > 0 && (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Alguns campos ainda não existem no banco ({faltando.map((c) => c.label).join(", ")}). Rode as
          migrations 20261020200000_metas_transparencia.sql e 20261020210000_transparencia_completa.sql no Supabase.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl bg-white p-12 text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando indicadores…
        </div>
      ) : (
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            salvar();
          }}
        >
          {GRUPOS.map((g) => (
            <fieldset key={g.titulo} className="rounded-3xl border border-black/5 bg-white p-5 sm:p-6">
              <legend className="px-2 text-base font-bold text-zinc-800">{g.titulo}</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.campos.map((c) => {
                  const off = !!linha && !existe(c.key);
                  const comum = "mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none disabled:opacity-50";
                  return (
                    <label key={c.key} className={`block ${c.tipo === "area" ? "sm:col-span-2 lg:col-span-3" : ""}`}>
                      <span className="text-sm font-semibold text-zinc-700">{c.label}</span>
                      {c.tipo === "area" ? (
                        <textarea rows={3} disabled={off} className={comum} value={valores[c.key] ?? ""} onChange={(e) => setValores({ ...valores, [c.key]: e.target.value })} />
                      ) : (
                        <input
                          type={c.tipo === "texto" ? "text" : "number"}
                          min={0}
                          step="any"
                          inputMode={c.tipo ? undefined : "decimal"}
                          disabled={off}
                          className={comum}
                          value={valores[c.key] ?? ""}
                          onChange={(e) => setValores({ ...valores, [c.key]: e.target.value })}
                        />
                      )}
                      {c.ajuda && <span className="mt-1 block text-xs text-zinc-500">{c.ajuda}</span>}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={carregar} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 font-semibold text-zinc-700">
              <RefreshCw className="h-4 w-4" /> Recarregar
            </button>
            <button type="submit" disabled={salvando} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#047857] px-6 font-bold text-white disabled:opacity-60">
              {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar indicadores
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
