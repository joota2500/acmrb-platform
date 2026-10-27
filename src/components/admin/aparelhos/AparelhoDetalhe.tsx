"use client";

/**
 * AparelhoDetalhe — gaveta com tudo de um aparelho (somente ADM DEUS)
 * ------------------------------------------------------------
 * Mostra a situação (ativo / suspenso / bloqueado), os dados do aparelho
 * (tipo, navegador, local aproximado, conta se logou), as ações (bloquear,
 * suspender, expulsar, desbloquear) e o HISTÓRICO: bloqueios anteriores,
 * expulsões e as últimas visitas (com as páginas de cada uma).
 * Dados: função aparelhos_lista e tabelas dispositivos_*, acessos_* (RLS is_deus()).
 * Visitas de anônimos somem em 24 h; os bloqueios ficam.
 * CSS: src/styles/admin-aparelhos.css (prefixo "apa-").
 */

import { useCallback, useEffect, useState } from "react";
import { Ban, Clock, Copy, Loader2, LogOut, Pencil, ShieldCheck, Smartphone, X } from "lucide-react";

import "@/styles/admin-aparelhos.css";
import "@/styles/admin-visitante-detalhe.css";
import { supabase } from "@/lib/supabase";
import { ToastArea, useToast } from "@/components/ui/Toast";
import { dataHoraCurta, duracao } from "@/components/admin/visitantes/tipos";
import { aparelhoDe, idCurto, localDe, origemDe } from "@/components/admin/acessos/tipos";
import AcaoAparelhoModal from "./AcaoAparelhoModal";
import SeloSituacao from "./SeloSituacao";
import { tempoRestante, type AcaoAparelho, type AparelhoItem, type BloqueioReg, type ExpulsaoReg } from "./tipos";

interface SessaoReg {
  id: string;
  iniciada_em: string;
  duracao_seg: number;
  paginas: number;
  origem: string | null;
  referrer_host: string | null;
  dispositivo: string | null;
  navegador: string | null;
  sistema: string | null;
  cidade: string | null;
  regiao: string | null;
  pais: string | null;
  auth_user_id: string | null;
}
interface PaginaReg { id: number; caminho: string; duracao_seg: number }

interface Props {
  anonId: string;
  onFechar: () => void;
  /** avisa a lista de trás para recarregar depois de uma ação */
  onAlterado?: () => void;
}

