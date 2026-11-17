"use client";

/**
 * Bloco operacional (antes ficava na home como "Transparência
 * Operacional / Materiais em destaque").
 *  - Filtros por ano e por tipo de material (aplicados no navegador).
 *  - Peso total, valor operacional (soma de subtotal = peso × valor/kg
 *    lançado no painel › Materiais), nº de registros e preço médio.
 *  - Ranking por peso com barra de participação.
 *  - Exportar CSV dos registros filtrados (gerado no navegador).
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet, Filter, Hash, Recycle, Scale, Wallet, Tag } from "lucide-react";
import Button from "@/components/ui/Button";
import Contador from "@/components/ui/Contador";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Input";
import TituloSecao from "@/components/home/TituloSecao";
import { useAparecer } from "@/hooks/useAparecer";
import { fmtMoeda, fmtNum, fmtPeso } from "@/utils/formatosTransparencia";
import type { RegistroMaterial } from "@/hooks/useTransparencia";

type Props = {
  registros: RegistroMaterial[]; // já filtrados
  anos: number[];
  materiais: string[];
  ano: string;
  material: string;
  onAno: (v: string) => void;
  onMaterial: (v: string) => void;
};

type Grupo = { nome: string; cor?: string; peso: number; valor: number; qtd: number };

function exportarCSV(registros: RegistroMaterial[]) {
  const linhas = [
    ["data", "material", "peso_kg", "valor_kg_reais", "subtotal_reais"],
    ...registros.map((r) => [
      r.data ? new Date(r.data).toLocaleDateString("pt-BR") : "",
      r.material,
      r.peso.toFixed(3).replace(".", ","),
      r.valorKg.toFixed(2).replace(".", ","),
      r.subtotal.toFixed(2).replace(".", ","),
    ]),
  ];
  // ";" e BOM para abrir certo no Excel em português
  const csv = "\uFEFF" + linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `acmrb-materiais-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TranspOperacional({ registros, anos, materiais, ano, material, onAno, onMaterial }: Props) {
  const aparecer = useAparecer();

  const { grupos, peso, valor } = useMemo(() => {
    const g: Record<string, Grupo> = {};
    let peso = 0;
    let valor = 0;
    for (const r of registros) {
      const x = (g[r.material] ??= { nome: r.material, cor: r.cor, peso: 0, valor: 0, qtd: 0 });
      x.peso += r.peso;
      x.valor += r.subtotal;
      x.qtd += 1;
      peso += r.peso;
      valor += r.subtotal;
    }
    return { grupos: Object.values(g).sort((a, b) => b.peso - a.peso), peso, valor };
  }, [registros]);

  const precoMedio = peso > 0 && valor > 0 ? valor / peso : 0;

  const resumo = [
    { rotulo: "Peso total reciclado", valor: peso, fmt: fmtPeso, icone: Scale },
    { rotulo: "Valor operacional", valor: valor, fmt: fmtMoeda, icone: Wallet, vazio: "Em apuração" },
    { rotulo: "Registros de pesagem", valor: registros.length, fmt: (n: number) => fmtNum(Math.round(n)), icone: Hash },
    { rotulo: "Preço médio por kg", valor: precoMedio, fmt: fmtMoeda, icone: Tag, vazio: "Em apuração" },
  ];

  return (
    <section id="operacional" className="scroll-mt-32 bg-white py-14 sm:py-20">
      <Container>
        <TituloSecao
          etiqueta="Transparência operacional"
          icone={Recycle}
          alinhamento="esquerda"
          className="mb-8 sm:mb-10"
          titulo={<>Materiais recicláveis <span>recuperados</span></>}
          descricao="Resumo público das pesagens de materiais recicláveis triados e comercializados pela associação. Use os filtros para ver um ano ou um tipo de material específico."
        />

        {/* Filtros */}
        <div
          className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface-alt p-4 sm:p-5"
          role="group"
          aria-label="Filtros dos materiais"
        >
          <Filter size={18} aria-hidden="true" className="mb-3 hidden text-leaf sm:block" />
          <label className="flex min-w-40 flex-1 flex-col gap-1.5 sm:max-w-60">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Ano</span>
            <Select value={ano} onChange={(e) => onAno(e.target.value)}>
              <option value="todos">Todos os anos</option>
              {anos.map((a) => <option key={a} value={String(a)}>{a}</option>)}
            </Select>
          </label>
          <label className="flex min-w-40 flex-1 flex-col gap-1.5 sm:max-w-60">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Material</span>
            <Select value={material} onChange={(e) => onMaterial(e.target.value)}>
              <option value="todos">Todos os materiais</option>
              {materiais.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </label>
          <Button type="button" className="w-full sm:ml-auto sm:w-auto" onClick={() => exportarCSV(registros)} disabled={!registros.length}>
            <Download size={16} aria-hidden="true" /> Exportar CSV
          </Button>
        </div>

        {/* Totais */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {resumo.map((r) => {
            const Icone = r.icone;
            return (
              <div key={r.rotulo} className="flex flex-col gap-1 rounded-card border border-black/5 bg-white p-4 shadow-card sm:p-5">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-mint text-leaf"><Icone size={18} aria-hidden="true" /></span>
                <span className="mt-2 text-xs font-semibold text-ink-muted sm:text-sm">{r.rotulo}</span>
                <strong className="text-xl font-black tabular-nums text-ink sm:text-2xl">
                  {r.valor > 0 ? <Contador key={`${r.rotulo}-${r.valor}`} valor={r.valor} formatar={r.fmt} /> : r.vazio ?? r.fmt(0)}
                </strong>
              </div>
            );
          })}
        </div>

        {valor === 0 && peso > 0 && (
          <p lang="pt-BR" className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            O valor operacional aparece como “Em apuração” enquanto o valor por quilo dos registros não for informado pela equipe.
          </p>
        )}

        {/* Ranking por peso */}
        {grupos.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="Nada por aqui" description="Nenhum registro encontrado para os filtros selecionados." />
          </div>
        ) : (
          <>
            <h3 className="mt-10 flex items-center gap-2 text-lg font-extrabold text-ink">
              <FileSpreadsheet size={18} className="text-leaf" aria-hidden="true" /> Ranking por peso
            </h3>
            <ol className="mt-4 grid gap-3 sm:gap-4">
              {grupos.map((g, i) => {
                const part = peso > 0 ? (g.peso / peso) * 100 : 0;
                return (
                  <motion.li
                    key={g.nome}
                    {...aparecer(Math.min(i, 6) * 0.05)}
                    className="flex gap-3 rounded-card border border-black/5 bg-white p-4 shadow-card sm:gap-4 sm:p-5"
                  >
                    <span className="grid size-9 flex-none place-items-center rounded-full bg-brand-mint text-sm font-extrabold text-leaf">#{i + 1}</span>
                    <div className="min-w-0 flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="flex min-w-0 items-center gap-2 text-base font-extrabold text-ink">
                            <i className="size-3 flex-none rounded-full" style={{ background: g.cor || "#059669" }} aria-hidden="true" />
                            <span className="truncate">{g.nome}</span>
                          </h4>
                          <strong className="flex-none text-base font-black tabular-nums text-leaf">{fmtNum(part, 1)}%</strong>
                        </div>
                        <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-zinc-100" aria-hidden="true">
                          <span className="block h-full rounded-full bg-leaf-bright" style={{ width: `${part}%`, background: g.cor || undefined }} />
                        </div>
                      </div>
                      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm lg:mt-0 lg:w-80">
                        <div><dt className="text-xs font-semibold text-ink-muted">Peso</dt><dd className="font-bold tabular-nums text-ink">{fmtPeso(g.peso)}</dd></div>
                        <div><dt className="text-xs font-semibold text-ink-muted">Valor</dt><dd className="font-bold tabular-nums text-ink">{g.valor > 0 ? fmtMoeda(g.valor) : "—"}</dd></div>
                        <div><dt className="text-xs font-semibold text-ink-muted">Registros</dt><dd className="font-bold tabular-nums text-ink">{g.qtd}</dd></div>
                      </dl>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </>
        )}
      </Container>
    </section>
  );
}
