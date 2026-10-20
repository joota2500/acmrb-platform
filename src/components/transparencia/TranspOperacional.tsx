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
import { motion, useReducedMotion } from "framer-motion";
import { Download, FileSpreadsheet, Filter, Hash, Scale, Wallet, Tag } from "lucide-react";
import Contador from "./Contador";
import TranspSecaoTitulo from "./TranspSecaoTitulo";
import { fmtMoeda, fmtNum, fmtPeso } from "./formatos";
import type { RegistroMaterial } from "@/hooks/useTransparencia";
import "@/styles/transp-operacional.css";

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
  const reduzir = useReducedMotion();

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
    <section id="operacional" className="tp-secao tp-secao--suave">
      <div className="tp-container">
        <TranspSecaoTitulo
          tag="♻ Transparência operacional"
          titulo="Materiais recicláveis recuperados"
          texto="Resumo público das pesagens de materiais recicláveis triados e comercializados pela associação. Use os filtros para ver um ano ou um tipo de material específico."
        />

        <div className="to-filtros" role="group" aria-label="Filtros dos materiais">
          <Filter size={16} aria-hidden className="to-filtros__icone" />
          <label>
            <span>Ano</span>
            <select value={ano} onChange={(e) => onAno(e.target.value)}>
              <option value="todos">Todos os anos</option>
              {anos.map((a) => <option key={a} value={String(a)}>{a}</option>)}
            </select>
          </label>
          <label>
            <span>Material</span>
            <select value={material} onChange={(e) => onMaterial(e.target.value)}>
              <option value="todos">Todos os materiais</option>
              {materiais.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <button type="button" className="to-csv" onClick={() => exportarCSV(registros)} disabled={!registros.length}>
            <Download size={16} aria-hidden /> Exportar CSV
          </button>
        </div>

        <div className="to-resumo">
          {resumo.map((r) => {
            const Icone = r.icone;
            return (
              <div key={r.rotulo} className="to-resumo__item">
                <Icone size={20} aria-hidden />
                <span>{r.rotulo}</span>
                <strong>
                  {r.valor > 0 ? <Contador key={`${r.rotulo}-${r.valor}`} valor={r.valor} formatar={r.fmt} /> : r.vazio ?? r.fmt(0)}
                </strong>
              </div>
            );
          })}
        </div>

        {valor === 0 && peso > 0 && (
          <p className="to-aviso">
            O valor operacional aparece como “Em apuração” enquanto o valor por quilo dos registros não for informado pela equipe.
          </p>
        )}

        {grupos.length === 0 ? (
          <div className="to-vazio">
            <FileSpreadsheet size={28} aria-hidden />
            <p>Nenhum registro encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <ol className="to-ranking">
            {grupos.map((g, i) => {
              const part = peso > 0 ? (g.peso / peso) * 100 : 0;
              return (
                <motion.li
                  key={g.nome}
                  className="to-item"
                  initial={reduzir ? false : { opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: Math.min(i, 6) * 0.05 }}
                >
                  <span className="to-item__pos">#{i + 1}</span>
                  <div className="to-item__corpo">
                    <div className="to-item__topo">
                      <h3>
                        <i style={{ background: g.cor || "#059669" }} aria-hidden /> {g.nome}
                      </h3>
                      <strong>{fmtNum(part, 1)}%</strong>
                    </div>
                    <div className="to-item__barra" aria-hidden>
                      <span style={{ width: `${part}%`, background: g.cor || undefined }} />
                    </div>
                    <dl className="to-item__dados">
                      <div><dt>Peso</dt><dd>{fmtPeso(g.peso)}</dd></div>
                      <div><dt>Valor</dt><dd>{g.valor > 0 ? fmtMoeda(g.valor) : "—"}</dd></div>
                      <div><dt>Registros</dt><dd>{g.qtd}</dd></div>
                    </dl>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
