"use client";

/**
 * VisaoMapaSection — "Visão do Mapa" (painel, somente ADM DEUS)
 * ------------------------------------------------------------
 * Substitui a antiga tela "Parceiros".
 *  - Mapa grande com TODOS os apoiadores e empresas de logística,
 *    inclusive os ocultos do site (marcador tracejado/apagado).
 *  - Estatísticas: por categoria, tipo de apoio e bairro; ocultos e
 *    sem localização.
 *  - "Pendentes de localização": geocodificação em lote pelo endereço
 *    salvo (ou pelo CNPJ, se não houver endereço). Cada sugestão é
 *    revisada UMA A UMA no mapa (arrastável) antes de salvar.
 *  - Exportar CSV com tudo (inclui ocultos; sem CPF).
 * Visual: só classes Tailwind. Mapa e painel lateral lado a lado no notebook
 * grande (>=1280px); empilhados no celular e no tablet.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Check, Download, Eye, EyeOff, Loader2, MapPin, MapPinOff, RefreshCw, ShieldAlert, SkipForward, Sparkles, Truck, Users, Wand2, type LucideIcon,
} from "lucide-react";

import { ToastArea, useToast } from "@/components/ui/Toast";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import ResultadosGeo from "@/components/admin/apoiadores/ResultadosGeo";
import type { PontoVisao } from "@/components/mapa/MapaVisao";
import { corCategoria, mascaraCnpj } from "@/services/apoiadores";
import {
  buscarCnpj, consultaDoCnpj, consultaDoEndereco, geocodificar, listarApoiadores, listarEmpresas, salvarLocalizacao,
  type Apoiador, type ConsultaGeo, type EmpresaLogistica, type ResultadoGeo,
} from "@/services/apoiadoresAdmin";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

/* Estilos que se repetem nesta tela */
// altura do mapa: acompanha a tela no celular/tablet e fica fixa no notebook grande
const ALTURA_MAPA = "h-[clamp(300px,60dvh,480px)] xl:h-[560px]";
// cartão branco arredondado (painel lateral e estatísticas)
const CARTAO = "flex min-h-0 flex-col gap-3 rounded-card border border-black/5 bg-white p-4 shadow-card";
const TITULO_CARTAO = "text-base font-extrabold tracking-tight text-ink";
const DICA = "text-sm text-ink-muted";
const LINK_DISCRETO =
  "self-center rounded-md text-sm text-ink-muted underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
// bolinhas da legenda do mapa
const PONTO = "inline-block h-3 w-3 rounded-full border-2 border-white bg-emerald-600 shadow-[0_0_0_1px_#d4d4d8]";
// ícone girando (botões que estão carregando)
const GIRA = "animate-spin motion-reduce:animate-none";

const MapaVisao = dynamic(() => import("@/components/mapa/MapaVisao"), {
  ssr: false,
  loading: () => (
    <div className={cn("flex items-center justify-center rounded-card bg-emerald-50 font-semibold text-leaf", ALTURA_MAPA)}>
      Carregando mapa…
    </div>
  ),
});

/** Item unificado (apoiador ou empresa) */
interface Item {
  id: string; // prefixado: "a-" apoiador, "e-" empresa
  idBanco: string;
  tabela: "apoiadores" | "empresas_logistica";
  tipo: "Apoiador" | "Logística";
  nome: string;
  categoria: string;
  tiposApoio: string[];
  bairro: string | null;
  endereco: string | null;
  cnpj: string | null;
  cep: string | null;
  lat: number | null;
  lng: number | null;
  noMapa: boolean;
  publico: boolean;
}

function deApoiador(a: Apoiador): Item {
  return {
    id: `a-${a.id}`, idBanco: a.id, tabela: "apoiadores", tipo: "Apoiador", nome: a.nome_fantasia || a.nome, categoria: a.categoria,
    tiposApoio: a.tipos_apoio ?? [], bairro: a.bairro, endereco: a.endereco, cnpj: a.cnpj, cep: null, lat: a.latitude, lng: a.longitude,
    noMapa: a.mostrar_no_mapa, publico: a.ativo && a.exibir_publicamente,
  };
}
function deEmpresa(e: EmpresaLogistica): Item {
  return {
    id: `e-${e.id}`, idBanco: e.id, tabela: "empresas_logistica", tipo: "Logística", nome: e.nome, categoria: "Logística reversa",
    tiposApoio: ["Logística reversa"], bairro: e.bairro ?? null, endereco: e.endereco ?? null, cnpj: e.cnpj, cep: e.cep ?? null,
    lat: e.latitude ?? null, lng: e.longitude ?? null, noMapa: !!e.mostrar_no_mapa, publico: e.exibir_publicamente,
  };
}

