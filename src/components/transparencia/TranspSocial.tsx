"use client";

/**
 * Impacto social: associados ativos e parceiros ativos (contados no
 * banco) + indicadores sociais manuais de dashboard_metricas.
 * Só aparecem os que têm valor maior que zero.
 */

import { motion } from "framer-motion";
import { BookOpen, Building2, GraduationCap, HandHeart, HeartHandshake, UserCheck, Users, type LucideIcon } from "lucide-react";
import Contador from "@/components/ui/Contador";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import TituloSecao from "@/components/home/TituloSecao";
import { useAparecer } from "@/hooks/useAparecer";
import { fmtNum } from "@/utils/formatosTransparencia";
import { num } from "@/hooks/useTransparencia";

type Props = { metricas: Record<string, unknown> | null; associadosAtivos: number; parceirosAtivos: number };

export default function TranspSocial({ metricas, associadosAtivos, parceirosAtivos }: Props) {
  const aparecer = useAparecer();
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
    <section id="impacto" className="scroll-mt-32 bg-white py-14 sm:py-20">
      <Container>
        <TituloSecao
          etiqueta="Impacto social"
          icone={HeartHandshake}
          alinhamento="esquerda"
          className="mb-8 sm:mb-10"
          titulo={<>Pessoas no centro da <span>reciclagem</span></>}
          descricao="A coleta seletiva em Baturité gera trabalho digno, renda e consciência ambiental. Estes números mostram quem faz e quem é alcançado por esse trabalho."
        />
        {visiveis.length === 0 ? (
          <EmptyState title="Em apuração" description="Os indicadores sociais estão em apuração e serão publicados em breve." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {visiveis.map((i, idx) => {
              const Icone = i.icone;
              return (
                <motion.article
                  key={i.titulo}
                  {...aparecer(idx * 0.06)}
                  className="flex flex-col rounded-card border border-black/5 bg-surface-alt p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-brand-mint text-leaf"><Icone size={20} aria-hidden="true" /></div>
                  <strong className="mt-4 text-3xl font-black tabular-nums text-ink"><Contador valor={i.valor} formatar={(n) => fmtNum(Math.round(n))} /></strong>
                  <h3 className="mt-1 text-base font-extrabold text-brand-dark">{i.titulo}</h3>
                  <p lang="pt-BR" className="mt-1.5 text-sm leading-relaxed text-ink-soft">{i.texto}</p>
                </motion.article>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
