"use client";

import Link from "next/link";
import { ArrowUp, AtSign, Globe, Mail, MapPin, Phone } from "lucide-react";

import { CONTATO } from "@/lib/contatoInstitucional";
import "@/styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__bg" />

      <div className="footer__container">
        {/* TOP */}
        <div className="footer__top">
          {/* BRAND */}
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon">♻</div>
              <div>
                <h3>ACMRB</h3>
                <p>Plataforma ESG Institucional</p>
              </div>
            </div>

            <p className="footer__description">
              Associação dos Catadores de Materiais Recicláveis de Baturité
              atuando em sustentabilidade, inclusão social e logística reversa.
            </p>
          </div>

          {/* INSTITUCIONAL */}
          <div className="footer__column">
            <h4>Institucional</h4>
            <div className="footer__links">
              <Link href="/quem-somos">Quem Somos</Link>
              <Link href="/#projetos">Projetos</Link>
              <Link href="/#transparencia">Transparência</Link>
              <Link href="/noticias">Notícias</Link>
            </div>
          </div>

          {/* SUSTENTABILIDADE */}
          <div className="footer__column">
            <h4>Sustentabilidade</h4>
            <div className="footer__links">
              <Link href="/#projetos">Logística Reversa</Link>
              <Link href="/#projetos">Educação Ambiental</Link>
              <Link href="/#projetos">Economia Circular</Link>
              <Link href="/#transparencia">Indicadores ESG</Link>
            </div>
          </div>

          {/* CONTATO */}
          <div className="footer__column">
            <h4>Contato</h4>
            <div className="footer__contact">
              <div className="footer__contact-item">
                <Phone size={20} />
                <div>
                  <span>WhatsApp</span>
                  <p>{CONTATO.whatsappExibicao}</p>
                </div>
              </div>

              <div className="footer__contact-item">
                <Mail size={20} />
                <div>
                  <span>E-mail</span>
                  <p>reciclae25@gmail.com</p>
                </div>
              </div>

              <div className="footer__contact-item">
                <MapPin size={20} />
                <div>
                  <span>Localização</span>
                  <p>Baturité • Ceará</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} ACMRB — Associação dos Catadores de Materiais Recicláveis de
            Baturité. Todos os direitos reservados.
          </p>

          <div className="footer__dev">
            <p>
              Desenvolvido por <span>DevJ-2500</span>
            </p>

            <div className="footer__social">
              <a
                href="https://www.instagram.com/devjunior2500"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <AtSign size={18} />
              </a>
              <a
                href="https://github.com/joota2500"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Globe size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Botão voltar ao topo */}
        <button
          type="button"
          className="footer__topo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo da página"
        >
          <ArrowUp size={18} aria-hidden />
          <span>Voltar ao topo</span>
        </button>
      </div>
    </footer>
  );
}
