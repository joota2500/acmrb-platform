"use client";

/**
 * AcessosTempoReal — quem está no site agora (somente ADM DEUS)
 * ------------------------------------------------------------
 * Atualiza sozinho a cada 10 s. Mostra visitas com atividade nos últimos
 * 2 minutos: quem (nome se logado, ou "Anônimo" + id curto), onde, página
 * atual, aparelho, origem e tempo. Também os números de hoje.
 * Dados: acessos_online e acessos_painel (migration 20261027100000).
 */

import { useCallback, useEffect, useState } from "react";
import { Activity, Pause, Play, RefreshCw, Smartphone, UserRound } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { duracao } from "@/types/visitantes";
import AparelhoDetalhe from "@/components/admin/aparelhos/AparelhoDetalhe";
import { aparelhoDe, idCurto, localDe, mensagemErro, origemDe, type PainelAcessos, type SessaoOnline } from "@/types/acessos";
import Button from "@/components/ui/Button";
import * as E from "@/components/admin/acessos/estilos";
import { cn } from "@/utils/cn";

export default function AcessosTempoReal() {
  const [online, setOnline] = useState<SessaoOnline[]>([]);
  const [painel, setPainel] = useState<PainelAcessos | null>(null);
  const [erro, setErro] = useState("");
  const [auto, setAuto] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);
  const [aparelhoAberto, setAparelhoAberto] = useState<string | null>(null);

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
    <div className={E.RAIZ}>
      <div className={E.BARRA}>
        <p className={E.NOTA}>
          {atualizadoEm ? `Atualizado às ${atualizadoEm.toLocaleTimeString("pt-BR")}` : "Carregando…"}
          {auto ? " · atualiza sozinho a cada 10 s" : " · atualização pausada"}
        </p>
        <div className={E.GRUPO}>
          <Button type="button" variante="contorno" tamanho="pequeno" onClick={() => setAuto((a) => !a)}>
            {auto ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />} {auto ? "Pausar" : "Retomar"}
          </Button>
          <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void carregar()}>
            <RefreshCw size={16} aria-hidden="true" /> Atualizar
          </Button>
        </div>
      </div>

      {erro && <p className={E.ERRO} role="alert">{erro}</p>}

      <div className={E.CARTOES}>
        <div className={cn(E.CARTAO_NUM, E.CARTAO_DESTAQUE)}><Activity size={18} aria-hidden="true" /><strong>{online.length}</strong><span>no site agora</span></div>
        <div className={E.CARTAO_NUM}><UserRound size={18} aria-hidden="true" /><strong>{logados}</strong><span>logados agora</span></div>
        <div className={E.CARTAO_NUM}><strong>{h?.sessoes ?? 0}</strong><span>visitas hoje</span></div>
        <div className={E.CARTAO_NUM}><strong>{h?.visitantes ?? 0}</strong><span>visitantes hoje (aprox.)</span></div>
      </div>

      {online.length === 0 ? (
        <p className={E.VAZIO}>Ninguém no site neste momento.</p>
      ) : (
        <div className={E.TABELA_CAIXA}>
          <table className={E.TABELA}>
            <thead>
              <tr><th>Quem</th><th>Onde</th><th>Página atual</th><th>Aparelho</th><th>Origem</th><th>Tempo</th><th><span className={E.SR}>Aparelho</span></th></tr>
            </thead>
            <tbody>
              {online.map((s) => (
                <tr key={s.id}>
                  <td data-rotulo="Quem">
                    {s.auth_user_id ? <strong className={E.NOME}>{s.nome ?? "Visitante cadastrado"}</strong> : <strong className={E.NOME}>Anônimo</strong>}
                    <span className={E.DETALHE}>id {idCurto(s.anon_id)}</span>
                  </td>
                  <td data-rotulo="Onde">{localDe(s)}</td>
                  <td data-rotulo="Página atual"><code className={E.CODIGO}>{s.pagina_atual ?? "—"}</code><span className={E.DETALHE}>{s.paginas} página(s)</span></td>
                  <td data-rotulo="Aparelho">{aparelhoDe(s)}</td>
                  <td data-rotulo="Origem">{origemDe(s)}</td>
                  <td data-rotulo="Tempo">{duracao(s.duracao_seg)}</td>
                  <td className={E.ACAO_TD}><Button type="button" variante="secundario" tamanho="pequeno" onClick={() => setAparelhoAberto(s.anon_id)}><Smartphone size={15} aria-hidden="true" /> Gerenciar</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aparelhoAberto && <AparelhoDetalhe anonId={aparelhoAberto} onFechar={() => setAparelhoAberto(null)} onAlterado={() => void carregar()} />}
    </div>
  );
}
