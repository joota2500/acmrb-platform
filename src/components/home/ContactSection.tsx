"use client";

/**
 * ContactSection — "Contato Institucional" (página inicial, id="contato")
 * ------------------------------------------------------------
 * O que mostra:
 *  1. Cabeçalho: selo, título (parte em verde) e apresentação.
 *  2. Cards de canais com ícone e ação: WhatsApp (mensagem pronta),
 *     Instagram, e-mail (mailto + copiar) e telefone (tel:).
 *  3. Formulário simples (nome, assunto, mensagem) que NÃO grava no banco:
 *     monta a mensagem e abre o WhatsApp ou o e-mail, à escolha do visitante.
 *  4. Mapa institucional real (Leaflet/OSM) com a sede e "Como chegar".
 *  5. CTA final: WhatsApp e projetos.
 *
 * Dados: src/lib/contatoInstitucional.ts (fonte única). Horário de
 * atendimento omitido de propósito (não há dado oficial).
 * Classes com prefixo "contato__" (CSS em src/styles/contact-section.css).
 *
 * Responsividade: celular ≤480px compacto, botões largura total;
 * tablet 2 colunas; desktop completo. Animações desligadas com
 * "reduzir movimento".
 */

import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  AtSign,
  Check,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Send,
} from "lucide-react";

import "@/styles/contact-section.css";
import { useAuth } from "@/contexts/AuthContext";
import {
  CONTATO,
  SEDE_COORDENADA,
  SEDE_COORDENADA_APROXIMADA,
  linkComoChegar,
  linkEmail,
  linkInstagram,
  linkMapaBusca,
  linkTelefone,
  linkWhatsApp,
} from "@/lib/contatoInstitucional";

const MapaSede = dynamic(() => import("@/components/mapa/MapaSede"), {
  ssr: false,
  loading: () => <div className="contato-mapa__loading" aria-hidden="true">Carregando mapa…</div>,
});

const ASSUNTOS = [
  "Parceria",
  "Logística reversa",
  "Doação/apoio",
  "Projetos/Educação ambiental",
  "Imprensa",
  "Outro",
] as const;
type Assunto = (typeof ASSUNTOS)[number];

const MSG_PADRAO = "Olá, ACMRB! Vim pelo site e gostaria de mais informações.";

type Erros = Partial<Record<"nome" | "assunto" | "mensagem", string>>;

