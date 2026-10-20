"use client";

/**
 * Impacto social: associados ativos e parceiros ativos (contados no
 * banco) + indicadores sociais manuais de dashboard_metricas.
 * Só aparecem os que têm valor maior que zero.
 */

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Building2, GraduationCap, HandHeart, HeartHandshake, UserCheck, Users, type LucideIcon } from "lucide-react";
import Contador from "./Contador";
import TranspSecaoTitulo from "./TranspSecaoTitulo";
import { fmtNum } from "./formatos";
import { num } from "@/hooks/useTransparencia";
import "@/styles/transp-social.css";

type Props = { metricas: Record<string, unknown> | null; associadosAtivos: number; parceirosAtivos: number };

export default function TranspSocial({ metricas, associadosAtivos, parceirosAtivos }: Props) {
  const reduzir = useReducedMotion();
  const m = (k: string) => num(metricas?.[k]);

  const itens: { titulo: string; valor: number; texto: string; icone: LucideIcon }[] = [
    { titulo: "Associados ativos", valor: associadosAtivos, texto: "Catadoras e catadores com cadastro ativo na associação.", icone: UserCheck },
    { titulo: "Catadores em atividade", valor: m("catadores_ativos"), texto: "Pessoas atuando diretamente na coleta e triagem.", icone: HandHeart },
    { titulo: "Famílias impactadas", valor: m("familias_impactadas"), texto: "Famílias com renda ligada ao trabalho da associação.", icone: Users },
    { titulo: "Pessoas alcançadas", valor: m("pessoas_impactadas"), texto: "Pessoas alcançadas por ações e campanhas.", icone: HeartHandshake },
    { titulo: "Ações educativas", valor: m("educacao_ambiental_acoes"), texto: "Oficinas, palestras e campanhas de educação ambiental.", icone: BookOpen },
    { titulo: "Escolas atendidas", valor: m("escolas_atendidas"), texto: "Escolas que receberam atividades de educação ambiental.", icone: GraduationCap },
    { titulo: "Parceiros ativos", valor: parceirosAtivos, texto: "Empresas e instituições parceiras cadastradas.", icone: Building2 },
  ];
  const visiveis = itens.filter((i) => i.valor > 0);

  return (
    <section id="impacto" className="tp-secao tp-secao--suave">
      <div className="tp-container">
        <TranspSecaoTitulo
          tag="Impacto social"
          titulo="Pessoas no centro da reciclagem"
          texto="A coleta seletiva em Baturité gera trabalho digno, renda e consciência ambiental. Estes números mostram quem faz e quem é alcançado por esse trabalho."
        />
        {visiveis.length === 0 ? (
          <p className="ts-vazio">Os indicadores sociais estão em apuração e serão publicados em breve.</p>
        ) : (
          <div className="ts-grade">
            {visiveis.map((i, idx) => {
              const Icone = i.icone;
              return (
                <motion.article
                  key={i.titulo}
                  className="ts-card"
                  initial={reduzir ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                >
                  <div className="ts-card__icone"><Icone size={20} aria-hidden /></div>
                  <strong><Contador valor={i.valor} formatar={(n) => fmtNum(Math.round(n))} /></strong>
                  <h3>{i.titulo}</h3>
                  <p>{i.texto}</p>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
