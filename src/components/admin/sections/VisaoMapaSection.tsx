"use client";

/**
 * VisaoMapaSection — "Visão do Mapa" (painel, somente ADM DEUS)
 * ------------------------------------------------------------
 * Substitui a antiga tela "Parceiros" (ParceirosSection, NÃO UTILIZADO).
 *  - Mapa grande com TODOS os apoiadores e empresas de logística,
 *    inclusive os ocultos do site (marcador tracejado/apagado).
 *  - Estatísticas: por categoria, tipo de apoio e bairro; ocultos e
 *    sem localização.
 *  - "Pendentes de localização": geocodificação em lote pelo endereço
 *    salvo (ou pelo CNPJ, se não houver endereço). Cada sugestão é
 *    revisada UMA A UMA no mapa (arrastável) antes de salvar.
 *  - Exportar CSV com tudo (inclui ocultos; sem CPF).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Check, Download, Eye, EyeOff, Loader2, MapPin, MapPinOff, RefreshCw, ShieldAlert, SkipForward, Sparkles, Truck, Users, Wand2,
} from "lucide-react";

import { ToastArea, useToast } from "@/components/ui/Toast";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import ResultadosGeo from "@/components/admin/apoiadores/ResultadosGeo";
import type { PontoVisao } from "@/components/mapa/MapaVisao";
import { corCategoria, mascaraCnpj } from "@/lib/apoiadores";
import {
  buscarCnpj, consultaDoCnpj, consultaDoEndereco, geocodificar, listarApoiadores, listarEmpresas, salvarLocalizacao,
  type Apoiador, type ConsultaGeo, type EmpresaLogistica, type ResultadoGeo,
} from "@/lib/apoiadoresAdmin";
import "@/styles/admin-visao-mapa.css";

const MapaVisao = dynamic(() => import("@/components/mapa/MapaVisao"), {
  ssr: false,
  loading: () => <div className="avm-map-loading">Carregando mapa…</div>,
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
      <div role="alert" className="avm-block">
        <ShieldAlert size={28} aria-hidden="true" />
        <h2>Acesso restrito</h2>
        <p>Visão do Mapa é uma área exclusiva do ADM DEUS.</p>
      </div>
    );
  }

  const max = (l: [string, number][]) => Math.max(1, ...l.map((x) => x[1]));

  return (
    <div className="avm">
      <ToastArea toasts={toasts} onFechar={fechar} />

      {/* Números principais */}
      <ul className="avm-kpis" aria-label="Resumo do mapa">
        <li><Users size={18} aria-hidden="true" /><strong>{stats.apoiadores}</strong><span>apoiadores</span></li>
        <li><Truck size={18} aria-hidden="true" /><strong>{stats.empresas}</strong><span>empresas de logística</span></li>
        <li><MapPin size={18} aria-hidden="true" /><strong>{stats.noSite}</strong><span>visíveis no mapa do site</span></li>
        <li><EyeOff size={18} aria-hidden="true" /><strong>{stats.ocultos}</strong><span>ocultos do mapa</span></li>
        <li className={stats.semLocal ? "avm-kpi--alerta" : ""}><MapPinOff size={18} aria-hidden="true" /><strong>{stats.semLocal}</strong><span>sem localização</span></li>
      </ul>

      {/* Barra */}
      <div className="avm-toolbar">
        <div className="avm-seg" role="radiogroup" aria-label="Filtrar por tipo">
          {([["", "Todos"], ["Apoiador", "Apoiadores"], ["Logística", "Logística"]] as const).map(([v, r]) => (
            <button key={v} type="button" role="radio" aria-checked={fTipo === v} onClick={() => setFTipo(v)}>{r}</button>
          ))}
        </div>
        <label className="avm-toggle">
          <input type="checkbox" checked={verOcultos} onChange={(e) => setVerOcultos(e.target.checked)} />
          {verOcultos ? <Eye size={15} aria-hidden="true" /> : <EyeOff size={15} aria-hidden="true" />} Mostrar ocultos
        </label>
        <div className="avm-toolbar__acts">
          <button type="button" className="avm-btn avm-btn--soft" onClick={carregar} disabled={carregando}>
            <RefreshCw size={16} aria-hidden="true" className={carregando ? "avm-spin" : ""} /> Atualizar
          </button>
          <button type="button" className="avm-btn" onClick={exportar} disabled={!itens.length}>
            <Download size={16} aria-hidden="true" /> Exportar CSV
          </button>
        </div>
      </div>

      {erro && (
        <div className="avm-state avm-state--erro" role="alert">
          {erro} <button type="button" className="avm-btn avm-btn--soft" onClick={carregar}>Tentar de novo</button>
        </div>
      )}

      <div className="avm-grid">
        {/* Mapa */}
        <div className="avm-map">
          <MapaVisao
            pontos={pontos}
            selecionado={selecionado}
            onSelecionar={selecionar}
            sugestao={atual && atual.lat != null && atual.lng != null ? { lat: atual.lat, lng: atual.lng } : null}
            onMoverSugestao={(lat, lng) => setFila((f) => (f.length ? [{ ...f[0], lat, lng, escolhido: null }, ...f.slice(1)] : f))}
          />
          <p className="avm-legenda">
            <span><i className="avm-dot" /> Visível no site</span>
            <span><i className="avm-dot avm-dot--oculto" /> Oculto (não aparece no site)</span>
            {atual && <span><i className="avm-dot avm-dot--sug" /> Posição sugerida (arraste)</span>}
          </p>
        </div>

        {/* Painel lateral: revisão ou pendentes */}
        <aside className="avm-side">
          {atual ? (
            <section className="avm-card avm-rev" aria-labelledby="avm-rev-t">
              <header>
                <span className="avm-tag"><Sparkles size={13} aria-hidden="true" /> Revisão {fila.length > 1 ? `(${fila.length} na fila)` : ""}</span>
                <h3 id="avm-rev-t">{atual.item.nome}</h3>
                <p>{[atual.item.tipo, atual.item.endereco, atual.item.bairro].filter(Boolean).join(" · ")}</p>
              </header>
              {atual.erro ? (
                <p className="avm-hint">{atual.erro} Abra o cadastro e marque o ponto manualmente.</p>
              ) : (
                <ResultadosGeo
                  resultados={atual.resultados}
                  escolhido={atual.escolhido}
                  aviso="Posição sugerida automaticamente — confira no mapa e arraste se precisar."
                  onEscolher={(r, i) => setFila((f) => [{ ...f[0], escolhido: i, lat: r.lat, lng: r.lng }, ...f.slice(1)])}
                />
              )}
              <div className="avm-rev__acts">
                <button type="button" className="avm-btn" disabled={salvando || atual.lat == null} onClick={() => confirmar(true)}>
                  {salvando ? <Loader2 size={16} className="avm-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />} Confirmar e mostrar no mapa
                </button>
                <button type="button" className="avm-btn avm-btn--soft" disabled={salvando || atual.lat == null} onClick={() => confirmar(false)}>
                  Salvar sem exibir
                </button>
                <button type="button" className="avm-btn avm-btn--ghost" onClick={proximo} disabled={salvando}>
                  <SkipForward size={16} aria-hidden="true" /> Pular
                </button>
              </div>
              <button type="button" className="avm-link" onClick={() => setFila([])}>Encerrar revisão</button>
            </section>
          ) : (
            <section className="avm-card" aria-labelledby="avm-pend-t">
              <header className="avm-card__head">
                <h3 id="avm-pend-t">Pendentes de localização</h3>
                <span className="avm-count">{pendentes.length}</span>
              </header>
              {pendentes.length === 0 ? (
                <p className="avm-hint">Tudo localizado. 🎉</p>
              ) : (
                <>
                  <button type="button" className="avm-btn avm-btn--full" onClick={() => localizarTodos()} disabled={!!processando}>
                    {processando ? <Loader2 size={16} className="avm-spin" aria-hidden="true" /> : <Wand2 size={16} aria-hidden="true" />}
                    {processando ? `Localizando ${processando.feitos}/${processando.total}…` : "Localizar automaticamente"}
                  </button>
                  <p className="avm-hint">Usa o endereço salvo (ou o CNPJ) e sugere a posição. Nada é salvo sem a sua confirmação.</p>
                  <ul className="avm-pend">
                    {pendentes.map((i) => (
                      <li key={i.id}>
                        <span className="avm-pend__dot" style={{ background: corCategoria(i.categoria) }} aria-hidden="true" />
                        <span className="avm-pend__txt">
                          <strong>{i.nome}</strong>
                          <span>{i.tipo}{i.endereco ? ` · ${i.endereco}` : i.cnpj ? " · tem CNPJ" : " · sem endereço"}</span>
                        </span>
                        <span className="avm-pend__acts">
                          <button type="button" className="avm-btn avm-btn--soft avm-btn--sm" disabled={!!processando} onClick={() => localizarTodos([i])}>Localizar</button>
                          <a className="avm-btn avm-btn--ghost avm-btn--sm" href={`/admin?secao=${i.tabela === "apoiadores" ? "apoiadores" : "logistica"}`}>Corrigir</a>
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
      <div className="avm-stats">
        {([["Por categoria", stats.porCategoria, true], ["Por tipo de apoio", stats.porApoio, false], ["Por bairro (top 10)", stats.porBairro, false]] as const).map(([t, l, cor]) => (
          <section key={t} className="avm-card">
            <h3 className="avm-card__t">{t}</h3>
            {l.length === 0 ? <p className="avm-hint">Sem dados ainda.</p> : (
              <ul className="avm-bars">
                {l.map(([nome, n]) => (
                  <li key={nome}>
                    <span className="avm-bars__nome">{nome}</span>
                    <span className="avm-bars__trilho"><span style={{ width: `${(n / max(l as [string, number][])) * 100}%`, background: cor ? corCategoria(nome) : undefined }} /></span>
                    <strong>{n}</strong>
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
