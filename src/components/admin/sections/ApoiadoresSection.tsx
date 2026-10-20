"use client";

/**
 * ApoiadoresSection — "Apoiadores e Mapa" (painel, somente ADM DEUS)
 * ------------------------------------------------------------
 * Lista com busca/filtros e CRUD completo da tabela apoiadores.
 * Formulário: pessoa jurídica (CNPJ + busca na BrasilAPI) ou física
 * (CPF, nunca exibido no site), categoria, tipos de apoio, contatos
 * públicos, logo, e o MAPA para clicar/arrastar e marcar o ponto
 * (também "usar minha localização" e busca de endereço no Nominatim).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Building2, Crosshair, Edit3, Eye, EyeOff, Loader2, MapPin, MapPinOff, Plus, RefreshCw, Search, ShieldAlert, Trash2, UserRound,
} from "lucide-react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ToastArea, useToast } from "@/components/ui/Toast";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import PainelLateral from "@/components/admin/apoiadores/PainelLateral";
import LogoUpload from "@/components/admin/apoiadores/LogoUpload";
import {
  CATEGORIAS, TIPOS_APOIO, corCategoria, mascaraCnpj, mascaraCpf, soDigitos, cnpjValido, cpfValido,
} from "@/lib/apoiadores";
import {
  apoiadorSchema, buscarCnpj, buscarEndereco, excluirApoiador, listarApoiadores, primeiroErro, salvarApoiador, type Apoiador,
} from "@/lib/apoiadoresAdmin";
import "@/styles/admin-apoiadores.css";

const MapaSeletor = dynamic(() => import("@/components/mapa/MapaSeletor"), {
  ssr: false,
  loading: () => <div className="admap-map-loading">Carregando mapa…</div>,
});

/** Estado do formulário (campos de texto como string) */
interface Form {
  tipo_pessoa: "juridica" | "fisica";
  nome: string;
  nome_fantasia: string;
  cnpj: string;
  cpf: string;
  categoria: string;
  tipos_apoio: string[];
  descricao: string;
  logo_url: string;
  site: string;
  instagram: string;
  telefone_publico: string;
  email_publico: string;
  endereco: string;
  bairro: string;
  latitude: number | null;
  longitude: number | null;
  mostrar_no_mapa: boolean;
  exibir_publicamente: boolean;
  anonimo: boolean;
  ativo: boolean;
  desde: string;
  ordem: string;
  observacoes_internas: string;
}

const VAZIO: Form = {
  tipo_pessoa: "juridica", nome: "", nome_fantasia: "", cnpj: "", cpf: "", categoria: "Comércio", tipos_apoio: [],
  descricao: "", logo_url: "", site: "", instagram: "", telefone_publico: "", email_publico: "", endereco: "", bairro: "",
  latitude: null, longitude: null, mostrar_no_mapa: false, exibir_publicamente: true, anonimo: false, ativo: true,
  desde: "", ordem: "0", observacoes_internas: "",
};

function paraForm(a: Apoiador): Form {
  return {
    tipo_pessoa: a.tipo_pessoa, nome: a.nome, nome_fantasia: a.nome_fantasia ?? "",
    cnpj: a.cnpj ? mascaraCnpj(a.cnpj) : "", cpf: a.cpf ? mascaraCpf(a.cpf) : "",
    categoria: a.categoria, tipos_apoio: a.tipos_apoio ?? [], descricao: a.descricao ?? "", logo_url: a.logo_url ?? "",
    site: a.site ?? "", instagram: a.instagram ?? "", telefone_publico: a.telefone_publico ?? "", email_publico: a.email_publico ?? "",
    endereco: a.endereco ?? "", bairro: a.bairro ?? "", latitude: a.latitude, longitude: a.longitude,
    mostrar_no_mapa: a.mostrar_no_mapa, exibir_publicamente: a.exibir_publicamente, anonimo: a.anonimo, ativo: a.ativo,
    desde: a.desde ?? "", ordem: String(a.ordem ?? 0), observacoes_internas: a.observacoes_internas ?? "",
  };
}

