"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/layout/Footer";
import InstitutionalSection from "@/components/home/InstitutionalSection";

import {
  ArrowLeft,
  ArrowRight,
  Recycle,
  Users,
  HeartHandshake,
  Globe,
  PlayCircle,
  ShieldCheck,
  Building2,
  Leaf,
  Award,
  BadgeCheck,
  Sparkles,
  Clock3,
  ChevronRight,
  Handshake,
  Heart,
  Scale,
  Sun,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import "@/styles/quem-somos.css";

type Associado = {
  id: string;
  nome: string;
  cargo: string;
  tipo_associado: string;
  foto_url?: string;
  bio?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  ativo?: boolean;
  destaque?: boolean;
  slug?: string;
};

export default function QuemSomosPage() {
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [totalAssociados, setTotalAssociados] = useState(0);
  const [loading, setLoading] = useState(true);

  async function carregarAssociados() {
    try {
      setLoading(true);

      const { data } = await supabase
        .from("associados")
        .select("*")
        .eq("ativo", true)
        .order("destaque", { ascending: false })
        .limit(4);

      setAssociados((data as Associado[]) || []);

      const { count } = await supabase
        .from("associados")
        .select("*", { count: "exact", head: true });

      setTotalAssociados(count || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAssociados();
  }, []);

  return (
    <main className="qs-page">
      {/* ==================== HERO ==================== */}
      <section className="qs-hero">
        <div className="qs-hero-bg" />
        <div className="qs-hero-blob" />

        <div className="qs-container">
          <Link href="/" className="qs-back">
            <ArrowLeft size={18} />
            Voltar para início
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="qs-hero-card"
          >
            <div className="qs-hero-grid">
              <div className="qs-hero-content">
                <div className="qs-badge">
                  <Recycle size={18} />
                  Associação Reciclaê • ACMRB
                </div>

                <h1 className="qs-title">
                  Transformando vidas através da reciclagem, dignidade e
                  inclusão social.
                </h1>

                <p className="qs-text">
                  A Associação dos Catadores de Materiais Recicláveis de
                  Baturité nasceu da luta diária de trabalhadores que
                  sobreviveram durante anos em condições extremamente difíceis
                  no antigo lixão municipal.
                </p>

                <p className="qs-text" style={{ marginTop: "1.25rem" }}>
                  Hoje a ACMRB representa uma nova oportunidade para dezenas de
                  famílias que buscam renda, reconhecimento, estrutura, inclusão
                  social e valorização do trabalho ambiental.
                </p>

                <div className="qs-tags">
                  <div className="qs-tag">
                    <ShieldCheck size={16} />
                    Projeto ESG
                  </div>
                  <div className="qs-tag">
                    <Sparkles size={16} />
                    Inclusão social
                  </div>
                  <div className="qs-tag">
                    <Leaf size={16} />
                    Sustentabilidade
                  </div>
                </div>

                {/* Contadores - dados do banco */}
                <div className="qs-stats">
                  <div className="qs-stat">
                    <Users size={24} />
                    <h3>{totalAssociados}+</h3>
                    <p>Associados</p>
                  </div>
                  <div className="qs-stat">
                    <HeartHandshake size={24} />
                    <h3>30+</h3>
                    <p>Famílias impactadas</p>
                  </div>
                  <div className="qs-stat">
                    <Recycle size={24} />
                    <h3>ESG</h3>
                    <p>Sustentabilidade</p>
                  </div>
                  <div className="qs-stat">
                    <Leaf size={24} />
                    <h3>2025</h3>
                    <p>Fundação</p>
                  </div>
                </div>

                <div className="qs-actions">
                  <a href="#associados" className="qs-btn-primary">
                    Conhecer associados
                    <ArrowRight size={18} />
                  </a>
                  <Link href="/#contato" className="qs-btn-secondary">
                    Seja parceiro
                  </Link>
                </div>
              </div>

              <div className="qs-hero-image">
                <Image
                  src="/images/acmrb-hero.jpg"
                  alt="ACMRB"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="qs-hero-overlay" />
                <div className="qs-quote">
                  <p>
                    “A reciclagem mudou não apenas o meio ambiente, mas também a
                    história de dezenas de famílias em Baturité.”
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== NOSSA HISTÓRIA (TIMELINE) ==================== */}
      <section className="qs-section">
        <div className="qs-section-header">
          <span className="qs-section-label">Nossa História</span>
          <h2 className="qs-section-title">
            Da luta no lixão à construção de um futuro digno
          </h2>
          <p className="qs-section-desc">
            Uma trajetória marcada pela resistência, organização e esperança dos
            catadores de Baturité.
          </p>
        </div>

        <div className="qs-timeline">
          {/* Item 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="qs-timeline-item"
          >
            <div className="qs-timeline-dot" />
            <div className="qs-timeline-content">
              <span className="qs-timeline-year">Décadas anteriores</span>
              <h3>Trabalho no lixão a céu aberto</h3>
              <p>
                Por muitos anos, dezenas de famílias sobreviveram coletando
                materiais recicláveis no antigo lixão municipal de Baturité,
                enfrentando condições precárias, riscos à saúde e falta de
                estrutura.
              </p>
            </div>
          </motion.div>

          {/* Item 2 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="qs-timeline-item"
          >
            <div className="qs-timeline-dot" />
            <div className="qs-timeline-content">
              <span className="qs-timeline-year">Processo de organização</span>
              <h3>A união dos catadores</h3>
              <p>
                Com o apoio da Secretaria de Meio Ambiente, Autarquia Municipal
                e parceiros, os catadores começaram a se organizar, buscando
                reconhecimento, dignidade e melhores condições de trabalho.
              </p>
            </div>
          </motion.div>

          {/* Item 3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="qs-timeline-item"
          >
            <div className="qs-timeline-dot" />
            <div className="qs-timeline-content">
              <span className="qs-timeline-year">2024 – 2025</span>
              <h3>Fechamento do lixão e transição</h3>
              <p>
                Com a inauguração do Aterro Sanitário Regional do Maciço de
                Baturité (2024) e o processo de desativação do antigo lixão, os
                catadores iniciaram a transição para um modelo mais organizado e
                sustentável de coleta e triagem.
              </p>
            </div>
          </motion.div>

          {/* Item 4 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="qs-timeline-item"
          >
            <div className="qs-timeline-dot qs-timeline-dot--active" />
            <div className="qs-timeline-content">
              <span className="qs-timeline-year">10 de julho de 2025</span>
              <h3>Fundação oficial da ACMRB</h3>
              <p>
                Nasce formalmente a Associação dos Catadores de Materiais
                Recicláveis de Baturité (ACMRB – Reciclaê), consolidando a luta
                por inclusão social, renda digna e valorização do trabalho
                ambiental.
              </p>
            </div>
          </motion.div>

          {/* Item 5 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="qs-timeline-item"
          >
            <div className="qs-timeline-dot" />
            <div className="qs-timeline-content">
              <span className="qs-timeline-year">Hoje e amanhã</span>
              <h3>Construindo o futuro</h3>
              <p>
                A ACMRB segue fortalecendo a coleta seletiva, a educação
                ambiental, as parcerias ESG e a geração de renda para as
                famílias associadas, transformando a realidade de Baturité.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== NOSSOS VALORES ==================== */}
      <section className="qs-section">
        <div className="qs-section-header">
          <span className="qs-section-label">Nossos Valores</span>
          <h2 className="qs-section-title">O que nos guia todos os dias</h2>
        </div>

        <div className="qs-valores-grid">
          <Link href="/valores" className="qs-valor-card">
            <div className="qs-valor-icon">
              <Heart size={28} />
            </div>
            <h3>Dignidade</h3>
            <p>Valorizamos cada trabalhador e sua história de vida.</p>
          </Link>

          <Link href="/valores" className="qs-valor-card">
            <div className="qs-valor-icon">
              <Leaf size={28} />
            </div>
            <h3>Sustentabilidade</h3>
            <p>Cuidamos do meio ambiente e do futuro das próximas gerações.</p>
          </Link>

          <Link href="/valores" className="qs-valor-card">
            <div className="qs-valor-icon">
              <Handshake size={28} />
            </div>
            <h3>Inclusão</h3>
            <p>Promovemos oportunidades reais de renda e reconhecimento.</p>
          </Link>

          <Link href="/valores" className="qs-valor-card">
            <div className="qs-valor-icon">
              <Scale size={28} />
            </div>
            <h3>Transparência</h3>
            <p>Atuamos com clareza, ética e responsabilidade social.</p>
          </Link>

          <Link href="/valores" className="qs-valor-card">
            <div className="qs-valor-icon">
              <Users size={28} />
            </div>
            <h3>Trabalho Coletivo</h3>
            <p>A união dos catadores é a base de toda a nossa força.</p>
          </Link>

          <Link href="/valores" className="qs-valor-card">
            <div className="qs-valor-icon">
              <Sun size={28} />
            </div>
            <h3>Educação Ambiental</h3>
            <p>
              Conscientizamos a comunidade sobre a importância da reciclagem.
            </p>
          </Link>
        </div>
      </section>

      {/* ==================== ASSOCIADOS ==================== */}
      <section id="associados" className="qs-section">
        <div className="qs-associados-header">
          <div>
            <span className="qs-section-label">Associados</span>
            <h2 className="qs-section-title">
              Pessoas que fazem a diferença todos os dias.
            </h2>
            <p className="qs-section-desc">
              Conheça alguns dos associados que contribuem diariamente para o
              fortalecimento ambiental, social e operacional da ACMRB.
            </p>
          </div>

          <Link href="/associados" className="qs-btn-primary">
            Ver todos os associados
            <ChevronRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="qs-loading">Carregando associados...</div>
        ) : (
          <div className="qs-associados-grid">
            {associados.map((item) => (
              <Link
                key={item.id}
                href={`/associados/${item.slug}`}
                className="qs-associado-card"
              >
                <div className="qs-associado-image">
                  <img src={item.foto_url} alt={item.nome} />
                  {item.destaque && (
                    <span className="qs-destaque">Destaque</span>
                  )}
                </div>
                <div className="qs-associado-body">
                  <h3>{item.nome}</h3>
                  <p className="qs-cargo">{item.cargo}</p>
                  <p className="qs-tipo">{item.tipo_associado}</p>
                  <span className="qs-ver-perfil">
                    Ver perfil completo
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ==================== IMPACTO ESG ==================== */}
      <section className="qs-section">
        <div className="qs-esg-wrapper">
          <div className="qs-esg-header">
            <div>
              <span className="qs-section-label">Impacto ESG</span>
              <h2 className="qs-section-title">
                Resultados ambientais e sociais.
              </h2>
            </div>
            <p className="qs-section-desc">
              A ACMRB atua diretamente na valorização humana, reciclagem,
              logística reversa, educação ambiental e redução de impactos
              ambientais no município de Baturité.
            </p>
          </div>

          <div className="qs-esg-grid">
            <div className="qs-esg-card">
              <Recycle size={28} />
              <h3>+12T</h3>
              <p>Materiais recicláveis destinados corretamente.</p>
            </div>
            <div className="qs-esg-card">
              <Users size={28} />
              <h3>30+</h3>
              <p>Famílias impactadas diretamente pela associação.</p>
            </div>
            <div className="qs-esg-card">
              <Leaf size={28} />
              <h3>ESG</h3>
              <p>
                Sustentabilidade, inclusão social e responsabilidade ambiental.
              </p>
            </div>
            <div className="qs-esg-card">
              <Award size={28} />
              <h3>2026</h3>
              <p>Expansão institucional, parcerias e novos projetos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== AÇÕES FUTURAS ==================== */}
      <section className="qs-section">
        <div className="qs-future">
          <span className="qs-future-badge">
            <Sparkles size={16} />
            Próximos passos
          </span>

          <h2>Expansão institucional e novas ações ambientais.</h2>

          <p>
            A ACMRB busca ampliar sua atuação com educação ambiental, coleta
            seletiva, novas parcerias ESG, capacitações técnicas,
            profissionalização operacional e fortalecimento da economia circular
            em Baturité.
          </p>

          <div className="qs-future-grid">
            <div className="qs-future-item">
              <BadgeCheck size={22} />
              <h3>Educação ambiental</h3>
            </div>
            <div className="qs-future-item">
              <ShieldCheck size={22} />
              <h3>Projetos ESG</h3>
            </div>
            <div className="qs-future-item">
              <Recycle size={22} />
              <h3>Coleta seletiva</h3>
            </div>
            <div className="qs-future-item">
              <Building2 size={22} />
              <h3>Novas parcerias</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== VÍDEO ==================== */}
      <section className="qs-section">
        <div className="qs-video-wrapper">
          <div className="qs-video-header">
            <div className="qs-video-label">
              <PlayCircle size={20} />
              Vídeo institucional
            </div>
            <h2>Conheça mais sobre a ACMRB.</h2>
          </div>
          <div className="qs-video">
            <iframe
              src="https://www.youtube.com/embed/ITur0JNJZos"
              title="Vídeo ACMRB"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ==================== INSTAGRAM ==================== */}
      <section className="qs-section">
        <div className="qs-instagram-header">
          <div>
            <span className="qs-section-label">Instagram</span>
            <h2 className="qs-section-title">
              Acompanhe nossas ações ambientais.
            </h2>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="qs-btn-dark"
          >
            <Globe size={18} />
            Ver Instagram
          </a>
        </div>

        <div className="qs-instagram-grid">
          <iframe src="https://www.instagram.com/p/DYcEwegMSmg/embed" />
          <iframe src="https://www.instagram.com/reel/DX4O5DgtuE3/embed" />
          <iframe src="https://www.instagram.com/p/DW90q-MF38J/embed" />
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <Footer />
    </main>
  );
}
