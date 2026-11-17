"use client";

/**
 * ParceirosPagina — conteúdo da rota /parceiros
 * ------------------------------------------------------------
 * 1. Hero com breadcrumb (Início › Parceiros) e totais.
 * 2. Empresas de logística reversa: cards com logo em moldura padrão,
 *    responsável, desde quando, materiais aceitos, total repassado e
 *    histórico público de repasses (abre/fecha).
 * 3. Apoiadores públicos agrupados por categoria.
 * Busca e filtro por material/categoria. Estados: carregando, vazio, erro.
 * Dados das views públicas (sem CPF nem observações internas).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, Building2, CalendarDays, ChevronDown, ChevronRight, ExternalLink, FileText,
  Globe, Handshake, HeartHandshake, AtSign, Mail, MapPin, Package, Phone, RefreshCw, Scale, Search, Truck, UserRound,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  CATEGORIAS, STATUS_LOGISTICA, corCategoria, formatarData, formatarKg, formatarReais, linkExterno, linkInstagram, mascaraCnpj,
  listarApoiadoresPublicos, listarEmpresasLogisticaPublicas, listarRepassesPublicos,
  type ApoiadorPublico, type EmpresaLogisticaPublica, type RepassePublico,
} from "@/services/apoiadores";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Input";
import FaixaCta from "@/components/home/FaixaCta";
import TituloSecao from "@/components/home/TituloSecao";
import { useAparecer } from "@/hooks/useAparecer";
import { cn } from "@/utils/cn";

/* Cor do selo de status da parceria */
const COR_STATUS: Record<string, string> = {
  ativa: "bg-brand-mint text-leaf",
  em_negociacao: "bg-amber-100 text-amber-700",
  pausada: "bg-zinc-100 text-zinc-600",
  encerrada: "bg-zinc-100 text-zinc-600",
};

/* Pequenos pedaços de estilo que se repetem */
const LINK_CARD = "inline-flex items-center gap-1.5 text-sm font-bold text-leaf hover:underline";
const ETIQUETA = "rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-leaf";

type Estado = "carregando" | "pronto" | "erro";

