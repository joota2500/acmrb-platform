"use client";

/**
 * DenunciasSection — "Denúncia Ambiental" (página inicial, id="denuncias")
 * ------------------------------------------------------------
 * A ACMRB não possui sistema próprio de denúncias. Esta seção orienta o
 * visitante e o direciona ao sistema oficial da AMAB (Autarquia Municipal
 * de Meio Ambiente de Baturité), que recebe e acompanha as denúncias.
 *
 * O que mostra:
 *  1. Cabeçalho: selo, título (parte em verde) e apresentação.
 *  2. O que pode ser denunciado (6 tipos genéricos de meio ambiente).
 *  3. Passo a passo em 4 etapas (linha do tempo).
 *  4. Dicas para uma boa denúncia + aviso de emergência (193).
 *  5. CTA para o sistema oficial (nova aba) e nota sobre o papel da ACMRB.
 *
 * Dados: conteúdo fixo, sem números ou telefones inventados (193 é o
 * número nacional do Corpo de Bombeiros).
 * Classes com prefixo "denun__" para não conflitar com outras seções.
 *
 * Responsividade (src/styles/denuncias-section.css):
 *  - Celular (≤480px): 1 coluna, compacto, fontes menores.
 *  - Tablet (481–1024px): 2 colunas.
 *  - Desktop (>1024px): 3 colunas; etapas em 4 colunas.
 * Animações: Framer Motion leve, desligadas com "reduzir movimento".
 */

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Axe,
  Camera,
  CalendarClock,
  ClipboardCheck,
  Droplets,
  ExternalLink,
  FileText,
  Flame,
  Info,
  MapPin,
  MousePointerClick,
  PawPrint,
  Phone,
  ShieldCheck,
  Trash2,
  Wind,
} from "lucide-react";

import "@/styles/denuncias-section.css";

/** Endereço oficial do sistema de denúncias da AMAB */
const AMAB_DENUNCIA_URL =
  "https://digital.acidadao.com.br/amabaturite/ambiental/denuncia";

const tipos = [
  {
    icon: Trash2,
    title: "Descarte irregular de lixo",
    text: "Entulho, lixo doméstico ou resíduos jogados em ruas, terrenos baldios e áreas públicas.",
  },
  {
    icon: Flame,
    title: "Queimadas",
    text: "Queima de lixo, de vegetação ou de materiais a céu aberto sem autorização.",
  },
  {
    icon: Droplets,
    title: "Poluição de rios e açudes",
    text: "Despejo de esgoto, óleo, produtos químicos ou resíduos em corpos d'água.",
  },
  {
    icon: Axe,
    title: "Desmatamento",
    text: "Corte ou supressão de vegetação nativa, inclusive em áreas protegidas da serra.",
  },
  {
    icon: Wind,
    title: "Outras poluições",
    text: "Poluição do ar, sonora ou do solo que prejudique o meio ambiente e a comunidade.",
  },
  {
    icon: PawPrint,
    title: "Fauna e animais",
    text: "Maus-tratos, captura ou comércio irregular de animais silvestres.",
  },
];

const passos = [
  {
    icon: MousePointerClick,
    title: "Acesse o sistema",
    text: "Clique no botão abaixo para abrir o sistema oficial de denúncias da AMAB.",
  },
  {
    icon: FileText,
    title: "Descreva o ocorrido",
    text: "Informe o tipo de problema e conte com clareza o que está acontecendo.",
  },
  {
    icon: Camera,
    title: "Anexe fotos e local",
    text: "Envie imagens e indique a localização exata para facilitar a fiscalização.",
  },
  {
    icon: ClipboardCheck,
    title: "Acompanhe o protocolo",
    text: "Guarde o número do protocolo para acompanhar o andamento da denúncia.",
  },
];

const dicas = [
  { icon: MapPin, text: "Local exato: endereço, ponto de referência ou localização no mapa." },
  { icon: Camera, text: "Fotos ou vídeos nítidos, sem se expor a riscos." },
  { icon: CalendarClock, text: "Data e horário em que o fato foi observado." },
  { icon: Info, text: "Detalhes úteis: frequência, veículos ou responsáveis, se souber." },
];

