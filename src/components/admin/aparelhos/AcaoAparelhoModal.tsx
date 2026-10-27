"use client";

/**
 * AcaoAparelhoModal — confirmação de uma ação sobre aparelho ou conta
 * ------------------------------------------------------------
 * Ações: bloquear (sem prazo), suspender (com duração), expulsar (derruba
 * a sessão e gera novo id; com conta, encerra todos os logins) e
 * desbloquear. Pede o motivo (vai para a auditoria), explica o efeito e só
 * executa ao clicar em confirmar. Chama POST /api/admin/dispositivos.
 * CSS: src/styles/admin-aparelhos.css (prefixo "apa-").
 */

import { useEffect, useState } from "react";
import { Ban, Clock, Loader2, LogOut, ShieldCheck, X } from "lucide-react";

import "@/styles/admin-aparelhos.css";
import { chamarApi } from "@/lib/apiAdmin";
import { DURACOES, type AcaoAparelho } from "./tipos";

interface Props {
  acao: AcaoAparelho;
  /** aparelho (anon_id) e/ou conta (usuario_id) afetados */
  alvo: { anon_id?: string; usuario_id?: string; descricao: string };
  onFechar: () => void;
  onFeito: (mensagem: string) => void;
}

const TEXTOS: Record<AcaoAparelho, { titulo: string; efeito: string; botao: string; pedeMotivo: boolean; perigo: boolean; ok: string; icone: typeof Ban }> = {
  bloquear: {
    titulo: "Bloquear aparelho",
    efeito: "O aparelho não consegue mais abrir o site: vê só a página “acesso bloqueado”. Vale em até 15 segundos e não expira sozinho. Você pode desbloquear quando quiser.",
    botao: "Bloquear",
    pedeMotivo: true,
    perigo: true,
    ok: "Aparelho bloqueado.",
    icone: Ban,
  },
  suspender: {
    titulo: "Suspender temporariamente",
    efeito: "O aparelho fica sem acesso ao site pelo tempo escolhido e volta sozinho depois. Você pode liberar antes, se quiser.",
    botao: "Suspender",
    pedeMotivo: true,
    perigo: true,
    ok: "Aparelho suspenso.",
    icone: Clock,
  },
  expulsar: {
    titulo: "Expulsar",
    efeito: "Derruba a sessão agora: a pessoa sai da conta (se estiver logada), o id do aparelho é apagado e um novo é criado. Ela pode voltar a entrar; para impedir, use bloquear.",
    botao: "Expulsar",
    pedeMotivo: true,
    perigo: true,
    ok: "Expulsão enviada. O aparelho é desconectado em até 30 segundos.",
    icone: LogOut,
  },
  desbloquear: {
    titulo: "Desbloquear aparelho",
    efeito: "O aparelho volta a abrir o site normalmente em até 15 segundos.",
    botao: "Desbloquear",
    pedeMotivo: false,
    perigo: false,
    ok: "Aparelho desbloqueado.",
    icone: ShieldCheck,
  },
};

export default function AcaoAparelhoModal({ acao, alvo, onFechar, onFeito }: Props) {
  const t = TEXTOS[acao];
  const Icone = t.icone;
  const [motivo, setMotivo] = useState("");
  const [horas, setHoras] = useState(24);
  const [rede, setRede] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && !enviando && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar, enviando]);

  const motivoOk = !t.pedeMotivo || motivo.trim().length >= 3;

  async function confirmar() {
    if (!motivoOk) {
      setErro("Escreva o motivo (pelo menos 3 letras). Ele fica registrado na auditoria.");
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      await chamarApi("POST", "/api/admin/dispositivos", {
        acao,
        anon_id: alvo.anon_id,
        usuario_id: alvo.usuario_id,
        motivo: motivo.trim(),
        horas: acao === "suspender" ? horas : undefined,
        bloquear_rede: (acao === "bloquear" || acao === "suspender") && rede ? true : undefined,
      });
      onFeito(t.ok);
    } catch (e) {
      setErro((e as Error).message);
      setEnviando(false);
    }
  }

  return (
    <div className="apa-fundo" onClick={() => !enviando && onFechar()} role="presentation">
      <div className="apa-modal" role="dialog" aria-modal="true" aria-labelledby="apa-titulo" onClick={(e) => e.stopPropagation()}>
        <div className="apa-modal__topo">
          <h3 id="apa-titulo" className={t.perigo ? "apa-modal__titulo apa-modal__titulo--perigo" : "apa-modal__titulo"}>
            <Icone size={18} aria-hidden="true" /> {t.titulo}
          </h3>
          <button type="button" className="advd-fechar" onClick={onFechar} disabled={enviando} aria-label="Fechar"><X size={20} /></button>
        </div>

        <p className="apa-modal__alvo">{alvo.descricao}</p>
        <p className="apa-modal__efeito">{t.efeito}</p>

        {acao === "suspender" && (
          <label className="apa-campo">
            Duração
            <select className="advis-select" value={horas} onChange={(e) => setHoras(Number(e.target.value))}>
              {DURACOES.map((d) => <option key={d.horas} value={d.horas}>{d.rotulo}</option>)}
            </select>
          </label>
        )}

        <label className="apa-campo">
          Motivo {t.pedeMotivo ? "(obrigatório)" : "(opcional)"}
          <textarea
            className="advd-input apa-texto"
            rows={3}
            maxLength={300}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={acao === "desbloquear" ? "Ex.: foi um engano" : "Ex.: tentativas repetidas de invadir o formulário"}
          />
          <span className="apa-contador">{motivo.length}/300 · fica registrado na auditoria, só o deus vê</span>
        </label>

        {(acao === "bloquear" || acao === "suspender") && (
          <label className="apa-check">
            <input type="checkbox" checked={rede} onChange={(e) => setRede(e.target.checked)} />
            <span>
              Bloquear também a <strong>rede (IP)</strong> deste aparelho.
              <small>Cuidado: quem usa o mesmo Wi-Fi ou a mesma operadora pode ser barrado junto. Use só em ataques repetidos.</small>
            </span>
          </label>
        )}

        {erro && <p className="apa-erro" role="alert">{erro}</p>}

        <div className="apa-modal__botoes">
          <button type="button" className="advis-btn advis-btn--ghost" onClick={onFechar} disabled={enviando}>Cancelar</button>
          <button type="button" className={t.perigo ? "advis-btn apa-btn--perigo" : "advis-btn"} onClick={() => void confirmar()} disabled={enviando || !motivoOk}>
            {enviando ? <Loader2 size={16} className="advis-giro" aria-hidden="true" /> : <Icone size={16} aria-hidden="true" />} {t.botao}
          </button>
        </div>
      </div>
    </div>
  );
}
