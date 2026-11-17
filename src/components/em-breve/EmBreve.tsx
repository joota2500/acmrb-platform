"use client";

/**
 * EmBreve — recursos planejados da plataforma (/em-breve)
 * ------------------------------------------------------------
 * Só front-end (sem backend). Cada cartão abre/fecha os detalhes e
 * pode ser marcado como "quero esse!" (guardado só no navegador).
 * Visual: Tailwind + componentes de ui (Container, Badge).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Award, ChevronDown, Heart, MapPinned, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

interface Recurso {
  id: string;
  titulo: string;
  icone: LucideIcon;
  resumo: string;
  detalhes: string[];
  etapa: "Em estudo" | "Planejado" | "Em desenvolvimento";
}

const RECURSOS: Recurso[] = [
  {
    id: "onde-descarto",
    titulo: "Onde descarto?",
    icone: MapPinned,
    resumo: "Busque um material e descubra o ponto de entrega mais perto de você.",
    detalhes: ["Busca por material (pilha, óleo, vidro, eletrônico…)", "Pontos no mapa de Baturité", "Dicas de como separar e armazenar"],
    etapa: "Em desenvolvimento",
  },
  {
    id: "ranking-verde",
    titulo: "Ranking verde",
    icone: Trophy,
    resumo: "Bairros e escolas que mais reciclam ganham destaque no site.",
    detalhes: ["Ranking mensal por bairro", "Desafios entre escolas", "Selo para os destaques do mês"],
    etapa: "Planejado",
  },
  {
    id: "certificado",
    titulo: "Certificado digital",
    icone: Award,
    resumo: "Empresas e moradores recebem um certificado da destinação correta do material.",
    detalhes: ["Certificado em PDF com código de verificação", "Histórico de entregas na sua conta", "Validação pública pelo site"],
    etapa: "Em estudo",
  },
];

const CHAVE = "acmrb-em-breve-votos";

export default function EmBreve() {
  const reduzir = useReducedMotion();
  const [aberto, setAberto] = useState<string | null>(null);
  const [votos, setVotos] = useState<string[]>([]);

  useEffect(() => {
    try {
      setVotos(JSON.parse(localStorage.getItem(CHAVE) ?? "[]"));
    } catch {
      /* armazenamento indisponível */
    }
  }, []);

  const votar = (id: string) => {
    const novo = votos.includes(id) ? votos.filter((v) => v !== id) : [...votos, id];
    setVotos(novo);
    try { localStorage.setItem(CHAVE, JSON.stringify(novo)); } catch { /* ignora */ }
  };

  return (
    <section
      className="min-h-[70vh] bg-[radial-gradient(circle_at_top,var(--color-brand-mint)_0%,#fff_55%)] pb-10 pt-22 sm:pb-16 sm:pt-24 lg:pt-28"
      aria-labelledby="embreve-titulo"
    >
      <Container tamanho="medio">
        <header className="mb-9 flex flex-col items-center gap-2.5 text-center">
          <Badge tom="marca" className="bg-brand text-white">
            <Sparkles size={15} aria-hidden="true" /> Em desenvolvimento
          </Badge>
          <h1 id="embreve-titulo" className="text-2xl font-black text-ink sm:text-4xl">
            Em breve na plataforma
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-ink-soft">
            Novidades que a ACMRB está preparando. Marque as que você mais quer ver primeiro.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECURSOS.map((r, i) => {
            const Icone = r.icone;
            const expandido = aberto === r.id;
            const votado = votos.includes(r.id);
            return (
              <motion.li
                key={r.id}
                className="flex flex-col gap-3 rounded-3xl border border-brand-line/60 bg-white p-4 shadow-[0_16px_36px_-26px_rgb(46_94_78/0.55)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_40px_-24px_rgb(46_94_78/0.6)] motion-reduce:transition-none motion-reduce:hover:transform-none sm:p-5"
                initial={reduzir ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Icone size={24} aria-hidden="true" />
                  </span>
                  <Badge tom="aviso" tamanho="pequeno">
                    {r.etapa}
                  </Badge>
                </div>
                <h2 className="text-lg font-black text-zinc-900">{r.titulo}</h2>
                <p className="flex-1 text-sm leading-relaxed text-zinc-600 texto-justo">{r.resumo}</p>

                <button
                  type="button"
                  className="inline-flex items-center gap-1 self-start text-sm font-extrabold text-brand"
                  aria-expanded={expandido}
                  aria-controls={`embreve-${r.id}`}
                  onClick={() => setAberto(expandido ? null : r.id)}
                >
                  {expandido ? "Menos detalhes" : "O que vai ter"}{" "}
                  <ChevronDown
                    size={16}
                    className={cn("transition-transform duration-200 motion-reduce:transition-none", expandido && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
                <ul
                  id={`embreve-${r.id}`}
                  className={cn("flex-col gap-1.5 rounded-2xl bg-[#f7faf8] py-3 pl-7 pr-4 text-sm text-zinc-700", expandido ? "flex" : "hidden")}
                  hidden={!expandido}
                >
                  {r.detalhes.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-[1.5px] text-sm font-extrabold transition",
                    votado
                      ? "border-brand bg-brand text-white hover:bg-brand-dark"
                      : "border-brand-line/70 text-brand hover:bg-green-50",
                  )}
                  aria-pressed={votado}
                  onClick={() => votar(r.id)}
                >
                  <Heart size={16} aria-hidden="true" /> {votado ? "Você quer esse!" : "Quero esse"}
                </button>
              </motion.li>
            );
          })}
        </ul>

        <p className="mt-8 text-center text-sm text-zinc-600">
          Tem uma ideia?{" "}
          <Link href="/#contato" className="font-extrabold text-brand underline">
            Fale com a gente
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