export default function DenunciasSection() {
  const reduzir = useReducedMotion();

  // Animação leve de entrada; sem movimento quando o usuário prefere
  const fade = (delay = 0) => ({
    initial: reduzir ? { opacity: 1 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: reduzir ? 0 : 0.5, delay: reduzir ? 0 : delay },
  });

  return (
    <section id="denuncias" className="denun" aria-labelledby="denun-titulo" lang="pt-BR">
      <div className="denun__container">
        {/* Cabeçalho */}
        <motion.header className="denun__header" {...fade()}>
          <span className="denun__tag">
            <AlertTriangle size={14} aria-hidden="true" /> Denúncia Ambiental
          </span>
          <h2 id="denun-titulo" className="denun__title">
            Viu um crime ambiental? <span>Denuncie no canal oficial</span>
          </h2>
          <p className="denun__description">
            A proteção do meio ambiente de Baturité depende de todos. As denúncias
            ambientais do município são recebidas e apuradas pela AMAB, a
            Autarquia Municipal de Meio Ambiente de Baturité, por meio do seu
            sistema oficial on-line. Veja abaixo o que pode ser denunciado e
            como fazer uma denúncia completa.
          </p>
        </motion.header>

        {/* O que pode ser denunciado */}
        <h3 className="denun__subtitle">O que pode ser denunciado</h3>
        <ul className="denun__grid" role="list">
          {tipos.map((t, i) => (
            <motion.li key={t.title} className="denun__card" {...fade(i * 0.05)}>
              <div className="denun__icon" aria-hidden="true">
                <t.icon size={22} />
              </div>
              <h4 className="denun__card-title">{t.title}</h4>
              <p className="denun__card-text">{t.text}</p>
            </motion.li>
          ))}
        </ul>

        {/* Passo a passo */}
        <h3 className="denun__subtitle">Como denunciar</h3>
        <ol className="denun__steps">
          {passos.map((p, i) => (
            <motion.li key={p.title} className="denun__step" {...fade(i * 0.08)}>
              <span className="denun__step-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="denun__step-icon" aria-hidden="true">
                <p.icon size={20} />
              </div>
              <h4 className="denun__step-title">{p.title}</h4>
              <p className="denun__step-text">{p.text}</p>
            </motion.li>
          ))}
        </ol>

        {/* Dicas + emergência */}
        <div className="denun__info">
          <motion.div className="denun__tips" {...fade()}>
            <h3 className="denun__info-title">
              <ShieldCheck size={20} aria-hidden="true" /> Dicas para uma boa denúncia
            </h3>
            <ul role="list">
              {dicas.map((d) => (
                <li key={d.text}>
                  <d.icon size={18} aria-hidden="true" />
                  <p>{d.text}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.aside className="denun__emergency" aria-label="Emergências" {...fade(0.1)}>
            <h3 className="denun__info-title">
              <Phone size={20} aria-hidden="true" /> Emergência ou incêndio?
            </h3>
            <p>
              Em situações de risco imediato, como incêndios em andamento, não
              espere: ligue para o Corpo de Bombeiros.
            </p>
            <a href="tel:193" className="denun__emergency-btn" aria-label="Ligar para os Bombeiros, 193">
              <Phone size={18} aria-hidden="true" /> Ligar 193
            </a>
          </motion.aside>
        </div>

        {/* CTA */}
        <motion.div className="denun__cta" {...fade()}>
          <div className="denun__cta-text">
            <h3>Faça sua denúncia ambiental</h3>
            <p>
              A ACMRB não recebe denúncias diretamente, mas apoia a fiscalização
              ambiental e incentiva a comunidade a usar o canal oficial da AMAB.
            </p>
          </div>
          <div className="denun__cta-action">
            <a
              href={AMAB_DENUNCIA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="denun__btn"
              aria-label="Fazer denúncia no sistema oficial da AMAB (abre em nova aba)"
            >
              Fazer denúncia na AMAB <ExternalLink size={18} aria-hidden="true" />
            </a>
            <small className="denun__notice">
              <Info size={14} aria-hidden="true" /> Você será direcionado ao sistema oficial da AMAB
            </small>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