export default function ApoiadoresSection() {
  const papel = usePapelAdmin();
  const { toasts, mostrar, fechar } = useToast();
  const [lista, setLista] = useState<Apoiador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [fCategoria, setFCategoria] = useState("");
  const [fMapa, setFMapa] = useState<"" | "sim" | "nao">("");
  const [aberto, setAberto] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [form, setForm] = useState<Form>(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [excluir, setExcluir] = useState<Apoiador | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [buscaEnd, setBuscaEnd] = useState("");
  const [resultadosEnd, setResultadosEnd] = useState<{ lat: number; lng: number; nome: string }[]>([]);
  const [buscandoEnd, setBuscandoEnd] = useState(false);
  const [localizando, setLocalizando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    try {
      setLista(await listarApoiadores());
    } catch (e) {
      setErroCarga(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (papel === "deus") carregar();
  }, [papel, carregar]);

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return lista.filter(
      (a) =>
        (!t || [a.nome, a.nome_fantasia ?? "", a.bairro ?? "", a.cnpj ?? ""].join(" ").toLowerCase().includes(t)) &&
        (!fCategoria || a.categoria === fCategoria) &&
        (!fMapa || (fMapa === "sim" ? a.mostrar_no_mapa : !a.mostrar_no_mapa)),
    );
  }, [lista, busca, fCategoria, fMapa]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const fecharPainel = useCallback(() => setAberto(false), []);

  function novo() {
    setEditId(undefined);
    setForm(VAZIO);
    setResultadosEnd([]);
    setBuscaEnd("");
    setAberto(true);
  }
  function editar(a: Apoiador) {
    setEditId(a.id);
    setForm(paraForm(a));
    setResultadosEnd([]);
    setBuscaEnd(a.endereco ?? "");
    setAberto(true);
  }

  async function salvar() {
    const r = apoiadorSchema.safeParse({ ...form, ordem: Number(form.ordem) || 0 });
    if (!r.success) return mostrar("erro", primeiroErro(r.error));
    setSalvando(true);
    try {
      await salvarApoiador(r.data, editId);
      mostrar("sucesso", editId ? "Apoiador atualizado" : "Apoiador cadastrado");
      setAberto(false);
      carregar();
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
      await excluirApoiador(excluir.id);
      mostrar("sucesso", "Apoiador excluído");
      setExcluir(null);
      carregar();
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro ao excluir");
    } finally {
      setExcluindo(false);
    }
  }

  async function alternar(a: Apoiador, campo: "mostrar_no_mapa" | "exibir_publicamente") {
    if (campo === "mostrar_no_mapa" && !a.mostrar_no_mapa && (a.latitude == null || a.longitude == null))
      return mostrar("aviso", "Edite o apoiador e marque o ponto no mapa primeiro.");
    const r = apoiadorSchema.safeParse({ ...paraForm(a), ordem: a.ordem, [campo]: !a[campo] });
    if (!r.success) return mostrar("erro", primeiroErro(r.error));
    try {
      await salvarApoiador(r.data, a.id);
      setLista((l) => l.map((x) => (x.id === a.id ? { ...x, [campo]: !a[campo] } : x)));
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro ao atualizar");
    }
  }

  async function preencherCnpj() {
    setBuscandoCnpj(true);
    try {
      const d = await buscarCnpj(form.cnpj);
      const end = [d.logradouro, d.numero, d.complemento].filter(Boolean).join(", ");
      setForm((f) => ({
        ...f,
        nome: d.razao_social || f.nome,
        nome_fantasia: d.nome_fantasia || f.nome_fantasia,
        endereco: end ? `${end}${d.municipio ? ` – ${d.municipio}/${d.uf}` : ""}` : f.endereco,
        bairro: d.bairro || f.bairro,
        desde: f.desde,
      }));
      if (end) setBuscaEnd(`${end}, ${d.bairro ?? ""}, ${d.municipio ?? ""}`);
      mostrar("sucesso", "Dados da Receita preenchidos. Confira antes de salvar.");
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro na consulta");
    } finally {
      setBuscandoCnpj(false);
    }
  }

  async function procurarEndereco() {
    setBuscandoEnd(true);
    try {
      const r = await buscarEndereco(buscaEnd);
      setResultadosEnd(r);
      if (!r.length) mostrar("aviso", "Endereço não encontrado. Marque o ponto clicando no mapa.");
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro na busca");
    } finally {
      setBuscandoEnd(false);
    }
  }

  function minhaLocalizacao() {
    if (!navigator.geolocation) return mostrar("erro", "Seu navegador não permite localização.");
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setForm((f) => ({ ...f, latitude: Math.round(p.coords.latitude * 1e6) / 1e6, longitude: Math.round(p.coords.longitude * 1e6) / 1e6 }));
        setLocalizando(false);
      },
      () => {
        mostrar("erro", "Não foi possível obter sua localização (permissão negada?).");
        setLocalizando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  if (papel !== "deus") {
    return (
      <div role="alert" className="admap-block">
        <ShieldAlert size={28} aria-hidden="true" />
        <h2>Acesso restrito</h2>
        <p>Apoiadores e Mapa é uma área exclusiva do ADM DEUS.</p>
      </div>
    );
  }

  const docOk = form.tipo_pessoa === "juridica" ? !form.cnpj || cnpjValido(form.cnpj) : !form.cpf || cpfValido(form.cpf);

  return (
    <div className="admap">
      <ToastArea toasts={toasts} onFechar={fechar} />

      {/* Barra superior */}
      <div className="admap-toolbar">
        <label className="admap-search">
          <Search size={16} aria-hidden="true" />
          <span className="admap-sr">Buscar apoiador</span>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, bairro ou CNPJ" />
        </label>
        <select value={fCategoria} onChange={(e) => setFCategoria(e.target.value)} aria-label="Filtrar por categoria" className="admap-input">
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={fMapa} onChange={(e) => setFMapa(e.target.value as typeof fMapa)} aria-label="Filtrar por mapa" className="admap-input">
          <option value="">No mapa: todos</option>
          <option value="sim">Aparecem no mapa</option>
          <option value="nao">Fora do mapa</option>
        </select>
        <button type="button" className="admap-btn" onClick={novo}><Plus size={16} aria-hidden="true" /> Novo apoiador</button>
      </div>

      <p className="admap-count">
        {lista.length} cadastrados · {lista.filter((a) => a.mostrar_no_mapa).length} no mapa · {lista.filter((a) => !a.exibir_publicamente).length} ocultos
      </p>

      {carregando ? (
        <div className="admap-state"><Loader2 className="admap-spin" aria-hidden="true" /> Carregando…</div>
      ) : erroCarga ? (
        <div className="admap-state admap-state--erro" role="alert">
          {erroCarga}
          <button type="button" className="admap-btn admap-btn--soft" onClick={carregar}><RefreshCw size={16} aria-hidden="true" /> Tentar de novo</button>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="admap-state">{lista.length ? "Nenhum apoiador com esses filtros." : "Nenhum apoiador cadastrado ainda. Clique em “Novo apoiador”."}</div>
      ) : (
        <ul className="admap-list">
          {filtrados.map((a) => (
            <li key={a.id} className={`admap-row${a.ativo ? "" : " admap-row--off"}`}>
              <span className="admap-row__logo" style={{ background: a.logo_url ? "#fff" : corCategoria(a.categoria) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {a.logo_url ? <img src={a.logo_url} alt="" /> : a.nome.charAt(0).toUpperCase()}
              </span>
              <div className="admap-row__info">
                <strong>{a.nome_fantasia || a.nome}{a.anonimo && <em> (anônimo no site)</em>}</strong>
                <span>
                  {a.tipo_pessoa === "juridica" ? <Building2 size={12} aria-hidden="true" /> : <UserRound size={12} aria-hidden="true" />}
                  {a.categoria}{a.bairro ? ` · ${a.bairro}` : ""}{a.cnpj ? ` · ${mascaraCnpj(a.cnpj)}` : ""}{!a.ativo ? " · inativo" : ""}
                </span>
              </div>
              <div className="admap-row__actions">
                <button type="button" className="admap-icon-btn" onClick={() => alternar(a, "mostrar_no_mapa")} aria-label={a.mostrar_no_mapa ? "Tirar do mapa" : "Mostrar no mapa"} title={a.mostrar_no_mapa ? "No mapa" : "Fora do mapa"}>
                  {a.mostrar_no_mapa ? <MapPin size={18} className="admap-on" /> : <MapPinOff size={18} />}
                </button>
                <button type="button" className="admap-icon-btn" onClick={() => alternar(a, "exibir_publicamente")} aria-label={a.exibir_publicamente ? "Ocultar do site" : "Exibir no site"} title={a.exibir_publicamente ? "Público" : "Oculto"}>
                  {a.exibir_publicamente ? <Eye size={18} className="admap-on" /> : <EyeOff size={18} />}
                </button>
                <button type="button" className="admap-icon-btn" onClick={() => editar(a)} aria-label={`Editar ${a.nome}`}><Edit3 size={18} /></button>
                <button type="button" className="admap-icon-btn admap-icon-btn--danger" onClick={() => setExcluir(a)} aria-label={`Excluir ${a.nome}`}><Trash2 size={18} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Formulário */}
      <PainelLateral
        aberto={aberto}
        titulo={editId ? "Editar apoiador" : "Novo apoiador"}
        onFechar={fecharPainel}
        rodape={
          <>
            <button type="button" className="admap-btn admap-btn--ghost" onClick={fecharPainel}>Cancelar</button>
            <button type="button" className="admap-btn" onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 size={16} className="admap-spin" aria-hidden="true" />} Salvar
            </button>
          </>
        }
      >
        <fieldset className="admap-fs">
          <legend>Identificação</legend>
          <div className="admap-seg" role="radiogroup" aria-label="Tipo de pessoa">
            {(["juridica", "fisica"] as const).map((t) => (
              <button key={t} type="button" role="radio" aria-checked={form.tipo_pessoa === t} onClick={() => set("tipo_pessoa", t)}>
                {t === "juridica" ? <><Building2 size={15} aria-hidden="true" /> Empresa / CNPJ</> : <><UserRound size={15} aria-hidden="true" /> Pessoa física / CPF</>}
              </button>
            ))}
          </div>

          {form.tipo_pessoa === "juridica" ? (
            <label className="admap-field">
              <span>CNPJ</span>
              <div className="admap-inline">
                <input className="admap-input" inputMode="numeric" value={form.cnpj} onChange={(e) => set("cnpj", mascaraCnpj(e.target.value))} placeholder="00.000.000/0000-00" aria-invalid={!docOk} />
                <button type="button" className="admap-btn admap-btn--soft" onClick={preencherCnpj} disabled={buscandoCnpj || soDigitos(form.cnpj).length !== 14}>
                  {buscandoCnpj ? <Loader2 size={16} className="admap-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />} Buscar dados
                </button>
              </div>
              {!docOk && <small className="admap-err">CNPJ inválido</small>}
              <small>Opcional. A busca usa a BrasilAPI (dados públicos da Receita).</small>
            </label>
          ) : (
            <label className="admap-field">
              <span>CPF (privado)</span>
              <input className="admap-input" inputMode="numeric" value={form.cpf} onChange={(e) => set("cpf", mascaraCpf(e.target.value))} placeholder="000.000.000-00" aria-invalid={!docOk} />
              {!docOk && <small className="admap-err">CPF inválido</small>}
              <small>Opcional. Nunca aparece no site.</small>
            </label>
          )}

          <div className="admap-grid2">
            <label className="admap-field">
              <span>{form.tipo_pessoa === "juridica" ? "Razão social / nome *" : "Nome *"}</span>
              <input className="admap-input" value={form.nome} onChange={(e) => set("nome", e.target.value)} required />
            </label>
            <label className="admap-field">
              <span>Nome fantasia / como aparece</span>
              <input className="admap-input" value={form.nome_fantasia} onChange={(e) => set("nome_fantasia", e.target.value)} />
            </label>
            <label className="admap-field">
              <span>Categoria</span>
              <select className="admap-input" value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="admap-field">
              <span>Apoiador desde</span>
              <input type="date" className="admap-input" value={form.desde} onChange={(e) => set("desde", e.target.value)} />
            </label>
          </div>

          <div className="admap-field">
            <span>Tipos de apoio</span>
            <div className="admap-chips">
              {TIPOS_APOIO.map((t) => (
                <button key={t} type="button" aria-pressed={form.tipos_apoio.includes(t)} onClick={() => set("tipos_apoio", form.tipos_apoio.includes(t) ? form.tipos_apoio.filter((x) => x !== t) : [...form.tipos_apoio, t])}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="admap-field">
            <span>Descrição pública</span>
            <textarea className="admap-input" rows={3} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} maxLength={2000} />
          </label>
        </fieldset>

        <fieldset className="admap-fs">
          <legend>Logo</legend>
          <LogoUpload valor={form.logo_url} pasta="apoiadores" onChange={(u) => set("logo_url", u)} onErro={(m) => mostrar("erro", m)} />
        </fieldset>

        <fieldset className="admap-fs">
          <legend>Contatos públicos (opcionais)</legend>
          <div className="admap-grid2">
            <label className="admap-field"><span>Site</span><input className="admap-input" value={form.site} onChange={(e) => set("site", e.target.value)} placeholder="www.exemplo.com.br" /></label>
            <label className="admap-field"><span>Instagram</span><input className="admap-input" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@perfil" /></label>
            <label className="admap-field"><span>Telefone</span><input className="admap-input" value={form.telefone_publico} onChange={(e) => set("telefone_publico", e.target.value)} /></label>
            <label className="admap-field"><span>E-mail</span><input type="email" className="admap-input" value={form.email_publico} onChange={(e) => set("email_publico", e.target.value)} /></label>
          </div>
        </fieldset>

        <fieldset className="admap-fs">
          <legend>Localização no mapa</legend>
          <div className="admap-grid2">
            <label className="admap-field"><span>Endereço</span><input className="admap-input" value={form.endereco} onChange={(e) => set("endereco", e.target.value)} /></label>
            <label className="admap-field"><span>Bairro</span><input className="admap-input" value={form.bairro} onChange={(e) => set("bairro", e.target.value)} /></label>
          </div>
          <div className="admap-field">
            <span>Buscar endereço no mapa (OpenStreetMap)</span>
            <div className="admap-inline">
              <input className="admap-input" value={buscaEnd} onChange={(e) => setBuscaEnd(e.target.value)} placeholder="Rua, número, bairro" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), procurarEndereco())} />
              <button type="button" className="admap-btn admap-btn--soft" onClick={procurarEndereco} disabled={buscandoEnd}>
                {buscandoEnd ? <Loader2 size={16} className="admap-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />} Buscar
              </button>
            </div>
            {resultadosEnd.length > 0 && (
              <ul className="admap-results">
                {resultadosEnd.map((r) => (
                  <li key={`${r.lat},${r.lng}`}>
                    <button type="button" onClick={() => { setForm((f) => ({ ...f, latitude: Math.round(r.lat * 1e6) / 1e6, longitude: Math.round(r.lng * 1e6) / 1e6 })); setResultadosEnd([]); }}>
                      <MapPin size={14} aria-hidden="true" /> {r.nome}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <MapaSeletor latitude={form.latitude} longitude={form.longitude} categoria={form.categoria} onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))} />
          <div className="admap-coords">
            <span>{form.latitude != null ? `Ponto: ${form.latitude}, ${form.longitude}` : "Clique no mapa para marcar o ponto (depois arraste para ajustar)."}</span>
            <div>
              <button type="button" className="admap-btn admap-btn--soft" onClick={minhaLocalizacao} disabled={localizando}>
                {localizando ? <Loader2 size={16} className="admap-spin" aria-hidden="true" /> : <Crosshair size={16} aria-hidden="true" />} Usar minha localização
              </button>
              {form.latitude != null && (
                <button type="button" className="admap-btn admap-btn--ghost" onClick={() => setForm((f) => ({ ...f, latitude: null, longitude: null, mostrar_no_mapa: false }))}>Limpar ponto</button>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="admap-fs">
          <legend>Exibição</legend>
          <label className="admap-toggle"><input type="checkbox" checked={form.mostrar_no_mapa} onChange={(e) => set("mostrar_no_mapa", e.target.checked)} /> Mostrar no mapa da página inicial</label>
          <label className="admap-toggle"><input type="checkbox" checked={form.exibir_publicamente} onChange={(e) => set("exibir_publicamente", e.target.checked)} /> Exibir publicamente (home e /parceiros)</label>
          {form.tipo_pessoa === "fisica" && (
            <label className="admap-toggle"><input type="checkbox" checked={form.anonimo} onChange={(e) => set("anonimo", e.target.checked)} /> Aparecer como “Apoiador anônimo”</label>
          )}
          <label className="admap-toggle"><input type="checkbox" checked={form.ativo} onChange={(e) => set("ativo", e.target.checked)} /> Ativo</label>
          <small className="admap-hint">Pessoas físicas e anônimos aparecem com localização aproximada (cerca de 100 m) e sem endereço.</small>
          <div className="admap-grid2">
            <label className="admap-field"><span>Ordem</span><input type="number" min={0} className="admap-input" value={form.ordem} onChange={(e) => set("ordem", e.target.value)} /></label>
          </div>
          <label className="admap-field">
            <span>Observações internas (não aparecem no site)</span>
            <textarea className="admap-input" rows={2} value={form.observacoes_internas} onChange={(e) => set("observacoes_internas", e.target.value)} />
          </label>
        </fieldset>
      </PainelLateral>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir apoiador?"
        mensagem={`“${excluir?.nome ?? ""}” será removido do mapa e do site. Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        perigo
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </div>
  );
}