export default function AparelhoDetalhe({ anonId, onFechar, onAlterado }: Props) {
  const { toasts, mostrar, fechar } = useToast();
  const [item, setItem] = useState<AparelhoItem | null>(null);
  const [bloqueios, setBloqueios] = useState<BloqueioReg[]>([]);
  const [expulsoes, setExpulsoes] = useState<ExpulsaoReg[]>([]);
  const [sessoes, setSessoes] = useState<SessaoReg[]>([]);
  const [paginas, setPaginas] = useState<Record<string, PaginaReg[]>>({});
  const [carregando, setCarregando] = useState(true);
  const [acao, setAcao] = useState<AcaoAparelho | null>(null);

  const carregar = useCallback(async () => {
    const [l, b, e, s] = await Promise.all([
      supabase.rpc("aparelhos_lista", { p_busca: anonId, p_limite: 5 }),
      supabase.from("dispositivos_bloqueios").select("id, tipo, motivo, ate, ativo, criado_em, criado_por, desbloqueado_em, desbloqueado_por, desbloqueio_motivo, ip_hash")
        .eq("dispositivo_id", anonId).order("criado_em", { ascending: false }).limit(50),
      supabase.from("dispositivos_expulsoes").select("id, motivo, criado_em, criado_por, entregue_em")
        .eq("dispositivo_id", anonId).order("criado_em", { ascending: false }).limit(50),
      supabase.from("acessos_sessoes").select("id, iniciada_em, duracao_seg, paginas, origem, referrer_host, dispositivo, navegador, sistema, cidade, regiao, pais, auth_user_id")
        .eq("anon_id", anonId).order("iniciada_em", { ascending: false }).limit(30),
    ]);
    const itens = ((l.data as { itens?: AparelhoItem[] } | null)?.itens ?? []) as AparelhoItem[];
    setItem(itens.find((x) => x.anon_id === anonId) ?? null);
    setBloqueios((b.data ?? []) as BloqueioReg[]);
    setExpulsoes((e.data ?? []) as ExpulsaoReg[]);
    setSessoes((s.data ?? []) as SessaoReg[]);
    setCarregando(false);
  }, [anonId]);

  useEffect(() => { void carregar(); }, [carregar]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && !acao && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar, acao]);

  async function verPaginas(id: string) {
    if (paginas[id]) {
      setPaginas((p) => { const n = { ...p }; delete n[id]; return n; });
      return;
    }
    const { data } = await supabase.from("acessos_paginas").select("id, caminho, duracao_seg").eq("sessao_id", id).order("id");
    setPaginas((p) => ({ ...p, [id]: (data ?? []) as PaginaReg[] }));
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(anonId);
      mostrar("sucesso", "Id completo copiado.");
    } catch {
      mostrar("erro", "Não foi possível copiar.");
    }
  }

  const situacao = item?.situacao ?? "ativo";
  const ref = item ?? sessoes[0] ?? null;
  const contaId = item?.auth_user_id ?? sessoes.find((s) => s.auth_user_id)?.auth_user_id ?? null;

  return (
    <div className="advd-fundo apa-gaveta-fundo" onClick={onFechar} role="presentation">
      <aside className="advd" role="dialog" aria-modal="true" aria-labelledby="apa-det-titulo" onClick={(e) => e.stopPropagation()}>
        <header className="advd-topo">
          <div className="advd-id">
            <span className="advd-avatar" aria-hidden="true"><Smartphone size={20} /></span>
            <div>
              <h2 id="apa-det-titulo" className="advd-nome">{item?.nome ?? (contaId ? "Aparelho de um cadastrado" : "Aparelho anônimo")}</h2>
              <p className="advd-email">id {idCurto(anonId)} · <button type="button" className="apa-link" onClick={() => void copiar()}><Copy size={12} aria-hidden="true" /> copiar id completo</button></p>
            </div>
          </div>
          <button type="button" className="advd-fechar" onClick={onFechar} aria-label="Fechar detalhes"><X size={20} /></button>
        </header>

        <div className="advd-corpo">
          {carregando ? (
            <p className="advd-vazio"><Loader2 className="advd-giro" aria-hidden="true" /> Carregando…</p>
          ) : (
            <>
              {/* ===== Situação e ações ===== */}
              <section className={`apa-situacao apa-situacao--${situacao}`}>
                <div className="apa-situacao__topo">
                  <SeloSituacao situacao={situacao} ate={item?.ate} />
                  {item?.online && <span className="apa-selo apa-selo--online">no site agora</span>}
                </div>
                {situacao !== "ativo" && item ? (
                  <p className="apa-situacao__texto">
                    {`${situacao === "suspenso" ? "Suspenso" : "Bloqueado"} ${item.ate ? `até ${dataHoraCurta(item.ate)} (${tempoRestante(item.ate)})` : "sem prazo (indeterminado)"}.`}{" "}
                    Motivo: <strong>{item.motivo}</strong>. Por {item.bloqueado_por} em {dataHoraCurta(item.bloqueado_em)}.
                    {item.com_rede ? " A rede (IP) também está bloqueada." : ""}
                  </p>
                ) : (
                  <p className="apa-situacao__texto">Este aparelho abre o site normalmente.</p>
                )}
                <div className="apa-acoes">
                  {situacao === "ativo" ? (
                    <>
                      <button type="button" className="advis-btn apa-btn--perigo" onClick={() => setAcao("bloquear")}><Ban size={16} aria-hidden="true" /> Bloquear</button>
                      <button type="button" className="advis-btn apa-btn--aviso" onClick={() => setAcao("suspender")}><Clock size={16} aria-hidden="true" /> Suspender</button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="advis-btn" onClick={() => setAcao("desbloquear")}><ShieldCheck size={16} aria-hidden="true" /> Desbloquear</button>
                      <button type="button" className="advis-btn advis-btn--soft" onClick={() => setAcao("editar")}><Pencil size={16} aria-hidden="true" /> Editar motivo/prazo</button>
                    </>
                  )}
                  <button type="button" className="advis-btn advis-btn--soft" onClick={() => setAcao("expulsar")}><LogOut size={16} aria-hidden="true" /> Expulsar</button>
                </div>
              </section>

              {/* ===== Dados do aparelho ===== */}
              <section className="advd-bloco">
                <h3><Smartphone size={16} aria-hidden="true" /> Dados do aparelho</h3>
                <dl className="apa-dados">
                  <div><dt>Aparelho</dt><dd>{ref ? aparelhoDe(ref) : "—"}</dd></div>
                  <div><dt>Local aproximado</dt><dd>{ref ? localDe(ref) : "—"}</dd></div>
                  <div><dt>Quem</dt><dd>{item?.nome ?? (contaId ? "Cadastrado" : "Anônimo (sem conta)")}</dd></div>
                  <div><dt>Primeira visita</dt><dd>{dataHoraCurta(item?.primeira ?? sessoes[sessoes.length - 1]?.iniciada_em)}</dd></div>
                  <div><dt>Última atividade</dt><dd>{dataHoraCurta(item?.ultima_atividade ?? sessoes[0]?.iniciada_em)}</dd></div>
                  <div><dt>Visitas / páginas / tempo</dt><dd>{item?.sessoes ?? sessoes.length} / {item?.paginas ?? "—"} / {duracao(item?.duracao_seg ?? 0)}</dd></div>
                </dl>
                {!contaId && <p className="advd-info">Visitas de quem não tem conta somem em 24 h; o bloqueio não some.</p>}
              </section>

              {/* ===== Histórico de bloqueios ===== */}
              <section className="advd-bloco">
                <h3><Ban size={16} aria-hidden="true" /> Histórico de bloqueios</h3>
                {bloqueios.length === 0 ? <p className="advd-vazio">Nunca foi bloqueado ou suspenso.</p> : (
                  <ul className="advd-linha-tempo">
                    {bloqueios.map((b) => (
                      <li key={b.id}>
                        <span className={`advd-ponto ${b.ativo ? "apa-ponto--vermelho" : ""}`} aria-hidden="true" />
                        <div>
                          <strong>{b.tipo === "bloqueio" ? "Bloqueio" : "Suspensão"} · {dataHoraCurta(b.criado_em)}{b.ativo && (!b.ate || new Date(b.ate).getTime() > Date.now()) ? " · em vigor" : ""}</strong>
                          <span>
                            Motivo: {b.motivo} · por {b.criado_por}
                            {b.ate ? ` · até ${dataHoraCurta(b.ate)}` : " · sem prazo"}{b.ip_hash ? " · incluiu a rede" : ""}
                            {b.desbloqueado_em ? ` · liberado ${dataHoraCurta(b.desbloqueado_em)} por ${b.desbloqueado_por ?? "—"}${b.desbloqueio_motivo ? ` (${b.desbloqueio_motivo})` : ""}` : ""}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="advd-bloco">
                <h3><LogOut size={16} aria-hidden="true" /> Expulsões</h3>
                {expulsoes.length === 0 ? <p className="advd-vazio">Nenhuma expulsão.</p> : (
                  <ul className="advd-linha-tempo">
                    {expulsoes.map((x) => (
                      <li key={x.id}>
                        <span className="advd-ponto advd-ponto--clique" aria-hidden="true" />
                        <div>
                          <strong>{dataHoraCurta(x.criado_em)} · por {x.criado_por}</strong>
                          <span>Motivo: {x.motivo} · {x.entregue_em ? `aparelho desconectado em ${dataHoraCurta(x.entregue_em)}` : "aguardando o aparelho receber o aviso"}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* ===== Visitas ===== */}
              <section className="advd-bloco">
                <h3><Smartphone size={16} aria-hidden="true" /> Últimas visitas</h3>
                {sessoes.length === 0 ? <p className="advd-vazio">Nenhuma visita registrada (anônimos somem em 24 h).</p> : (
                  <ul className="advd-linha-tempo">
                    {sessoes.map((s) => (
                      <li key={s.id}>
                        <span className="advd-ponto" aria-hidden="true" />
                        <div>
                          <strong>{dataHoraCurta(s.iniciada_em)} · {duracao(s.duracao_seg)} · {s.paginas} página(s)</strong>
                          <span>{localDe(s)} · origem: {origemDe(s)} · <button type="button" className="apa-link" onClick={() => void verPaginas(s.id)}>{paginas[s.id] ? "ocultar páginas" : "ver páginas"}</button></span>
                          {paginas[s.id] && (
                            <ul className="apa-paginas">
                              {paginas[s.id].map((p) => <li key={p.id}><code className="aac-codigo">{p.caminho}</code> <span>{duracao(p.duracao_seg)}</span></li>)}
                            </ul>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </aside>

      {acao && (
        <div onClick={(e) => e.stopPropagation()} role="presentation">
          <AcaoAparelhoModal
            acao={acao}
            inicial={item?.bloqueio_tipo ? { motivo: item.motivo ?? "", ate: item.ate, tipo: item.bloqueio_tipo } : undefined}
            alvo={{ anon_id: anonId, descricao: `Aparelho id ${idCurto(anonId)}${item?.nome ? ` · ${item.nome}` : ""}${ref ? ` · ${aparelhoDe(ref)}` : ""}` }}
            onFechar={() => setAcao(null)}
            onFeito={(msg) => { setAcao(null); mostrar("sucesso", msg); onAlterado?.(); void carregar(); }}
          />
        </div>
      )}
      <ToastArea toasts={toasts} onFechar={fechar} />
    </div>
  );
}
