"use client";

/**
 * AcessosResumo — visão geral dos acessos (somente ADM DEUS)
 * ------------------------------------------------------------
 * Período (hoje, 7, 30, 90 dias), cartões (visitas, visitantes, páginas,
 * tempo médio, anônimos x logados, cadastrados e conversão), gráfico por
 * dia e rankings (aparelho, origem, país, cidade, páginas).
 * Dados: função acessos_painel (migration 20261027100000). Números de dias
 * antigos vêm de totais diários; "visitantes" é aproximado nesses dias.
 * CSS: src/styles/admin-acessos.css (prefixo "aac-").
 */

import { useCallback, useEffect, useState } from "react";
import { Clock, FileText, Loader2, RefreshCw, Smartphone, UserCheck, Users } from "lucide-react";

import "@/styles/admin-acessos.css";
import { supabase } from "@/lib/supabase";
import { duracao } from "@/components/admin/visitantes/tipos";
import Ranking from "./Ranking";
import { mensagemErro, type PainelAcessos } from "./tipos";

const PERIODOS = [
  { dias: 1, rotulo: "Hoje" },
  { dias: 7, rotulo: "7 dias" },
  { dias: 30, rotulo: "30 dias" },
  { dias: 90, rotulo: "90 dias" },
];

const diaCurto = (iso: string) => {
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}`;
};

export default function AcessosResumo() {
  const [dias, setDias] = useState(7);
  const [p, setP] = useState<PainelAcessos | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await supabase.rpc("acessos_painel", { p_dias: dias });
    if (error) {
      setErro(mensagemErro(error, "20261027100000_acessos_site.sql"));
      setP(null);
    } else {
      setErro("");
      setP(data as PainelAcessos);
    }
    setCarregando(false);
  }, [dias]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const t = p?.periodo;
  const mediaSeg = t && t.sessoes ? Math.round(t.duracao_seg / t.sessoes) : 0;
  const conversao = t && t.visitantes ? Math.round((p!.novos_cadastros / t.visitantes) * 1000) / 10 : 0;
  const maxSerie = Math.max(1, ...(p?.serie.map((s) => s.sessoes) ?? [1]));

  return (
    <div className="aac">
      <div className="aac-barra">
        <div className="aac-periodos" role="group" aria-label="Período">
          {PERIODOS.map((x) => (
            <button key={x.dias} type="button" className={x.dias === dias ? "aac-chip aac-chip--ativo" : "aac-chip"} onClick={() => setDias(x.dias)}>{x.rotulo}</button>
          ))}
        </div>
        <button type="button" className="advis-btn advis-btn--soft" onClick={() => void carregar()}>
          <RefreshCw size={16} aria-hidden="true" /> Atualizar
        </button>
      </div>

      {erro && <p className="aac-erro" role="alert">{erro}</p>}
      {carregando && !p && <p className="aac-vazio"><Loader2 className="advis-giro" aria-hidden="true" /> Carregando…</p>}

      {p && t && (
        <>
          <div className="aac-cards">
            <div className="aac-card"><Users size={18} aria-hidden="true" /><strong>{t.sessoes}</strong><span>visitas</span></div>
            <div className="aac-card"><UserCheck size={18} aria-hidden="true" /><strong>{t.visitantes}</strong><span>visitantes (aprox.)</span></div>
            <div className="aac-card"><FileText size={18} aria-hidden="true" /><strong>{t.paginas}</strong><span>páginas vistas</span></div>
            <div className="aac-card"><Clock size={18} aria-hidden="true" /><strong>{duracao(mediaSeg)}</strong><span>tempo médio por visita</span></div>
          </div>

          <div className="aac-grade">
            <section className="aac-bloco">
              <h3><Smartphone size={16} aria-hidden="true" /> Quem visitou</h3>
              <div className="aac-pilha" role="img" aria-label={`${t.anonimas} visitas anônimas e ${t.logadas} de pessoas logadas`}>
                <i className="aac-pilha__anon" style={{ flexGrow: t.anonimas }} />
                <i className="aac-pilha__logado" style={{ flexGrow: t.logadas }} />
              </div>
              <ul className="aac-legenda">
                <li><span className="aac-ponto aac-ponto--anon" /> Sem login (anônimos): <b>{t.anonimas}</b></li>
                <li><span className="aac-ponto aac-ponto--logado" /> Logados: <b>{t.logadas}</b></li>
                <li>Cadastrados no total: <b>{p.cadastrados_total}</b> ({p.cadastrados_ativos} ativos)</li>
                <li>Novos cadastros no período: <b>{p.novos_cadastros}</b> · conversão aprox. <b>{conversao}%</b></li>
              </ul>
              <p className="aac-nota">Anônimos ficam registrados por 24 h; depois só restam os totais do dia.</p>
            </section>

            <section className="aac-bloco">
              <h3>Visitas por dia</h3>
              <div className="aac-colunas" role="img" aria-label="Gráfico de visitas por dia">
                {p.serie.map((s) => (
                  <div key={s.dia} className="aac-coluna" title={`${diaCurto(s.dia)}: ${s.sessoes} visitas (${s.logadas} logadas)`}>
                    <span className="aac-coluna__valor">{s.sessoes || ""}</span>
                    <span className="aac-coluna__barra">
                      <i className="aac-coluna__total" style={{ height: `${(s.sessoes / maxSerie) * 100}%` }}>
                        <b style={{ height: s.sessoes ? `${(s.logadas / s.sessoes) * 100}%` : 0 }} />
                      </i>
                    </span>
                    <span className="aac-coluna__dia">{p.serie.length > 14 ? diaCurto(s.dia).slice(0, 2) : diaCurto(s.dia)}</span>
                  </div>
                ))}
              </div>
              <p className="aac-nota">A parte escura de cada barra são as visitas de pessoas logadas.</p>
            </section>
          </div>

          <div className="aac-grade aac-grade--3">
            <Ranking titulo="Aparelhos" itens={p.dispositivos} />
            <Ranking titulo="De onde vieram" itens={p.origens} />
            <Ranking titulo="Países" itens={p.paises} vazio="A região só aparece depois de publicado na Vercel." />
          </div>
          <div className="aac-grade">
            <Ranking titulo="Cidades" itens={p.cidades} vazio="A cidade só aparece depois de publicado na Vercel." />
            <Ranking titulo="Páginas mais vistas" itens={p.paginas} extra={(i) => (i.media_seg ? `${duracao(i.media_seg)} em média` : null)} />
          </div>
        </>
      )}
    </div>
  );
}
