"use client";

/**
 * TelaBloqueio — a tela que a pessoa vê quando o aparelho foi bloqueado,
 * suspenso ou expulso pelo ADM DEUS.
 * ------------------------------------------------------------
 * Mostra o título certo ("Aparelho bloqueado", "Aparelho suspenso" ou
 * "Você foi desconectado"), o MOTIVO escrito pelo administrador, até quando
 * (com contagem regressiva ao vivo) ou "sem data para terminar", e o
 * contato oficial (WhatsApp e e-mail) para contestar.
 * Usada pela página /acesso-bloqueado (carregamento direto) e pelo
 * GuardaAparelho (página aberta trocada sem recarregar).
 * Visual: Tailwind (cor do ícone e da caixa de motivo muda conforme o tipo).
 */

import { useEffect, useState } from "react";
import { Clock, LogOut, MessageCircle, ShieldAlert } from "lucide-react";

import { cn } from "@/utils/cn";
import { CONTATO, linkEmail, linkWhatsApp } from "@/constants/contato";
import { contagem, dataFortaleza } from "@/utils/prazo";

export type TipoBloqueio = "bloqueio" | "suspensao" | "expulsao";

interface Props {
  tipo: TipoBloqueio;
  motivo?: string | null;
  /** instante em que termina (ISO); vazio = sem data para terminar */
  ate?: string | null;
  /** código curto do aparelho (para o contato) */
  codigo?: string | null;
  /** chamado quando a contagem chega a zero (a página recarrega) */
  onTerminou?: () => void;
  /** botão "voltar ao site" (usado na expulsão) */
  onContinuar?: () => void;
}

// Cores de cada tipo: vermelho para bloqueio, âmbar para suspensão, verde para expulsão
const CORES: Record<TipoBloqueio, { icone: string; motivo: string }> = {
  bloqueio: { icone: "bg-red-100 text-red-700", motivo: "bg-red-50" },
  suspensao: { icone: "bg-amber-100 text-amber-700", motivo: "bg-amber-50" },
  expulsao: { icone: "bg-brand-soft text-green-800", motivo: "bg-zinc-100" },
};

const BOTAO =
  "inline-flex w-full items-center justify-center gap-2 rounded-control px-5 py-3 text-[0.95rem] font-extrabold text-white no-underline transition";
const PARAGRAFO = "texto-justo text-[0.9rem] leading-relaxed sm:text-[0.98rem]";
const CAIXA = "w-full rounded-2xl bg-zinc-100 px-4 py-3 text-left";
const ROTULO = "mb-1 block text-left text-[0.72rem] font-extrabold uppercase tracking-wider text-ink-muted";

const TITULO: Record<TipoBloqueio, string> = {
  bloqueio: "Aparelho bloqueado",
  suspensao: "Aparelho suspenso",
  expulsao: "Você foi desconectado",
};

export default function TelaBloqueio({ tipo, motivo, ate, codigo, onTerminou, onContinuar }: Props) {
  const fim = ate ? Date.parse(ate) : NaN;
  const temFim = !Number.isNaN(fim);
  const [restante, setRestante] = useState(() => (temFim ? fim - Date.now() : 0));

  // Contagem regressiva ao vivo; ao zerar, avisa para recarregar
  useEffect(() => {
    if (!temFim) return;
    const t = setInterval(() => {
      const r = fim - Date.now();
      setRestante(r);
      if (r <= 0) {
        clearInterval(t);
        onTerminou?.();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [fim, temFim, onTerminou]);

  const Icone = tipo === "suspensao" ? Clock : tipo === "expulsao" ? LogOut : ShieldAlert;
  const mensagemZap =
    `Olá! Meu aparelho${codigo ? ` (código ${codigo})` : ""} aparece como "${TITULO[tipo].toLowerCase()}" no site da ACMRB` +
    `${motivo ? ` com o motivo: "${motivo}"` : ""}. Gostaria de entender e, se for um engano, pedir a liberação.`;

  return (
    <section
      className="flex w-full max-w-lg flex-col items-center gap-3.5 rounded-3xl border border-zinc-200 bg-white px-4.5 py-6 text-center shadow-[0_18px_50px_rgb(0_0_0/0.08)] sm:px-6.5 sm:py-8"
      aria-labelledby="ab-titulo"
      data-tela-bloqueio={tipo}
    >
      <span className={cn("inline-flex h-17 w-17 items-center justify-center rounded-full", CORES[tipo].icone)} aria-hidden="true">
        <Icone size={34} />
      </span>
      <h1 id="ab-titulo" className="text-2xl font-black text-zinc-900 sm:text-[1.6rem]">
        {TITULO[tipo]}
      </h1>

      <p className={cn(PARAGRAFO, "text-zinc-600")}>
        {tipo === "bloqueio" && "O acesso a este site foi bloqueado neste aparelho pela administração da associação."}
        {tipo === "suspensao" && "O acesso a este site foi suspenso neste aparelho pela administração da associação."}
        {tipo === "expulsao" && "A administração da associação encerrou o seu acesso neste aparelho. Você saiu da conta, se estava logado."}
      </p>

      {motivo ? (
        <div className={cn(CAIXA, CORES[tipo].motivo)}>
          <span className={ROTULO}>Motivo</span>
          <p className={cn(PARAGRAFO, "break-words text-zinc-800")}>{motivo}</p>
        </div>
      ) : null}

      {tipo !== "expulsao" && (
        <div className={CAIXA}>
          <span className={ROTULO}>Duração</span>
          {temFim ? (
            <>
              <p className={cn(PARAGRAFO, "text-zinc-800")}>
                {tipo === "bloqueio" ? "Bloqueado" : "Suspenso"} até <strong>{dataFortaleza(ate as string)}</strong> (horário de Fortaleza).
              </p>
              <p className="mt-1 text-left text-lg font-black tabular-nums text-amber-700" aria-live="off">
                Libera em {contagem(restante)}
              </p>
            </>
          ) : (
            <p className={cn(PARAGRAFO, "text-zinc-800")}>Sem data para terminar (indeterminado). A liberação depende da administração.</p>
          )}
        </div>
      )}

      {tipo === "expulsao" && onContinuar && (
        <button type="button" className={cn(BOTAO, "bg-green-800 hover:bg-green-900")} onClick={onContinuar}>
          Entendi, voltar ao site
        </button>
      )}

      <div className="flex w-full flex-col items-center gap-2.5 border-t border-zinc-100 pt-2.5">
        <p className={cn(PARAGRAFO, "text-zinc-600")}>Acha que foi um engano? Fale com a gente para contestar:</p>
        <a
          className={cn(BOTAO, "bg-green-700 hover:bg-green-800")}
          href={linkWhatsApp(mensagemZap)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={18} aria-hidden="true" /> WhatsApp {CONTATO.whatsappExibicao}
        </a>
        <a className="break-all text-sm font-bold text-green-800 underline" href={linkEmail("Contestar bloqueio no site", mensagemZap)}>
          {CONTATO.email}
        </a>
      </div>
    </section>
  );
}
