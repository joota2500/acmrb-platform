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
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, Building2, CalendarDays, ChevronDown, ChevronRight, ExternalLink, FileText,
  Globe, Handshake, HeartHandshake, AtSign, Mail, MapPin, Package, Phone, RefreshCw, Scale, Search, Truck, UserRound,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  CATEGORIAS, STATUS_LOGISTICA, corCategoria, formatarData, formatarKg, formatarReais, linkExterno, linkInstagram, mascaraCnpj,
  listarApoiadoresPublicos, listarEmpresasLogisticaPublicas, listarRepassesPublicos,
  type ApoiadorPublico, type EmpresaLogisticaPublica, type RepassePublico,
} from "@/lib/apoiadores";
import "@/styles/parceiros-page.css";

type Estado = "carregando" | "pronto" | "erro";

export default function ParceirosPagina() {
  const reduzir = useReducedMotion();
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

  const fade = (delay = 0) => ({
    initial: reduzir ? { opacity: 1 } : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: { duration: reduzir ? 0 : 0.45, delay: reduzir ? 0 : delay },
  });

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
    <main className="parc" lang="pt-BR">
      {/* Hero */}
      <section className="parc__hero" aria-labelledby="parc-titulo">
        <div className="parc__container">
          <nav aria-label="Trilha de navegação" className="parc__crumb">
            <ol>
              <li><Link href="/">Início</Link></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li aria-current="page">Parceiros</li>
            </ol>
          </nav>
          <motion.div {...fade()}>
            <span className="parc__tag"><Handshake size={14} aria-hidden="true" /> Parceiros e Apoiadores</span>
            <h1 id="parc-titulo" className="parc__title">
              Parcerias que dão <span>destino certo</span> ao material reciclável
            </h1>
            <p className="parc__lead">
              A ACMRB recebe, identifica, separa e repassa os materiais recicláveis para empresas de logística reversa e
              indústrias recicladoras. Aqui você conhece cada parceiro, os responsáveis e o histórico público do que já foi
              repassado, além dos comércios, instituições e pessoas que apoiam a associação.
            </p>
          </motion.div>
          <ul className="parc__stats" aria-label="Totais">
            <li><Truck size={20} aria-hidden="true" /><strong>{estado === "pronto" ? empresas.length : "—"}</strong><span>empresas de logística</span></li>
            <li><Scale size={20} aria-hidden="true" /><strong>{estado === "pronto" ? formatarKg(totalRepassado) : "—"}</strong><span>repassados (registros públicos)</span></li>
            <li><HeartHandshake size={20} aria-hidden="true" /><strong>{estado === "pronto" ? apoiadores.length : "—"}</strong><span>apoiadores</span></li>
          </ul>
        </div>
      </section>

      <div className="parc__container parc__body">
        {/* Filtros */}
        <div className="parc__filters" role="search">
          <label className="parc__search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Buscar parceiro</span>
            <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, material ou responsável" />
          </label>
          <label className="parc__select">
            <span className="sr-only">Filtrar por material</span>
            <select value={material} onChange={(e) => setMaterial(e.target.value)}>
              <option value="">Todos os materiais</option>
              {materiais.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="parc__select">
            <span className="sr-only">Filtrar apoiadores por categoria</span>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Todas as categorias</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        {estado === "carregando" && (
          <div className="parc__skeletons" aria-busy="true" aria-label="Carregando parceiros">
            {[0, 1, 2].map((i) => <div key={i} className="parc__skeleton" />)}
          </div>
        )}

        {estado === "erro" && (
          <div className="parc__state parc__state--erro" role="alert">
            <AlertTriangle size={28} aria-hidden="true" />
            <strong>Não foi possível carregar os parceiros</strong>
            <p>Verifique sua conexão e tente novamente.</p>
            <button type="button" onClick={carregar} className="parc__btn"><RefreshCw size={16} aria-hidden="true" /> Tentar de novo</button>
          </div>
        )}

        {estado === "pronto" && (
          <>
            {/* Logística reversa */}
            <section aria-labelledby="parc-log" className="parc__section">
              <header className="parc__section-head">
                <h2 id="parc-log"><Truck size={22} aria-hidden="true" /> Empresas de logística reversa</h2>
                <p>Empresas e indústrias que recebem os materiais triados pela ACMRB e garantem o destino ambientalmente correto.</p>
              </header>

              {empresasFiltradas.length === 0 ? (
                <div className="parc__state" role="status">
                  <Building2 size={28} aria-hidden="true" />
                  <strong>{indisponivel || empresas.length === 0 ? "Em breve as empresas parceiras" : "Nenhuma empresa com esse filtro"}</strong>
                  <p>{empresas.length === 0 ? "As parcerias de logística reversa serão publicadas aqui." : "Ajuste a busca ou o filtro de material."}</p>
                </div>
              ) : (
                <ul className="parc__grid">
                  {empresasFiltradas.map((e, i) => {
                    const hist = repasses.filter((r) => r.empresa_id === e.id);
                    const site = linkExterno(e.site);
                    const exp = aberto === e.id;
                    return (
                      <motion.li key={e.id} className="parc__card" {...fade(Math.min(i, 6) * 0.05)}>
                        <div className="parc__card-top">
                          <div className="parc__logo">
                            {e.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={e.logo_url} alt={`Logo de ${e.nome}`} loading="lazy" />
                            ) : (
                              <span aria-hidden="true">{e.nome.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="parc__card-head">
                            <h3>{e.nome}</h3>
                            <span className={`parc__status parc__status--${e.status}`}>{STATUS_LOGISTICA[e.status] ?? e.status}</span>
                            {e.cnpj && <span className="parc__cnpj">CNPJ {mascaraCnpj(e.cnpj)}</span>}
                          </div>
                        </div>

                        {e.descricao && <p className="parc__desc">{e.descricao}</p>}

                        <dl className="parc__meta">
                          {e.responsavel_nome && (
                            <div><dt><UserRound size={15} aria-hidden="true" /> Responsável</dt><dd>{e.responsavel_nome}{e.responsavel_cargo ? ` · ${e.responsavel_cargo}` : ""}</dd></div>
                          )}
                          {e.parceria_desde && (
                            <div><dt><CalendarDays size={15} aria-hidden="true" /> Parceria desde</dt><dd>{formatarData(e.parceria_desde, { month: "long", year: "numeric" })}</dd></div>
                          )}
                          <div><dt><Scale size={15} aria-hidden="true" /> Total repassado</dt><dd><strong>{formatarKg(e.total_repassado_kg)}</strong>{e.total_repasses ? ` em ${e.total_repasses} ${e.total_repasses === 1 ? "repasse" : "repasses"}` : ""}</dd></div>
                        </dl>

                        {e.materiais_aceitos.length > 0 && (
                          <div className="parc__mats">
                            <span><Package size={14} aria-hidden="true" /> Materiais aceitos</span>
                            <ul>{e.materiais_aceitos.map((m) => <li key={m}>{m}</li>)}</ul>
                          </div>
                        )}

                        <div className="parc__links">
                          {site && <a href={site} target="_blank" rel="noopener noreferrer"><Globe size={15} aria-hidden="true" /> Site <ExternalLink size={12} aria-hidden="true" /></a>}
                          {e.email_publico && <a href={`mailto:${e.email_publico}`}><Mail size={15} aria-hidden="true" /> E-mail</a>}
                          {e.telefone_publico && <a href={`tel:${e.telefone_publico.replace(/\D/g, "")}`}><Phone size={15} aria-hidden="true" /> {e.telefone_publico}</a>}
                        </div>

                        {hist.length > 0 && (
                          <div className="parc__hist">
                            <button type="button" aria-expanded={exp} aria-controls={`hist-${e.id}`} onClick={() => setAberto(exp ? null : e.id)}>
                              Histórico de repasses ({hist.length}) <ChevronDown size={16} aria-hidden="true" className={exp ? "parc__rot" : ""} />
                            </button>
                            {exp && (
                              <div id={`hist-${e.id}`} className="parc__table-wrap">
                                <table className="parc__table">
                                  <caption className="sr-only">Repasses públicos para {e.nome}</caption>
                                  <thead><tr><th scope="col">Data</th><th scope="col">Material</th><th scope="col">Peso</th><th scope="col">Valor</th><th scope="col"><span className="sr-only">Documento</span></th></tr></thead>
                                  <tbody>
                                    {hist.map((r) => (
                                      <tr key={r.id}>
                                        <td data-label="Data">{formatarData(r.data)}</td>
                                        <td data-label="Material">{r.material}</td>
                                        <td data-label="Peso">{formatarKg(r.peso_kg)}</td>
                                        <td data-label="Valor">{r.valor != null ? formatarReais(r.valor) : "—"}</td>
                                        <td data-label="Documento">
                                          {r.documento_url ? (
                                            <a href={linkExterno(r.documento_url)!} target="_blank" rel="noopener noreferrer"><FileText size={14} aria-hidden="true" /> Comprovante</a>
                                          ) : "—"}
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

            {/* Apoiadores */}
            <section aria-labelledby="parc-apo" className="parc__section">
              <header className="parc__section-head">
                <h2 id="parc-apo"><HeartHandshake size={22} aria-hidden="true" /> Apoiadores e parceiros institucionais</h2>
                <p>Comércios, instituições e pessoas que apoiam a coleta seletiva com pontos de entrega, doações, divulgação e voluntariado.</p>
              </header>

              {grupos.length === 0 ? (
                <div className="parc__state" role="status">
                  <HeartHandshake size={28} aria-hidden="true" />
                  <strong>{apoiadores.length === 0 ? "Em breve os primeiros apoiadores" : "Nenhum apoiador com esse filtro"}</strong>
                  <p>{apoiadores.length === 0 ? "Os apoiadores da ACMRB serão listados aqui." : "Ajuste a busca ou a categoria."}</p>
                </div>
              ) : (
                grupos.map((g) => (
                  <div key={g.categoria} className="parc__group">
                    <h3 className="parc__group-title" style={{ ["--cat" as string]: corCategoria(g.categoria) }}>
                      <span aria-hidden="true" /> {g.categoria} <small>({g.itens.length})</small>
                    </h3>
                    <ul className="parc__apo-grid">
                      {g.itens.map((a) => {
                        const site = linkExterno(a.site);
                        const insta = linkInstagram(a.instagram);
                        return (
                          <li key={a.id} className="parc__apo">
                            <div className="parc__apo-logo">
                              {a.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={a.logo_url} alt="" loading="lazy" />
                              ) : (
                                <span style={{ background: corCategoria(a.categoria) }} aria-hidden="true">{a.nome_exibicao.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="parc__apo-body">
                              <strong>{a.nome_exibicao}</strong>
                              {a.bairro && <span className="parc__apo-bairro"><MapPin size={12} aria-hidden="true" /> {a.bairro}</span>}
                              {a.descricao && <p>{a.descricao}</p>}
                              {a.tipos_apoio.length > 0 && <ul className="parc__apo-tags">{a.tipos_apoio.map((t) => <li key={t}>{t}</li>)}</ul>}
                              {(site || insta) && (
                                <div className="parc__apo-links">
                                  {site && <a href={site} target="_blank" rel="noopener noreferrer"><Globe size={13} aria-hidden="true" /> Site</a>}
                                  {insta && <a href={insta} target="_blank" rel="noopener noreferrer"><AtSign size={13} aria-hidden="true" /> Instagram</a>}
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

        {/* CTA */}
        <section className="parc__cta" aria-labelledby="parc-cta">
          <div>
            <h2 id="parc-cta">Sua empresa quer ser parceira?</h2>
            <p>Indústrias, operadores de logística reversa, comércios e instituições podem apoiar a ACMRB. Entre em contato e conheça como funciona a parceria.</p>
          </div>
          <div className="parc__cta-actions">
            <a href="/#contato" className="parc__btn parc__btn--light">Quero ser parceiro <ArrowRight size={16} aria-hidden="true" /></a>
            <a href="/#parceiros" className="parc__btn parc__btn--ghost"><MapPin size={16} aria-hidden="true" /> Ver mapa de apoiadores</a>
          </div>
        </section>
      </div>
    </main>
  );
}
