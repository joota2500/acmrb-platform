"use client";

/**
 * AcaoAparelhoModal — confirmação de uma ação sobre aparelho ou conta
 * ------------------------------------------------------------
 * Ações: bloquear, suspender, editar (motivo/prazo do bloqueio em vigor),
 * expulsar (derruba a sessão; opcionalmente impede de voltar por um prazo)
 * e desbloquear. O deus escolhe o prazo (indeterminado, tempo ou data e
 * hora). O MOTIVO é mostrado para a pessoa na tela de bloqueio e vai para
 * a auditoria. Chama POST /api/admin/dispositivos.
 * CSS: src/styles/admin-aparelhos.css (prefixo "apa-").
 */

import { useEffect, useState } from "react";
import { Ban, Clock, Loader2, LogOut, Pencil, ShieldCheck, X } from "lucide-react";

import "@/styles/admin-aparelhos.css";
import { chamarApi } from "@/lib/apiAdmin";
import { calcularAte, type PrazoEntrada } from "@/lib/prazo";
import SeletorPrazo, { paraCampoData } from "./SeletorPrazo";
import type { AcaoAparelho } from "./tipos";

interface Props {
  acao: AcaoAparelho;
  /** aparelho (anon_id) e/ou conta (usuario_id) afetados */
  alvo: { anon_id?: string; usuario_id?: string; descricao: string };
  /** valores atuais (só para "editar") */
  inicial?: { motivo: string; ate: string | null; tipo: "bloqueio" | "suspensao" };
  onFechar: () => void;
  onFeito: (mensagem: string) => void;
}

const TEXTOS: Record<AcaoAparelho, { titulo: string; efeito: string; botao: string; pedeMotivo: boolean; perigo: boolean; ok: string; icone: typeof Ban }> = {
  bloquear: {
    titulo: "Bloquear aparelho",
    efeito: "O aparelho não consegue abrir nada do site: vê a tela “Aparelho bloqueado” com o motivo e o prazo. Vale na próxima navegação e a página que estiver aberta é trocada em até ~10 segundos.",
    botao: "Bloquear",
    pedeMotivo: true,
    perigo: true,
    ok: "Aparelho bloqueado.",
    icone: Ban,
  },
  suspender: {
    titulo: "Suspender aparelho",
    efeito: "Igual ao bloqueio, mas a tela mostra “Aparelho suspenso” e a contagem até a volta. Use para um castigo curto; escolha o prazo abaixo.",
    botao: "Suspender",
    pedeMotivo: true,
    perigo: true,
    ok: "Aparelho suspenso.",
    icone: Clock,
  },
  editar: {
    titulo: "Editar bloqueio",
    efeito: "Muda o motivo e/ou o prazo do bloqueio que está em vigor. A tela da pessoa se atualiza sozinha.",
    botao: "Salvar alteração",
    pedeMotivo: true,
    perigo: false,
    ok: "Bloqueio atualizado.",
    icone: Pencil,
  },
  expulsar: {
    titulo: "Expulsar",
    efeito: "Derruba o acesso agora: a pessoa sai da conta (se estiver logada) e vê o aviso “Você foi desconectado” com o motivo. Se não impedir o retorno, ela pode entrar de novo logo em seguida.",
    botao: "Expulsar",
    pedeMotivo: true,
    perigo: true,
    ok: "Expulsão enviada. O aparelho é desconectado em até ~10 segundos.",
    icone: LogOut,
  },
  desbloquear: {
    titulo: "Desbloquear aparelho",
    efeito: "O aparelho volta a abrir o site; a tela de bloqueio some sozinha em até ~10 segundos.",
    botao: "Desbloquear",
    pedeMotivo: false,
    perigo: false,
    ok: "Aparelho desbloqueado.",
    icone: ShieldCheck,
  },
};

export default function AcaoAparelhoModal({ acao, alvo, inicial, onFechar, onFeito }: Props) {
  const t = TEXTOS[acao];
  const Icone = t.icone;
  const [motivo, setMotivo] = useState(acao === "editar" ? inicial?.motivo ?? "" : "");
  const [prazo, setPrazo] = useState<PrazoEntrada>(() => {
    if (acao === "editar") return inicial?.ate ? { modo: "data", ate: inicial.ate } : { modo: "indeterminado" };
    if (acao === "suspender") return { modo: "relativo", quantidade: 24, unidade: "horas" };
    if (acao === "expulsar") return { modo: "relativo", quantidade: 1, unidade: "horas" };
    return { modo: "indeterminado" };
  });
  const [tipoEditado, setTipoEditado] = useState<"bloqueio" | "suspensao">(inicial?.tipo ?? "bloqueio");
  const [impedir, setImpedir] = useState(false);
  const [rede, setRede] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && !enviando && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar, enviando]);

  const usaPrazo = acao === "bloquear" || acao === "suspender" || acao === "editar" || (acao === "expulsar" && impedir);
  const prazoOk = !usaPrazo || !("erro" in calcularAte(prazo));
  const motivoOk = !t.pedeMotivo || motivo.trim().length >= 3;

  async function confirmar() {
    if (!motivoOk) {
      setErro("Escreva o motivo (pelo menos 3 letras). A pessoa vai ler esta mensagem.");
      return;
    }
    if (!prazoOk) {
      setErro("Confira o prazo escolhido.");
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      await chamarApi("POST", "/api/admin/dispositivos", {
        acao,
        anon_id: alvo.anon_id,
        usuario_id: alvo.usuario_id,
        motivo: motivo.trim() || undefined,
        prazo: usaPrazo ? prazo : undefined,
        tipo: acao === "editar" ? tipoEditado : undefined,
        impedir: acao === "expulsar" ? impedir : undefined,
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

        {acao === "editar" && (
          <label className="apa-campo">
            Tela mostrada
            <select className="advis-select" value={tipoEditado} onChange={(e) => setTipoEditado(e.target.value as "bloqueio" | "suspensao")}>
              <option value="bloqueio">Aparelho bloqueado</option>
              <option value="suspensao">Aparelho suspenso</option>
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
          <span className="apa-contador">
            {acao === "desbloquear" ? `${motivo.length}/300 · fica só na auditoria` : `${motivo.length}/300 · a pessoa vai ler este texto na tela e ele fica na auditoria`}
          </span>
        </label>

        {acao === "expulsar" && (
          <label className="apa-check apa-check--neutro">
            <input type="checkbox" checked={impedir} onChange={(e) => setImpedir(e.target.checked)} />
            <span>
              Impedir de voltar por um tempo.
              <small>Sem isto, a pessoa pode entrar de novo logo depois. Com isto, o aparelho{alvo.usuario_id ? " e a conta ficam" : " fica"} sem acesso pelo prazo escolhido.</small>
            </span>
          </label>
        )}

        {usaPrazo && <SeletorPrazo valor={prazo} onChange={setPrazo} rotuloIndeterminado={acao === "expulsar" ? "Indeterminado (até eu liberar)" : undefined} />}

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
          <button type="button" className={t.perigo ? "advis-btn apa-btn--perigo" : "advis-btn"} onClick={() => void confirmar()} disabled={enviando || !motivoOk || !prazoOk}>
            {enviando ? <Loader2 size={16} className="advis-giro" aria-hidden="true" /> : <Icone size={16} aria-hidden="true" />} {t.botao}
          </button>
        </div>
      </div>
    </div>
  );
}
