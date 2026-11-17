"use client";

/**
 * InstitutionalSection — "Plataforma Institucional" (página inicial)
 * ------------------------------------------------------------
 * O que mostra:
 *  - Números rápidos (famílias, material reciclado e local de atuação).
 *  - 4 grupos de links (Quem Somos, Sustentabilidade, Transparência,
 *    Parcerias): grade no tablet/desktop e sanfona (abre e fecha) no celular.
 *  - Documentos públicos (lidos da tabela transparencia_documentos do
 *    Supabase; se não houver, mostra uma lista padrão).
 *  - Dados oficiais: CNPJ (com botão de copiar), endereço e fundação.
 *  - Faixa de chamada com 3 botões.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2, Leaf, ShieldCheck, Handshake, FileText, MapPin, Hash,
  ArrowRight, Users, Recycle, ChevronDown, Copy, Check, CalendarDays,
  ExternalLink,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useAparecer } from "@/hooks/useAparecer";
import { useESGMetrics } from "@/hooks/useESGMetrics";
import { supabase } from "@/lib/supabase";
import { CONTATO, linkMapaBusca } from "@/constants/contato";
import { cn } from "@/utils/cn";
import FaixaCta from "./FaixaCta";
import TituloSecao from "./TituloSecao";

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

// Dados oficiais centralizados em src/constants/contato.ts
const CNPJ = CONTATO.cnpj;
const ENDERECO = CONTATO.endereco;
const MAPS = linkMapaBusca();

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

  const aparecer = useAparecer();

  // classe dos botõezinhos "Copiar" e "Mapa" da parte de dados oficiais
  const botaoMini =
    "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand/20 bg-white px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-brand-soft";

  return (
    <section className="bg-surface-alt py-16 sm:py-20 lg:py-24" aria-labelledby="inst-titulo" lang="pt-BR">
      <Container>
        {/* ===== Cabeçalho ===== */}
        <motion.div {...aparecer()}>
          <TituloSecao
            id="inst-titulo"
            etiqueta="Plataforma Institucional"
            titulo={
              <>
                Transparência, sustentabilidade e <span>impacto social</span>
              </>
            }
            descricao="A ACMRB reúne catadores de materiais recicláveis de Baturité em uma organização formal, com registro, prestação de contas e parcerias com indústrias, empresas e poder público. Aqui você encontra os principais caminhos para conhecer a associação, acompanhar os dados públicos e propor parcerias."
          />
        </motion.div>

        {/* ===== Números rápidos ===== */}
        <ul className="mb-8 grid gap-4 md:grid-cols-3" aria-label="Números da associação">
          {stats.map(({ icon: Icon, valor, rotulo }, i) => (
            <motion.li
              key={rotulo}
              {...aparecer(0.06 * i)}
              className="flex items-center gap-4 rounded-card border border-black/5 bg-white p-5 shadow-card"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-mint text-leaf" aria-hidden="true">
                <Icon size={22} />
              </span>
              <div>
                <strong className="block text-xl font-black text-brand">{valor}</strong>
                <span className="text-sm text-ink-soft">{rotulo}</span>
              </div>
            </motion.li>
          ))}
        </ul>

        {/* ===== Grupos de links: grade (md+) e sanfona (celular) ===== */}
        <nav className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Navegação institucional">
          {groups.map(({ title, icon: Icon, items }) => {
            const isOpen = aberto === title;
            const idLista = `inst-lista-${title.replace(/\s/g, "-").toLowerCase()}`;
            return (
              <div key={title} className="rounded-card border border-black/5 bg-white p-5 shadow-card">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={idLista}
                  onClick={() => setAberto(isOpen ? null : title)}
                  className="flex w-full items-center gap-3 text-left sm:cursor-default"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white" aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <h3 className="flex-1 text-lg font-black text-ink">{title}</h3>
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={cn("text-ink-muted transition sm:hidden", isOpen && "rotate-180")}
                  />
                </button>
                {/* no celular só aparece aberto; do tablet para cima sempre aparece */}
                <ul id={idLista} className={cn("mt-4 space-y-1 border-t border-line pt-3", !isOpen && "max-sm:hidden")}>
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-soft hover:text-brand"
                      >
                        <ArrowRight size={14} aria-hidden="true" className="text-leaf-bright transition group-hover:translate-x-1" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* ===== Documentos públicos ===== */}
        <motion.div {...aparecer()} className="mt-8 rounded-card border border-black/5 bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-mint text-leaf" aria-hidden="true">
              <FileText size={22} />
            </span>
            <div className="min-w-0 flex-1 basis-48">
              <h3 className="text-lg font-black text-ink">Documentos públicos</h3>
              <p className="text-sm text-ink-soft">Estatuto, relatórios e prestação de contas disponíveis para consulta.</p>
            </div>
            <Link href="/transparencia#documentos" className="inline-flex items-center gap-1.5 text-sm font-bold text-leaf hover:underline max-sm:w-full">
              Ver todos <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {docs.length > 0
              ? docs.map((d) => (
                  <li key={d.id}>
                    <a
                      href={d.url_arquivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-leaf-bright hover:bg-brand-soft"
                    >
                      <span>{d.titulo}{d.ano ? ` (${d.ano})` : ""}</span>
                      <ExternalLink size={15} aria-hidden="true" className="shrink-0 text-leaf" />
                    </a>
                  </li>
                ))
              : docsPadrao.map((t) => (
                  <li key={t}>
                    <Link
                      href="/transparencia#documentos"
                      className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-leaf-bright hover:bg-brand-soft"
                    >
                      <span>{t}</span>
                      <ArrowRight size={15} aria-hidden="true" className="shrink-0 text-leaf" />
                    </Link>
                  </li>
                ))}
          </ul>
        </motion.div>

        {/* ===== Dados oficiais ===== */}
        <ul className="mt-6 grid gap-4 lg:grid-cols-3" aria-label="Dados oficiais">
          <li className="flex items-center gap-3 rounded-card border border-black/5 bg-white p-5 shadow-card">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand" aria-hidden="true">
              <Hash size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">CNPJ</span>
              <strong className="block truncate text-ink">{CNPJ}</strong>
            </div>
            <button type="button" className={botaoMini} onClick={copiarCnpj} aria-label="Copiar CNPJ">
              {copiado ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {copiado ? "Copiado" : "Copiar"}
            </button>
          </li>

          <li className="flex items-center gap-3 rounded-card border border-black/5 bg-white p-5 shadow-card">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand" aria-hidden="true">
              <MapPin size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Endereço</span>
              <strong className="block text-sm leading-snug text-ink">{ENDERECO}</strong>
            </div>
            <a href={MAPS} target="_blank" rel="noopener noreferrer" className={botaoMini} aria-label="Abrir endereço no Google Maps">
              <ExternalLink size={14} aria-hidden="true" /> Mapa
            </a>
          </li>

          <li className="flex items-center gap-3 rounded-card border border-black/5 bg-white p-5 shadow-card">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand" aria-hidden="true">
              <CalendarDays size={18} />
            </span>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Registro</span>
              <strong className="block text-ink">Fundada em 10/07/2025</strong>
            </div>
          </li>
        </ul>

        {/* ===== Chamada final ===== */}
        <motion.div {...aparecer(0.1)}>
          <FaixaCta
            titulo="Construindo uma reciclagem mais justa no Maciço de Baturité"
            texto="Fortalecemos a coleta seletiva, a logística reversa e o trabalho digno dos catadores. Conheça a associação, acompanhe os dados públicos ou fale com a gente para firmar uma parceria."
          >
            <Button href="/quem-somos" variante="claro" tamanho="grande">Conhecer a associação</Button>
            <Button href="/transparencia" variante="contornoClaro" tamanho="grande">Ver transparência</Button>
            <Button href="/#contato" variante="contornoClaro" tamanho="grande">Seja parceiro</Button>
          </FaixaCta>
        </motion.div>
      </Container>
    </section>
  );
}