export default function ContactSection() {
  const reduzir = useReducedMotion();
  const [copiado, setCopiado] = useState(false);
  const [nome, setNome] = useState("");
  const [assunto, setAssunto] = useState<Assunto | "">("");
  const [mensagem, setMensagem] = useState("");
  const [canal, setCanal] = useState<"whatsapp" | "email">("whatsapp");
  const [erros, setErros] = useState<Erros>({});
  const [enviado, setEnviado] = useState(false);
  // Só quem tem conta (visitante ou admin) envia mensagem pelo formulário
  const { user } = useAuth();
  const [precisaLogin, setPrecisaLogin] = useState(false);

  const anim = (atraso = 0) =>
    reduzir
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: atraso },
          viewport: { once: true, margin: "-60px" },
        };

  async function copiarEmail() {
    try {
      await navigator.clipboard.writeText(CONTATO.email);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* navegador sem permissão: ignora */
    }
  }

  function validar(): Erros {
    const e: Erros = {};
    if (nome.trim().length < 2) e.nome = "Informe seu nome (mínimo 2 letras).";
    if (!assunto) e.assunto = "Escolha um assunto.";
    if (mensagem.trim().length < 10) e.mensagem = "Escreva uma mensagem com pelo menos 10 caracteres.";
    if (mensagem.length > 1500) e.mensagem = "A mensagem pode ter no máximo 1500 caracteres.";
    return e;
  }

  function enviar(ev: FormEvent) {
    ev.preventDefault();
    if (!user) {
      setPrecisaLogin(true);
      return;
    }
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) {
      const primeiro = Object.keys(e)[0];
      document.getElementById(`contato-${primeiro}`)?.focus();
      return;
    }
    const titulo = `[Site ACMRB] ${assunto}`;
    const texto = `Olá, ACMRB!\n\nNome: ${nome.trim()}\nAssunto: ${assunto}\n\n${mensagem.trim()}`;
    const url = canal === "whatsapp" ? linkWhatsApp(`*${titulo}*\n\n${texto}`) : linkEmail(titulo, texto);
    if (canal === "whatsapp") window.open(url, "_blank", "noopener,noreferrer");
    else window.location.href = url;
    setEnviado(true);
  }

  const canais = [
    {
      icon: MessageCircle,
      titulo: "WhatsApp",
      valor: CONTATO.whatsappExibicao,
      texto: "Canal mais rápido para falar com a associação.",
      href: linkWhatsApp(MSG_PADRAO),
      acao: "Abrir conversa",
      externo: true,
    },
    {
      icon: AtSign,
      titulo: "Instagram",
      valor: `@${CONTATO.instagramUsuario}`,
      texto: "Acompanhe ações, coletas e novidades.",
      href: linkInstagram(),
      acao: "Ver perfil",
      externo: true,
    },
    {
      icon: Mail,
      titulo: "E-mail",
      valor: CONTATO.email,
      texto: "Ideal para propostas, documentos e parcerias formais.",
      href: linkEmail("Contato pelo site ACMRB"),
      acao: "Enviar e-mail",
      externo: false,
      copiar: true,
    },
    {
      icon: Phone,
      titulo: "Telefone",
      valor: CONTATO.whatsappExibicao,
      texto: "Ligue para tratar diretamente com a equipe.",
      href: linkTelefone(),
      acao: "Ligar agora",
      externo: false,
    },
  ];

  return (
    <section id="contato" className="contato" aria-labelledby="contato-titulo" lang="pt-BR">
      <div className="contato__container">
        {/* 1. Cabeçalho */}
        <motion.header className="contato__header" {...anim()}>
          <span className="contato__tag">
            <MessageCircle size={15} aria-hidden="true" /> Contato Institucional
          </span>
          <h2 id="contato-titulo" className="contato__title">
            Fale com a ACMRB e <span>construa impacto com a gente</span>
          </h2>
          <p className="contato__description">
            Atendemos indústrias, empresas, instituições, imprensa e cidadãos interessados em parcerias, logística
            reversa, doações, projetos e educação ambiental. Escolha o canal que preferir ou envie sua mensagem pelo
            formulário abaixo.
          </p>
        </motion.header>

        {/* 2. Canais */}
        <ul className="contato__canais">
          {canais.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.li key={c.titulo} className="contato__canal" {...anim(i * 0.06)}>
                <div className="contato__canal-icon" aria-hidden="true">
                  <Icon size={22} />
                </div>
                <h3 className="contato__canal-title">{c.titulo}</h3>
                <strong className="contato__canal-valor">{c.valor}</strong>
                <p className="contato__canal-text">{c.texto}</p>
                <div className="contato__canal-acoes">
                  <a
                    href={c.href}
                    className="contato__btn contato__btn--soft"
                    {...(c.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={`${c.acao}: ${c.titulo} ${c.valor}${c.externo ? " (abre em nova aba)" : ""}`}
                  >
                    {c.acao}
                    {c.externo ? <ExternalLink size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}
                  </a>
                  {c.copiar && (
                    <button
                      type="button"
                      className="contato__btn contato__btn--icon"
                      onClick={copiarEmail}
                      aria-label={copiado ? "E-mail copiado" : "Copiar e-mail"}
                      title={copiado ? "Copiado!" : "Copiar e-mail"}
                    >
                      {copiado ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
        <p className="contato__sr" aria-live="polite">{copiado ? "E-mail copiado para a área de transferência." : ""}</p>

        {/* 3. Formulário + 4. Mapa */}
        <div className="contato__grid">
          <motion.div className="contato__painel" {...anim()}>
            <h3 className="contato__subtitle">Envie sua mensagem</h3>
            <p className="contato__painel-text">
              Nada é salvo no site: a mensagem é montada e aberta no seu WhatsApp ou no seu e-mail para você enviar.
            </p>

            <form className="contato__form" onSubmit={enviar} noValidate>
              <div className="contato__campo">
                <label htmlFor="contato-nome">Seu nome</label>
                <input
                  id="contato-nome"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  aria-invalid={!!erros.nome}
                  aria-describedby={erros.nome ? "contato-nome-erro" : undefined}
                  placeholder="Nome ou empresa"
                />
                {erros.nome && <span id="contato-nome-erro" className="contato__erro">{erros.nome}</span>}
              </div>

              <fieldset className="contato__campo">
                <legend id="contato-assunto-legenda">Assunto</legend>
                <div
                  id="contato-assunto"
                  className="contato__chips"
                  role="radiogroup"
                  aria-labelledby="contato-assunto-legenda"
                  aria-invalid={!!erros.assunto}
                  tabIndex={-1}
                >
                  {ASSUNTOS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      role="radio"
                      aria-checked={assunto === a}
                      className={`contato__chip${assunto === a ? " contato__chip--ativo" : ""}`}
                      onClick={() => setAssunto(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                {erros.assunto && <span className="contato__erro">{erros.assunto}</span>}
              </fieldset>

              <div className="contato__campo">
                <label htmlFor="contato-mensagem">Mensagem</label>
                <textarea
                  id="contato-mensagem"
                  rows={5}
                  maxLength={1500}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  aria-invalid={!!erros.mensagem}
                  aria-describedby="contato-mensagem-info"
                  placeholder="Conte como podemos ajudar…"
                />
                <span id="contato-mensagem-info" className={erros.mensagem ? "contato__erro" : "contato__contador"}>
                  {erros.mensagem ?? `${mensagem.length}/1500`}
                </span>
              </div>

              <fieldset className="contato__campo">
                <legend>Enviar por</legend>
                <div className="contato__canal-escolha">
                  <label className={`contato__opcao${canal === "whatsapp" ? " contato__opcao--ativa" : ""}`}>
                    <input type="radio" name="contato-canal" checked={canal === "whatsapp"} onChange={() => setCanal("whatsapp")} />
                    <MessageCircle size={16} aria-hidden="true" /> WhatsApp
                  </label>
                  <label className={`contato__opcao${canal === "email" ? " contato__opcao--ativa" : ""}`}>
                    <input type="radio" name="contato-canal" checked={canal === "email"} onChange={() => setCanal("email")} />
                    <Mail size={16} aria-hidden="true" /> E-mail
                  </label>
                </div>
              </fieldset>

              <button type="submit" className="contato__btn contato__btn--primary contato__enviar">
                <Send size={17} aria-hidden="true" />
                {canal === "whatsapp" ? "Abrir no WhatsApp" : "Abrir no e-mail"}
              </button>
              {precisaLogin && !user && (
                <p className="contato__login-aviso" role="alert">
                  Para enviar mensagens pelo site é preciso ter uma conta de visitante.{" "}
                  <Link href="/login">Entre ou crie sua conta grátis</Link>.
                </p>
              )}
              <p className="contato__sr" aria-live="polite">
                {enviado ? `Mensagem aberta no ${canal === "whatsapp" ? "WhatsApp" : "e-mail"}. Finalize o envio por lá.` : ""}
              </p>
            </form>
          </motion.div>

          <motion.div className="contato__painel contato__painel--mapa" {...anim(0.1)}>
            <h3 className="contato__subtitle">Onde estamos</h3>
            <div className="contato__endereco">
              <MapPin size={18} aria-hidden="true" />
              <div>
                <strong>{CONTATO.endereco}</strong>
                <span>CNPJ {CONTATO.cnpj}</span>
              </div>
            </div>
            <div className="contato-mapa">
              <MapaSede
                posicao={SEDE_COORDENADA}
                titulo="Sede da ACMRB"
                endereco={CONTATO.endereco}
                aproximada={SEDE_COORDENADA_APROXIMADA}
              />
            </div>
            <div className="contato__mapa-acoes">
              <a href={linkComoChegar()} target="_blank" rel="noopener noreferrer" className="contato__btn contato__btn--primary">
                <Navigation size={16} aria-hidden="true" /> Como chegar
              </a>
              <a href={linkMapaBusca()} target="_blank" rel="noopener noreferrer" className="contato__btn contato__btn--ghost">
                Abrir no Google Maps <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* 5. CTA final */}
        <motion.div className="contato__cta" {...anim()}>
          <h3 className="contato__cta-title">Vamos construir soluções sustentáveis juntos</h3>
          <p className="contato__cta-text">
            Projetos, ações ambientais, campanhas educativas e parcerias institucionais começam com uma conversa.
          </p>
          <div className="contato__cta-acoes">
            <a href={linkWhatsApp(MSG_PADRAO)} target="_blank" rel="noopener noreferrer" className="contato__btn contato__btn--light">
              <MessageCircle size={17} aria-hidden="true" /> Falar no WhatsApp
            </a>
            <Link href="/projetos" className="contato__btn contato__btn--outline">
              Ver projetos <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
