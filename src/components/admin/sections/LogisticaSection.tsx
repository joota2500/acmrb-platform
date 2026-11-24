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
 * Visual só com Tailwind, no mesmo padrão do painel de notícias
 * (classes em components/admin/apoiadores/estilos.ts).
 * Escrita direto nas tabelas empresas_logistica e repasses_logistica
 * (RLS: só administradores), nunca nas views públicas.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown, Clock, Eye, EyeOff, FileText, Handshake, Loader2, MapPin, PackagePlus, Pencil, Plus, RefreshCw, Search, ShieldAlert, Trash2, Truck,
} from "lucide-react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import PainelLateral from "@/components/admin/apoiadores/PainelLateral";
import LogoUpload from "@/components/admin/apoiadores/LogoUpload";
import { STATUS_LOGISTICA, cnpjValido, formatarData, formatarKg, formatarReais, mascaraCnpj, soDigitos } from "@/services/apoiadores";
import ResultadosGeo from "@/components/admin/apoiadores/ResultadosGeo";
import {
  buscarCnpj, buscarEndereco, consultaDoCnpj, enderecoDoCnpj, geocodificar, type ResultadoGeo,
  empresaSchema, excluirEmpresa, excluirRepasse, listarEmpresas, listarRepasses, primeiroErro, repasseSchema, salvarEmpresa, salvarRepasse,
  type EmpresaLogistica, type Repasse,
} from "@/services/apoiadoresAdmin";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import {
  BLOCO, BOTAO_ACAO, BOTAO_PERIGO, CAMPO, CARTAO, CONTROLE, DICA, EM_LINHA, ERRO, LINHA, MAPA_CARREGANDO, MARCAR, ROTULO, SELO, TEXTO_ACAO,
  CAIXA_VAZIA, TITULO_BLOCO,
} from "@/components/admin/apoiadores/estilos";

