"use client";

/**
 * VisitanteDetalhe — gaveta lateral de um visitante (somente ADM DEUS)
 * ------------------------------------------------------------
 * Abas:
 *  - Atividade: total de logins, tempo total e médio, último acesso,
 *    páginas mais visitadas, itens mais clicados e linha do tempo
 *    (sessões e eventos recentes). Dados: visitante_sessoes e
 *    visitante_eventos (RLS is_deus).
 *  - Dados: edição de nome, telefone, cidade e nascimento; ativar /
 *    desativar; excluir (com confirmação) via /api/admin/visitantes.
 * CSS: src/styles/admin-visitante-detalhe.css (prefixo "advd-").
 */

import { useEffect, useMemo, useState } from "react";
import { Activity, Clock, Copy, KeyRound, Loader2, LogIn, Mail, MousePointerClick, Power, Save, Timer, Trash2, X, FileText } from "lucide-react";

import "@/styles/admin-visitante-detalhe.css";
import { supabase } from "@/lib/supabase";
import { chamarApi } from "@/lib/apiAdmin";
import { mascaraTelefone } from "@/lib/validacao";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { dataHoraCurta, duracao, type Visitante } from "./tipos";

interface Sessao {
  id: string;
  iniciada_em: string;
  ultima_atividade: string;
  encerrada_em: string | null;
  duracao_seg: number;
  user_agent: string | null;
}
interface Evento {
  id: number;
  sessao_id: string | null;
  tipo: "pagina" | "clique";
  caminho: string;
  rotulo: string | null;
  alvo: string | null;
  criado_em: string;
}

interface LoginReg { id: number; criado_em: string; dispositivo: string | null; navegador: string | null; cidade: string | null; regiao: string | null; pais: string | null }
interface AcessoSite { id: string; iniciada_em: string; duracao_seg: number; paginas: number; origem: string | null; referrer_host: string | null; dispositivo: string | null; navegador: string | null; sistema: string | null; cidade: string | null; regiao: string | null; pais: string | null }

interface Props {
  visitante: Visitante;
  onFechar: () => void;
  onAlterado: (msg: string) => void;
  onErro: (msg: string) => void;
  onExcluido: (msg: string) => void;
}

/** "Mozilla/5.0 (... Android ...) Chrome/..." → "Chrome · Android" */
function navegador(ua: string | null) {
  if (!ua) return "—";
  const nav = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navegador";
  const so = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return so ? `${nav} · ${so}` : nav;
}

