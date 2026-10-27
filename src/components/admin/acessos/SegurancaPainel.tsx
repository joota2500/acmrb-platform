"use client";

/**
 * SegurancaPainel — segurança do site (somente ADM DEUS)
 * ------------------------------------------------------------
 * Três visões:
 *  - Logins: tentativas certas e erradas (e-mail parcialmente escondido,
 *    sem IP), resumo das últimas 24 h e botão para liberar um bloqueio.
 *  - Auditoria: o que cada administrador criou, alterou ou excluiu
 *    (gravado pelo banco, não pelo navegador).
 *  - Limpeza: apaga agora os acessos anônimos com mais de 24 h.
 * Dados: login_tentativas e admin_auditoria (RLS: só is_deus()).
 * CSS: src/styles/admin-acessos.css (prefixo "aac-").
 */

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, LockOpen, RefreshCw, Trash2 } from "lucide-react";

import "@/styles/admin-acessos.css";
import { supabase } from "@/lib/supabase";
import { chamarApi } from "@/lib/apiAdmin";
import { dataHoraCurta } from "@/components/admin/visitantes/tipos";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { localDe, mensagemErro } from "./tipos";

interface Tentativa {
  id: number;
  criado_em: string;
  tipo: string;
  sucesso: boolean;
  motivo: string | null;
  email_hash: string;
  email_mascarado: string | null;
  dispositivo: string | null;
  navegador: string | null;
  cidade: string | null;
  regiao: string | null;
  pais: string | null;
}
interface Auditoria { id: number; ator_email: string; acao: string; alvo_email: string | null; detalhes: Record<string, unknown>; created_at: string }

const POR_PAGINA = 20;
const VERBOS: Record<string, string> = { insert: "criou", update: "alterou", delete: "excluiu" };
const TABELAS: Record<string, string> = {
  noticias: "notícia", associados: "associado", apoiadores: "apoiador", empresas_logistica: "empresa de logística",
  repasses_logistica: "repasse", parceiros: "parceiro", quem_somos_conteudo: "texto de Quem Somos",
  transparencia_documentos: "documento de transparência", coleta_calendario: "calendário de coleta",
  dashboard_metricas: "indicador", coleta_solicitacoes: "pedido de coleta", admins: "administrador",
};

/** "update:noticias" → "alterou notícia"; ações antigas (visitante_excluir) ficam legíveis */
function descreverAcao(a: Auditoria) {
  const [op, tabela] = a.acao.split(":");
  if (tabela && VERBOS[op]) return `${VERBOS[op]} ${TABELAS[tabela] ?? tabela}`;
  return a.acao.replace(/_/g, " ");
}

type Visao = "logins" | "auditoria" | "limpeza";

export default function SegurancaPainel() {
  const [visao, setVisao] = useState<Visao>("logins");
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  return (
    <div className="aac">
      <div className="aac-periodos" role="tablist" aria-label="Segurança">
        {([["logins", "Tentativas de login"], ["auditoria", "Auditoria do painel"], ["limpeza", "Limpeza"]] as [Visao, string][]).map(([id, rotulo]) => (
          <button key={id} type="button" role="tab" aria-selected={visao === id} className={visao === id ? "aac-chip aac-chip--ativo" : "aac-chip"} onClick={() => setVisao(id)}>{rotulo}</button>
        ))}
      </div>
      {aviso && <p className={aviso.tipo === "ok" ? "aac-nota" : "aac-erro"} role="status">{aviso.texto}</p>}
      {visao === "logins" && <Logins onAviso={setAviso} />}
      {visao === "auditoria" && <AuditoriaLista />}
      {visao === "limpeza" && <Limpeza onAviso={setAviso} />}
    </div>
  );
}