const MapaSeletor = dynamic(() => import("@/components/mapa/MapaSeletor"), {
  ssr: false,
  loading: () => <div className={MAPA_CARREGANDO}>Carregando mapa…</div>,
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

// cor do selo de cada situação da parceria
const COR_STATUS: Record<string, string> = {
  ativa: "bg-emerald-100 text-emerald-800",
  em_negociacao: "bg-blue-100 text-blue-800",
  pausada: "bg-amber-100 text-amber-800",
  encerrada: "bg-zinc-100 text-zinc-700",
};

const num = (v: string) => (v.trim() === "" ? NaN : Number(v.replace(",", ".")));

export default function LogisticaSection() {
  const papel = usePapelAdmin();
  const { mostrar } = useToast();
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

  /* ---------- Sem permissão ---------- */
  if (papel !== "deus") {
    return (
      <div role="alert" className={cn(CARTAO, "mx-auto my-8 flex max-w-md flex-col items-center gap-2.5 p-8 text-center text-brand")}>
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-mint">
          <ShieldAlert size={26} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-extrabold text-ink">Acesso restrito</h2>
        <p className="text-sm text-ink-soft">Logística Reversa é uma área exclusiva do ADM DEUS.</p>
      </div>
    );
  }

  const cnpjOk = !fe.cnpj || cnpjValido(fe.cnpj);

  // números dos cartões do topo
  const cartoes = [
    { rotulo: "Empresas", valor: empresas.length, Icone: Truck, cor: "bg-brand-mint text-brand" },
    { rotulo: "Parceria ativa", valor: empresas.filter((e) => e.status === "ativa").length, Icone: Handshake, cor: "bg-emerald-100 text-emerald-700" },
    { rotulo: "Em negociação", valor: empresas.filter((e) => e.status === "em_negociacao").length, Icone: Clock, cor: "bg-blue-100 text-blue-700" },
    { rotulo: "No site", valor: empresas.filter((e) => e.exibir_publicamente).length, Icone: Eye, cor: "bg-zinc-100 text-zinc-600" },
    { rotulo: "No mapa", valor: empresas.filter((e) => e.mostrar_no_mapa && e.latitude != null).length, Icone: MapPin, cor: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black tracking-tight text-ink sm:text-2xl">Logística Reversa</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Empresas parceiras e os repasses de material. As empresas e os repasses públicos aparecem em /parceiros.
          </p>
        </div>
        <Button type="button" tamanho="pequeno" onClick={novaEmpresa} className="max-sm:w-full">
          <Plus size={16} aria-hidden="true" /> Nova empresa
        </Button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cartoes.map(({ rotulo, valor, Icone, cor }) => (
          <div key={rotulo} className={cn(CARTAO, "flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-card-hover")}>
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", cor)}>
              <Icone size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <strong className="block text-2xl font-black leading-none text-ink">{carregando ? "–" : valor}</strong>
              <span className="text-[0.78rem] font-semibold text-ink-soft">{rotulo}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className={cn(CARTAO, "grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 p-3")}>
        <label className="flex h-11 items-center gap-2 rounded-control border border-line bg-white px-3.5 text-ink-muted transition focus-within:border-brand focus-within:shadow-focus">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Buscar empresa</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, responsável ou material"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[0.9rem] text-ink outline-none"
          />
        </label>
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={carregar} aria-label="Atualizar lista" title="Atualizar lista" className="h-11">
          <RefreshCw size={16} aria-hidden="true" className={cn(carregando && "animate-spin")} />
        </Button>
      </div>

      {/* Carregando: esqueleto no lugar da lista */}
      {carregando && (
        <ul className="flex flex-col gap-3" aria-label="Carregando empresas">
          {[0, 1, 2].map((i) => (
            <li key={i} className={cn(CARTAO, "grid animate-pulse grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-4 p-3.5 sm:grid-cols-[4rem_minmax(0,1fr)]")}>
              <div className="aspect-square rounded-xl bg-zinc-100" />
              <div className="flex flex-col gap-2">
                <div className="h-3 w-24 rounded-full bg-zinc-100" />
                <div className="h-4 w-3/4 rounded-full bg-zinc-100" />
                <div className="h-3 w-1/2 rounded-full bg-zinc-100" />
              </div>
            </li>
          ))}
        </ul>
      )}
      {!carregando && erro && (
        <div className={cn(CAIXA_VAZIA, "border-red-200 text-danger")} role="alert">
          Erro ao carregar: {erro}
          <Button type="button" variante="secundario" tamanho="pequeno" onClick={carregar}><RefreshCw size={16} aria-hidden="true" /> Tentar de novo</Button>
        </div>
      )}
      {!carregando && !erro && filtradas.length === 0 && (
        <div className={CAIXA_VAZIA}>
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-brand"><Truck size={22} aria-hidden="true" /></span>
          {empresas.length ? "Nenhuma empresa com essa busca." : "Nenhuma empresa cadastrada. Clique em “Nova empresa”."}
        </div>
      )}

      {/* Lista */}
      {!carregando && !erro && filtradas.length > 0 && (
        <ul className="flex flex-col gap-3">
          {filtradas.map((e) => {
            const reps = repasses[e.id];
            const exp = aberta === e.id;
            const total = reps?.reduce((s, r) => s + Number(r.peso_kg), 0);
            return (
              <li key={e.id} className={cn(CARTAO, "overflow-hidden transition hover:border-brand-line")}>
                <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 p-3 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-4 sm:p-3.5 xl:grid-cols-[4rem_minmax(0,1fr)_auto]">
                  <span
                    className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-line text-white"
                    style={{ background: e.logo_url ? "#fff" : "#059669" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {e.logo_url ? <img src={e.logo_url} alt="" className="size-full object-contain p-1" /> : <Truck size={22} aria-hidden="true" />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      <span className={cn(SELO, COR_STATUS[e.status] ?? COR_STATUS.encerrada)}>{STATUS_LOGISTICA[e.status] ?? e.status}</span>
                      {e.exibir_publicamente
                        ? <span className={cn(SELO, "bg-emerald-50 font-bold text-leaf")}><Eye size={11} aria-hidden="true" /> No site</span>
                        : <span className={cn(SELO, "bg-zinc-200 text-zinc-700")}><EyeOff size={11} aria-hidden="true" /> Oculta</span>}
                      {e.mostrar_no_mapa && e.latitude != null && (
                        <span className={cn(SELO, "bg-emerald-100 text-emerald-800")}><MapPin size={11} aria-label="No mapa" /> No mapa</span>
                      )}
                    </div>
                    <h3 className="mt-1.5 truncate text-[0.92rem] font-extrabold leading-snug text-ink sm:text-base">{e.nome}</h3>
                    <small className="mt-0.5 block truncate text-[0.78rem] text-ink-muted">
                      {[e.responsavel_nome, e.parceria_desde ? `desde ${formatarData(e.parceria_desde)}` : "", (e.materiais_aceitos ?? []).join(", ")].filter(Boolean).join(" • ") || "Sem detalhes cadastrados"}
                    </small>
                  </div>
                  <div className="col-span-2 flex flex-wrap items-center gap-1.5 border-t border-line pt-3 xl:col-span-1 xl:justify-end xl:border-0 xl:pt-0">
                    <button type="button" className={BOTAO_ACAO} onClick={() => editarEmpresa(e)} title="Editar" aria-label={`Editar ${e.nome}`}>
                      <Pencil size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Editar</span>
                    </button>
                    <button
                      type="button"
                      className={BOTAO_ACAO}
                      onClick={() => alternarVisivel(e)}
                      title={e.exibir_publicamente ? "Ocultar do site" : "Exibir no site"}
                      aria-label={e.exibir_publicamente ? "Ocultar do site" : "Exibir no site"}
                    >
                      {e.exibir_publicamente ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                      <span className={TEXTO_ACAO}>{e.exibir_publicamente ? "Ocultar" : "Exibir"}</span>
                    </button>
                    <button type="button" className={BOTAO_ACAO} onClick={() => novoRepasse(e.id)} title="Registrar repasse" aria-label={`Registrar repasse de ${e.nome}`}>
                      <PackagePlus size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Repasse</span>
                    </button>
                    <button
                      type="button"
                      className={cn(BOTAO_ACAO, BOTAO_PERIGO)}
                      onClick={() => setExcluir({ tipo: "empresa", id: e.id, nome: e.nome })}
                      title="Excluir"
                      aria-label={`Excluir ${e.nome}`}
                    >
                      <Trash2 size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Excluir</span>
                    </button>
                  </div>
                </div>

                {/* histórico de repasses (abre e fecha) */}
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-2 border-t border-line bg-surface-alt px-4 py-2.5 text-[0.85rem] font-bold text-brand transition hover:bg-brand-soft focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
                  aria-expanded={exp}
                  onClick={() => abrirHistorico(e.id)}
                >
                  <span>Repasses {reps ? `(${reps.length} · ${formatarKg(total ?? 0)})` : ""}</span>
                  <ChevronDown size={16} aria-hidden="true" className={cn("transition-transform", exp && "rotate-180")} />
                </button>
                {exp && (
                  <div className="flex flex-col items-start gap-3 border-t border-line p-3 sm:p-4">
                    <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => novoRepasse(e.id)}><Plus size={16} aria-hidden="true" /> Registrar repasse</Button>
                    {!reps ? (
                      <p className={DICA}><Loader2 size={14} className="animate-spin" aria-hidden="true" /> Carregando…</p>
                    ) : reps.length === 0 ? (
                      <p className={DICA}>Nenhum repasse registrado ainda.</p>
                    ) : (
                      // no celular a tabela rola só dentro desta caixa (a página não rola para o lado)
                      <div className="relative w-full max-w-full overflow-x-auto rounded-xl border border-line">
                        <table className="w-full min-w-[34rem] border-collapse text-[0.85rem]">
                          <thead className="bg-surface-alt text-left text-[0.75rem] uppercase tracking-wide text-ink-muted">
                            <tr>
                              <th className="px-3 py-2 font-bold">Data</th>
                              <th className="px-3 py-2 font-bold">Material</th>
                              <th className="px-3 py-2 font-bold">Peso</th>
                              <th className="px-3 py-2 font-bold">Valor</th>
                              <th className="px-3 py-2 font-bold">Público</th>
                              <th className="px-3 py-2"><span className="sr-only">Ações</span></th>
                            </tr>
                          </thead>
                          <tbody className="text-zinc-700">
                            {reps.map((r) => (
                              <tr key={r.id} className="border-t border-line">
                                <td className="whitespace-nowrap px-3 py-2">{formatarData(r.data)}</td>
                                <td className="px-3 py-2">
                                  {r.material}
                                  {r.documento_url && (
                                    <a href={r.documento_url} target="_blank" rel="noopener noreferrer" aria-label="Documento" className="ml-1 inline-flex align-middle text-brand hover:text-leaf">
                                      <FileText size={13} />
                                    </a>
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2">{formatarKg(r.peso_kg)}</td>
                                <td className="whitespace-nowrap px-3 py-2">{r.valor != null ? formatarReais(r.valor) : "—"}</td>
                                <td className="px-3 py-2">
                                  <span className={cn(SELO, r.publico ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600")}>{r.publico ? "Sim" : "Não"}</span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-right">
                                  <div className="inline-flex gap-1">
                                    <button type="button" className={BOTAO_ACAO} onClick={() => editarRepasse(r)} aria-label="Editar repasse" title="Editar repasse"><Pencil size={14} /></button>
                                    <button
                                      type="button"
                                      className={cn(BOTAO_ACAO, BOTAO_PERIGO)}
                                      onClick={() => setExcluir({ tipo: "repasse", id: r.id, empresa: e.id, nome: `${r.material} de ${formatarData(r.data)}` })}
                                      aria-label="Excluir repasse"
                                      title="Excluir repasse"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
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
          <Button type="button" variante="contorno" tamanho="pequeno" onClick={fecharEmp}>Cancelar</Button>
          <Button type="button" tamanho="pequeno" onClick={salvarEmp} disabled={salvando}>{salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Salvar</Button>
        </>}
      >
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Empresa</legend>
          <div className={LINHA}>
            <label className={CAMPO}><span className={ROTULO}>Nome *</span><input className={CONTROLE} value={fe.nome} onChange={(e) => setFe({ ...fe, nome: e.target.value })} /></label>
          </div>
          <label className={CAMPO}>
            <span className={ROTULO}>CNPJ</span>
            <div className={EM_LINHA}>
              <input className={CONTROLE} inputMode="numeric" value={fe.cnpj} onChange={(e) => setFe({ ...fe, cnpj: mascaraCnpj(e.target.value) })} placeholder="00.000.000/0000-00" aria-invalid={!cnpjOk} />
              <Button type="button" variante="secundario" tamanho="pequeno" onClick={preencherCnpj} disabled={buscandoCnpj || soDigitos(fe.cnpj).length !== 14}>
                {buscandoCnpj ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />} Buscar dados
              </Button>
            </div>
            {!cnpjOk && <small className={ERRO}>CNPJ inválido</small>}
            <small className={DICA}>Opcional. Preenche pela Receita (BrasilAPI/CNPJ.ws) e já localiza o endereço no mapa.</small>
          </label>
          <div className={LINHA}>
            <label className={CAMPO}><span className={ROTULO}>Responsável</span><input className={CONTROLE} value={fe.responsavel_nome} onChange={(e) => setFe({ ...fe, responsavel_nome: e.target.value })} /></label>
            <label className={CAMPO}><span className={ROTULO}>Cargo do responsável</span><input className={CONTROLE} value={fe.responsavel_cargo} onChange={(e) => setFe({ ...fe, responsavel_cargo: e.target.value })} /></label>
            <label className={CAMPO}><span className={ROTULO}>Parceria desde</span><input type="date" className={CONTROLE} value={fe.parceria_desde} onChange={(e) => setFe({ ...fe, parceria_desde: e.target.value })} /></label>
            <label className={CAMPO}>
              <span className={ROTULO}>Status</span>
              <select className={CONTROLE} value={fe.status} onChange={(e) => setFe({ ...fe, status: e.target.value })}>
                {Object.entries(STATUS_LOGISTICA).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
              </select>
            </label>
          </div>
          <label className={CAMPO}><span className={ROTULO}>Materiais aceitos (separados por vírgula)</span><input className={CONTROLE} value={fe.materiais} onChange={(e) => setFe({ ...fe, materiais: e.target.value })} placeholder="Papelão, Vidro, PET" /></label>
          <label className={CAMPO}><span className={ROTULO}>Descrição pública</span><textarea className={CONTROLE} rows={3} value={fe.descricao} onChange={(e) => setFe({ ...fe, descricao: e.target.value })} /></label>
        </fieldset>
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Localização</legend>
          <div className={LINHA}>
            <label className={CAMPO}><span className={ROTULO}>Endereço</span><input className={CONTROLE} value={fe.endereco} onChange={(e) => setFe({ ...fe, endereco: e.target.value })} /></label>
            <label className={CAMPO}><span className={ROTULO}>Bairro</span><input className={CONTROLE} value={fe.bairro} onChange={(e) => setFe({ ...fe, bairro: e.target.value })} /></label>
            <label className={CAMPO}><span className={ROTULO}>CEP</span><input className={CONTROLE} inputMode="numeric" value={fe.cep} onChange={(e) => setFe({ ...fe, cep: soDigitos(e.target.value).slice(0, 8) })} placeholder="62760000" /></label>
          </div>
          <div className={CAMPO}>
            <span className={ROTULO}>Buscar endereço no mapa (OpenStreetMap, Photon, Esri e CEP)</span>
            <div className={EM_LINHA}>
              <input className={CONTROLE} value={buscaEnd} onChange={(e) => setBuscaEnd(e.target.value)} placeholder="Rua, número, bairro, cidade" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), procurarEndereco())} />
              <Button type="button" variante="secundario" tamanho="pequeno" onClick={procurarEndereco} disabled={buscandoEnd}>
                {buscandoEnd ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />} Buscar
              </Button>
            </div>
            <ResultadosGeo resultados={resultadosGeo} escolhido={escolhidoGeo} onEscolher={aplicarGeo} aviso={avisoGeo} />
          </div>
          <MapaSeletor latitude={fe.latitude} longitude={fe.longitude} categoria="Logística reversa" onChange={(lat, lng) => setFe((f) => ({ ...f, latitude: lat, longitude: lng, mostrar_no_mapa: f.latitude == null ? true : f.mostrar_no_mapa }))} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.8rem] text-zinc-600">
            <span className="[overflow-wrap:anywhere]">{fe.latitude != null ? `Ponto: ${fe.latitude}, ${fe.longitude}` : "Clique no mapa para marcar o ponto (depois arraste para ajustar)."}</span>
            {fe.latitude != null && (
              <div className="flex flex-wrap gap-2"><Button type="button" variante="contorno" tamanho="pequeno" onClick={() => setFe((f) => ({ ...f, latitude: null, longitude: null, mostrar_no_mapa: false }))}>Limpar ponto</Button></div>
            )}
          </div>
          <label className={MARCAR}><input type="checkbox" checked={fe.mostrar_no_mapa} onChange={(e) => setFe({ ...fe, mostrar_no_mapa: e.target.checked })} /> Mostrar no mapa público (cor de logística reversa)</label>
        </fieldset>
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Logo</legend>
          <LogoUpload valor={fe.logo_url} pasta="logistica" onChange={(u) => setFe((f) => ({ ...f, logo_url: u }))} onErro={(m) => mostrar("erro", m)} />
        </fieldset>
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Contato público (opcional)</legend>
          <div className={LINHA}>
            <label className={CAMPO}><span className={ROTULO}>Site</span><input className={CONTROLE} value={fe.site} onChange={(e) => setFe({ ...fe, site: e.target.value })} /></label>
            <label className={CAMPO}><span className={ROTULO}>Telefone</span><input className={CONTROLE} value={fe.telefone_publico} onChange={(e) => setFe({ ...fe, telefone_publico: e.target.value })} /></label>
            <label className={CAMPO}><span className={ROTULO}>E-mail</span><input type="email" className={CONTROLE} value={fe.email_publico} onChange={(e) => setFe({ ...fe, email_publico: e.target.value })} /></label>
            <label className={CAMPO}><span className={ROTULO}>Ordem</span><input type="number" min={0} className={CONTROLE} value={fe.ordem} onChange={(e) => setFe({ ...fe, ordem: e.target.value })} /></label>
          </div>
          <label className={MARCAR}><input type="checkbox" checked={fe.exibir_publicamente} onChange={(e) => setFe({ ...fe, exibir_publicamente: e.target.checked })} /> Exibir em /parceiros</label>
          <label className={CAMPO}><span className={ROTULO}>Observações internas (não aparecem no site)</span><textarea className={CONTROLE} rows={2} value={fe.observacoes_internas} onChange={(e) => setFe({ ...fe, observacoes_internas: e.target.value })} /></label>
        </fieldset>
      </PainelLateral>

      {/* Repasse */}
      <PainelLateral
        aberto={!!painelRep}
        titulo={painelRep?.id ? "Editar repasse" : "Registrar repasse"}
        onFechar={fecharRep}
        rodape={<>
          <Button type="button" variante="contorno" tamanho="pequeno" onClick={fecharRep}>Cancelar</Button>
          <Button type="button" tamanho="pequeno" onClick={salvarRep} disabled={salvando}>{salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Salvar</Button>
        </>}
      >
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Repasse para {empresas.find((e) => e.id === painelRep?.empresa)?.nome ?? "empresa"}</legend>
          <div className={LINHA}>
            <label className={CAMPO}><span className={ROTULO}>Data *</span><input type="date" className={CONTROLE} value={fr.data} onChange={(e) => setFr({ ...fr, data: e.target.value })} /></label>
            <label className={CAMPO}><span className={ROTULO}>Material *</span><input className={CONTROLE} value={fr.material} onChange={(e) => setFr({ ...fr, material: e.target.value })} placeholder="Ex.: Papelão" /></label>
            <label className={CAMPO}><span className={ROTULO}>Peso (kg) *</span><input inputMode="decimal" className={CONTROLE} value={fr.peso_kg} onChange={(e) => setFr({ ...fr, peso_kg: e.target.value })} /></label>
            <label className={CAMPO}><span className={ROTULO}>Valor (R$, opcional)</span><input inputMode="decimal" className={CONTROLE} value={fr.valor} onChange={(e) => setFr({ ...fr, valor: e.target.value })} /></label>
          </div>
          <label className={CAMPO}><span className={ROTULO}>Link do documento/comprovante (opcional)</span><input className={CONTROLE} value={fr.documento_url} onChange={(e) => setFr({ ...fr, documento_url: e.target.value })} placeholder="https://" /></label>
          <label className={CAMPO}><span className={ROTULO}>Observação</span><textarea className={CONTROLE} rows={2} value={fr.observacao} onChange={(e) => setFr({ ...fr, observacao: e.target.value })} /></label>
          <label className={MARCAR}><input type="checkbox" checked={fr.publico} onChange={(e) => setFr({ ...fr, publico: e.target.checked })} /> Mostrar no histórico público</label>
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
