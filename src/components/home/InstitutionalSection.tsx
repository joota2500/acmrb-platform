"use client";

/**
 * Seção "Plataforma Institucional" da home.
 *
 * - Números rápidos vêm do banco via useESGMetrics (mesma fonte de antes).
 *   Valor zero aparece como "Em apuração" para não exibir dado falso.
 * - Colunas de links: grade no tablet/desktop e acordeão no celular.
 * - Documentos públicos: lista os publicados em transparencia_documentos;
 *   se a tabela não existir ou estiver vazia, mostra atalhos para
 *   /transparencia#documentos.
 * - Dados oficiais em cards: copiar CNPJ e abrir endereço no Google Maps.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2, Leaf, ShieldCheck, Handshake, FileText, MapPin, Hash,
  ArrowRight, Users, Recycle, ChevronDown, Copy, Check, CalendarDays,
  ExternalLink,
} from "lucide-react";
import { useESGMetrics } from "@/hooks/useESGMetrics";
import { supabase } from "@/lib/supabase";

import "@/styles/institutional-section.css";

type LinkItem = { label: string; href: string };
type Group = { title: string; icon: React.ElementType; items: LinkItem[] };

// Todos os destinos abaixo existem no site (páginas ou âncoras da home).
const groups: Group[] = [
  {
    title: "Quem Somos",
    icon: Building2,
    items: [
      { label: "História da associação", href: "/quem-somos" },
      { label: "Missão e visão", href: "/quem-somos" },
      { label: "Equipe e associados", href: "/associados" },
      { label: "Atuação institucional", href: "/#quem-somos" },
    ],
  },
  {
    title: "Sustentabilidade",
    icon: Leaf,
    items: [
      { label: "Logística reversa", href: "/#logistica-reversa" },
      { label: "Educação ambiental", href: "/#operacao" },
      { label: "Economia circular", href: "/#logistica-reversa" },
      { label: "Impacto ESG", href: "/transparencia#indicadores" },
    ],
  },
  {
    title: "Transparência",
    icon: ShieldCheck,
    items: [
      { label: "Relatórios institucionais", href: "/transparencia#documentos" },
      { label: "Projetos e ações", href: "/projetos" },
      { label: "Prestação de contas", href: "/transparencia#documentos" },
      { label: "Documentos públicos", href: "/transparencia#documentos" },
    ],
  },
  {
    title: "Parcerias",
    icon: Handshake,
    items: [
      { label: "Empresas parceiras", href: "/#parceiros" },
      { label: "Projetos ambientais", href: "/projetos" },
      { label: "Apoiadores", href: "/#parceiros" },
      { label: "Parcerias ESG", href: "/#contato" },
    ],
  },
];

// Atalhos usados quando ainda não há documentos publicados no banco
const docsPadrao = ["Estatuto Social", "Relatório Anual", "Prestação de Contas", "Certidões e documentos"];

type Doc = { id: string; titulo: string; url_arquivo: string; ano: number | null };

const CNPJ = "62.166.052/0001-90";
const ENDERECO = "Rua Kaolim, 252 – Mangá, Baturité/CE";
const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Rua Kaolim, 252, Mangá, Baturité, CE")}`;

export default function InstitutionalSection() {
  const { totalPeso, familiasImpactadas, loading } = useESGMetrics();
  const [aberto, setAberto] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [docs, setDocs] = useState<Doc[]>([]);

  // Busca documentos publicados; qualquer erro mantém o fallback
  useEffect(() => {
    let vivo = true;
    supabase
      .from("transparencia_documentos")
      .select("id, titulo, url_arquivo, ano")
      .eq("publicado", true)
      .order("ano", { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        if (vivo && !error && data) setDocs(data as Doc[]);
      });
    return () => { vivo = false; };
  }, []);

  const copiarCnpj = async () => {
    try {
      await navigator.clipboard.writeText(CNPJ);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* navegador sem permissão de área de transferência */
    }
  };

  const fmt = (v: number, sufixo: string) =>
    loading ? "…" : v > 0 ? `${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}${sufixo}` : "Em apuração";

  const stats = [
    { icon: Users, valor: fmt(familiasImpactadas, "+"), rotulo: "Famílias impactadas" },
    { icon: Recycle, valor: fmt(totalPeso, " kg"), rotulo: "Material reciclado" },
    { icon: MapPin, valor: "Baturité – CE", rotulo: "Atuação no Maciço de Baturité" },
  ];

  return (
    <section className="inst" aria-labelledby="inst-titulo" lang="pt-BR">
      <div className="inst__container">
        {/* Cabeçalho */}
        <motion.header
          className="inst__header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inst__tag">Plataforma Institucional</span>
          <h2 id="inst-titulo" className="inst__title">
            Transparência, sustentabilidade e <span>impacto social</span>
          </h2>
          <p className="inst__description">
            A ACMRB reúne catadores de materiais recicláveis de Baturité em uma
            organização formal, com registro, prestação de contas e parcerias
            com indústrias, empresas e poder público. Aqui você encontra os
            principais caminhos para conhecer a associação, acompanhar os
            dados públicos e propor parcerias.
          </p>
        </motion.header>

        {/* Números rápidos */}
        <ul className="inst__stats" aria-label="Números da associação">
          {stats.map(({ icon: Icon, valor, rotulo }) => (
            <li key={rotulo} className="inst__stat">
              <span className="inst__stat-icon" aria-hidden><Icon size={20} /></span>
              <div>
                <strong>{valor}</strong>
                <span>{rotulo}</span>
              </div>
            </li>
          ))}
        </ul>

        {/* Links: grade no desktop/tablet, acordeão no celular */}
        <nav className="inst__grid" aria-label="Navegação institucional">
          {groups.map(({ title, icon: Icon, items }) => {
            const isOpen = aberto === title;
            const idLista = `inst-lista-${title.replace(/\s/g, "-").toLowerCase()}`;
            return (
              <div key={title} className={`inst__card${isOpen ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="inst__card-head"
                  aria-expanded={isOpen}
                  aria-controls={idLista}
                  onClick={() => setAberto(isOpen ? null : title)}
                >
                  <span className="inst__card-icon" aria-hidden><Icon size={20} /></span>
                  <h3>{title}</h3>
                  <ChevronDown className="inst__chevron" size={18} aria-hidden />
                </button>
                <ul id={idLista} className="inst__links">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="inst__link">
                        <ArrowRight size={14} aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Documentos públicos */}
        <div className="inst__docs">
          <div className="inst__docs-head">
            <span className="inst__card-icon" aria-hidden><FileText size={20} /></span>
            <div>
              <h3>Documentos públicos</h3>
              <p>Estatuto, relatórios e prestação de contas disponíveis para consulta.</p>
            </div>
            <Link href="/transparencia#documentos" className="inst__docs-all">
              Ver todos <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <ul className="inst__docs-list">
            {docs.length > 0
              ? docs.map((d) => (
                  <li key={d.id}>
                    <a href={d.url_arquivo} target="_blank" rel="noopener noreferrer" className="inst__doc">
                      <span>{d.titulo}{d.ano ? ` (${d.ano})` : ""}</span>
                      <ExternalLink size={15} aria-hidden />
                    </a>
                  </li>
                ))
              : docsPadrao.map((t) => (
                  <li key={t}>
                    <Link href="/transparencia#documentos" className="inst__doc">
                      <span>{t}</span>
                      <ArrowRight size={15} aria-hidden />
                    </Link>
                  </li>
                ))}
          </ul>
        </div>

        {/* Dados oficiais */}
        <ul className="inst__legal" aria-label="Dados oficiais">
          <li className="inst__legal-item">
            <span className="inst__legal-icon" aria-hidden><Hash size={18} /></span>
            <div>
              <span>CNPJ</span>
              <strong>{CNPJ}</strong>
            </div>
            <button type="button" className="inst__legal-btn" onClick={copiarCnpj} aria-label="Copiar CNPJ">
              {copiado ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiado ? "Copiado" : "Copiar"}</span>
            </button>
          </li>
          <li className="inst__legal-item">
            <span className="inst__legal-icon" aria-hidden><MapPin size={18} /></span>
            <div>
              <span>Endereço</span>
              <strong>{ENDERECO}</strong>
            </div>
            <a href={MAPS} target="_blank" rel="noopener noreferrer" className="inst__legal-btn" aria-label="Abrir endereço no Google Maps">
              <ExternalLink size={16} />
              <span>Mapa</span>
            </a>
          </li>
          <li className="inst__legal-item">
            <span className="inst__legal-icon" aria-hidden><CalendarDays size={18} /></span>
            <div>
              <span>Registro</span>
              <strong>Fundada em 10/07/2025</strong>
            </div>
          </li>
        </ul>

        {/* Chamada final */}
        <motion.div
          className="inst__cta"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h3>Construindo uma reciclagem mais justa no Maciço de Baturité</h3>
            <p>
              Fortalecemos a coleta seletiva, a logística reversa e o trabalho
              digno dos catadores. Conheça a associação, acompanhe os dados
              públicos ou fale com a gente para firmar uma parceria.
            </p>
          </div>
          <div className="inst__cta-actions">
            <Link href="/quem-somos" className="inst__btn inst__btn--primary">Conhecer a associação</Link>
            <Link href="/transparencia" className="inst__btn">Ver transparência</Link>
            <Link href="/#contato" className="inst__btn">Seja parceiro</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
