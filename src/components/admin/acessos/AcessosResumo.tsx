"use client";

/**
 * AcessosResumo — visão geral dos acessos (somente ADM DEUS)
 * ------------------------------------------------------------
 * Período (hoje, 7, 30, 90 dias), cartões (visitas, visitantes, páginas,
 * tempo médio, anônimos x logados, cadastrados e conversão), gráfico por
 * dia e rankings (aparelho, origem, país, cidade, páginas).
 * Dados: função acessos_painel (migration 20261027100000). Números de dias
 * antigos vêm de totais diários; "visitantes" é aproximado nesses dias.
 */

import { useCallback, useEffect, useState } from "react";
import { Clock, FileText, Loader2, RefreshCw, Smartphone, UserCheck, Users } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { duracao } from "@/types/visitantes";
import Ranking from "@/components/admin/acessos/Ranking";
import { mensagemErro, type PainelAcessos } from "@/types/acessos";
import Button from "@/components/ui/Button";
import * as E from "@/components/admin/acessos/estilos";
import { cn } from "@/utils/cn";

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
    <div className={E.RAIZ}>
      <div className={E.BARRA}>
        <div className={E.GRUPO} role="group" aria-label="Período">
          {PERIODOS.map((x) => (
            <button key={x.dias} type="button" className={x.dias === dias ? cn(E.CHIP, E.CHIP_ATIVO) : E.CHIP} onClick={() => setDias(x.dias)}>{x.rotulo}</button>
          ))}
        </div>
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void carregar()}>
          <RefreshCw size={16} aria-hidden="true" /> Atualizar
        </Button>
      </div>

      {erro && <p className={E.ERRO} role="alert">{erro}</p>}
      {carregando && !p && <p className={E.VAZIO}><Loader2 className={E.GIRO} aria-hidden="true" /> Carregando…</p>}

      {p && t && (
        <>
          <div className={E.CARTOES}>
            <div className={E.CARTAO_NUM}><Users size={18} aria-hidden="true" /><strong>{t.sessoes}</strong><span>visitas</span></div>
            <div className={E.CARTAO_NUM}><UserCheck size={18} aria-hidden="true" /><strong>{t.visitantes}</strong><span>visitantes (aprox.)</span></div>
            <div className={E.CARTAO_NUM}><FileText size={18} aria-hidden="true" /><strong>{t.paginas}</strong><span>páginas vistas</span></div>
            <div className={E.CARTAO_NUM}><Clock size={18} aria-hidden="true" /><strong>{duracao(mediaSeg)}</strong><span>tempo médio por visita</span></div>
          </div>

          <div className={E.GRADE}>
            <section className={E.BLOCO}>
              <h3><Smartphone size={16} aria-hidden="true" /> Quem visitou</h3>
              <div className={E.PILHA} role="img" aria-label={`${t.anonimas} visitas anônimas e ${t.logadas} de pessoas logadas`}>
                <i className={E.COR_ANONIMO} style={{ flexGrow: t.anonimas }} />
                <i className={E.COR_LOGADO} style={{ flexGrow: t.logadas }} />
              </div>
              <ul className={E.LEGENDA}>
                <li><span className={cn(E.PONTO_LEGENDA, E.COR_ANONIMO)} /> Sem login (anônimos): <b>{t.anonimas}</b></li>
                <li><span className={cn(E.PONTO_LEGENDA, E.COR_LOGADO)} /> Logados: <b>{t.logadas}</b></li>
                <li>Cadastrados no total: <b>{p.cadastrados_total}</b> ({p.cadastrados_ativos} ativos)</li>
                <li>Novos cadastros no período: <b>{p.novos_cadastros}</b> · conversão aprox. <b>{conversao}%</b></li>
              </ul>
              <p className={E.NOTA}>Anônimos ficam registrados por 24 h; depois só restam os totais do dia.</p>
            </section>

            <section className={E.BLOCO}>
              <h3>Visitas por dia</h3>
              <div className={E.COLUNAS} role="img" aria-label="Gráfico de visitas por dia">
                {p.serie.map((s) => (
                  <div key={s.dia} className={E.COLUNA} title={`${diaCurto(s.dia)}: ${s.sessoes} visitas (${s.logadas} logadas)`}>
                    <span className={E.COLUNA_VALOR}>{s.sessoes || ""}</span>
                    <span className={E.COLUNA_BARRA}>
                      <i className={E.COLUNA_TOTAL} style={{ height: `${(s.sessoes / maxSerie) * 100}%` }}>
                        <b style={{ height: s.sessoes ? `${(s.logadas / s.sessoes) * 100}%` : 0 }} />
                      </i>
                    </span>
                    <span className={E.COLUNA_DIA}>{p.serie.length > 14 ? diaCurto(s.dia).slice(0, 2) : diaCurto(s.dia)}</span>
                  </div>
                ))}
              </div>
              <p className={E.NOTA}>A parte escura de cada barra são as visitas de pessoas logadas.</p>
            </section>
          </div>

          <div className={cn(E.GRADE, E.GRADE_3)}>
            <Ranking titulo="Aparelhos" itens={p.dispositivos} />
            <Ranking titulo="De onde vieram" itens={p.origens} />
            <Ranking titulo="Países" itens={p.paises} vazio="A região só aparece depois de publicado na Vercel." />
          </div>
          <div className={E.GRADE}>
            <Ranking titulo="Cidades" itens={p.cidades} vazio="A cidade só aparece depois de publicado na Vercel." />
            <Ranking titulo="Páginas mais vistas" itens={p.paginas} extra={(i) => (i.media_seg ? `${duracao(i.media_seg)} em média` : null)} />
          </div>
        </>
      )}
    </div>
  );
}
