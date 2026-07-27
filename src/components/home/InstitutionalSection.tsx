"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Leaf,
  ShieldCheck,
  Handshake,
  FileText,
  MapPin,
  Hash,
  X,
  ArrowRight,
  Users,
  Recycle,
} from "lucide-react";
import { useESGMetrics } from "@/hooks/useESGMetrics";

import "@/styles/institutional-section.css";

type LinkItem = {
  label: string;
  href?: string;
  developing?: boolean;
};

type Group = {
  title: string;
  icon: React.ElementType;
  items: LinkItem[];
};

const groups: Group[] = [
  {
    title: "Quem Somos",
    icon: Building2,
    items: [
      { label: "História da associação", href: "/quem-somos" },
      { label: "Missão e visão", href: "/quem-somos" },
      { label: "Equipe e associados", href: "/associados" },
      { label: "Atuação institucional", href: "/quem-somos" },
    ],
  },
  {
    title: "Sustentabilidade",
    icon: Leaf,
    items: [
      { label: "Logística reversa", href: "/#operacao" },
      { label: "Educação ambiental", developing: true },
      { label: "Economia circular", developing: true },
      { label: "Impacto ESG", href: "/transparencia" },
    ],
  },
  {
    title: "Transparência",
    icon: ShieldCheck,
    items: [
      { label: "Relatórios institucionais", href: "/transparencia" },
      { label: "Projetos e ações", href: "/projetos" },
      { label: "Prestação de contas", href: "/transparencia" },
      { label: "Documentos públicos", developing: true },
    ],
  },
  {
    title: "Parcerias",
    icon: Handshake,
    items: [
      { label: "Empresas parceiras", href: "/#parcerias" },
      { label: "Projetos ambientais", href: "/projetos" },
      { label: "Apoiadores", href: "/#contato" },
      { label: "Parcerias ESG", href: "/#contato" },
    ],
  },
];

const documents = [
  { label: "Estatuto Social", developing: true },
  { label: "Relatório Anual", developing: true },
  { label: "Prestação de Contas", developing: true },
  { label: "Certidões e documentos", developing: true },
];

export default function InstitutionalSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [countdown, setCountdown] = useState(5);

  const { totalPeso, familiasImpactadas, loading } = useESGMetrics();

  useEffect(() => {
    if (!modalOpen) return;

    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setModalOpen(false);
          // Rola até o contato
          const el = document.getElementById("contato");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [modalOpen]);

  const openDeveloping = (title: string) => {
    setModalTitle(title);
    setModalOpen(true);
  };

  return (
    <section className="institutional">
      <div className="institutional__bg" />

      <div className="institutional__container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="institutional__header"
        >
          <span className="institutional__tag">Plataforma Institucional</span>
          <h2 className="institutional__title">
            Transparência, sustentabilidade e impacto social.
          </h2>
          <p className="institutional__description">
            A ACMRB desenvolve ações ambientais, inclusão social, logística
            reversa e iniciativas sustentáveis voltadas para transformação
            ambiental e fortalecimento institucional.
          </p>
        </motion.div>

        {/* Números rápidos */}
        <div className="institutional__stats">
          <div className="institutional__stat">
            <Users size={20} />
            <div>
              <strong>{loading ? "—" : `${familiasImpactadas}+`}</strong>
              <span>Famílias impactadas</span>
            </div>
          </div>
          <div className="institutional__stat">
            <Recycle size={20} />
            <div>
              <strong>{loading ? "—" : `${totalPeso.toFixed(0)}kg`}</strong>
              <span>Material reciclado</span>
            </div>
          </div>
          <div className="institutional__stat">
            <MapPin size={20} />
            <div>
              <strong>Baturité – CE</strong>
              <span>Atuação no Maciço</span>
            </div>
          </div>
        </div>

        {/* Grid de links */}
        <div className="institutional__grid">
          {groups.map((group, index) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="institutional__card"
              >
                <div className="institutional__card-icon">
                  <Icon size={22} />
                </div>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) =>
                    item.developing ? (
                      <li key={item.label}>
                        <button
                          type="button"
                          onClick={() => openDeveloping(item.label)}
                          className="institutional__link"
                        >
                          {item.label}
                        </button>
                      </li>
                    ) : (
                      <li key={item.label}>
                        <Link
                          href={item.href || "#"}
                          className="institutional__link"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Documentos */}
        <div className="institutional__docs">
          <div className="institutional__docs-header">
            <FileText size={22} />
            <h3>Documentos públicos</h3>
          </div>
          <div className="institutional__docs-list">
            {documents.map((doc) => (
              <button
                key={doc.label}
                type="button"
                onClick={() => openDeveloping(doc.label)}
                className="institutional__doc-btn"
              >
                {doc.label}
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* CNPJ / Registro */}
        <div className="institutional__legal">
          <div className="institutional__legal-item">
            <Hash size={18} />
            <div>
              <span>CNPJ</span>
              <strong>62.166.052/0001-90</strong>
            </div>
          </div>
          <div className="institutional__legal-item">
            <MapPin size={18} />
            <div>
              <span>Endereço</span>
              <strong>Rua Kaolim, 252 – Mangá, Baturité/CE</strong>
            </div>
          </div>
          <div className="institutional__legal-item">
            <Building2 size={18} />
            <div>
              <span>Registro</span>
              <strong>Fundada em 10/07/2025</strong>
            </div>
          </div>
        </div>

        {/* CTA */}
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="institutional__cta"
        >
          <div className="institutional__cta-content">
            <span className="institutional__tag">Impacto Ambiental</span>

            <h3>Construindo uma plataforma sustentável para o futuro.</h3>

            <p>
              A ACMRB fortalece ações ambientais, educação sustentável,
              logística reversa, inclusão social e desenvolvimento regional
              através da reciclagem e economia circular.
            </p>

            <p className="institutional__cta-local">
              Atuamos em Baturité e buscamos parcerias em todo o Maciço de
              Baturité e regiões.
            </p>
          </div>

          <div className="institutional__cta-actions">
            <Link href="/quem-somos" className="institutional__btn-primary">
              Conhecer a associação
            </Link>
            <Link
              href="/transparencia"
              className="institutional__btn-secondary"
            >
              Ver transparência
            </Link>
            <a href="#contato" className="institutional__btn-secondary">
              Seja parceiro
            </a>
          </div>
        </motion.div>
      </div>

      {/* Modal Em Desenvolvimento */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="institutional__modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="institutional__modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="institutional__modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>

              <div className="institutional__modal-icon">♻</div>
              <h3>Página em desenvolvimento</h3>
              <p>
                A área <strong>{modalTitle}</strong> ainda está sendo preparada
                com carinho pela equipe ACMRB.
              </p>
              <p className="institutional__modal-sub">
                Em breve você poderá acessar essas informações com total
                transparência.
              </p>
              <p className="institutional__modal-timer">
                Redirecionando em <strong>{countdown}s</strong>...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
