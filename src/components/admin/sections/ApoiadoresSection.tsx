"use client";

/**
 * ApoiadoresSection — "Apoiadores e Mapa" (painel, somente ADM DEUS)
 * ------------------------------------------------------------
 * Lista com busca/filtros e CRUD completo da tabela apoiadores.
 * Formulário: pessoa jurídica (CNPJ + busca na BrasilAPI) ou física
 * (CPF, nunca exibido no site), categoria, tipos de apoio, contatos
 * públicos, logo, e o MAPA para clicar/arrastar e marcar o ponto
 * (também "usar minha localização" e busca de endereço em cadeia:
 * Nominatim → Photon → Esri → CEP, pela rota /api/geocodificar).
 * "Buscar dados" do CNPJ preenche e já posiciona o marcador.
 * Visual só com Tailwind, no mesmo padrão do painel de notícias
 * (classes em components/admin/apoiadores/estilos.ts).
 * Escrita direto na tabela apoiadores (RLS: só administradores), nunca na view pública.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Building2, Crosshair, Eye, EyeOff, HeartHandshake, Loader2, MapPin, MapPinOff, Pencil, Plus, PowerOff, RefreshCw, Search, ShieldAlert, Trash2,
  UserRound,
} from "lucide-react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import PainelLateral from "@/components/admin/apoiadores/PainelLateral";
import LogoUpload from "@/components/admin/apoiadores/LogoUpload";
import {
  CATEGORIAS, TIPOS_APOIO, corCategoria, mascaraCnpj, mascaraCpf, soDigitos, cnpjValido, cpfValido,
} from "@/services/apoiadores";
import {
  apoiadorSchema, buscarCnpj, buscarEndereco, consultaDoCnpj, enderecoDoCnpj, excluirApoiador, geocodificar, listarApoiadores, primeiroErro,
  salvarApoiador, type Apoiador, type ResultadoGeo,
} from "@/services/apoiadoresAdmin";
import ResultadosGeo from "@/components/admin/apoiadores/ResultadosGeo";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import {
  BLOCO, BOTAO_ACAO, BOTAO_PERIGO, CAMPO, CARTAO, CONTROLE, DICA, EM_LINHA, ERRO, LINHA, MAPA_CARREGANDO, MARCAR, ROTULO, SELECT, SELO, TEXTO_ACAO,
  CAIXA_VAZIA, TITULO_BLOCO,
} from "@/components/admin/apoiadores/estilos";

const MapaSeletor = dynamic(() => import("@/components/mapa/MapaSeletor"), {
  ssr: false,
  loading: () => <div className={MAPA_CARREGANDO}>Carregando mapa…</div>,
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
  const { mostrar } = useToast();
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
  const [resultadosEnd, setResultadosEnd] = useState<ResultadoGeo[]>([]);
  const [escolhidoGeo, setEscolhidoGeo] = useState<number | null>(null);
  const [avisoGeo, setAvisoGeo] = useState<string | null>(null);
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

  /** Limpa a lista de sugestões e o aviso de localização automática */
  function limparGeo() {
    setResultadosEnd([]);
    setEscolhidoGeo(null);
    setAvisoGeo(null);
  }

  /** Posiciona o marcador no resultado escolhido */
  function aplicarGeo(r: ResultadoGeo, i: number) {
    setEscolhidoGeo(i);
    setForm((f) => ({ ...f, latitude: r.lat, longitude: r.lng, mostrar_no_mapa: f.latitude == null ? true : f.mostrar_no_mapa }));
  }

  function novo() {
    setEditId(undefined);
    setForm(VAZIO);
    limparGeo();
    setBuscaEnd("");
    setAberto(true);
  }
  function editar(a: Apoiador) {
    setEditId(a.id);
    setForm(paraForm(a));
    limparGeo();
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

  /** Busca o CNPJ, preenche os dados e já localiza o endereço no mapa */
  async function preencherCnpj() {
    setBuscandoCnpj(true);
    limparGeo();
    try {
      const d = await buscarCnpj(form.cnpj);
      const end = enderecoDoCnpj(d);
      setForm((f) => ({
        ...f,
        nome: d.razao_social || f.nome,
        nome_fantasia: d.nome_fantasia || f.nome_fantasia,
        endereco: end || f.endereco,
        bairro: d.bairro || f.bairro,
      }));
      if (end) setBuscaEnd([d.logradouro, d.numero, d.bairro, d.municipio].filter(Boolean).join(", "));
      mostrar("sucesso", `Dados da Receita preenchidos (${d.fonte}). Procurando o local no mapa…`);
      if (!d.logradouro && !d.cep) return;
      const r = await geocodificar(consultaDoCnpj(d));
      setResultadosEnd(r);
      if (r.length) {
        aplicarGeo(r[0], 0);
        setAvisoGeo("Local encontrado automaticamente — confira e ajuste se necessário.");
      } else {
        mostrar("aviso", "Não achamos o endereço no mapa. Marque o ponto clicando no mapa.");
      }
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro na consulta");
    } finally {
      setBuscandoCnpj(false);
    }
  }

  async function procurarEndereco() {
    setBuscandoEnd(true);
    try {
      limparGeo();
      const r = await buscarEndereco(buscaEnd);
      setResultadosEnd(r);
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

  function minhaLocalizacao() {
    if (!navigator.geolocation) return mostrar("erro", "Seu navegador não permite localização.");
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setForm((f) => ({ ...f, latitude: Math.round(p.coords.latitude * 1e6) / 1e6, longitude: Math.round(p.coords.longitude * 1e6) / 1e6, mostrar_no_mapa: f.latitude == null ? true : f.mostrar_no_mapa }));
        setLocalizando(false);
      },
      () => {
        mostrar("erro", "Não foi possível obter sua localização (permissão negada?).");
        setLocalizando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  /* ---------- Sem permissão ---------- */
  if (papel !== "deus") {
    return (
      <div role="alert" className={cn(CARTAO, "mx-auto my-8 flex max-w-md flex-col items-center gap-2.5 p-8 text-center text-brand")}>
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-mint">
          <ShieldAlert size={26} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-extrabold text-ink">Acesso restrito</h2>
        <p className="text-sm text-ink-soft">Apoiadores e Mapa é uma área exclusiva do ADM DEUS.</p>
      </div>
    );
  }

  const docOk = form.tipo_pessoa === "juridica" ? !form.cnpj || cnpjValido(form.cnpj) : !form.cpf || cpfValido(form.cpf);

  // números dos cartões do topo
  const cartoes = [
    { rotulo: "Cadastrados", valor: lista.length, Icone: HeartHandshake, cor: "bg-brand-mint text-brand" },
    { rotulo: "No mapa", valor: lista.filter((a) => a.mostrar_no_mapa).length, Icone: MapPin, cor: "bg-emerald-100 text-emerald-700" },
    { rotulo: "No site", valor: lista.filter((a) => a.exibir_publicamente).length, Icone: Eye, cor: "bg-blue-100 text-blue-700" },
    { rotulo: "Ocultos", valor: lista.filter((a) => !a.exibir_publicamente).length, Icone: EyeOff, cor: "bg-zinc-100 text-zinc-600" },
    { rotulo: "Inativos", valor: lista.filter((a) => !a.ativo).length, Icone: PowerOff, cor: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black tracking-tight text-ink sm:text-2xl">Apoiadores e Mapa</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Empresas e pessoas que apoiam a ACMRB. Quem estiver “no mapa” aparece no mapa da página inicial; “no site”, em /parceiros.
          </p>
        </div>
        <Button type="button" tamanho="pequeno" onClick={novo} className="max-sm:w-full">
          <Plus size={16} aria-hidden="true" /> Novo apoiador
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
      <div className={cn(CARTAO, "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2.5 p-3 lg:grid-cols-[minmax(0,1fr)_13rem_13rem_auto]")}>
        <label className="col-span-3 flex h-11 items-center gap-2 rounded-control border border-line bg-white px-3.5 text-ink-muted transition focus-within:border-brand focus-within:shadow-focus lg:col-span-1">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Buscar apoiador</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, bairro ou CNPJ"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[0.9rem] text-ink outline-none"
          />
        </label>
        <select value={fCategoria} onChange={(e) => setFCategoria(e.target.value)} aria-label="Filtrar por categoria" className={SELECT}>
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={fMapa} onChange={(e) => setFMapa(e.target.value as typeof fMapa)} aria-label="Filtrar por mapa" className={SELECT}>
          <option value="">No mapa: todos</option>
          <option value="sim">Aparecem no mapa</option>
          <option value="nao">Fora do mapa</option>
        </select>
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={carregar} aria-label="Atualizar lista" title="Atualizar lista" className="h-11">
          <RefreshCw size={16} aria-hidden="true" className={cn(carregando && "animate-spin")} />
        </Button>
      </div>
      {!carregando && !erroCarga && lista.length > 0 && (
        <p className="-mt-2 text-[0.8rem] text-ink-muted">Mostrando {filtrados.length} de {lista.length}.</p>
      )}

      {/* Carregando: esqueleto no lugar da lista */}
      {carregando && (
        <ul className="flex flex-col gap-3" aria-label="Carregando apoiadores">
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
      {!carregando && erroCarga && (
        <div className={cn(CAIXA_VAZIA, "border-red-200 text-danger")} role="alert">
          Erro ao carregar: {erroCarga}
          <Button type="button" variante="secundario" tamanho="pequeno" onClick={carregar}><RefreshCw size={16} aria-hidden="true" /> Tentar de novo</Button>
        </div>
      )}
      {!carregando && !erroCarga && filtrados.length === 0 && (
        <div className={CAIXA_VAZIA}>
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-brand"><HeartHandshake size={22} aria-hidden="true" /></span>
          {lista.length ? "Nenhum apoiador com esses filtros." : "Nenhum apoiador cadastrado ainda. Clique em “Novo apoiador”."}
        </div>
      )}

      {/* Lista */}
      {!carregando && !erroCarga && filtrados.length > 0 && (
        <ul className="flex flex-col gap-3">
          {filtrados.map((a) => (
            <li
              key={a.id}
              className={cn(
                CARTAO,
                "grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 p-3 transition hover:border-brand-line sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-4 sm:p-3.5 xl:grid-cols-[4rem_minmax(0,1fr)_auto]",
                !a.ativo && "bg-zinc-50/80",
              )}
            >
              {/* logo (ou a inicial na cor da categoria) */}
              <span
                className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-line text-xl font-black text-white"
                style={{ background: a.logo_url ? "#fff" : corCategoria(a.categoria) }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {a.logo_url ? <img src={a.logo_url} alt="" className="size-full object-contain p-1" /> : a.nome.charAt(0).toUpperCase()}
              </span>
              <div className={cn("min-w-0", !a.ativo && "opacity-70")}>
                <div className="flex flex-wrap gap-1.5">
                  <span className={cn(SELO, "bg-emerald-50 font-bold text-leaf")}>
                    <span className="size-2 rounded-full" style={{ background: corCategoria(a.categoria) }} aria-hidden="true" />
                    {a.categoria}
                  </span>
                  <span className={cn(SELO, "bg-zinc-100 text-zinc-700")}>
                    {a.tipo_pessoa === "juridica" ? <Building2 size={11} aria-hidden="true" /> : <UserRound size={11} aria-hidden="true" />}
                    {a.tipo_pessoa === "juridica" ? "Empresa" : "Pessoa física"}
                  </span>
                  {a.mostrar_no_mapa && <span className={cn(SELO, "bg-emerald-100 text-emerald-800")}><MapPin size={11} aria-hidden="true" /> No mapa</span>}
                  {!a.exibir_publicamente && <span className={cn(SELO, "bg-zinc-200 text-zinc-700")}><EyeOff size={11} aria-hidden="true" /> Oculto</span>}
                  {!a.ativo && <span className={cn(SELO, "bg-amber-100 text-amber-800")}>Inativo</span>}
                  {a.anonimo && <span className={cn(SELO, "bg-blue-100 text-blue-800")}>Anônimo no site</span>}
                </div>
                <h3 className="mt-1.5 truncate text-[0.92rem] font-extrabold leading-snug text-ink sm:text-base">{a.nome_fantasia || a.nome}</h3>
                <small className="mt-0.5 block truncate text-[0.78rem] text-ink-muted">
                  {[a.bairro, a.cnpj ? mascaraCnpj(a.cnpj) : "", a.nome_fantasia && a.nome_fantasia !== a.nome ? a.nome : ""].filter(Boolean).join(" • ") || "Sem endereço cadastrado"}
                </small>
              </div>
              <div className="col-span-2 flex flex-wrap items-center gap-1.5 border-t border-line pt-3 xl:col-span-1 xl:justify-end xl:border-0 xl:pt-0">
                <button type="button" className={BOTAO_ACAO} onClick={() => editar(a)} title="Editar" aria-label={`Editar ${a.nome}`}>
                  <Pencil size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Editar</span>
                </button>
                <button
                  type="button"
                  className={cn(BOTAO_ACAO, a.mostrar_no_mapa && "text-emerald-700")}
                  onClick={() => alternar(a, "mostrar_no_mapa")}
                  title={a.mostrar_no_mapa ? "Tirar do mapa" : "Mostrar no mapa"}
                  aria-label={a.mostrar_no_mapa ? "Tirar do mapa" : "Mostrar no mapa"}
                >
                  {a.mostrar_no_mapa ? <MapPinOff size={15} aria-hidden="true" /> : <MapPin size={15} aria-hidden="true" />}
                  <span className={TEXTO_ACAO}>{a.mostrar_no_mapa ? "Tirar do mapa" : "Pôr no mapa"}</span>
                </button>
                <button
                  type="button"
                  className={BOTAO_ACAO}
                  onClick={() => alternar(a, "exibir_publicamente")}
                  title={a.exibir_publicamente ? "Ocultar do site" : "Exibir no site"}
                  aria-label={a.exibir_publicamente ? "Ocultar do site" : "Exibir no site"}
                >
                  {a.exibir_publicamente ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                  <span className={TEXTO_ACAO}>{a.exibir_publicamente ? "Ocultar" : "Exibir"}</span>
                </button>
                <button type="button" className={cn(BOTAO_ACAO, BOTAO_PERIGO)} onClick={() => setExcluir(a)} title="Excluir" aria-label={`Excluir ${a.nome}`}>
                  <Trash2 size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Excluir</span>
                </button>
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
            <Button type="button" variante="contorno" tamanho="pequeno" onClick={fecharPainel}>Cancelar</Button>
            <Button type="button" tamanho="pequeno" onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Salvar
            </Button>
          </>
        }
      >
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Identificação</legend>
          <div className="grid grid-cols-1 gap-1.5 rounded-2xl bg-surface-alt p-1 ring-1 ring-line min-[420px]:grid-cols-2" role="radiogroup" aria-label="Tipo de pessoa">
            {(["juridica", "fisica"] as const).map((t) => (
              <button key={t} type="button" className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-[0.85rem] font-bold text-ink-muted transition hover:text-brand aria-checked:bg-white aria-checked:text-brand aria-checked:shadow-sm aria-checked:ring-1 aria-checked:ring-black/5" role="radio" aria-checked={form.tipo_pessoa === t} onClick={() => set("tipo_pessoa", t)}>
                {t === "juridica" ? <><Building2 size={15} aria-hidden="true" /> Empresa / CNPJ</> : <><UserRound size={15} aria-hidden="true" /> Pessoa física / CPF</>}
              </button>
            ))}
          </div>

          {form.tipo_pessoa === "juridica" ? (
            <label className={CAMPO}>
              <span className={ROTULO}>CNPJ</span>
              <div className={EM_LINHA}>
                <input className={CONTROLE} inputMode="numeric" value={form.cnpj} onChange={(e) => set("cnpj", mascaraCnpj(e.target.value))} placeholder="00.000.000/0000-00" aria-invalid={!docOk} />
                <Button type="button" variante="secundario" tamanho="pequeno" onClick={preencherCnpj} disabled={buscandoCnpj || soDigitos(form.cnpj).length !== 14}>
                  {buscandoCnpj ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />} Buscar dados
                </Button>
              </div>
              {!docOk && <small className={ERRO}>CNPJ inválido</small>}
              <small className={DICA}>Opcional. “Buscar dados” preenche pela Receita (BrasilAPI/CNPJ.ws) e já localiza o endereço no mapa.</small>
            </label>
          ) : (
            <label className={CAMPO}>
              <span className={ROTULO}>CPF (privado)</span>
              <input className={CONTROLE} inputMode="numeric" value={form.cpf} onChange={(e) => set("cpf", mascaraCpf(e.target.value))} placeholder="000.000.000-00" aria-invalid={!docOk} />
              {!docOk && <small className={ERRO}>CPF inválido</small>}
              <small className={DICA}>Opcional. Nunca aparece no site.</small>
            </label>
          )}

          <div className={LINHA}>
            <label className={CAMPO}>
              <span className={ROTULO}>{form.tipo_pessoa === "juridica" ? "Razão social / nome *" : "Nome *"}</span>
              <input className={CONTROLE} value={form.nome} onChange={(e) => set("nome", e.target.value)} required />
            </label>
            <label className={CAMPO}>
              <span className={ROTULO}>Nome fantasia / como aparece</span>
              <input className={CONTROLE} value={form.nome_fantasia} onChange={(e) => set("nome_fantasia", e.target.value)} />
            </label>
            <label className={CAMPO}>
              <span className={ROTULO}>Categoria</span>
              <select className={CONTROLE} value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className={CAMPO}>
              <span className={ROTULO}>Apoiador desde</span>
              <input type="date" className={CONTROLE} value={form.desde} onChange={(e) => set("desde", e.target.value)} />
            </label>
          </div>

          <div className={CAMPO}>
            <span className={ROTULO}>Tipos de apoio</span>
            <div className="flex flex-wrap gap-1.5">
              {TIPOS_APOIO.map((t) => (
                <button key={t} type="button" className="cursor-pointer rounded-full border border-line bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-zinc-700 transition hover:border-brand-line aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-white" aria-pressed={form.tipos_apoio.includes(t)} onClick={() => set("tipos_apoio", form.tipos_apoio.includes(t) ? form.tipos_apoio.filter((x) => x !== t) : [...form.tipos_apoio, t])}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className={CAMPO}>
            <span className={ROTULO}>Descrição pública</span>
            <textarea className={CONTROLE} rows={3} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} maxLength={2000} />
          </label>
        </fieldset>

        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Logo</legend>
          <LogoUpload valor={form.logo_url} pasta="apoiadores" onChange={(u) => set("logo_url", u)} onErro={(m) => mostrar("erro", m)} />
        </fieldset>

        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Contatos públicos (opcionais)</legend>
          <div className={LINHA}>
            <label className={CAMPO}><span className={ROTULO}>Site</span><input className={CONTROLE} value={form.site} onChange={(e) => set("site", e.target.value)} placeholder="www.exemplo.com.br" /></label>
            <label className={CAMPO}><span className={ROTULO}>Instagram</span><input className={CONTROLE} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@perfil" /></label>
            <label className={CAMPO}><span className={ROTULO}>Telefone</span><input className={CONTROLE} value={form.telefone_publico} onChange={(e) => set("telefone_publico", e.target.value)} /></label>
            <label className={CAMPO}><span className={ROTULO}>E-mail</span><input type="email" className={CONTROLE} value={form.email_publico} onChange={(e) => set("email_publico", e.target.value)} /></label>
          </div>
        </fieldset>

        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Localização no mapa</legend>
          <div className={LINHA}>
            <label className={CAMPO}><span className={ROTULO}>Endereço</span><input className={CONTROLE} value={form.endereco} onChange={(e) => set("endereco", e.target.value)} /></label>
            <label className={CAMPO}><span className={ROTULO}>Bairro</span><input className={CONTROLE} value={form.bairro} onChange={(e) => set("bairro", e.target.value)} /></label>
          </div>
          <div className={CAMPO}>
            <span className={ROTULO}>Buscar endereço no mapa (OpenStreetMap, Photon, Esri e CEP)</span>
            <div className={EM_LINHA}>
              <input className={CONTROLE} value={buscaEnd} onChange={(e) => setBuscaEnd(e.target.value)} placeholder="Rua, número, bairro" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), procurarEndereco())} />
              <Button type="button" variante="secundario" tamanho="pequeno" onClick={procurarEndereco} disabled={buscandoEnd}>
                {buscandoEnd ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />} Buscar
              </Button>
            </div>
            <ResultadosGeo resultados={resultadosEnd} escolhido={escolhidoGeo} onEscolher={aplicarGeo} aviso={avisoGeo} />
          </div>

          <MapaSeletor latitude={form.latitude} longitude={form.longitude} categoria={form.categoria} onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng, mostrar_no_mapa: f.latitude == null ? true : f.mostrar_no_mapa }))} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.8rem] text-zinc-600">
            <span className="[overflow-wrap:anywhere]">{form.latitude != null ? `Ponto: ${form.latitude}, ${form.longitude}` : "Clique no mapa para marcar o ponto (depois arraste para ajustar)."}</span>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variante="secundario" tamanho="pequeno" onClick={minhaLocalizacao} disabled={localizando}>
                {localizando ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Crosshair size={16} aria-hidden="true" />} Usar minha localização
              </Button>
              {form.latitude != null && (
                <Button type="button" variante="contorno" tamanho="pequeno" onClick={() => setForm((f) => ({ ...f, latitude: null, longitude: null, mostrar_no_mapa: false }))}>Limpar ponto</Button>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Exibição</legend>
          <label className={MARCAR}><input type="checkbox" checked={form.mostrar_no_mapa} onChange={(e) => set("mostrar_no_mapa", e.target.checked)} /> Mostrar no mapa da página inicial</label>
          {/* Aviso: ponto marcado mas fora do mapa (causa de "cadastrei e não aparece") */}
          {form.latitude != null && !form.mostrar_no_mapa && (
            <p className={DICA} role="note">Este apoiador tem ponto marcado, mas só aparece no mapa da home com esta opção ligada.</p>
          )}
          <label className={MARCAR}><input type="checkbox" checked={form.exibir_publicamente} onChange={(e) => set("exibir_publicamente", e.target.checked)} /> Exibir publicamente (home e /parceiros)</label>
          {form.tipo_pessoa === "fisica" && (
            <label className={MARCAR}><input type="checkbox" checked={form.anonimo} onChange={(e) => set("anonimo", e.target.checked)} /> Aparecer como “Apoiador anônimo”</label>
          )}
          <label className={MARCAR}><input type="checkbox" checked={form.ativo} onChange={(e) => set("ativo", e.target.checked)} /> Ativo</label>
          <small className={DICA}>Pessoas físicas e anônimos aparecem com localização aproximada (cerca de 100 m) e sem endereço.</small>
          <div className={LINHA}>
            <label className={CAMPO}><span className={ROTULO}>Ordem</span><input type="number" min={0} className={CONTROLE} value={form.ordem} onChange={(e) => set("ordem", e.target.value)} /></label>
          </div>
          <label className={CAMPO}>
            <span className={ROTULO}>Observações internas (não aparecem no site)</span>
            <textarea className={CONTROLE} rows={2} value={form.observacoes_internas} onChange={(e) => set("observacoes_internas", e.target.value)} />
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
