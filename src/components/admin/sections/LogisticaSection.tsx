"use client";

/**
 * LogisticaSection — "Logística Reversa" (painel, somente ADM DEUS)
 * ------------------------------------------------------------
 * CRUD das empresas parceiras de logística reversa (logo, responsável,
 * materiais aceitos, status, observações internas) e, para cada uma,
 * o sub-CRUD de repasses (data, material, peso, valor, documento, público).
 * Os repasses públicos aparecem na página /parceiros.
 * CNPJ com "Buscar dados" (preenche e já localiza no mapa), endereço e
 * marcador no mapa (migration 20261020250000_logistica_localizacao.sql).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, Edit3, Eye, EyeOff, FileText, Loader2, MapPin, Plus, RefreshCw, Search, ShieldAlert, Trash2, Truck } from "lucide-react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ToastArea, useToast } from "@/components/ui/Toast";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import PainelLateral from "@/components/admin/apoiadores/PainelLateral";
import LogoUpload from "@/components/admin/apoiadores/LogoUpload";
import { STATUS_LOGISTICA, cnpjValido, formatarData, formatarKg, formatarReais, mascaraCnpj, soDigitos } from "@/lib/apoiadores";
import ResultadosGeo from "@/components/admin/apoiadores/ResultadosGeo";
import {
  buscarCnpj, buscarEndereco, consultaDoCnpj, enderecoDoCnpj, geocodificar, type ResultadoGeo,
  empresaSchema, excluirEmpresa, excluirRepasse, listarEmpresas, listarRepasses, primeiroErro, repasseSchema, salvarEmpresa, salvarRepasse,
  type EmpresaLogistica, type Repasse,
} from "@/lib/apoiadoresAdmin";
import "@/styles/admin-apoiadores.css";

const MapaSeletor = dynamic(() => import("@/components/mapa/MapaSeletor"), {
  ssr: false,
  loading: () => <div className="admap-map-loading">Carregando mapa…</div>,
});

interface FormEmpresa {
  nome: string; cnpj: string; logo_url: string; responsavel_nome: string; responsavel_cargo: string; telefone_publico: string;
  email_publico: string; site: string; descricao: string; materiais: string; parceria_desde: string; status: string;
  exibir_publicamente: boolean; observacoes_internas: string; ordem: string;
  // localização (migration 20261020250000)
  endereco: string; bairro: string; cep: string; latitude: number | null; longitude: number | null; mostrar_no_mapa: boolean;
}
const EMP_VAZIA: FormEmpresa = {
  nome: "", cnpj: "", logo_url: "", responsavel_nome: "", responsavel_cargo: "", telefone_publico: "", email_publico: "", site: "",
  descricao: "", materiais: "", parceria_desde: "", status: "ativa", exibir_publicamente: true, observacoes_internas: "", ordem: "0",
  endereco: "", bairro: "", cep: "", latitude: null, longitude: null, mostrar_no_mapa: false,
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
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [buscaEnd, setBuscaEnd] = useState("");
  const [buscandoEnd, setBuscandoEnd] = useState(false);
  const [resultadosGeo, setResultadosGeo] = useState<ResultadoGeo[]>([]);
  const [escolhidoGeo, setEscolhidoGeo] = useState<number | null>(null);
  const [avisoGeo, setAvisoGeo] = useState<string | null>(null);

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
    limparGeo();
    setBuscaEnd("");
    setPainelEmp(true);
  }
  function editarEmpresa(e: EmpresaLogistica) {
    setEditEmp(e.id);
    setFe({
      nome: e.nome, cnpj: e.cnpj ? mascaraCnpj(e.cnpj) : "", logo_url: e.logo_url ?? "", responsavel_nome: e.responsavel_nome ?? "",
      responsavel_cargo: e.responsavel_cargo ?? "", telefone_publico: e.telefone_publico ?? "", email_publico: e.email_publico ?? "",
      site: e.site ?? "", descricao: e.descricao ?? "", materiais: (e.materiais_aceitos ?? []).join(", "), parceria_desde: e.parceria_desde ?? "",
      status: e.status, exibir_publicamente: e.exibir_publicamente, observacoes_internas: e.observacoes_internas ?? "", ordem: String(e.ordem ?? 0),
      endereco: e.endereco ?? "", bairro: e.bairro ?? "", cep: e.cep ?? "", latitude: e.latitude ?? null, longitude: e.longitude ?? null,
      mostrar_no_mapa: !!e.mostrar_no_mapa,
    });
    limparGeo();
    setBuscaEnd([e.endereco, e.bairro].filter(Boolean).join(", "));
    setPainelEmp(true);
  }

  function limparGeo() {
    setResultadosGeo([]);
    setEscolhidoGeo(null);
    setAvisoGeo(null);
  }

  function aplicarGeo(r: ResultadoGeo, i: number) {
    setEscolhidoGeo(i);
    setFe((f) => ({ ...f, latitude: r.lat, longitude: r.lng, mostrar_no_mapa: f.latitude == null ? true : f.mostrar_no_mapa }));
  }

  /** CNPJ → preenche os dados e já posiciona o marcador no endereço */
  async function preencherCnpj() {
    setBuscandoCnpj(true);
    limparGeo();
    try {
      const d = await buscarCnpj(fe.cnpj);
      const end = enderecoDoCnpj(d);
      setFe((f) => ({
        ...f,
        nome: f.nome || d.nome_fantasia || d.razao_social,
        endereco: end || f.endereco,
        bairro: d.bairro || f.bairro,
        cep: d.cep || f.cep,
        email_publico: f.email_publico || (d.email ?? "").toLowerCase(),
      }));
      if (end) setBuscaEnd([d.logradouro, d.numero, d.bairro, d.municipio, d.uf].filter(Boolean).join(", "));
      mostrar("sucesso", `Dados da Receita preenchidos (${d.fonte}). Procurando o local no mapa…`);
      if (!d.logradouro && !d.cep) return;
      const r = await geocodificar(consultaDoCnpj(d));
      setResultadosGeo(r);
      if (r.length) {
        aplicarGeo(r[0], 0);
        setAvisoGeo("Local encontrado automaticamente — confira e ajuste se necessário.");
      } else mostrar("aviso", "Não achamos o endereço no mapa. Marque o ponto clicando no mapa.");
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro na consulta");
    } finally {
      setBuscandoCnpj(false);
    }
  }

  async function procurarEndereco() {
    setBuscandoEnd(true);
    limparGeo();
    try {
      const r = await buscarEndereco(buscaEnd);
      setResultadosGeo(r);
      if (r.length) {
        aplicarGeo(r[0], 0);
        setAvisoGeo("Melhor resultado posicionado no mapa — confira e arraste se precisar.");
      } else mostrar("aviso", "Endereço não encontrado. Marque o ponto clicando no mapa.");
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro na busca");
    } finally {
      setBuscandoEnd(false);
    }
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
      parceria_desde: e.parceria_desde ?? "", observacoes_internas: e.observacoes_internas ?? "",
      endereco: e.endereco ?? "", bairro: e.bairro ?? "", cep: e.cep ?? "", latitude: e.latitude ?? null, longitude: e.longitude ?? null,
      mostrar_no_mapa: !!e.mostrar_no_mapa });
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
                      {e.mostrar_no_mapa && e.latitude != null ? <> · <MapPin size={12} aria-label="No mapa" /> no mapa</> : ""}
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
          </div>
          <label className="admap-field">
            <span>CNPJ</span>
            <div className="admap-inline">
              <input className="admap-input" inputMode="numeric" value={fe.cnpj} onChange={(e) => setFe({ ...fe, cnpj: mascaraCnpj(e.target.value) })} placeholder="00.000.000/0000-00" aria-invalid={!cnpjOk} />
              <button type="button" className="admap-btn admap-btn--soft" onClick={preencherCnpj} disabled={buscandoCnpj || soDigitos(fe.cnpj).length !== 14}>
                {buscandoCnpj ? <Loader2 size={16} className="admap-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />} Buscar dados
              </button>
            </div>
            {!cnpjOk && <small className="admap-err">CNPJ inválido</small>}
            <small>Opcional. Preenche pela Receita (BrasilAPI/CNPJ.ws) e já localiza o endereço no mapa.</small>
          </label>
          <div className="admap-grid2">
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
          <legend>Localização</legend>
          <div className="admap-grid2">
            <label className="admap-field"><span>Endereço</span><input className="admap-input" value={fe.endereco} onChange={(e) => setFe({ ...fe, endereco: e.target.value })} /></label>
            <label className="admap-field"><span>Bairro</span><input className="admap-input" value={fe.bairro} onChange={(e) => setFe({ ...fe, bairro: e.target.value })} /></label>
            <label className="admap-field"><span>CEP</span><input className="admap-input" inputMode="numeric" value={fe.cep} onChange={(e) => setFe({ ...fe, cep: soDigitos(e.target.value).slice(0, 8) })} placeholder="62760000" /></label>
          </div>
          <div className="admap-field">
            <span>Buscar endereço no mapa (OpenStreetMap, Photon, Esri e CEP)</span>
            <div className="admap-inline">
              <input className="admap-input" value={buscaEnd} onChange={(e) => setBuscaEnd(e.target.value)} placeholder="Rua, número, bairro, cidade" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), procurarEndereco())} />
              <button type="button" className="admap-btn admap-btn--soft" onClick={procurarEndereco} disabled={buscandoEnd}>
                {buscandoEnd ? <Loader2 size={16} className="admap-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />} Buscar
              </button>
            </div>
            <ResultadosGeo resultados={resultadosGeo} escolhido={escolhidoGeo} onEscolher={aplicarGeo} aviso={avisoGeo} />
          </div>
          <MapaSeletor latitude={fe.latitude} longitude={fe.longitude} categoria="Logística reversa" onChange={(lat, lng) => setFe((f) => ({ ...f, latitude: lat, longitude: lng, mostrar_no_mapa: f.latitude == null ? true : f.mostrar_no_mapa }))} />
          <div className="admap-coords">
            <span>{fe.latitude != null ? `Ponto: ${fe.latitude}, ${fe.longitude}` : "Clique no mapa para marcar o ponto (depois arraste para ajustar)."}</span>
            {fe.latitude != null && (
              <div><button type="button" className="admap-btn admap-btn--ghost" onClick={() => setFe((f) => ({ ...f, latitude: null, longitude: null, mostrar_no_mapa: false }))}>Limpar ponto</button></div>
            )}
          </div>
          <label className="admap-toggle"><input type="checkbox" checked={fe.mostrar_no_mapa} onChange={(e) => setFe({ ...fe, mostrar_no_mapa: e.target.checked })} /> Mostrar no mapa público (cor de logística reversa)</label>
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
