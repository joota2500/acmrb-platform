"use client";

/**
 * LogisticaSection — "Logística Reversa" (painel, somente ADM DEUS)
 * ------------------------------------------------------------
 * CRUD das empresas parceiras de logística reversa (logo, responsável,
 * materiais aceitos, status, observações internas) e, para cada uma,
 * o sub-CRUD de repasses (data, material, peso, valor, documento, público).
 * Os repasses públicos aparecem na página /parceiros.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Edit3, Eye, EyeOff, FileText, Loader2, Plus, RefreshCw, Search, ShieldAlert, Trash2, Truck } from "lucide-react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ToastArea, useToast } from "@/components/ui/Toast";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import PainelLateral from "@/components/admin/apoiadores/PainelLateral";
import LogoUpload from "@/components/admin/apoiadores/LogoUpload";
import { STATUS_LOGISTICA, cnpjValido, formatarData, formatarKg, formatarReais, mascaraCnpj } from "@/lib/apoiadores";
import {
  empresaSchema, excluirEmpresa, excluirRepasse, listarEmpresas, listarRepasses, primeiroErro, repasseSchema, salvarEmpresa, salvarRepasse,
  type EmpresaLogistica, type Repasse,
} from "@/lib/apoiadoresAdmin";
import "@/styles/admin-apoiadores.css";

interface FormEmpresa {
  nome: string; cnpj: string; logo_url: string; responsavel_nome: string; responsavel_cargo: string; telefone_publico: string;
  email_publico: string; site: string; descricao: string; materiais: string; parceria_desde: string; status: string;
  exibir_publicamente: boolean; observacoes_internas: string; ordem: string;
}
const EMP_VAZIA: FormEmpresa = {
  nome: "", cnpj: "", logo_url: "", responsavel_nome: "", responsavel_cargo: "", telefone_publico: "", email_publico: "", site: "",
  descricao: "", materiais: "", parceria_desde: "", status: "ativa", exibir_publicamente: true, observacoes_internas: "", ordem: "0",
};

interface FormRepasse { data: string; material: string; peso_kg: string; valor: string; documento_url: string; observacao: string; publico: boolean }
const hoje = () => new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD no fuso local
const REP_VAZIO = (): FormRepasse => ({ data: hoje(), material: "", peso_kg: "", valor: "", documento_url: "", observacao: "", publico: true });

const num = (v: string) => (v.trim() === "" ? NaN : Number(v.replace(",", ".")));

export default function LogisticaSection() {
  const papel = usePapelAdmin();
  const { toasts, mostrar, fechar } = useToast();
  const [empresas, setEmpresas] = useState<EmpresaLogistica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [painelEmp, setPainelEmp] = useState(false);
  const [editEmp, setEditEmp] = useState<string | undefined>();
  const [fe, setFe] = useState<FormEmpresa>(EMP_VAZIA);
  const [salvando, setSalvando] = useState(false);
  const [aberta, setAberta] = useState<string | null>(null);
  const [repasses, setRepasses] = useState<Record<string, Repasse[]>>({});
  const [painelRep, setPainelRep] = useState<{ empresa: string; id?: string } | null>(null);
  const [fr, setFr] = useState<FormRepasse>(REP_VAZIO());
  const [excluir, setExcluir] = useState<{ tipo: "empresa" | "repasse"; id: string; empresa?: string; nome: string } | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setEmpresas(await listarEmpresas());
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarRepasses = useCallback(async (id: string) => {
    try {
      const r = await listarRepasses(id);
      setRepasses((m) => ({ ...m, [id]: r }));
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro ao carregar repasses");
    }
  }, [mostrar]);

  useEffect(() => {
    if (papel === "deus") carregar();
  }, [papel, carregar]);

  const filtradas = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return empresas.filter((e) => !t || [e.nome, e.responsavel_nome ?? "", ...e.materiais_aceitos].join(" ").toLowerCase().includes(t));
  }, [empresas, busca]);

  const fecharEmp = useCallback(() => setPainelEmp(false), []);
  const fecharRep = useCallback(() => setPainelRep(null), []);

  function novaEmpresa() {
    setEditEmp(undefined);
    setFe(EMP_VAZIA);
    setPainelEmp(true);
  }
  function editarEmpresa(e: EmpresaLogistica) {
    setEditEmp(e.id);
    setFe({
      nome: e.nome, cnpj: e.cnpj ? mascaraCnpj(e.cnpj) : "", logo_url: e.logo_url ?? "", responsavel_nome: e.responsavel_nome ?? "",
      responsavel_cargo: e.responsavel_cargo ?? "", telefone_publico: e.telefone_publico ?? "", email_publico: e.email_publico ?? "",
      site: e.site ?? "", descricao: e.descricao ?? "", materiais: (e.materiais_aceitos ?? []).join(", "), parceria_desde: e.parceria_desde ?? "",
      status: e.status, exibir_publicamente: e.exibir_publicamente, observacoes_internas: e.observacoes_internas ?? "", ordem: String(e.ordem ?? 0),
    });
    setPainelEmp(true);
  }

  async function salvarEmp() {
    const { materiais, ...resto } = fe;
    const r = empresaSchema.safeParse({
      ...resto,
      ordem: Number(fe.ordem) || 0,
      materiais_aceitos: [...new Set(materiais.split(",").map((m) => m.trim()).filter(Boolean))],
    });
    if (!r.success) return mostrar("erro", primeiroErro(r.error));
    setSalvando(true);
    try {
      await salvarEmpresa(r.data, editEmp);
      mostrar("sucesso", editEmp ? "Empresa atualizada" : "Empresa cadastrada");
      setPainelEmp(false);
      carregar();
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarVisivel(e: EmpresaLogistica) {
    const r = empresaSchema.safeParse({ ...e, cnpj: e.cnpj ?? "", exibir_publicamente: !e.exibir_publicamente, ordem: e.ordem ?? 0,
      logo_url: e.logo_url ?? "", responsavel_nome: e.responsavel_nome ?? "", responsavel_cargo: e.responsavel_cargo ?? "",
      telefone_publico: e.telefone_publico ?? "", email_publico: e.email_publico ?? "", site: e.site ?? "", descricao: e.descricao ?? "",
      parceria_desde: e.parceria_desde ?? "", observacoes_internas: e.observacoes_internas ?? "" });
    if (!r.success) return mostrar("erro", primeiroErro(r.error));
    try {
      await salvarEmpresa(r.data, e.id);
      setEmpresas((l) => l.map((x) => (x.id === e.id ? { ...x, exibir_publicamente: !e.exibir_publicamente } : x)));
    } catch (err) {
      mostrar("erro", err instanceof Error ? err.message : "Erro ao atualizar");
    }
  }

  function abrirHistorico(id: string) {
    const nova = aberta === id ? null : id;
    setAberta(nova);
    if (nova && !repasses[nova]) carregarRepasses(nova);
  }

  function novoRepasse(empresa: string) {
    setFr(REP_VAZIO());
    setPainelRep({ empresa });
  }
  function editarRepasse(r: Repasse) {
    setFr({ data: r.data, material: r.material, peso_kg: String(r.peso_kg), valor: r.valor != null ? String(r.valor) : "", documento_url: r.documento_url ?? "", observacao: r.observacao ?? "", publico: r.publico });
    setPainelRep({ empresa: r.empresa_id, id: r.id });
  }

  async function salvarRep() {
    if (!painelRep) return;
    const valor = num(fr.valor);
    const r = repasseSchema.safeParse({ ...fr, empresa_id: painelRep.empresa, peso_kg: num(fr.peso_kg), valor: Number.isNaN(valor) ? null : valor });
    if (!r.success) return mostrar("erro", primeiroErro(r.error));
    setSalvando(true);
    try {
      await salvarRepasse(r.data, painelRep.id);
      mostrar("sucesso", painelRep.id ? "Repasse atualizado" : "Repasse registrado");
      const emp = painelRep.empresa;
      setPainelRep(null);
      setAberta(emp);
      carregarRepasses(emp);
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    if (!excluir) return;
    setExcluindo(true);
    try {
      if (excluir.tipo === "empresa") {
        await excluirEmpresa(excluir.id);
        carregar();
      } else {
        await excluirRepasse(excluir.id);
        if (excluir.empresa) carregarRepasses(excluir.empresa);
      }
      mostrar("sucesso", "Excluído");
      setExcluir(null);
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro ao excluir");
    } finally {
      setExcluindo(false);
    }
  }

  if (papel !== "deus") {
    return (
      <div role="alert" className="admap-block">
        <ShieldAlert size={28} aria-hidden="true" />
        <h2>Acesso restrito</h2>
        <p>Logística Reversa é uma área exclusiva do ADM DEUS.</p>
      </div>
    );
  }

  const cnpjOk = !fe.cnpj || cnpjValido(fe.cnpj);

  return (
    <div className="admap">
      <ToastArea toasts={toasts} onFechar={fechar} />

      <div className="admap-toolbar admap-toolbar--2">
        <label className="admap-search">
          <Search size={16} aria-hidden="true" />
          <span className="admap-sr">Buscar empresa</span>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, responsável ou material" />
        </label>
        <button type="button" className="admap-btn" onClick={novaEmpresa}><Plus size={16} aria-hidden="true" /> Nova empresa</button>
      </div>

      {carregando ? (
        <div className="admap-state"><Loader2 className="admap-spin" aria-hidden="true" /> Carregando…</div>
      ) : erro ? (
        <div className="admap-state admap-state--erro" role="alert">
          {erro}
          <button type="button" className="admap-btn admap-btn--soft" onClick={carregar}><RefreshCw size={16} aria-hidden="true" /> Tentar de novo</button>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="admap-state">{empresas.length ? "Nenhuma empresa com essa busca." : "Nenhuma empresa cadastrada. Clique em “Nova empresa”."}</div>
      ) : (
        <ul className="admap-list">
          {filtradas.map((e) => {
            const reps = repasses[e.id];
            const exp = aberta === e.id;
            const total = reps?.reduce((s, r) => s + Number(r.peso_kg), 0);
            return (
              <li key={e.id} className="admap-emp">
                <div className="admap-row">
                  <span className="admap-row__logo" style={{ background: e.logo_url ? "#fff" : "#059669" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {e.logo_url ? <img src={e.logo_url} alt="" /> : <Truck size={18} aria-hidden="true" />}
                  </span>
                  <div className="admap-row__info">
                    <strong>{e.nome}</strong>
                    <span>
                      {STATUS_LOGISTICA[e.status] ?? e.status}
                      {e.responsavel_nome ? ` · ${e.responsavel_nome}` : ""}
                      {e.parceria_desde ? ` · desde ${formatarData(e.parceria_desde)}` : ""}
                    </span>
                  </div>
                  <div className="admap-row__actions">
                    <button type="button" className="admap-icon-btn" onClick={() => alternarVisivel(e)} aria-label={e.exibir_publicamente ? "Ocultar do site" : "Exibir no site"}>
                      {e.exibir_publicamente ? <Eye size={18} className="admap-on" /> : <EyeOff size={18} />}
                    </button>
                    <button type="button" className="admap-icon-btn" onClick={() => editarEmpresa(e)} aria-label={`Editar ${e.nome}`}><Edit3 size={18} /></button>
                    <button type="button" className="admap-icon-btn admap-icon-btn--danger" onClick={() => setExcluir({ tipo: "empresa", id: e.id, nome: e.nome })} aria-label={`Excluir ${e.nome}`}><Trash2 size={18} /></button>
                  </div>
                </div>
                <button type="button" className="admap-hist-toggle" aria-expanded={exp} onClick={() => abrirHistorico(e.id)}>
                  Repasses {reps ? `(${reps.length} · ${formatarKg(total ?? 0)})` : ""} <ChevronDown size={16} aria-hidden="true" className={exp ? "admap-rot" : ""} />
                </button>
                {exp && (
                  <div className="admap-hist">
                    <button type="button" className="admap-btn admap-btn--soft" onClick={() => novoRepasse(e.id)}><Plus size={16} aria-hidden="true" /> Registrar repasse</button>
                    {!reps ? (
                      <p className="admap-hint"><Loader2 size={14} className="admap-spin" aria-hidden="true" /> Carregando…</p>
                    ) : reps.length === 0 ? (
                      <p className="admap-hint">Nenhum repasse registrado ainda.</p>
                    ) : (
                      <div className="admap-table-wrap">
                        <table className="admap-table">
                          <thead><tr><th>Data</th><th>Material</th><th>Peso</th><th>Valor</th><th>Público</th><th><span className="admap-sr">Ações</span></th></tr></thead>
                          <tbody>
                            {reps.map((r) => (
                              <tr key={r.id}>
                                <td>{formatarData(r.data)}</td>
                                <td>{r.material}{r.documento_url && <a href={r.documento_url} target="_blank" rel="noopener noreferrer" aria-label="Documento"> <FileText size={13} /></a>}</td>
                                <td>{formatarKg(r.peso_kg)}</td>
                                <td>{r.valor != null ? formatarReais(r.valor) : "—"}</td>
                                <td>{r.publico ? "Sim" : "Não"}</td>
                                <td className="admap-table__acts">
                                  <button type="button" className="admap-icon-btn" onClick={() => editarRepasse(r)} aria-label="Editar repasse"><Edit3 size={16} /></button>
                                  <button type="button" className="admap-icon-btn admap-icon-btn--danger" onClick={() => setExcluir({ tipo: "repasse", id: r.id, empresa: e.id, nome: `${r.material} de ${formatarData(r.data)}` })} aria-label="Excluir repasse"><Trash2 size={16} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Empresa */}
      <PainelLateral
        aberto={painelEmp}
        titulo={editEmp ? "Editar empresa" : "Nova empresa de logística reversa"}
        onFechar={fecharEmp}
        rodape={<>
          <button type="button" className="admap-btn admap-btn--ghost" onClick={fecharEmp}>Cancelar</button>
          <button type="button" className="admap-btn" onClick={salvarEmp} disabled={salvando}>{salvando && <Loader2 size={16} className="admap-spin" aria-hidden="true" />} Salvar</button>
        </>}
      >
        <fieldset className="admap-fs">
          <legend>Empresa</legend>
          <div className="admap-grid2">
            <label className="admap-field"><span>Nome *</span><input className="admap-input" value={fe.nome} onChange={(e) => setFe({ ...fe, nome: e.target.value })} /></label>
            <label className="admap-field">
              <span>CNPJ</span>
              <input className="admap-input" inputMode="numeric" value={fe.cnpj} onChange={(e) => setFe({ ...fe, cnpj: mascaraCnpj(e.target.value) })} placeholder="00.000.000/0000-00" aria-invalid={!cnpjOk} />
              {!cnpjOk && <small className="admap-err">CNPJ inválido</small>}
            </label>
            <label className="admap-field"><span>Responsável</span><input className="admap-input" value={fe.responsavel_nome} onChange={(e) => setFe({ ...fe, responsavel_nome: e.target.value })} /></label>
            <label className="admap-field"><span>Cargo do responsável</span><input className="admap-input" value={fe.responsavel_cargo} onChange={(e) => setFe({ ...fe, responsavel_cargo: e.target.value })} /></label>
            <label className="admap-field"><span>Parceria desde</span><input type="date" className="admap-input" value={fe.parceria_desde} onChange={(e) => setFe({ ...fe, parceria_desde: e.target.value })} /></label>
            <label className="admap-field">
              <span>Status</span>
              <select className="admap-input" value={fe.status} onChange={(e) => setFe({ ...fe, status: e.target.value })}>
                {Object.entries(STATUS_LOGISTICA).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
              </select>
            </label>
          </div>
          <label className="admap-field"><span>Materiais aceitos (separados por vírgula)</span><input className="admap-input" value={fe.materiais} onChange={(e) => setFe({ ...fe, materiais: e.target.value })} placeholder="Papelão, Vidro, PET" /></label>
          <label className="admap-field"><span>Descrição pública</span><textarea className="admap-input" rows={3} value={fe.descricao} onChange={(e) => setFe({ ...fe, descricao: e.target.value })} /></label>
        </fieldset>
        <fieldset className="admap-fs">
          <legend>Logo</legend>
          <LogoUpload valor={fe.logo_url} pasta="logistica" onChange={(u) => setFe((f) => ({ ...f, logo_url: u }))} onErro={(m) => mostrar("erro", m)} />
        </fieldset>
        <fieldset className="admap-fs">
          <legend>Contato público (opcional)</legend>
          <div className="admap-grid2">
            <label className="admap-field"><span>Site</span><input className="admap-input" value={fe.site} onChange={(e) => setFe({ ...fe, site: e.target.value })} /></label>
            <label className="admap-field"><span>Telefone</span><input className="admap-input" value={fe.telefone_publico} onChange={(e) => setFe({ ...fe, telefone_publico: e.target.value })} /></label>
            <label className="admap-field"><span>E-mail</span><input type="email" className="admap-input" value={fe.email_publico} onChange={(e) => setFe({ ...fe, email_publico: e.target.value })} /></label>
            <label className="admap-field"><span>Ordem</span><input type="number" min={0} className="admap-input" value={fe.ordem} onChange={(e) => setFe({ ...fe, ordem: e.target.value })} /></label>
          </div>
          <label className="admap-toggle"><input type="checkbox" checked={fe.exibir_publicamente} onChange={(e) => setFe({ ...fe, exibir_publicamente: e.target.checked })} /> Exibir em /parceiros</label>
          <label className="admap-field"><span>Observações internas (não aparecem no site)</span><textarea className="admap-input" rows={2} value={fe.observacoes_internas} onChange={(e) => setFe({ ...fe, observacoes_internas: e.target.value })} /></label>
        </fieldset>
      </PainelLateral>

      {/* Repasse */}
      <PainelLateral
        aberto={!!painelRep}
        titulo={painelRep?.id ? "Editar repasse" : "Registrar repasse"}
        onFechar={fecharRep}
        rodape={<>
          <button type="button" className="admap-btn admap-btn--ghost" onClick={fecharRep}>Cancelar</button>
          <button type="button" className="admap-btn" onClick={salvarRep} disabled={salvando}>{salvando && <Loader2 size={16} className="admap-spin" aria-hidden="true" />} Salvar</button>
        </>}
      >
        <fieldset className="admap-fs">
          <legend>Repasse para {empresas.find((e) => e.id === painelRep?.empresa)?.nome ?? "empresa"}</legend>
          <div className="admap-grid2">
            <label className="admap-field"><span>Data *</span><input type="date" className="admap-input" value={fr.data} onChange={(e) => setFr({ ...fr, data: e.target.value })} /></label>
            <label className="admap-field"><span>Material *</span><input className="admap-input" value={fr.material} onChange={(e) => setFr({ ...fr, material: e.target.value })} placeholder="Ex.: Papelão" /></label>
            <label className="admap-field"><span>Peso (kg) *</span><input inputMode="decimal" className="admap-input" value={fr.peso_kg} onChange={(e) => setFr({ ...fr, peso_kg: e.target.value })} /></label>
            <label className="admap-field"><span>Valor (R$, opcional)</span><input inputMode="decimal" className="admap-input" value={fr.valor} onChange={(e) => setFr({ ...fr, valor: e.target.value })} /></label>
          </div>
          <label className="admap-field"><span>Link do documento/comprovante (opcional)</span><input className="admap-input" value={fr.documento_url} onChange={(e) => setFr({ ...fr, documento_url: e.target.value })} placeholder="https://" /></label>
          <label className="admap-field"><span>Observação</span><textarea className="admap-input" rows={2} value={fr.observacao} onChange={(e) => setFr({ ...fr, observacao: e.target.value })} /></label>
          <label className="admap-toggle"><input type="checkbox" checked={fr.publico} onChange={(e) => setFr({ ...fr, publico: e.target.checked })} /> Mostrar no histórico público</label>
        </fieldset>
      </PainelLateral>

      <ConfirmDialog
        aberto={!!excluir}
        titulo={excluir?.tipo === "empresa" ? "Excluir empresa?" : "Excluir repasse?"}
        mensagem={excluir?.tipo === "empresa" ? `“${excluir?.nome}” e todos os repasses dela serão excluídos. Essa ação não pode ser desfeita.` : `O repasse “${excluir?.nome ?? ""}” será excluído.`}
        textoConfirmar="Excluir"
        perigo
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </div>
  );
}