const temPonto = (i: Item) => i.lat != null && i.lng != null;

/** Contagem agrupada, do maior para o menor */
function contar(lista: string[]) {
  const m = new Map<string, number>();
  lista.forEach((v) => m.set(v, (m.get(v) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function csv(itens: Item[]) {
  const esc = (v: unknown) => {
    const t = v == null ? "" : String(v);
    return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const cab = ["tipo", "nome", "categoria", "tipos_apoio", "cnpj", "endereco", "bairro", "latitude", "longitude", "no_mapa", "publico"];
  const linhas = itens.map((i) =>
    [i.tipo, i.nome, i.categoria, i.tiposApoio.join(" | "), i.cnpj ? mascaraCnpj(i.cnpj) : "", i.endereco, i.bairro, i.lat, i.lng,
      i.noMapa ? "sim" : "não", i.publico ? "sim" : "não"].map(esc).join(";"),
  );
  // BOM para o Excel abrir com acentos
  return "\uFEFF" + [cab.join(";"), ...linhas].join("\n");
}

interface Revisao {
  item: Item;
  resultados: ResultadoGeo[];
  escolhido: number | null;
  lat: number | null;
  lng: number | null;
  erro: string | null;
}

/** Cartão de número do topo da tela (alerta = fica amarelo, ex.: itens sem localização) */
function Numero({ icone: Icone, valor, rotulo, alerta }: { icone: LucideIcon; valor: number; rotulo: string; alerta?: boolean }) {
  return (
    <li
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-card border p-3.5 shadow-card sm:p-4",
        alerta ? "border-amber-200 bg-warning-soft" : "border-black/5 bg-white",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          alerta ? "bg-amber-100 text-warning" : "bg-brand-mint text-leaf",
        )}
      >
        <Icone size={20} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col">
        <strong className={cn("text-2xl font-black leading-none tabular-nums", alerta ? "text-warning" : "text-emerald-900")}>{valor}</strong>
        <span className="mt-1 text-xs leading-tight text-ink-muted">{rotulo}</span>
      </span>
    </li>
  );
}

export default function VisaoMapaSection() {
  const papel = usePapelAdmin();
  const { toasts, mostrar, fechar } = useToast();
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [verOcultos, setVerOcultos] = useState(true);
  const [fTipo, setFTipo] = useState<"" | "Apoiador" | "Logística">("");
  const [selecionado, setSelecionado] = useState<string | null>(null);
  // localização em lote
  const [fila, setFila] = useState<Revisao[]>([]);
  const [processando, setProcessando] = useState<{ feitos: number; total: number } | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [a, e] = await Promise.all([listarApoiadores(), listarEmpresas()]);
      setItens([...a.map(deApoiador), ...e.map(deEmpresa)]);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (papel === "deus") carregar();
  }, [papel, carregar]);

  const visiveis = useMemo(
    () => itens.filter((i) => (verOcultos || i.publico) && (!fTipo || i.tipo === fTipo)),
    [itens, verOcultos, fTipo],
  );
  const pontos: PontoVisao[] = useMemo(
    () =>
      visiveis.filter(temPonto).map((i) => ({
        id: i.id, nome: i.nome, categoria: i.categoria, tipo: i.tipo, lat: i.lat!, lng: i.lng!, bairro: i.bairro,
        oculto: !i.publico || !i.noMapa,
      })),
    [visiveis],
  );
  const pendentes = useMemo(() => itens.filter((i) => !temPonto(i)), [itens]);

  const stats = useMemo(() => ({
    total: itens.length,
    apoiadores: itens.filter((i) => i.tipo === "Apoiador").length,
    empresas: itens.filter((i) => i.tipo === "Logística").length,
    noSite: itens.filter((i) => i.publico && i.noMapa && temPonto(i)).length,
    ocultos: itens.filter((i) => !i.publico || !i.noMapa).length,
    semLocal: pendentes.length,
    porCategoria: contar(itens.map((i) => i.categoria)),
    porApoio: contar(itens.flatMap((i) => i.tiposApoio)),
    porBairro: contar(itens.map((i) => i.bairro?.trim() || "Sem bairro")).slice(0, 10),
  }), [itens, pendentes]);

  const selecionar = useCallback((id: string) => setSelecionado(id), []);

  /** Monta a consulta: endereço salvo; se não houver, busca o CNPJ */
  async function consultaDe(i: Item): Promise<ConsultaGeo | null> {
    const c = consultaDoEndereco(i.endereco, i.bairro);
    if (c && (c.logradouro || c.bairro)) return { ...c, cep: i.cep ?? undefined };
    if (i.cnpj) return consultaDoCnpj(await buscarCnpj(i.cnpj));
    if (i.cep) return { cep: i.cep };
    return null;
  }

  async function revisar(i: Item): Promise<Revisao> {
    try {
      const c = await consultaDe(i);
      if (!c) return { item: i, resultados: [], escolhido: null, lat: null, lng: null, erro: "Sem endereço, CNPJ ou CEP para procurar." };
      const r = await geocodificar(c);
      return { item: i, resultados: r, escolhido: r.length ? 0 : null, lat: r[0]?.lat ?? null, lng: r[0]?.lng ?? null, erro: r.length ? null : "Nada encontrado." };
    } catch (e) {
      return { item: i, resultados: [], escolhido: null, lat: null, lng: null, erro: e instanceof Error ? e.message : "Erro na busca" };
    }
  }

  /** Localiza todos os pendentes (um por vez, respeitando os serviços gratuitos) */
  async function localizarTodos(lista = pendentes) {
    if (!lista.length) return;
    setProcessando({ feitos: 0, total: lista.length });
    const saida: Revisao[] = [];
    for (let k = 0; k < lista.length; k++) {
      saida.push(await revisar(lista[k]));
      setProcessando({ feitos: k + 1, total: lista.length });
    }
    setProcessando(null);
    // primeiro os que têm sugestão
    saida.sort((a, b) => Number(!a.resultados.length) - Number(!b.resultados.length));
    setFila(saida);
    const achados = saida.filter((s) => s.resultados.length).length;
    mostrar(achados ? "sucesso" : "aviso", `${achados} de ${saida.length} com posição sugerida. Confira um a um.`);
  }

  const atual = fila[0] ?? null;
  const proximo = () => setFila((f) => f.slice(1));

  async function confirmar(mostrarNoMapa: boolean) {
    if (!atual || atual.lat == null || atual.lng == null) return;
    setSalvando(true);
    try {
      await salvarLocalizacao(atual.item.tabela, atual.item.idBanco, atual.lat, atual.lng, mostrarNoMapa);
      setItens((l) => l.map((x) => (x.id === atual.item.id ? { ...x, lat: atual.lat, lng: atual.lng, noMapa: mostrarNoMapa } : x)));
      mostrar("sucesso", `Local de “${atual.item.nome}” salvo.`);
      proximo();
    } catch (e) {
      mostrar("erro", e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  function exportar() {
    const blob = new Blob([csv(itens)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acmrb-mapa-${new Date().toLocaleDateString("sv-SE")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (papel !== "deus") {
    return (
      <div role="alert" className="flex flex-col items-center gap-2 rounded-card border border-black/5 bg-white px-4 py-10 text-center text-ink-soft shadow-card">
        <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning">
          <ShieldAlert size={28} aria-hidden="true" />
        </span>
        <h2 className="text-xl font-black text-ink">Acesso restrito</h2>
        <p>Visão do Mapa é uma área exclusiva do ADM DEUS.</p>
      </div>
    );
  }

  const max = (l: [string, number][]) => Math.max(1, ...l.map((x) => x[1]));

  return (
    <div className="flex flex-col gap-4">
      <ToastArea toasts={toasts} onFechar={fechar} />

      {/* Números principais */}
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5" aria-label="Resumo do mapa">
        <Numero icone={Users} valor={stats.apoiadores} rotulo="apoiadores" />
        <Numero icone={Truck} valor={stats.empresas} rotulo="empresas de logística" />
        <Numero icone={MapPin} valor={stats.noSite} rotulo="visíveis no mapa do site" />
        <Numero icone={EyeOff} valor={stats.ocultos} rotulo="ocultos do mapa" />
        <Numero icone={MapPinOff} valor={stats.semLocal} rotulo="sem localização" alerta={stats.semLocal > 0} />
      </ul>

      {/* Barra */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex rounded-full border border-line bg-white p-1 shadow-sm" role="radiogroup" aria-label="Filtrar por tipo">
          {([["", "Todos"], ["Apoiador", "Apoiadores"], ["Logística", "Logística"]] as const).map(([v, r]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={fTipo === v}
              onClick={() => setFTipo(v)}
              className="min-h-9 rounded-full px-3.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 aria-checked:bg-leaf aria-checked:text-white"
            >
              {r}
            </button>
          ))}
        </div>
        <label className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 text-sm text-ink-soft">
          <input type="checkbox" className="h-4 w-4 accent-leaf" checked={verOcultos} onChange={(e) => setVerOcultos(e.target.checked)} />
          {verOcultos ? <Eye size={15} aria-hidden="true" /> : <EyeOff size={15} aria-hidden="true" />} Mostrar ocultos
        </label>
        <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
          <Button type="button" variante="secundario" tamanho="pequeno" onClick={carregar} disabled={carregando}>
            <RefreshCw size={16} aria-hidden="true" className={carregando ? GIRA : ""} /> Atualizar
          </Button>
          <Button type="button" tamanho="pequeno" onClick={exportar} disabled={!itens.length}>
            <Download size={16} aria-hidden="true" /> Exportar CSV
          </Button>
        </div>
      </div>

      {erro && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-danger-soft p-4 text-danger" role="alert">
          {erro} <Button type="button" variante="secundario" tamanho="pequeno" onClick={carregar}>Tentar de novo</Button>
        </div>
      )}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22.5rem] [&>*]:min-w-0">
        {/* Mapa */}
        {/* os [&_.mapa-wrap] ajustam a caixa do mapa (classe criada em utils/mapaEstilo.ts) */}
        <div className={cn("flex flex-col gap-2 [&_.mapa-wrap]:border [&_.mapa-wrap]:border-emerald-200", "[&_.mapa-wrap]:h-[clamp(300px,60dvh,480px)] xl:[&_.mapa-wrap]:h-[560px]")}>
          <MapaVisao
            pontos={pontos}
            selecionado={selecionado}
            onSelecionar={selecionar}
            sugestao={atual && atual.lat != null && atual.lng != null ? { lat: atual.lat, lng: atual.lng } : null}
            onMoverSugestao={(lat, lng) => setFila((f) => (f.length ? [{ ...f[0], lat, lng, escolhido: null }, ...f.slice(1)] : f))}
          />
          <p className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><i className={PONTO} /> Visível no site</span>
            <span className="inline-flex items-center gap-1.5"><i className={cn(PONTO, "opacity-50 outline-1 outline-dashed outline-zinc-500")} /> Oculto (não aparece no site)</span>
            {atual && <span className="inline-flex items-center gap-1.5"><i className={cn(PONTO, "bg-red-600")} /> Posição sugerida (arraste)</span>}
          </p>
        </div>

        {/* Painel lateral: revisão ou pendentes */}
        <aside className="flex flex-col gap-4 xl:max-h-[600px]">
          {atual ? (
            <section className={CARTAO} aria-labelledby="avm-rev-t">
              <header>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-leaf"><Sparkles size={14} aria-hidden="true" /> Revisão {fila.length > 1 ? `(${fila.length} na fila)` : ""}</span>
                <h3 id="avm-rev-t" className={cn(TITULO_CARTAO, "mt-1")}>{atual.item.nome}</h3>
                <p className="mt-0.5 text-sm text-ink-muted">{[atual.item.tipo, atual.item.endereco, atual.item.bairro].filter(Boolean).join(" · ")}</p>
              </header>
              {atual.erro ? (
                <p className={DICA}>{atual.erro} Abra o cadastro e marque o ponto manualmente.</p>
              ) : (
                <ResultadosGeo
                  resultados={atual.resultados}
                  escolhido={atual.escolhido}
                  aviso="Posição sugerida automaticamente — confira no mapa e arraste se precisar."
                  onEscolher={(r, i) => setFila((f) => [{ ...f[0], escolhido: i, lat: r.lat, lng: r.lng }, ...f.slice(1)])}
                />
              )}
              <div className="flex flex-col gap-2">
                <Button type="button" tamanho="pequeno" disabled={salvando || atual.lat == null} onClick={() => confirmar(true)}>
                  {salvando ? <Loader2 size={16} className={GIRA} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />} Confirmar e mostrar no mapa
                </Button>
                <Button type="button" variante="secundario" tamanho="pequeno" disabled={salvando || atual.lat == null} onClick={() => confirmar(false)}>
                  Salvar sem exibir
                </Button>
                <Button type="button" variante="contorno" tamanho="pequeno" onClick={proximo} disabled={salvando}>
                  <SkipForward size={16} aria-hidden="true" /> Pular
                </Button>
              </div>
              <button type="button" className={LINK_DISCRETO} onClick={() => setFila([])}>Encerrar revisão</button>
            </section>
          ) : (
            <section className={CARTAO} aria-labelledby="avm-pend-t">
              <header className="flex items-center justify-between gap-2">
                <h3 id="avm-pend-t" className={TITULO_CARTAO}>Pendentes de localização</h3>
                <span className="min-w-7 rounded-full bg-amber-100 px-2 py-0.5 text-center text-sm font-extrabold text-warning">{pendentes.length}</span>
              </header>
              {pendentes.length === 0 ? (
                <p className={DICA}>Tudo localizado. 🎉</p>
              ) : (
                <>
                  <Button type="button" tamanho="pequeno" larguraTotal onClick={() => localizarTodos()} disabled={!!processando}>
                    {processando ? <Loader2 size={16} className={GIRA} aria-hidden="true" /> : <Wand2 size={16} aria-hidden="true" />}
                    {processando ? `Localizando ${processando.feitos}/${processando.total}…` : "Localizar automaticamente"}
                  </Button>
                  <p className={DICA}>Usa o endereço salvo (ou o CNPJ) e sugere a posição. Nada é salvo sem a sua confirmação.</p>
                  <ul className="flex max-h-96 flex-col gap-1.5 overflow-y-auto overscroll-contain pr-0.5">
                    {pendentes.map((i) => (
                      <li key={i.id} className="grid grid-cols-[auto_1fr] items-center gap-x-2.5 gap-y-1.5 rounded-xl border border-line p-2.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: corCategoria(i.categoria) }} aria-hidden="true" />
                        <span className="flex min-w-0 flex-col">
                          <strong className="truncate text-sm font-bold text-ink">{i.nome}</strong>
                          <span className="truncate text-xs text-ink-muted">{i.tipo}{i.endereco ? ` · ${i.endereco}` : i.cnpj ? " · tem CNPJ" : " · sem endereço"}</span>
                        </span>
                        <span className="col-start-2 flex gap-1.5">
                          <Button type="button" variante="secundario" tamanho="pequeno" disabled={!!processando} onClick={() => localizarTodos([i])}>Localizar</Button>
                          <Button variante="contorno" tamanho="pequeno" href={`/admin?secao=${i.tabela === "apoiadores" ? "apoiadores" : "logistica"}`}>Corrigir</Button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}
        </aside>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {([["Por categoria", stats.porCategoria, true], ["Por tipo de apoio", stats.porApoio, false], ["Por bairro (top 10)", stats.porBairro, false]] as const).map(([t, l, cor]) => (
          <section key={t} className={CARTAO}>
            <h3 className={TITULO_CARTAO}>{t}</h3>
            {l.length === 0 ? <p className={DICA}>Sem dados ainda.</p> : (
              <ul className="flex flex-col gap-2.5">
                {l.map(([nome, n]) => (
                  <li key={nome} className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-2 text-sm text-ink-soft sm:grid-cols-[minmax(0,9rem)_1fr_auto]">
                    <span className="truncate">{nome}</span>
                    {/* trilho cinza com a barra por cima (largura e cor vêm dos dados) */}
                    <span className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <span
                        className="block h-full rounded-[inherit] bg-emerald-500 transition-[width] duration-500 motion-reduce:transition-none"
                        style={{ width: `${(n / max(l as [string, number][])) * 100}%`, background: cor ? corCategoria(nome) : undefined }}
                      />
                    </span>
                    <strong className="tabular-nums text-emerald-900">{n}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
