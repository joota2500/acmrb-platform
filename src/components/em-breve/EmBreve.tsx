"use client";

/**
 * EmBreve — recursos planejados da plataforma (/em-breve)
 * ------------------------------------------------------------
 * Só front-end (sem backend). Cada cartão abre/fecha os detalhes e
 * pode ser marcado como "quero esse!" (guardado só no navegador).
 * CSS: src/styles/em-breve.css (prefixo "embreve").
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Award, ChevronDown, Heart, MapPinned, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import "@/styles/em-breve.css";

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
    <section className="embreve" aria-labelledby="embreve-titulo">
      <div className="embreve__container">
        <header className="embreve__topo">
          <span className="embreve__selo"><Sparkles size={15} aria-hidden="true" /> Em desenvolvimento</span>
          <h1 id="embreve-titulo" className="embreve__titulo">Em breve na plataforma</h1>
          <p className="embreve__sub">Novidades que a ACMRB está preparando. Marque as que você mais quer ver primeiro.</p>
        </header>

        <ul className="embreve__grade">
          {RECURSOS.map((r, i) => {
            const Icone = r.icone;
            const expandido = aberto === r.id;
            const votado = votos.includes(r.id);
            return (
              <motion.li
                key={r.id}
                className="embreve__cartao"
                initial={reduzir ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="embreve__cartao-topo">
                  <span className="embreve__icone"><Icone size={24} aria-hidden="true" /></span>
                  <span className="embreve__etapa">{r.etapa}</span>
                </div>
                <h2 className="embreve__nome">{r.titulo}</h2>
                <p className="embreve__resumo">{r.resumo}</p>

                <button type="button" className="embreve__mais" aria-expanded={expandido} aria-controls={`embreve-${r.id}`} onClick={() => setAberto(expandido ? null : r.id)}>
                  {expandido ? "Menos detalhes" : "O que vai ter"} <ChevronDown size={16} aria-hidden="true" />
                </button>
                <ul id={`embreve-${r.id}`} className="embreve__detalhes" hidden={!expandido}>
                  {r.detalhes.map((d) => <li key={d}>{d}</li>)}
                </ul>

                <button type="button" className={`embreve__voto${votado ? " embreve__voto--ativo" : ""}`} aria-pressed={votado} onClick={() => votar(r.id)}>
                  <Heart size={16} aria-hidden="true" /> {votado ? "Você quer esse!" : "Quero esse"}
                </button>
              </motion.li>
            );
          })}
        </ul>

        <p className="embreve__rodape">
          Tem uma ideia? <Link href="/#contato">Fale com a gente</Link>.
        </p>
      </div>
    </section>
  );
}
