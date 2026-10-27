"use client";

/**
 * Rodapé institucional da ACMRB
 * ------------------------------------------------------------
 * Compacto, no padrão das seções recentes. Dados de contato vêm de
 * src/lib/contatoInstitucional.ts. No celular, as colunas de links
 * viram acordeão (<details>) para economizar espaço.
 * CSS em src/styles/footer.css (prefixo "footer__").
 */

import Link from "next/link";
import { ArrowUp, AtSign, FileText, Mail, MapPin, MessageCircle } from "lucide-react";

import {
  CONTATO,
  linkEmail,
  linkInstagram,
  linkMapaBusca,
  linkWhatsApp,
} from "@/lib/contatoInstitucional";
import "@/styles/footer.css";

type Item = { rotulo: string; href: string };

const COLUNAS: { titulo: string; itens: Item[] }[] = [
  {
    titulo: "Institucional",
    itens: [
      { rotulo: "Quem Somos", href: "/quem-somos" },
      { rotulo: "Associados", href: "/associados" },
      { rotulo: "Projetos", href: "/projetos" },
      { rotulo: "Notícias", href: "/noticias" },
      { rotulo: "Transparência", href: "/transparencia" },
    ],
  },
  {
    titulo: "Sustentabilidade",
    itens: [
      { rotulo: "Logística Reversa", href: "/#logistica-reversa" },
      { rotulo: "Educação Ambiental", href: "/#operacao" },
      { rotulo: "Economia Circular", href: "/#logistica-reversa" },
      { rotulo: "Indicadores ESG", href: "/transparencia#indicadores" },
    ],
  },
  {
    titulo: "Participe",
    itens: [
      { rotulo: "Agendar coleta", href: "/agendar-coleta" },
      { rotulo: "Calendário de coleta", href: "/calendario-coleta" },
      { rotulo: "Mapa de apoiadores", href: "/#parceiros" },
      { rotulo: "Parceiros", href: "/parceiros" },
      { rotulo: "Denúncia ambiental", href: "/#denuncias" },
      { rotulo: "Contato", href: "/#contato" },
    ],
  },
];

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="footer" lang="pt-BR">
      <div className="footer__container">
        <div className="footer__top">
          {/* Marca */}
          <div className="footer__brand">
            <Link href="/" className="footer__logo" aria-label="ACMRB — página inicial">
              <span className="footer__logo-icon" aria-hidden>♻</span>
              <span>
                <strong className="footer__logo-title">ACMRB</strong>
                <span className="footer__logo-sub">Associação dos Catadores</span>
              </span>
            </Link>
            <p className="footer__description">
              Associação dos Catadores de Materiais Recicláveis de Baturité, atuando em
              sustentabilidade, inclusão social e logística reversa.
            </p>
            <div className="footer__social">
              <a href={linkInstagram()} target="_blank" rel="noopener noreferrer"
                aria-label={`Instagram @${CONTATO.instagramUsuario} (abre em nova aba)`}>
                <AtSign size={16} aria-hidden />
              </a>
              <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp (abre em nova aba)">
                <MessageCircle size={16} aria-hidden />
              </a>
              <a href={linkEmail()} aria-label={`E-mail ${CONTATO.email}`}>
                <Mail size={16} aria-hidden />
              </a>
            </div>
          </div>

          {/* Colunas de links */}
          <nav className="footer__nav" aria-label="Links do rodapé">
            {COLUNAS.map((col) => (
              <details key={col.titulo} className="footer__column" open>
                <summary className="footer__column-title">{col.titulo}</summary>
                <ul className="footer__links">
                  {col.itens.map((i) => (
                    <li key={i.rotulo}><Link href={i.href}>{i.rotulo}</Link></li>
                  ))}
                </ul>
              </details>
            ))}
          </nav>

          {/* Contato */}
          <address className="footer__contact">
            <span className="footer__column-title">Contato</span>
            <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" className="footer__contact-item">
              <MessageCircle size={15} aria-hidden /> {CONTATO.whatsappExibicao}
            </a>
            <a href={linkEmail()} className="footer__contact-item">
              <Mail size={15} aria-hidden /> {CONTATO.email}
            </a>
            <a href={linkMapaBusca()} target="_blank" rel="noopener noreferrer" className="footer__contact-item">
              <MapPin size={15} aria-hidden /> {CONTATO.endereco}
            </a>
            <span className="footer__contact-item">
              <FileText size={15} aria-hidden /> CNPJ {CONTATO.cnpj}
            </span>
          </address>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {ano} ACMRB — Associação dos Catadores de Materiais Recicláveis de Baturité.
            Todos os direitos reservados.
          </p>
          <p className="footer__dev">
            Desenvolvido por{" "}
            <a href="https://github.com/joota2500" target="_blank" rel="noopener noreferrer">DevJ-2500</a>
            {/* Link discreto para a página de recursos planejados */}
            <span aria-hidden="true"> · </span>
            <Link href="/em-breve" className="footer__embreve">Em breve</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/privacidade" className="footer__embreve">Privacidade</Link>
          </p>
          <button type="button" className="footer__topo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Voltar ao topo da página">
            <ArrowUp size={15} aria-hidden />
            <span>Topo</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
