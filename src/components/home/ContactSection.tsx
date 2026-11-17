"use client";

/**
 * ContactSection — "Contato Institucional" (âncora #contato)
 * ------------------------------------------------------------
 * O que mostra:
 *  1. 4 canais de contato (WhatsApp, Instagram, E-mail e Telefone), com
 *     botão de copiar o e-mail.
 *  2. Formulário: NÃO salva nada no site; monta a mensagem e abre no
 *     WhatsApp ou no e-mail da pessoa. Só quem tem conta envia.
 *  3. Mapa da sede (Leaflet), com botões "Como chegar" e "Google Maps".
 *  4. Faixa final de chamada.
 *
 * Os dados de contato ficam em src/constants/contato.ts (um lugar só).
 * Responsivo: canais em 1/2/4 colunas; formulário e mapa lado a lado no desktop.
 */

import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
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

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Input, { Textarea } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useAparecer } from "@/hooks/useAparecer";
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
} from "@/constants/contato";
import { cn } from "@/utils/cn";
import FaixaCta from "./FaixaCta";
import TituloSecao from "./TituloSecao";

// Mapa carregado só no navegador (Leaflet usa "window")
const MapaSede = dynamic(() => import("@/components/mapa/MapaSede"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-brand-soft text-sm font-semibold text-leaf" aria-hidden="true">
      Carregando mapa…
    </div>
  ),
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

  const aparecer = useAparecer();

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

  // Classe dos botões de escolha (assunto e canal)
  const opcao = "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition";

  return (
    <section id="contato" className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="contato-titulo" lang="pt-BR">
      <Container>
        {/* ===== 1. Cabeçalho ===== */}
        <motion.div {...aparecer()}>
          <TituloSecao
            id="contato-titulo"
            icone={MessageCircle}
            etiqueta="Contato Institucional"
            titulo={
              <>
                Fale com a ACMRB e <span>construa impacto com a gente</span>
              </>
            }
            descricao="Atendemos indústrias, empresas, instituições, imprensa e cidadãos interessados em parcerias, logística reversa, doações, projetos e educação ambiental. Escolha o canal que preferir ou envie sua mensagem pelo formulário abaixo."
          />
        </motion.div>

        {/* ===== 2. Canais de contato ===== */}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {canais.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.li
                key={c.titulo}
                {...aparecer(i * 0.06)}
                className="flex flex-col rounded-card border border-black/5 bg-surface-alt p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card-hover"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-brand text-white shadow-md" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-black text-ink">{c.titulo}</h3>
                <strong className="mt-1 break-words text-sm text-brand">{c.valor}</strong>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{c.texto}</p>
                <div className="mt-5 flex items-center gap-2">
                  <Button
                    href={c.href}
                    variante="secundario"
                    tamanho="pequeno"
                    {...(c.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={`${c.acao}: ${c.titulo} ${c.valor}${c.externo ? " (abre em nova aba)" : ""}`}
                  >
                    {c.acao}
                    {c.externo ? <ExternalLink size={14} aria-hidden="true" /> : <ArrowRight size={14} aria-hidden="true" />}
                  </Button>
                  {c.copiar && (
                    <button
                      type="button"
                      onClick={copiarEmail}
                      aria-label={copiado ? "E-mail copiado" : "Copiar e-mail"}
                      title={copiado ? "Copiado!" : "Copiar e-mail"}
                      className="grid size-9 place-items-center rounded-control border border-brand/20 bg-white text-brand transition hover:bg-brand-soft"
                    >
                      {copiado ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
        {/* aviso para leitores de tela quando copia o e-mail */}
        <p className="sr-only" aria-live="polite">
          {copiado ? "E-mail copiado para a área de transferência." : ""}
        </p>

        {/* ===== 3. Formulário + mapa ===== */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <motion.div {...aparecer()} className="rounded-3xl border border-black/5 bg-white p-6 shadow-pop sm:p-8">
            <h3 className="text-xl font-black text-ink">Envie sua mensagem</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Nada é salvo no site: a mensagem é montada e aberta no seu WhatsApp ou no seu e-mail para você enviar.
            </p>

            <form className="mt-6 flex flex-col gap-5" onSubmit={enviar} noValidate>
              {/* Nome */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contato-nome" className="text-sm font-semibold text-ink">Seu nome</label>
                <Input
                  id="contato-nome"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  invalido={!!erros.nome}
                  aria-describedby={erros.nome ? "contato-nome-erro" : undefined}
                  placeholder="Nome ou empresa"
                />
                {erros.nome && <span id="contato-nome-erro" className="text-xs font-medium text-danger">{erros.nome}</span>}
              </div>

              {/* Assunto (botões de escolha) */}
              <fieldset className="flex flex-col gap-2">
                <legend id="contato-assunto-legenda" className="mb-1 text-sm font-semibold text-ink">Assunto</legend>
                <div
                  id="contato-assunto"
                  className="flex flex-wrap gap-2"
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
                      onClick={() => setAssunto(a)}
                      className={cn(opcao, assunto === a ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-brand-soft")}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                {erros.assunto && <span className="text-xs font-medium text-danger">{erros.assunto}</span>}
              </fieldset>

              {/* Mensagem */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contato-mensagem" className="text-sm font-semibold text-ink">Mensagem</label>
                <Textarea
                  id="contato-mensagem"
                  rows={5}
                  maxLength={1500}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  invalido={!!erros.mensagem}
                  aria-describedby="contato-mensagem-info"
                  placeholder="Conte como podemos ajudar…"
                />
                <span id="contato-mensagem-info" className={cn("text-xs", erros.mensagem ? "font-medium text-danger" : "text-right text-ink-muted")}>
                  {erros.mensagem ?? `${mensagem.length}/1500`}
                </span>
              </div>

              {/* Canal de envio */}
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-semibold text-ink">Enviar por</legend>
                <div className="flex flex-wrap gap-2">
                  <label className={cn(opcao, "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand", canal === "whatsapp" ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-brand-soft")}>
                    <input type="radio" name="contato-canal" className="sr-only" checked={canal === "whatsapp"} onChange={() => setCanal("whatsapp")} />
                    <MessageCircle size={16} aria-hidden="true" /> WhatsApp
                  </label>
                  <label className={cn(opcao, "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand", canal === "email" ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-brand-soft")}>
                    <input type="radio" name="contato-canal" className="sr-only" checked={canal === "email"} onChange={() => setCanal("email")} />
                    <Mail size={16} aria-hidden="true" /> E-mail
                  </label>
                </div>
              </fieldset>

              <Button type="submit" tamanho="grande" larguraTotal>
                <Send size={17} aria-hidden="true" />
                {canal === "whatsapp" ? "Abrir no WhatsApp" : "Abrir no e-mail"}
              </Button>

              {/* Só quem tem conta envia: aviso com link para entrar */}
              {precisaLogin && !user && (
                <p className="rounded-xl border border-amber-200 bg-warning-soft p-3 text-sm text-warning" role="alert">
                  Para enviar mensagens pelo site é preciso ter uma conta de visitante.{" "}
                  <Link href="/login" className="font-bold underline">Entre ou crie sua conta grátis</Link>.
                </p>
              )}

              <p className="sr-only" aria-live="polite">
                {enviado ? `Mensagem aberta no ${canal === "whatsapp" ? "WhatsApp" : "e-mail"}. Finalize o envio por lá.` : ""}
              </p>
            </form>
          </motion.div>

          {/* Mapa da sede */}
          <motion.div {...aparecer(0.1)} className="flex flex-col rounded-3xl border border-black/5 bg-surface-alt p-6 sm:p-8">
            <h3 className="text-xl font-black text-ink">Onde estamos</h3>
            <div className="mt-4 flex items-start gap-3 text-leaf">
              <MapPin size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <strong className="block text-ink">{CONTATO.endereco}</strong>
                <span className="mt-0.5 block text-sm text-ink-soft">CNPJ {CONTATO.cnpj}</span>
              </div>
            </div>

            <div className="relative mt-5 min-h-72 flex-1 overflow-hidden rounded-2xl border border-brand-line bg-white">
              <MapaSede
                posicao={SEDE_COORDENADA}
                titulo="Sede da ACMRB"
                endereco={CONTATO.endereco}
                aproximada={SEDE_COORDENADA_APROXIMADA}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={linkComoChegar()} target="_blank" rel="noopener noreferrer">
                <Navigation size={16} aria-hidden="true" /> Como chegar
              </Button>
              <Button href={linkMapaBusca()} target="_blank" rel="noopener noreferrer" variante="contorno">
                Abrir no Google Maps <ExternalLink size={15} aria-hidden="true" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* ===== 4. Chamada final ===== */}
        <motion.div {...aparecer()}>
          <FaixaCta
            titulo="Vamos construir soluções sustentáveis juntos"
            texto="Projetos, ações ambientais, campanhas educativas e parcerias institucionais começam com uma conversa."
          >
            <Button href={linkWhatsApp(MSG_PADRAO)} target="_blank" rel="noopener noreferrer" variante="claro" tamanho="grande">
              <MessageCircle size={17} aria-hidden="true" /> Falar no WhatsApp
            </Button>
            <Button href="/projetos" variante="contornoClaro" tamanho="grande">
              Ver projetos <ArrowRight size={17} aria-hidden="true" />
            </Button>
          </FaixaCta>
        </motion.div>
      </Container>
    </section>
  );
}
