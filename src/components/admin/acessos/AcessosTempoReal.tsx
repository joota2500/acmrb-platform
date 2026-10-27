"use client";

/**
 * AcessosTempoReal — quem está no site agora (somente ADM DEUS)
 * ------------------------------------------------------------
 * Atualiza sozinho a cada 10 s. Mostra visitas com atividade nos últimos
 * 2 minutos: quem (nome se logado, ou "Anônimo" + id curto), onde, página
 * atual, aparelho, origem e tempo. Também os números de hoje.
 * Dados: acessos_online e acessos_painel (migration 20261027100000).
 * CSS: src/styles/admin-acessos.css (prefixo "aac-").
 */

import { useCallback, useEffect, useState } from "react";
import { Activity, Pause, Play, RefreshCw, UserRound } from "lucide-react";

import "@/styles/admin-acessos.css";
import { supabase } from "@/lib/supabase";
import { duracao } from "@/components/admin/visitantes/tipos";
import { aparelhoDe, idCurto, localDe, mensagemErro, origemDe, type PainelAcessos, type SessaoOnline } from "./tipos";

export default function AcessosTempoReal() {
  const [online, setOnline] = useState<SessaoOnline[]>([]);
  const [painel, setPainel] = useState<PainelAcessos | null>(null);
  const [erro, setErro] = useState("");
  const [auto, setAuto] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);

  const carregar = useCallback(async () => {
    const [o, p] = await Promise.all([supabase.rpc("acessos_online"), supabase.rpc("acessos_painel", { p_dias: 1 })]);
    const e = o.error ?? p.error;
    if (e) {
      setErro(mensagemErro(e, "20261027100000_acessos_site.sql"));
      return;
    }
    setErro("");
    setOnline((o.data ?? []) as SessaoOnline[]);
    setPainel(p.data as PainelAcessos);
    setAtualizadoEm(new Date());
  }, []);

  useEffect(() => {
    void carregar();
    if (!auto) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") void carregar();
    }, 10_000);
    return () => clearInterval(t);
  }, [carregar, auto]);

  const logados = online.filter((s) => s.auth_user_id).length;
  const h = painel?.hoje;

  return (
    <div className="aac">
      <div className="aac-barra">
        <p className="aac-nota">
          {atualizadoEm ? `Atualizado às ${atualizadoEm.toLocaleTimeString("pt-BR")}` : "Carregando…"}
          {auto ? " · atualiza sozinho a cada 10 s" : " · atualização pausada"}
        </p>
        <div className="aac-periodos">
          <button type="button" className="advis-btn advis-btn--ghost" onClick={() => setAuto((a) => !a)}>
            {auto ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />} {auto ? "Pausar" : "Retomar"}
          </button>
          <button type="button" className="advis-btn advis-btn--soft" onClick={() => void carregar()}>
            <RefreshCw size={16} aria-hidden="true" /> Atualizar
          </button>
        </div>
      </div>

      {erro && <p className="aac-erro" role="alert">{erro}</p>}

      <div className="aac-cards">
        <div className="aac-card aac-card--destaque"><Activity size={18} aria-hidden="true" /><strong>{online.length}</strong><span>no site agora</span></div>
        <div className="aac-card"><UserRound size={18} aria-hidden="true" /><strong>{logados}</strong><span>logados agora</span></div>
        <div className="aac-card"><strong>{h?.sessoes ?? 0}</strong><span>visitas hoje</span></div>
        <div className="aac-card"><strong>{h?.visitantes ?? 0}</strong><span>visitantes hoje (aprox.)</span></div>
      </div>

      {online.length === 0 ? (
        <p className="aac-vazio">Ninguém no site neste momento.</p>
      ) : (
        <div className="advis-tabela-wrap">
          <table className="advis-tabela">
            <thead>
              <tr><th>Quem</th><th>Onde</th><th>Página atual</th><th>Aparelho</th><th>Origem</th><th>Tempo</th></tr>
            </thead>
            <tbody>
              {online.map((s) => (
                <tr key={s.id}>
                  <td data-rotulo="Quem">
                    {s.auth_user_id ? <strong className="advis-nome">{s.nome ?? "Visitante cadastrado"}</strong> : <strong className="advis-nome">Anônimo</strong>}
                    <span className="advis-email">id {idCurto(s.anon_id)}</span>
                  </td>
                  <td data-rotulo="Onde">{localDe(s)}</td>
                  <td data-rotulo="Página atual"><code className="aac-codigo">{s.pagina_atual ?? "—"}</code><span className="advis-email">{s.paginas} página(s)</span></td>
                  <td data-rotulo="Aparelho">{aparelhoDe(s)}</td>
                  <td data-rotulo="Origem">{origemDe(s)}</td>
                  <td data-rotulo="Tempo">{duracao(s.duracao_seg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