/** Contagem decrescente (top N) */
function ranking(itens: string[], n = 8) {
  const mapa = new Map<string, number>();
  for (const i of itens) mapa.set(i, (mapa.get(i) ?? 0) + 1);
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default function VisitanteDetalhe({ visitante: v, onFechar, onAlterado, onErro, onExcluido }: Props) {
  const [aba, setAba] = useState<"atividade" | "logins" | "dados">("atividade");
  const [logins, setLogins] = useState<LoginReg[] | null>(null);
  const [acessosSite, setAcessosSite] = useState<AcessoSite[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [linkSenha, setLinkSenha] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: v.nome,
    telefone: v.telefone ?? "",
    cidade: v.cidade ?? "",
    data_nascimento: v.data_nascimento ?? "",
  });

  // Fecha com Esc
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && !confirmar && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar, confirmar]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      setCarregando(true);
      if (!v.auth_user_id) {
        setCarregando(false);
        return;
      }
      const [s, e] = await Promise.all([
        supabase.from("visitante_sessoes").select("id, iniciada_em, ultima_atividade, encerrada_em, duracao_seg, user_agent")
          .eq("auth_user_id", v.auth_user_id).order("iniciada_em", { ascending: false }).limit(500),
        supabase.from("visitante_eventos").select("id, sessao_id, tipo, caminho, rotulo, alvo, criado_em")
          .eq("auth_user_id", v.auth_user_id).order("criado_em", { ascending: false }).limit(1000),
      ]);
      if (!vivo) return;
      setSessoes((s.data ?? []) as Sessao[]);
      setEventos((e.data ?? []) as Evento[]);
      setCarregando(false);
    })();
    return () => { vivo = false; };
  }, [v.auth_user_id]);

  // Histórico de logins e acessos ao site (carrega ao abrir a aba)
  useEffect(() => {
    if (aba !== "logins" || logins !== null || !v.auth_user_id) return;
    void (async () => {
      const [l, a] = await Promise.all([
        supabase.from("login_tentativas").select("id, criado_em, dispositivo, navegador, cidade, regiao, pais").eq("auth_user_id", v.auth_user_id).eq("sucesso", true).order("criado_em", { ascending: false }).limit(50),
        supabase.from("acessos_sessoes").select("id, iniciada_em, duracao_seg, paginas, origem, referrer_host, dispositivo, navegador, sistema, cidade, regiao, pais").eq("auth_user_id", v.auth_user_id).order("iniciada_em", { ascending: false }).limit(50),
      ]);
      setLogins((l.data ?? []) as LoginReg[]);
      setAcessosSite((a.data ?? []) as AcessoSite[]);
    })();
  }, [aba, logins, v.auth_user_id]);

  // Métricas calculadas no navegador (até 500 sessões / 1000 eventos)
  const m = useMemo(() => {
    const totalSeg = sessoes.reduce((a, s) => a + (s.duracao_seg ?? 0), 0);
    return {
      logins: sessoes.length,
      totalSeg,
      mediaSeg: sessoes.length ? Math.round(totalSeg / sessoes.length) : 0,
      ultimo: sessoes[0]?.ultima_atividade ?? null,
      paginas: ranking(eventos.filter((e) => e.tipo === "pagina").map((e) => e.caminho)),
      cliques: ranking(eventos.filter((e) => e.tipo === "clique").map((e) => e.rotulo || e.alvo || "(sem rótulo)")),
    };
  }, [sessoes, eventos]);

  async function salvar(dados: Record<string, unknown>, msg: string) {
    setSalvando(true);
    try {
      await chamarApi("PATCH", "/api/admin/visitantes", { id: v.id, ...dados });
      onAlterado(msg);
    } catch (e) {
      onErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  // Redefinir senha: por e-mail (Supabase envia) ou gerando o link para o deus copiar
  async function redefinirSenha(modo: "email" | "link") {
    setSalvando(true);
    setLinkSenha(null);
    try {
      const r = await chamarApi("POST", "/api/admin/visitantes", { acao: "resetar_senha", id: v.id, modo });
      if (modo === "link") setLinkSenha(r.link as string);
      else onAlterado(`E-mail de redefinição enviado para ${v.email}.`);
    } catch (e) {
      onErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function copiarLink() {
    if (!linkSenha) return;
    try {
      await navigator.clipboard.writeText(linkSenha);
      onAlterado("Link copiado. Envie ao visitante (vale por pouco tempo).");
    } catch {
      onErro("Não foi possível copiar; selecione o link e copie manualmente.");
    }
  }

  async function excluir() {
    setSalvando(true);
    try {
      const r = await chamarApi("DELETE", `/api/admin/visitantes?id=${v.id}`);
      setConfirmar(false);
      onExcluido(r.modo === "completo" ? "Visitante excluído (conta e histórico)." : "Visitante excluído.");
    } catch (e) {
      onErro((e as Error).message);
      setSalvando(false);
    }
  }

  const max = (lista: [string, number][]) => lista[0]?.[1] ?? 1;

  return (
    <div className="advd-fundo" onClick={onFechar} role="presentation">
      <aside className="advd" role="dialog" aria-modal="true" aria-labelledby="advd-titulo" onClick={(e) => e.stopPropagation()}>
        <header className="advd-topo">
          <div className="advd-id">
            <span className="advd-avatar" aria-hidden="true">{v.nome.charAt(0).toUpperCase()}</span>
            <div>
              <h2 id="advd-titulo" className="advd-nome">{v.nome}</h2>
              <p className="advd-email">{v.email}</p>
            </div>
          </div>
          <button type="button" className="advd-fechar" onClick={onFechar} aria-label="Fechar detalhes"><X size={20} /></button>
        </header>

        <div className="advd-abas" role="tablist">
          <button type="button" role="tab" aria-selected={aba === "atividade"} className={aba === "atividade" ? "advd-aba advd-aba--ativa" : "advd-aba"} onClick={() => setAba("atividade")}>Atividade</button>
          <button type="button" role="tab" aria-selected={aba === "logins"} className={aba === "logins" ? "advd-aba advd-aba--ativa" : "advd-aba"} onClick={() => setAba("logins")}>Logins e acessos</button>
          <button type="button" role="tab" aria-selected={aba === "dados"} className={aba === "dados" ? "advd-aba advd-aba--ativa" : "advd-aba"} onClick={() => setAba("dados")}>Dados e conta</button>
        </div>

        <div className="advd-corpo">
          {aba === "atividade" && (carregando ? (
            <p className="advd-vazio"><Loader2 className="advd-giro" aria-hidden="true" /> Carregando atividade…</p>
          ) : (
            <>
              <div className="advd-cards">
                <div className="advd-card"><LogIn size={18} aria-hidden="true" /><strong>{m.logins}</strong><span>logins</span></div>
                <div className="advd-card"><Clock size={18} aria-hidden="true" /><strong>{duracao(m.totalSeg)}</strong><span>tempo total</span></div>
                <div className="advd-card"><Timer size={18} aria-hidden="true" /><strong>{duracao(m.mediaSeg)}</strong><span>média por sessão</span></div>
                <div className="advd-card"><Activity size={18} aria-hidden="true" /><strong>{dataHoraCurta(m.ultimo)}</strong><span>último acesso</span></div>
              </div>

              <div className="advd-grade">
                <section className="advd-bloco">
                  <h3><FileText size={16} aria-hidden="true" /> Páginas mais visitadas</h3>
                  {m.paginas.length === 0 ? <p className="advd-vazio">Sem registros.</p> : (
                    <ul className="advd-barras">
                      {m.paginas.map(([k, n]) => (
                        <li key={k}><span className="advd-barra-rotulo" title={k}>{k}</span><span className="advd-barra"><i style={{ width: `${(n / max(m.paginas)) * 100}%` }} /></span><b>{n}</b></li>
                      ))}
                    </ul>
                  )}
                </section>
                <section className="advd-bloco">
                  <h3><MousePointerClick size={16} aria-hidden="true" /> Itens mais clicados</h3>
                  {m.cliques.length === 0 ? <p className="advd-vazio">Sem registros.</p> : (
                    <ul className="advd-barras">
                      {m.cliques.map(([k, n]) => (
                        <li key={k}><span className="advd-barra-rotulo" title={k}>{k}</span><span className="advd-barra"><i style={{ width: `${(n / max(m.cliques)) * 100}%` }} /></span><b>{n}</b></li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              <section className="advd-bloco">
                <h3><LogIn size={16} aria-hidden="true" /> Sessões recentes</h3>
                {sessoes.length === 0 ? <p className="advd-vazio">Nenhuma sessão registrada.</p> : (
                  <ul className="advd-linha-tempo">
                    {sessoes.slice(0, 10).map((s) => (
                      <li key={s.id}>
                        <span className="advd-ponto" aria-hidden="true" />
                        <div>
                          <strong>{dataHoraCurta(s.iniciada_em)}</strong>
                          <span>{duracao(s.duracao_seg)} · {navegador(s.user_agent)} · {s.encerrada_em ? `saiu ${dataHoraCurta(s.encerrada_em)}` : "sem saída registrada"}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="advd-bloco">
                <h3><Activity size={16} aria-hidden="true" /> Eventos recentes</h3>
                {eventos.length === 0 ? <p className="advd-vazio">Nenhum evento registrado.</p> : (
                  <ul className="advd-linha-tempo advd-linha-tempo--eventos">
                    {eventos.slice(0, 30).map((e) => (
                      <li key={e.id}>
                        <span className={`advd-ponto advd-ponto--${e.tipo}`} aria-hidden="true" />
                        <div>
                          <strong>{e.tipo === "pagina" ? `Abriu ${e.caminho}` : `Clicou em “${e.rotulo || e.alvo || "item"}”`}</strong>
                          <span>{dataHoraCurta(e.criado_em)}{e.tipo === "clique" ? ` · em ${e.caminho}` : ""}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ))}

          {aba === "logins" && (
            logins === null ? (
              <p className="advd-vazio"><Loader2 className="advd-giro" aria-hidden="true" /> Carregando…</p>
            ) : (
              <>
                <section className="advd-bloco">
                  <h3><LogIn size={16} aria-hidden="true" /> Histórico de logins</h3>
                  {logins.length === 0 ? <p className="advd-vazio">Nenhum login registrado depois da ativação do registro de segurança.</p> : (
                    <ul className="advd-linha-tempo">
                      {logins.map((l) => (
                        <li key={l.id}><span className="advd-ponto" aria-hidden="true" /><div><strong>{dataHoraCurta(l.criado_em)}</strong><span>{[l.dispositivo, l.navegador].filter(Boolean).join(" · ") || "aparelho não informado"} · {[l.cidade, l.regiao, l.pais].filter(Boolean).join(", ") || "local não informado"}</span></div></li>
                      ))}
                    </ul>
                  )}
                </section>
                <section className="advd-bloco">
                  <h3><Activity size={16} aria-hidden="true" /> Visitas ao site (logado)</h3>
                  {acessosSite.length === 0 ? <p className="advd-vazio">Nenhuma visita registrada.</p> : (
                    <ul className="advd-linha-tempo">
                      {acessosSite.map((a) => (
                        <li key={a.id}><span className="advd-ponto" aria-hidden="true" /><div><strong>{dataHoraCurta(a.iniciada_em)} · {duracao(a.duracao_seg)} · {a.paginas} página(s)</strong><span>{[a.dispositivo, a.navegador, a.sistema].filter(Boolean).join(" · ") || "aparelho não informado"} · {[a.cidade, a.regiao, a.pais].filter(Boolean).join(", ") || "local não informado"} · origem: {a.referrer_host ?? a.origem ?? "direto"}</span></div></li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )
          )}

          {aba === "dados" && (
            <>
              <form
                className="advd-form"
                onSubmit={(e) => { e.preventDefault(); void salvar(form, "Dados do visitante salvos."); }}
              >
                <label>Nome completo<input className="advd-input" value={form.nome} maxLength={100} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></label>
                <label>E-mail (login)<input className="advd-input" value={v.email} disabled /></label>
                <div className="advd-form-linha">
                  <label>Telefone<input className="advd-input" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: mascaraTelefone(e.target.value) })} /></label>
                  <label>Nascimento<input className="advd-input" type="date" value={form.data_nascimento} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })} /></label>
                </div>
                <label>Cidade<input className="advd-input" value={form.cidade} maxLength={80} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></label>
                <p className="advd-info">Cadastrado em {dataHoraCurta(v.created_at)}.</p>
                <button type="submit" className="advd-btn" disabled={salvando}><Save size={16} aria-hidden="true" /> Salvar dados</button>
              </form>

              <div className="advd-perigo">
                <div>
                  <h3>Situação: {v.ativo ? "ativo" : "inativo"}</h3>
                  <p>Desativar bloqueia o login do visitante sem apagar o histórico.</p>
                </div>
                <button type="button" className="advd-btn advd-btn--soft" disabled={salvando} onClick={() => void salvar({ ativo: !v.ativo }, v.ativo ? "Visitante desativado." : "Visitante reativado.")}>
                  <Power size={16} aria-hidden="true" /> {v.ativo ? "Desativar" : "Reativar"}
                </button>
              </div>
              <div className="advd-senha">
                <div>
                  <h3><KeyRound size={15} aria-hidden="true" /> Redefinir senha</h3>
                  <p>Envie ao visitante um e-mail para criar nova senha, ou gere o link e mande por WhatsApp.</p>
                </div>
                <div className="advd-senha-botoes">
                  <button type="button" className="advd-btn advd-btn--soft" disabled={salvando} onClick={() => void redefinirSenha("email")}>
                    <Mail size={16} aria-hidden="true" /> Enviar e-mail
                  </button>
                  <button type="button" className="advd-btn advd-btn--soft" disabled={salvando} onClick={() => void redefinirSenha("link")}>
                    <KeyRound size={16} aria-hidden="true" /> Gerar link
                  </button>
                </div>
                {linkSenha && (
                  <div className="advd-senha-link">
                    <input className="advd-input" readOnly value={linkSenha} onFocus={(e) => e.currentTarget.select()} aria-label="Link para redefinir a senha" />
                    <button type="button" className="advd-btn" onClick={() => void copiarLink()}><Copy size={16} aria-hidden="true" /> Copiar</button>
                  </div>
                )}
              </div>
              <div className="advd-perigo advd-perigo--vermelho">
                <div>
                  <h3>Excluir visitante</h3>
                  <p>Remove a conta de acesso, o perfil, as sessões e os eventos. Não pode ser desfeito.</p>
                </div>
                <button type="button" className="advd-btn advd-btn--perigo" disabled={salvando} onClick={() => setConfirmar(true)}>
                  <Trash2 size={16} aria-hidden="true" /> Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Impede que cliques no diálogo fechem a gaveta */}
      <div onClick={(e) => e.stopPropagation()} role="presentation">
      <ConfirmDialog
        aberto={confirmar}
        titulo="Excluir visitante?"
        mensagem={`A conta de ${v.nome} (${v.email}) e todo o histórico serão apagados. Esta ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        perigo
        carregando={salvando}
        onConfirmar={excluir}
        onCancelar={() => setConfirmar(false)}
      />
      </div>
    </div>
  );
}
