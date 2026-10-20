"use client";

// NÃO UTILIZADO: removido da home. Peso total, valor operacional e ranking de
// materiais agora ficam em /transparencia (src/components/transparencia/TranspOperacional.tsx).

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Recycle, Scale, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

import "@/styles/materials-section.css";

type MaterialResumo = {
  nome: string;
  peso: number;
  valor: number;
  quantidade: number;
  percentual: number;
};

export default function MaterialsPublicSection() {
  const [loading, setLoading] = useState(true);
  const [materiais, setMateriais] = useState<MaterialResumo[]>([]);
  const [totalPeso, setTotalPeso] = useState(0);
  const [totalValor, setTotalValor] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);

      const { data, error } = await supabase.from("materiais_registros")
        .select(`
          peso,
          subtotal,
          materiais_tipos (
            nome
          )
        `);

      if (error || !data) {
        console.error(error);
        return;
      }

      const resumo: Record<string, MaterialResumo> = {};
      let pesoTotal = 0;
      let valorTotal = 0;

      data.forEach((item: any) => {
        const nome = item?.materiais_tipos?.nome || "Sem nome";
        const peso = Number(item.peso || 0);
        const valor = Number(item.subtotal || 0);

        pesoTotal += peso;
        valorTotal += valor;

        if (!resumo[nome]) {
          resumo[nome] = {
            nome,
            peso: 0,
            valor: 0,
            quantidade: 0,
            percentual: 0,
          };
        }

        resumo[nome].peso += peso;
        resumo[nome].valor += valor;
        resumo[nome].quantidade += 1;
      });

      const lista = Object.values(resumo)
        .map((item) => ({
          ...item,
          percentual:
            pesoTotal > 0
              ? Number(((item.peso / pesoTotal) * 100).toFixed(1))
              : 0,
        }))
        .sort((a, b) => b.peso - a.peso);

      setMateriais(lista);
      setTotalPeso(pesoTotal);
      setTotalValor(valorTotal);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const topMateriais = useMemo(() => materiais.slice(0, 3), [materiais]);

  return (
    <section className="materials">
      <div className="materials__bg">
        <div className="materials__blob materials__blob--1" />
        <div className="materials__blob materials__blob--2" />
      </div>

      <div className="materials__container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="materials__header"
        >
          <div className="materials__tag">♻ Transparência Operacional</div>

          <h2 className="materials__title">
            Materiais recicláveis recuperados pela ACMRB
          </h2>

          <p className="materials__description">
            Resumo operacional público com dados de reciclagem, logística
            reversa e materiais processados pela associação.
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="materials__kpis">
          <motion.div
            whileHover={{ y: -4 }}
            className="materials__kpi materials__kpi--green"
          >
            <div className="materials__kpi-icon">
              <Scale size={26} />
            </div>
            <p>Peso total reciclado</p>
            <h3>{loading ? "--" : `${totalPeso.toFixed(0)}kg`}</h3>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="materials__kpi materials__kpi--blue"
          >
            <div className="materials__kpi-icon">
              <Wallet size={26} />
            </div>
            <p>Valor operacional</p>
            <h3>{loading ? "--" : `R$ ${totalValor.toFixed(2)}`}</h3>
          </motion.div>
        </div>

        {/* Top materiais */}
        <div className="materials__ranking">
          <div className="materials__ranking-header">
            <div>
              <h3>Materiais em destaque</h3>
              <p>Ranking baseado no maior volume operacional reciclado.</p>
            </div>

            <Link href="/transparencia" className="materials__btn">
              Ver relatório completo
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="materials__list">
            {topMateriais.map((item, index) => (
              <motion.div
                key={item.nome}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="materials__card"
              >
                <div className="materials__card-top">
                  <div className="materials__card-icon">
                    <Recycle size={24} />
                  </div>
                  <span className="materials__rank">#{index + 1}</span>
                </div>

                <h4>{item.nome}</h4>

                <div className="materials__stats">
                  <div>
                    <span>Peso</span>
                    <strong>{item.peso.toFixed(0)}kg</strong>
                  </div>
                  <div>
                    <span>Participação</span>
                    <strong className="materials__percent">
                      {item.percentual}%
                    </strong>
                  </div>
                </div>

                <div className="materials__value">
                  <span>Valor operacional</span>
                  <strong>R$ {item.valor.toFixed(2)}</strong>
                </div>

                <div className="materials__registros">
                  <span>Registros</span>
                  <div>
                    <TrendingUp size={16} />
                    {item.quantidade}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
