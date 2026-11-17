"use client";

/**
 * DenunciasSection — "Denúncia Ambiental" (página inicial)
 * ------------------------------------------------------------
 * A ACMRB NÃO recebe denúncias: a seção explica o que pode ser denunciado,
 * como fazer uma denúncia completa e leva a pessoa ao sistema oficial da
 * AMAB (Autarquia Municipal de Meio Ambiente de Baturité).
 *
 * Partes: cabeçalho · 6 tipos de denúncia · passo a passo (4 etapas) ·
 * dicas + aviso de emergência (Bombeiros 193) · botão para o sistema da AMAB.
 *
 * Dados: conteúdo fixo. Responsivo: 1 coluna no celular, 2 no tablet e
 * 3 (tipos) / 4 (passos) no desktop.
 */

import { motion } from "framer-motion";
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

import Container from "@/components/ui/Container";
import { useAparecer } from "@/hooks/useAparecer";
import TituloSecao from "./TituloSecao";

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
  const aparecer = useAparecer();

  return (
    <section id="denuncias" className="bg-warning-soft py-16 sm:py-20 lg:py-24" aria-labelledby="denun-titulo" lang="pt-BR">
      <Container>
        {/* ===== Cabeçalho ===== */}
        <motion.div {...aparecer()}>
          <TituloSecao
            id="denun-titulo"
            icone={AlertTriangle}
            etiqueta="Denúncia Ambiental"
            titulo={
              <>
                Viu um crime ambiental? <span>Denuncie no canal oficial</span>
              </>
            }
            descricao="A proteção do meio ambiente de Baturité depende de todos. As denúncias ambientais do município são recebidas e apuradas pela AMAB, a Autarquia Municipal de Meio Ambiente de Baturité, por meio do seu sistema oficial on-line. Veja abaixo o que pode ser denunciado e como fazer uma denúncia completa."
          />
        </motion.div>

        {/* ===== O que pode ser denunciado ===== */}
        <h3 className="mb-6 text-xl font-black text-ink sm:text-2xl">O que pode ser denunciado</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {tipos.map((t, i) => (
            <motion.li
              key={t.title}
              {...aparecer(i * 0.05)}
              className="flex gap-4 rounded-card border border-amber-200/60 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-warning" aria-hidden="true">
                <t.icon size={22} />
              </span>
              <div>
                <h4 className="font-black text-ink">{t.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t.text}</p>
              </div>
            </motion.li>
          ))}
        </ul>

        {/* ===== Passo a passo ===== */}
        <h3 className="mb-6 mt-14 text-xl font-black text-ink sm:text-2xl">Como denunciar</h3>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {passos.map((p, i) => (
            <motion.li
              key={p.title}
              {...aparecer(i * 0.08)}
              className="relative overflow-hidden rounded-card bg-white p-6 shadow-card"
            >
              {/* número grande de fundo */}
              <span aria-hidden="true" className="absolute -right-1 -top-3 text-7xl font-black text-amber-100">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative grid size-11 place-items-center rounded-xl bg-brand text-white" aria-hidden="true">
                <p.icon size={20} />
              </span>
              <h4 className="relative mt-4 font-black text-ink">{p.title}</h4>
              <p className="relative mt-1 text-sm leading-relaxed text-ink-soft">{p.text}</p>
            </motion.li>
          ))}
        </ol>

        {/* ===== Dicas + emergência ===== */}
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <motion.div {...aparecer()} className="rounded-card bg-white p-6 shadow-card sm:p-8">
            <h3 className="flex items-center gap-2 text-lg font-black text-ink">
              <ShieldCheck size={20} className="text-leaf" aria-hidden="true" /> Dicas para uma boa denúncia
            </h3>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2" role="list">
              {dicas.map((d) => (
                <li key={d.text} className="flex items-start gap-3">
                  <d.icon size={18} className="mt-0.5 shrink-0 text-leaf-bright" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-ink-soft">{d.text}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.aside
            {...aparecer(0.1)}
            aria-label="Emergências"
            className="rounded-card border border-red-200 bg-danger-soft p-6 sm:p-8"
          >
            <h3 className="flex items-center gap-2 text-lg font-black text-danger">
              <Phone size={20} aria-hidden="true" /> Emergência ou incêndio?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Em situações de risco imediato, como incêndios em andamento, não espere: ligue para o Corpo de Bombeiros.
            </p>
            <a
              href="tel:193"
              aria-label="Ligar para os Bombeiros, 193"
              className="mt-5 inline-flex h-12 items-center gap-2 rounded-control bg-red-600 px-6 font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98]"
            >
              <Phone size={18} aria-hidden="true" /> Ligar 193
            </a>
          </motion.aside>
        </div>

        {/* ===== Botão para o sistema da AMAB ===== */}
        <motion.div
          {...aparecer()}
          className="mt-10 flex flex-col gap-6 rounded-3xl bg-emerald-950 p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="max-w-2xl">
            <h3 className="text-2xl font-black text-white">Faça sua denúncia ambiental</h3>
            <p className="mt-2 leading-relaxed text-emerald-100">
              A ACMRB não recebe denúncias diretamente, mas apoia a fiscalização ambiental e incentiva a comunidade a usar
              o canal oficial da AMAB.
            </p>
          </div>
          <div className="flex flex-col gap-2 lg:shrink-0 lg:items-end">
            <a
              href={AMAB_DENUNCIA_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Fazer denúncia no sistema oficial da AMAB (abre em nova aba)"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-control bg-white px-7 font-bold text-leaf shadow-sm transition hover:bg-emerald-50 active:scale-[0.98]"
            >
              Fazer denúncia na AMAB <ExternalLink size={18} aria-hidden="true" />
            </a>
            <small className="flex items-center gap-1.5 text-xs text-emerald-200">
              <Info size={14} aria-hidden="true" /> Você será direcionado ao sistema oficial da AMAB
            </small>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
