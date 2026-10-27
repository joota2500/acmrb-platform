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
 * CSS: src/styles/acesso-bloqueado.css (prefixo "ab-").
 */

import { useEffect, useState } from "react";
import { Clock, LogOut, MessageCircle, ShieldAlert } from "lucide-react";

import "@/styles/acesso-bloqueado.css";
import { CONTATO, linkEmail, linkWhatsApp } from "@/lib/contatoInstitucional";
import { contagem, dataFortaleza } from "@/lib/prazo";

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
    <section className={`ab__cartao ab__cartao--${tipo}`} aria-labelledby="ab-titulo" data-tela-bloqueio={tipo}>
      <span className="ab__icone" aria-hidden="true"><Icone size={34} /></span>
      <h1 id="ab-titulo" className="ab__titulo">{TITULO[tipo]}</h1>

      <p className="ab__texto">
        {tipo === "bloqueio" && "O acesso a este site foi bloqueado neste aparelho pela administração da associação."}
        {tipo === "suspensao" && "O acesso a este site foi suspenso neste aparelho pela administração da associação."}
        {tipo === "expulsao" && "A administração da associação encerrou o seu acesso neste aparelho. Você saiu da conta, se estava logado."}
      </p>

      {motivo ? (
        <div className="ab__motivo">
          <span className="ab__rotulo">Motivo</span>
          <p>{motivo}</p>
        </div>
      ) : null}

      {tipo !== "expulsao" && (
        <div className="ab__prazo">
          <span className="ab__rotulo">Duração</span>
          {temFim ? (
            <>
              <p>{tipo === "bloqueio" ? "Bloqueado" : "Suspenso"} até <strong>{dataFortaleza(ate as string)}</strong> (horário de Fortaleza).</p>
              <p className="ab__contagem" aria-live="off">Libera em {contagem(restante)}</p>
            </>
          ) : (
            <p>Sem data para terminar (indeterminado). A liberação depende da administração.</p>
          )}
        </div>
      )}

      {tipo === "expulsao" && onContinuar && (
        <button type="button" className="ab__botao" onClick={onContinuar}>Entendi, voltar ao site</button>
      )}

      <div className="ab__contato">
        <p className="ab__texto">Acha que foi um engano? Fale com a gente para contestar:</p>
        <a className="ab__botao ab__botao--zap" href={linkWhatsApp(mensagemZap)} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={18} aria-hidden="true" /> WhatsApp {CONTATO.whatsappExibicao}
        </a>
        <a className="ab__email" href={linkEmail("Contestar bloqueio no site", mensagemZap)}>{CONTATO.email}</a>
      </div>
    </section>
  );
}