export default function ParceirosPagina() {
  const aparecer = useAparecer();
  const [estado, setEstado] = useState<Estado>("carregando");
  const [indisponivel, setIndisponivel] = useState(false);
  const [empresas, setEmpresas] = useState<EmpresaLogisticaPublica[]>([]);
  const [repasses, setRepasses] = useState<RepassePublico[]>([]);
  const [apoiadores, setApoiadores] = useState<ApoiadorPublico[]>([]);
  const [busca, setBusca] = useState("");
  const [material, setMaterial] = useState("");
  const [categoria, setCategoria] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setEstado("carregando");
    const [e, r, a] = await Promise.all([
      listarEmpresasLogisticaPublicas(supabase),
      listarRepassesPublicos(supabase),
      listarApoiadoresPublicos(supabase),
    ]);
    if (e.erro || r.erro || a.erro) {
      setEstado("erro");
      return;
    }
    setIndisponivel(e.indisponivel && a.indisponivel);
    setEmpresas(e.dados);
    setRepasses(r.dados);
    setApoiadores(a.dados);
    setEstado("pronto");
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const termo = norm(busca.trim());

  const materiais = useMemo(() => {
    const s = new Set<string>();
    empresas.forEach((e) => e.materiais_aceitos.forEach((m) => s.add(m)));
    repasses.forEach((r) => s.add(r.material));
    return [...s].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [empresas, repasses]);

  const empresasFiltradas = useMemo(
    () =>
      empresas.filter((e) => {
        const okBusca = !termo || norm([e.nome, e.responsavel_nome ?? "", e.descricao ?? "", ...e.materiais_aceitos].join(" ")).includes(termo);
        const okMat = !material || e.materiais_aceitos.includes(material) || repasses.some((r) => r.empresa_id === e.id && r.material === material);
        return okBusca && okMat;
      }),
    [empresas, repasses, termo, material],
  );

  const apoiadoresFiltrados = useMemo(
    () =>
      apoiadores.filter(
        (a) =>
          (!categoria || a.categoria === categoria) &&
          (!termo || norm([a.nome_exibicao, a.categoria, a.bairro ?? "", ...a.tipos_apoio].join(" ")).includes(termo)),
      ),
    [apoiadores, categoria, termo],
  );

  const grupos = useMemo(
    () =>
      CATEGORIAS.map((c) => ({ categoria: c, itens: apoiadoresFiltrados.filter((a) => a.categoria === c) })).filter((g) => g.itens.length),
    [apoiadoresFiltrados],
  );

  const totalRepassado = empresas.reduce((s, e) => s + Number(e.total_repassado_kg || 0), 0);

  return (
    <main className="min-h-screen bg-surface-alt" lang="pt-BR">
      {/* ---------- Topo ---------- */}
      <section className="relative isolate overflow-hidden bg-emerald-950 pb-24 pt-24 sm:pb-28 sm:pt-28 lg:pb-32" aria-labelledby="parc-titulo">
        {/* brilhos decorativos no fundo */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 -z-10 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 -z-10 size-80 rounded-full bg-sun/10 blur-3xl" />

        <Container>
          <nav aria-label="Trilha de navegação">
            <ol className="flex items-center gap-1.5 text-sm text-emerald-200">
              <li><Link href="/" className="hover:text-white hover:underline">Início</Link></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li aria-current="page" className="font-semibold text-white">Parceiros</li>
            </ol>
          </nav>
          <motion.div className="mt-6 max-w-3xl" {...aparecer()}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-md">
              <Handshake size={14} className="text-emerald-300" aria-hidden="true" /> Parceiros e Apoiadores
            </span>
            <h1 id="parc-titulo" className="mt-5 text-balance text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Parcerias que dão <span className="text-emerald-300">destino certo</span> ao material reciclável
            </h1>
            <p lang="pt-BR" className="mt-5 text-pretty text-base leading-relaxed text-emerald-100 sm:text-lg">
              A ACMRB recebe, identifica, separa e repassa os materiais recicláveis para empresas de logística reversa e
              indústrias recicladoras. Aqui você conhece cada parceiro, os responsáveis e o histórico público do que já foi
              repassado, além dos comércios, instituições e pessoas que apoiam a associação.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* ---------- Totais (sobem sobre o topo) ---------- */}
      <Container className="relative z-10 -mt-14 sm:-mt-16">
        <ul className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Totais">
          {[
            { icone: Truck, valor: estado === "pronto" ? String(empresas.length) : "—", rotulo: "empresas de logística" },
            { icone: Scale, valor: estado === "pronto" ? formatarKg(totalRepassado) : "—", rotulo: "repassados (registros públicos)" },
            { icone: HeartHandshake, valor: estado === "pronto" ? String(apoiadores.length) : "—", rotulo: "apoiadores" },
          ].map((t) => {
            const Icone = t.icone;
            return (
              <li key={t.rotulo} className="flex flex-col gap-1 rounded-card border border-black/5 bg-white p-3 shadow-pop sm:p-5">
                <span className="grid size-8 place-items-center rounded-xl bg-brand-mint text-leaf sm:size-10"><Icone size={18} aria-hidden="true" /></span>
                <strong className="mt-1 text-lg font-black tabular-nums text-ink sm:text-3xl">{t.valor}</strong>
                <span className="text-[0.68rem] leading-tight text-ink-soft sm:text-sm">{t.rotulo}</span>
              </li>
            );
          })}
        </ul>
      </Container>

      <Container className="pb-16 pt-8 sm:pb-24 sm:pt-10">
        {/* ---------- Filtros ---------- */}
        <div className="z-20 mb-10 grid gap-3 rounded-card border border-line bg-white/90 p-3 shadow-card backdrop-blur-md sm:sticky sm:top-18 sm:grid-cols-2 sm:p-4 lg:top-17 lg:grid-cols-[1fr_14rem_14rem]" role="search">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <span className="sr-only">Buscar parceiro</span>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, material ou responsável"
              className="h-11 w-full rounded-control border border-line bg-white pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none"
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por material</span>
            <Select value={material} onChange={(e) => setMaterial(e.target.value)}>
              <option value="">Todos os materiais</option>
              {materiais.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </label>
          <label>
            <span className="sr-only">Filtrar apoiadores por categoria</span>
            <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Todas as categorias</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </label>
        </div>

        {estado === "carregando" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Carregando parceiros">
            {[0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-card bg-white" />)}
          </div>
        )}

        {estado === "erro" && (
          <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-red-200 bg-danger-soft p-8 text-center" role="alert">
            <AlertTriangle size={30} className="text-danger" aria-hidden="true" />
            <strong className="text-lg text-ink">Não foi possível carregar os parceiros</strong>
            <p className="text-sm text-ink-soft">Verifique sua conexão e tente novamente.</p>
            <Button type="button" onClick={carregar} className="mt-2"><RefreshCw size={16} aria-hidden="true" /> Tentar de novo</Button>
          </div>
        )}

        {estado === "pronto" && (
          <>
            {/* ---------- Logística reversa ---------- */}
            <section aria-labelledby="parc-log">
              <TituloSecao
                id="parc-log"
                etiqueta="Logística reversa"
                icone={Truck}
                alinhamento="esquerda"
                className="mb-8 sm:mb-10"
                titulo={<>Empresas de <span>logística reversa</span></>}
                descricao="Empresas e indústrias que recebem os materiais triados pela ACMRB e garantem o destino ambientalmente correto."
              />

              {empresasFiltradas.length === 0 ? (
                <div role="status">
                  <EmptyState
                    title={indisponivel || empresas.length === 0 ? "Em breve as empresas parceiras" : "Nenhuma empresa com esse filtro"}
                    description={empresas.length === 0 ? "As parcerias de logística reversa serão publicadas aqui." : "Ajuste a busca ou o filtro de material."}
                  />
                </div>
              ) : (
                <ul className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {empresasFiltradas.map((e, i) => {
                    const hist = repasses.filter((r) => r.empresa_id === e.id);
                    const site = linkExterno(e.site);
                    const exp = aberto === e.id;
                    return (
                      <motion.li
                        key={e.id}
                        {...aparecer(Math.min(i, 6) * 0.05)}
                        className="flex flex-col gap-4 rounded-card border border-black/5 bg-white p-5 shadow-card transition duration-300 hover:border-brand-line hover:shadow-card-hover motion-reduce:transition-none sm:p-6"
                      >
                        <div className="flex items-center gap-4">
                          <div className="grid size-16 flex-none place-items-center overflow-hidden rounded-2xl border border-line bg-white p-1.5 sm:size-20">
                            {e.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={e.logo_url} alt={`Logo de ${e.nome}`} loading="lazy" className="size-full object-contain" />
                            ) : (
                              <span aria-hidden="true" className="grid size-full place-items-center rounded-xl bg-linear-to-br from-leaf to-leaf-bright text-3xl font-black text-white">{e.nome.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col items-start gap-1">
                            <h3 className="text-lg font-black leading-tight text-ink [overflow-wrap:anywhere]">{e.nome}</h3>
                            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-extrabold", COR_STATUS[e.status] ?? COR_STATUS.pausada)}>{STATUS_LOGISTICA[e.status] ?? e.status}</span>
                            {e.cnpj && <span className="text-xs text-ink-muted">CNPJ {mascaraCnpj(e.cnpj)}</span>}
                          </div>
                        </div>

                        {e.descricao && <p lang="pt-BR" className="texto-justo text-sm leading-relaxed text-ink-soft">{e.descricao}</p>}

                        <dl className="flex flex-col gap-2.5 text-sm">
                          {e.responsavel_nome && (
                            <div className="flex justify-between gap-3 border-b border-dashed border-line pb-2"><dt className="inline-flex flex-none items-center gap-1.5 text-ink-muted"><UserRound size={15} className="text-leaf" aria-hidden="true" /> Responsável</dt><dd className="text-right text-ink">{e.responsavel_nome}{e.responsavel_cargo ? ` · ${e.responsavel_cargo}` : ""}</dd></div>
                          )}
                          {e.parceria_desde && (
                            <div className="flex justify-between gap-3 border-b border-dashed border-line pb-2"><dt className="inline-flex flex-none items-center gap-1.5 text-ink-muted"><CalendarDays size={15} className="text-leaf" aria-hidden="true" /> Parceria desde</dt><dd className="text-right text-ink">{formatarData(e.parceria_desde, { month: "long", year: "numeric" })}</dd></div>
                          )}
                          <div className="flex justify-between gap-3 border-b border-dashed border-line pb-2"><dt className="inline-flex flex-none items-center gap-1.5 text-ink-muted"><Scale size={15} className="text-leaf" aria-hidden="true" /> Total repassado</dt><dd className="text-right text-ink"><strong>{formatarKg(e.total_repassado_kg)}</strong>{e.total_repasses ? ` em ${e.total_repasses} ${e.total_repasses === 1 ? "repasse" : "repasses"}` : ""}</dd></div>
                        </dl>

                        {e.materiais_aceitos.length > 0 && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-soft"><Package size={14} aria-hidden="true" /> Materiais aceitos</span>
                            <ul className="mt-2 flex flex-wrap gap-1.5">{e.materiais_aceitos.map((m) => <li key={m} className={ETIQUETA}>{m}</li>)}</ul>
                          </div>
                        )}

                        {(site || e.email_publico || e.telefone_publico) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {site && <a href={site} target="_blank" rel="noopener noreferrer" className={LINK_CARD}><Globe size={15} aria-hidden="true" /> Site <ExternalLink size={12} aria-hidden="true" /></a>}
                            {e.email_publico && <a href={`mailto:${e.email_publico}`} className={LINK_CARD}><Mail size={15} aria-hidden="true" /> E-mail</a>}
                            {e.telefone_publico && <a href={`tel:${e.telefone_publico.replace(/\D/g, "")}`} className={LINK_CARD}><Phone size={15} aria-hidden="true" /> {e.telefone_publico}</a>}
                          </div>
                        )}

                        {hist.length > 0 && (
                          <div>
                            <button
                              type="button"
                              aria-expanded={exp}
                              aria-controls={`hist-${e.id}`}
                              onClick={() => setAberto(exp ? null : e.id)}
                              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-brand-line bg-brand-soft px-3.5 py-2.5 text-sm font-bold text-leaf transition hover:bg-brand-mint"
                            >
                              Histórico de repasses ({hist.length}) <ChevronDown size={16} aria-hidden="true" className={cn("transition", exp && "rotate-180")} />
                            </button>
                            {exp && (
                              <div id={`hist-${e.id}`} className="mt-3">
                                {/* no celular cada repasse vira um cartãozinho; do tablet para cima é tabela */}
                                <table className="w-full border-collapse text-sm max-sm:block">
                                  <caption className="sr-only">Repasses públicos para {e.nome}</caption>
                                  <thead className="max-sm:hidden"><tr className="border-b border-brand-line text-left text-xs text-ink-muted"><th scope="col" className="px-1.5 py-2 font-bold">Data</th><th scope="col" className="px-1.5 py-2 font-bold">Material</th><th scope="col" className="px-1.5 py-2 font-bold">Peso</th><th scope="col" className="px-1.5 py-2 font-bold">Valor</th><th scope="col" className="px-1.5 py-2"><span className="sr-only">Documento</span></th></tr></thead>
                                  <tbody className="max-sm:block max-sm:space-y-2">
                                    {hist.map((r) => (
                                      <tr key={r.id} className="border-b border-line text-ink max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-3 max-sm:gap-y-1 max-sm:rounded-xl max-sm:border max-sm:bg-surface-alt max-sm:p-3">
                                        <td className="px-1.5 py-2 max-sm:p-0"><span className="font-semibold text-ink-muted sm:hidden">Data: </span>{formatarData(r.data)}</td>
                                        <td className="px-1.5 py-2 max-sm:p-0"><span className="font-semibold text-ink-muted sm:hidden">Material: </span>{r.material}</td>
                                        <td className="px-1.5 py-2 max-sm:p-0"><span className="font-semibold text-ink-muted sm:hidden">Peso: </span>{formatarKg(r.peso_kg)}</td>
                                        <td className="px-1.5 py-2 max-sm:p-0"><span className="font-semibold text-ink-muted sm:hidden">Valor: </span>{r.valor != null ? formatarReais(r.valor) : "—"}</td>
                                        <td className="px-1.5 py-2 max-sm:col-span-2 max-sm:p-0">
                                          {r.documento_url ? (
                                            <a href={linkExterno(r.documento_url)!} target="_blank" rel="noopener noreferrer" className={LINK_CARD}><FileText size={14} aria-hidden="true" /> Comprovante</a>
                                          ) : (
                                            <><span className="font-semibold text-ink-muted sm:hidden">Documento: </span>—</>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* ---------- Apoiadores ---------- */}
            <section aria-labelledby="parc-apo" className="mt-16 sm:mt-24">
              <TituloSecao
                id="parc-apo"
                etiqueta="Apoiadores"
                icone={HeartHandshake}
                alinhamento="esquerda"
                className="mb-8 sm:mb-10"
                titulo={<>Apoiadores e <span>parceiros institucionais</span></>}
                descricao="Comércios, instituições e pessoas que apoiam a coleta seletiva com pontos de entrega, doações, divulgação e voluntariado."
              />

              {grupos.length === 0 ? (
                <div role="status">
                  <EmptyState
                    title={apoiadores.length === 0 ? "Em breve os primeiros apoiadores" : "Nenhum apoiador com esse filtro"}
                    description={apoiadores.length === 0 ? "Os apoiadores da ACMRB serão listados aqui." : "Ajuste a busca ou a categoria."}
                  />
                </div>
              ) : (
                grupos.map((g) => (
                  <div key={g.categoria} className="mb-10 last:mb-0">
                    <h3 className="mb-4 flex items-center gap-2.5 text-lg font-extrabold text-ink">
                      <span aria-hidden="true" className="size-3 rounded-full" style={{ background: corCategoria(g.categoria) }} /> {g.categoria}{" "}
                      <small className="font-semibold text-ink-muted">({g.itens.length})</small>
                    </h3>
                    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {g.itens.map((a) => {
                        const site = linkExterno(a.site);
                        const insta = linkInstagram(a.instagram);
                        return (
                          <li key={a.id} className="flex gap-3.5 rounded-card border border-black/5 bg-white p-4 shadow-card">
                            <div className="grid size-14 flex-none place-items-center overflow-hidden rounded-xl border border-line bg-white p-1">
                              {a.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={a.logo_url} alt="" loading="lazy" className="size-full object-contain" />
                              ) : (
                                <span className="grid size-full place-items-center rounded-lg text-xl font-black text-white" style={{ background: corCategoria(a.categoria) }} aria-hidden="true">{a.nome_exibicao.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="flex min-w-0 flex-col gap-1.5">
                              <strong className="text-base font-extrabold text-ink [overflow-wrap:anywhere]">{a.nome_exibicao}</strong>
                              {a.bairro && <span className="inline-flex items-center gap-1 text-xs text-ink-muted"><MapPin size={12} aria-hidden="true" /> {a.bairro}</span>}
                              {a.descricao && <p lang="pt-BR" className="text-sm leading-relaxed text-ink-soft">{a.descricao}</p>}
                              {a.tipos_apoio.length > 0 && <ul className="flex flex-wrap gap-1.5">{a.tipos_apoio.map((t) => <li key={t} className={ETIQUETA}>{t}</li>)}</ul>}
                              {(site || insta) && (
                                <div className="flex gap-4">
                                  {site && <a href={site} target="_blank" rel="noopener noreferrer" className={LINK_CARD}><Globe size={13} aria-hidden="true" /> Site</a>}
                                  {insta && <a href={insta} target="_blank" rel="noopener noreferrer" className={LINK_CARD}><AtSign size={13} aria-hidden="true" /> Instagram</a>}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </section>
          </>
        )}

        {/* ---------- Chamada para ser parceiro ---------- */}
        <section aria-label="Seja um parceiro">
          <FaixaCta
            titulo="Sua empresa quer ser parceira?"
            texto="Indústrias, operadores de logística reversa, comércios e instituições podem apoiar a ACMRB. Entre em contato e conheça como funciona a parceria."
          >
            <Button href="/#contato" variante="claro" tamanho="grande">Quero ser parceiro <ArrowRight size={16} aria-hidden="true" /></Button>
            <Button href="/#parceiros" variante="contornoClaro" tamanho="grande"><MapPin size={16} aria-hidden="true" /> Ver mapa de apoiadores</Button>
          </FaixaCta>
        </section>
      </Container>
    </main>
  );
}