function Logins({ onAviso }: { onAviso: (a: { tipo: "ok" | "erro"; texto: string }) => void }) {
  const [linhas, setLinhas] = useState<Tentativa[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [resultado, setResultado] = useState<"todos" | "falhas" | "acertos">("todos");
  const [tipo, setTipo] = useState("");
  const [resumo, setResumo] = useState({ falhas: 0, acertos: 0 });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    let q = supabase.from("login_tentativas")
      .select("id, criado_em, tipo, sucesso, motivo, email_hash, email_mascarado, dispositivo, navegador, cidade, regiao, pais", { count: "exact" })
      .order("criado_em", { ascending: false }).range(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA - 1);
    if (resultado !== "todos") q = q.eq("sucesso", resultado === "acertos");
    if (tipo) q = q.eq("tipo", tipo);
    const desde = new Date(Date.now() - 86_400_000).toISOString();
    const [r, f, a] = await Promise.all([
      q,
      supabase.from("login_tentativas").select("id", { count: "exact", head: true }).eq("sucesso", false).eq("tipo", "login").gte("criado_em", desde),
      supabase.from("login_tentativas").select("id", { count: "exact", head: true }).eq("sucesso", true).eq("tipo", "login").gte("criado_em", desde),
    ]);
    if (r.error) {
      setErro(mensagemErro(r.error, "20261027110000_seguranca_limites_auditoria.sql"));
      setCarregando(false);
      return;
    }
    setErro("");
    setLinhas((r.data ?? []) as Tentativa[]);
    setTotal(r.count ?? 0);
    setResumo({ falhas: f.count ?? 0, acertos: a.count ?? 0 });
    setCarregando(false);
  }, [pagina, resultado, tipo]);

  useEffect(() => { void carregar(); }, [carregar]);

  async function liberar(t: Tentativa) {
    try {
      await chamarApi("POST", "/api/admin/seguranca", { acao: "liberar_bloqueio", email_hash: t.email_hash });
      onAviso({ tipo: "ok", texto: `Bloqueio de ${t.email_mascarado ?? "este e-mail"} liberado.` });
      void carregar();
    } catch (e) {
      onAviso({ tipo: "erro", texto: (e as Error).message });
    }
  }

  const nTotal = Math.max(1, Math.ceil(total / POR_PAGINA));
  return (
    <>
      <div className="aac-cards">
        <div className="aac-card"><strong>{resumo.falhas}</strong><span>logins errados em 24 h</span></div>
        <div className="aac-card"><strong>{resumo.acertos}</strong><span>logins certos em 24 h</span></div>
        <div className="aac-card" style={{ gridColumn: "span 2" }}>
          <span>Regras: 5 senhas erradas do mesmo e-mail na mesma rede bloqueiam por 15 min; 20 falhas de uma mesma rede bloqueiam a rede. Não guardamos IP.</span>
        </div>
      </div>
      <div className="aac-filtros">
        <select className="advis-select" aria-label="Resultado" value={resultado} onChange={(e) => { setResultado(e.target.value as typeof resultado); setPagina(0); }}>
          <option value="todos">Certos e errados</option><option value="falhas">Só erros</option><option value="acertos">Só acertos</option>
        </select>
        <select className="advis-select" aria-label="Tipo" value={tipo} onChange={(e) => { setTipo(e.target.value); setPagina(0); }}>
          <option value="">Login, cadastro e senha</option><option value="login">Login</option><option value="cadastro">Cadastro</option><option value="recuperar">Recuperar senha</option>
        </select>
        <button type="button" className="advis-btn advis-btn--soft" onClick={() => void carregar()}><RefreshCw size={16} aria-hidden="true" /> Atualizar</button>
      </div>
      {erro && <p className="aac-erro" role="alert">{erro}</p>}
      {carregando ? <p className="aac-vazio"><Loader2 className="advis-giro" aria-hidden="true" /> Carregando…</p> : linhas.length === 0 ? <p className="aac-vazio">Nenhum registro ainda.</p> : (
        <div className="advis-tabela-wrap">
          <table className="advis-tabela">
            <thead><tr><th>Quando</th><th>Tipo</th><th>Resultado</th><th>E-mail</th><th>Local</th><th>Aparelho</th><th><span className="advis-sr">Ações</span></th></tr></thead>
            <tbody>
              {linhas.map((t) => (
                <tr key={t.id}>
                  <td data-rotulo="Quando">{dataHoraCurta(t.criado_em)}</td>
                  <td data-rotulo="Tipo">{t.tipo === "recuperar" ? "recuperar senha" : t.tipo}</td>
                  <td data-rotulo="Resultado"><span className={`aac-selo ${t.sucesso ? "aac-selo--ok" : "aac-selo--erro"}`}>{t.sucesso ? "certo" : "errado"}</span>{t.motivo && <span className="advis-email">{t.motivo}</span>}</td>
                  <td data-rotulo="E-mail">{t.email_mascarado ?? "—"}</td>
                  <td data-rotulo="Local">{localDe(t)}</td>
                  <td data-rotulo="Aparelho">{[t.dispositivo, t.navegador].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="advis-acao">{!t.sucesso && t.tipo === "login" && <button type="button" className="advis-btn advis-btn--soft" onClick={() => void liberar(t)}><LockOpen size={15} aria-hidden="true" /> Liberar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Paginacao pagina={pagina} total={nTotal} onMudar={setPagina} />
    </>
  );
}

function AuditoriaLista() {
  const [linhas, setLinhas] = useState<Auditoria[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [ator, setAtor] = useState("");
  const [atores, setAtores] = useState<string[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    let q = supabase.from("admin_auditoria").select("id, ator_email, acao, alvo_email, detalhes, created_at", { count: "exact" })
      .order("created_at", { ascending: false }).range(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA - 1);
    if (ator) q = q.eq("ator_email", ator);
    const { data, count, error } = await q;
    if (error) {
      setErro(mensagemErro(error, "20261020190000_admin_auditoria.sql"));
      setCarregando(false);
      return;
    }
    setErro("");
    setLinhas((data ?? []) as Auditoria[]);
    setTotal(count ?? 0);
    setCarregando(false);
  }, [pagina, ator]);

  useEffect(() => { void carregar(); }, [carregar]);
  useEffect(() => {
    void supabase.from("admins").select("email").then(({ data }) => setAtores((data ?? []).map((a) => a.email as string)));
  }, []);

  const nTotal = Math.max(1, Math.ceil(total / POR_PAGINA));
  return (
    <>
      <p className="aac-nota">O banco registra sozinho quem criou, alterou ou excluiu conteúdo no painel. Os valores dos campos não são guardados, só quais campos mudaram.</p>
      <div className="aac-filtros">
        <select className="advis-select" aria-label="Quem fez" value={ator} onChange={(e) => { setAtor(e.target.value); setPagina(0); }}>
          <option value="">Todos os administradores</option>
          {atores.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <button type="button" className="advis-btn advis-btn--soft" onClick={() => void carregar()}><RefreshCw size={16} aria-hidden="true" /> Atualizar</button>
      </div>
      {erro && <p className="aac-erro" role="alert">{erro}</p>}
      {carregando ? <p className="aac-vazio"><Loader2 className="advis-giro" aria-hidden="true" /> Carregando…</p> : linhas.length === 0 ? <p className="aac-vazio">Nenhuma ação registrada ainda.</p> : (
        <div className="advis-tabela-wrap">
          <table className="advis-tabela">
            <thead><tr><th>Quando</th><th>Quem</th><th>O que fez</th><th>Sobre</th><th>Campos</th></tr></thead>
            <tbody>
              {linhas.map((a) => {
                const d = a.detalhes ?? {};
                const campos = Array.isArray(d.campos) ? (d.campos as string[]).join(", ") : Object.keys(d).filter((k) => !["tabela", "registro", "rotulo"].includes(k)).join(", ");
                return (
                  <tr key={a.id}>
                    <td data-rotulo="Quando">{dataHoraCurta(a.created_at)}</td>
                    <td data-rotulo="Quem">{a.ator_email}</td>
                    <td data-rotulo="O que fez"><strong className="advis-nome">{descreverAcao(a)}</strong></td>
                    <td data-rotulo="Sobre">{(d.rotulo as string) || a.alvo_email || "—"}</td>
                    <td data-rotulo="Campos">{campos || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Paginacao pagina={pagina} total={nTotal} onMudar={setPagina} />
    </>
  );
}

function Limpeza({ onAviso }: { onAviso: (a: { tipo: "ok" | "erro"; texto: string }) => void }) {
  const [anonimos, setAnonimos] = useState<number | null>(null);
  const [vencidos, setVencidos] = useState<number | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [rodando, setRodando] = useState(false);

  const contar = useCallback(async () => {
    const limite = new Date(Date.now() - 24 * 3_600_000).toISOString();
    const [a, v] = await Promise.all([
      supabase.from("acessos_sessoes").select("id", { count: "exact", head: true }).is("auth_user_id", null),
      supabase.from("acessos_sessoes").select("id", { count: "exact", head: true }).is("auth_user_id", null).lt("ultima_atividade", limite),
    ]);
    setAnonimos(a.error ? null : a.count ?? 0);
    setVencidos(v.error ? null : v.count ?? 0);
  }, []);
  useEffect(() => { void contar(); }, [contar]);

  async function rodar() {
    setRodando(true);
    try {
      const r = await chamarApi("POST", "/api/admin/seguranca", { acao: "limpar_agora" });
      onAviso({ tipo: "ok", texto: `Limpeza feita: ${r.sessoes_apagadas ?? 0} acesso(s) anônimo(s) antigo(s) apagado(s).` });
      setConfirmar(false);
      void contar();
    } catch (e) {
      onAviso({ tipo: "erro", texto: (e as Error).message });
    } finally {
      setRodando(false);
    }
  }

  return (
    <>
      <div className="aac-cards">
        <div className="aac-card"><strong>{anonimos ?? "—"}</strong><span>acessos anônimos guardados</span></div>
        <div className="aac-card"><strong>{vencidos ?? "—"}</strong><span>já passaram de 24 h</span></div>
      </div>
      <section className="aac-bloco">
        <h3>Como a limpeza funciona</h3>
        <p className="aac-nota">
          Todo acesso de quem não fez login é apagado 24 horas depois da última atividade. Antes de apagar, o banco guarda só os totais do dia
          (visitas, aparelho, origem, cidade), que não identificam ninguém. A limpeza roda sozinha de hora em hora (pg_cron) ou uma vez por dia
          (Vercel Cron). Se os números acima de &ldquo;já passaram de 24 h&rdquo; não zerarem, o agendamento não está ativo: veja o guia de configuração.
        </p>
        <div>
          <button type="button" className="advis-btn" onClick={() => setConfirmar(true)}><Trash2 size={16} aria-hidden="true" /> Rodar limpeza agora</button>
        </div>
      </section>
      <ConfirmDialog aberto={confirmar} titulo="Rodar a limpeza agora?" mensagem="Os acessos anônimos com mais de 24 h serão apagados (ficam só os totais do dia). Isso não pode ser desfeito." textoConfirmar="Rodar limpeza" perigo carregando={rodando} onConfirmar={rodar} onCancelar={() => setConfirmar(false)} />
    </>
  );
}

function Paginacao({ pagina, total, onMudar }: { pagina: number; total: number; onMudar: (p: number) => void }) {
  return (
    <nav className="advis-paginacao" aria-label="Paginação">
      <button type="button" className="advis-btn advis-btn--ghost" disabled={pagina === 0} onClick={() => onMudar(pagina - 1)}><ChevronLeft size={16} aria-hidden="true" /> Anterior</button>
      <span>Página {pagina + 1} de {total}</span>
      <button type="button" className="advis-btn advis-btn--ghost" disabled={pagina + 1 >= total} onClick={() => onMudar(pagina + 1)}>Próxima <ChevronRight size={16} aria-hidden="true" /></button>
    </nav>
  );
}
