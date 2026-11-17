"use client";

/**
 * ApoiadoresMapaSection — "Parceiros e Apoiadores" (âncora #parceiros)
 * ------------------------------------------------------------
 * O que mostra:
 *  - Contadores (apoiadores cadastrados, pontos no mapa, categorias).
 *  - Filtros por categoria e por tipo de apoio.
 *  - Mapa (Leaflet) ao lado da lista de apoiadores; clicar num item da
 *    lista destaca o ponto no mapa.
 *  - Faixa de chamada para /parceiros e para o contato.
 *
 * De onde vêm os dados (Supabase, via src/services/apoiadores.ts):
 *  - listarApoiadoresPublicos: apoiadores cadastrados e publicados.
 *  - listarEmpresasLogisticaPublicas: empresas de logística reversa que
 *    aparecem no mapa (viram "pontos" com empresaComoPonto).
 *
 * O mapa só roda no navegador (next/dynamic com ssr: false).
 * Responsivo: mapa e lista empilhados até 1024px; lado a lado no desktop.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Handshake, HeartHandshake, MapPin, MapPinned, RotateCcw, Tags } from "lucide-react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useAparecer } from "@/hooks/useAparecer";
import { supabase } from "@/lib/supabase";
import {
  CATEGORIAS, TIPOS_APOIO, corCategoria, empresaComoPonto, listarApoiadoresPublicos, listarEmpresasLogisticaPublicas, type ApoiadorPublico,
} from "@/services/apoiadores";
import { cn } from "@/utils/cn";
import FaixaCta from "./FaixaCta";
import TituloSecao from "./TituloSecao";

// Mapa carregado só no navegador (Leaflet usa "window")
const MapaPontos = dynamic(() => import("@/components/mapa/MapaPontos"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-brand-soft font-bold text-leaf" aria-hidden="true">
      Carregando mapa…
    </div>
  ),
});

export default function ApoiadoresMapaSection() {
  const aparecer = useAparecer();

  const [lista, setLista] = useState<ApoiadorPublico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [apoio, setApoio] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  // Busca apoiadores + empresas de logística reversa que estão no mapa
  useEffect(() => {
    let vivo = true;
    Promise.all([listarApoiadoresPublicos(supabase), listarEmpresasLogisticaPublicas(supabase)]).then(([a, e]) => {
      if (!vivo) return;
      const empresas = e.dados.filter((x) => x.no_mapa && x.latitude != null && x.longitude != null).map(empresaComoPonto);
      setLista([...a.dados, ...empresas]);
      setCarregando(false);
    });
    return () => {
      vivo = false;
    };
  }, []);

  // Só mostra nos filtros as categorias e apoios que existem de verdade
  const categoriasUsadas = useMemo(
    () => [...CATEGORIAS, "Logística reversa"].filter((c) => lista.some((a) => a.categoria === c)),
    [lista],
  );
  const apoiosUsados = useMemo(() => TIPOS_APOIO.filter((t) => lista.some((a) => a.tipos_apoio.includes(t))), [lista]);

  // Lista depois de aplicar os filtros
  const filtrados = useMemo(
    () => lista.filter((a) => (!categoria || a.categoria === categoria) && (!apoio || a.tipos_apoio.includes(apoio))),
    [lista, categoria, apoio],
  );
  const noMapa = useMemo(() => filtrados.filter((a) => a.no_mapa), [filtrados]);
  const totalNoMapa = lista.filter((a) => a.no_mapa).length;

  const selecionar = useCallback((id: string) => setSelecionado(id), []);

  // Clicar na lista: seleciona o ponto e, no celular/tablet, rola até o mapa
  const selecionarDaLista = (id: string) => {
    setSelecionado(id);
    if (window.matchMedia("(max-width: 1024px)").matches) {
      document.getElementById("apoiadores-mapa")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const limpar = () => {
    setCategoria(null);
    setApoio(null);
  };

  // Contadores do topo
  const contadores = [
    { icone: HeartHandshake, valor: lista.length, rotulo: "apoiadores cadastrados" },
    { icone: MapPinned, valor: totalNoMapa, rotulo: "pontos no mapa" },
    { icone: Tags, valor: categoriasUsadas.length, rotulo: "categorias" },
  ];

  // Estilo base dos botões de filtro
  const chip =
    "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition";

  return (
    <section id="parceiros" className="bg-surface-alt py-16 sm:py-20 lg:py-24" aria-labelledby="apmapa-titulo" lang="pt-BR">
      <Container>
        {/* ===== Cabeçalho ===== */}
        <motion.div {...aparecer()}>
          <TituloSecao
            id="apmapa-titulo"
            icone={Handshake}
            etiqueta="Parceiros e Apoiadores"
            titulo={
              <>
                Quem faz a reciclagem acontecer <span>em Baturité</span>
              </>
            }
            descricao="Comércios, restaurantes, pousadas, residências, empresas e instituições que apoiam a ACMRB com pontos de entrega, doações, divulgação e logística reversa. Cada ponto no mapa representa alguém que fortalece a coleta seletiva e o trabalho dos catadores do Maciço de Baturité."
          />
        </motion.div>

        {/* ===== Contadores ===== */}
        <motion.ul {...aparecer(0.05)} className="mb-8 grid grid-cols-3 gap-3 sm:gap-4" aria-label="Resumo dos apoiadores">
          {contadores.map(({ icone: Icone, valor, rotulo }) => (
            <li
              key={rotulo}
              className="flex min-w-0 flex-col items-center gap-1 rounded-card border border-black/5 bg-white p-3 text-center shadow-card sm:p-5"
            >
              <Icone size={20} className="text-leaf" aria-hidden="true" />
              <strong className="text-2xl font-black text-brand sm:text-3xl">{carregando ? "—" : valor}</strong>
              <span className="text-xs text-ink-soft sm:text-sm">{rotulo}</span>
            </li>
          ))}
        </motion.ul>

        {/* ===== Filtros ===== */}
        {(categoriasUsadas.length > 0 || apoiosUsados.length > 0) && (
          <motion.div {...aparecer(0.1)} className="mb-6 flex flex-col gap-3 rounded-card border border-black/5 bg-white p-4 shadow-card sm:p-5">
            {categoriasUsadas.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por categoria">
                <span className="mr-1 text-xs font-bold uppercase tracking-wider text-ink-muted">Categoria</span>
                {categoriasUsadas.map((c) => {
                  const ativo = categoria === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => setCategoria(ativo ? null : c)}
                      // a cor de cada categoria vem do serviço (corCategoria)
                      style={ativo ? { backgroundColor: corCategoria(c), borderColor: corCategoria(c) } : undefined}
                      className={cn(chip, ativo ? "text-white" : "border-line bg-white text-ink hover:bg-brand-soft")}
                    >
                      <span
                        aria-hidden="true"
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: ativo ? "#fff" : corCategoria(c) }}
                      />
                      {c}
                    </button>
                  );
                })}
              </div>
            )}

            {apoiosUsados.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por tipo de apoio">
                <span className="mr-1 text-xs font-bold uppercase tracking-wider text-ink-muted">Tipo de apoio</span>
                {apoiosUsados.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={apoio === t}
                    onClick={() => setApoio(apoio === t ? null : t)}
                    className={cn(chip, apoio === t ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-brand-soft")}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {(categoria || apoio) && (
              <button
                type="button"
                onClick={limpar}
                className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-leaf hover:underline"
              >
                <RotateCcw size={14} aria-hidden="true" /> Limpar filtros
              </button>
            )}
          </motion.div>
        )}

        {/* ===== Mapa + lista =====
            Sem animação "whileInView" aqui de propósito: quando o observador não
            dispara (pulo por âncora /#parceiros, aba em segundo plano) o mapa
            ficava invisível. Assim ele sempre aparece. */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div
            id="apoiadores-mapa"
            className="relative h-[clamp(300px,55dvh,520px)] overflow-hidden rounded-card border border-black/5 bg-white shadow-card-hover"
          >
            <MapaPontos pontos={noMapa} selecionado={selecionado} onSelecionar={selecionar} />

            {!carregando && noMapa.length === 0 && (
              <div
                role="status"
                className="absolute inset-x-3 bottom-3 z-450 flex flex-col items-center gap-1 rounded-2xl border border-brand-line bg-white/95 p-4 text-center shadow-card-hover sm:inset-x-4 sm:bottom-4"
              >
                <MapPin size={26} className="text-leaf" aria-hidden="true" />
                <strong className="text-ink">
                  {lista.length === 0 || totalNoMapa === 0 ? "Em breve os primeiros pontos no mapa" : "Nenhum ponto com esse filtro"}
                </strong>
                <p className="max-w-md text-sm text-ink-soft">
                  {totalNoMapa === 0
                    ? "Estamos cadastrando os comércios, casas e instituições que apoiam a coleta seletiva em Baturité."
                    : "Tente outra categoria ou limpe os filtros para ver todos os pontos."}
                </p>
              </div>
            )}
          </div>

          <aside
            className="flex max-h-85 flex-col rounded-card border border-black/5 bg-white p-4 shadow-card lg:max-h-[clamp(300px,55dvh,520px)]"
            aria-label="Lista de apoiadores"
          >
            <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-leaf" aria-live="polite">
              {carregando ? "Carregando apoiadores…" : `${filtrados.length} ${filtrados.length === 1 ? "apoiador" : "apoiadores"}`}
            </p>

            {!carregando && filtrados.length === 0 ? (
              <p className="text-sm text-ink-muted">Os apoiadores aparecerão aqui assim que forem cadastrados.</p>
            ) : (
              <ul className="flex flex-col gap-2 overflow-y-auto">
                {filtrados.map((a) => (
                  <li key={a.id} className="min-w-0">
                    <button
                      type="button"
                      aria-current={selecionado === a.id}
                      disabled={!a.no_mapa}
                      title={a.no_mapa ? "Ver no mapa" : "Ainda sem ponto no mapa"}
                      onClick={() => selecionarDaLista(a.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition disabled:cursor-default",
                        selecionado === a.id
                          ? "border-brand-line bg-brand-soft"
                          : "border-transparent bg-surface-alt enabled:hover:border-brand-line enabled:hover:bg-brand-soft",
                      )}
                    >
                      {a.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.logo_url} alt="" loading="lazy" className="size-10 shrink-0 rounded-lg border border-line bg-white object-contain" />
                      ) : (
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-lg font-black text-white"
                          style={{ background: corCategoria(a.categoria) }}
                          aria-hidden="true"
                        >
                          {a.nome_exibicao.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <strong className="line-clamp-2 text-sm text-ink [overflow-wrap:anywhere]">{a.nome_exibicao}</strong>
                        <span className="text-xs text-ink-muted">
                          {a.categoria}
                          {a.bairro ? ` · ${a.bairro}` : ""}
                        </span>
                      </span>
                      {a.no_mapa && <MapPin size={16} className="shrink-0 text-leaf" aria-hidden="true" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>

        {/* ===== Chamada ===== */}
        <motion.div {...aparecer(0.1)}>
          <FaixaCta
            titulo="Empresas parceiras e logística reversa"
            texto="Conheça as empresas que recebem os materiais triados pela ACMRB, os responsáveis por cada parceria e o histórico público do que já foi repassado para reciclagem."
          >
            <Button href="/parceiros" variante="claro" tamanho="grande">
              <Building2 size={18} aria-hidden="true" /> Conheça nossas empresas parceiras <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button href="/#contato" variante="contornoClaro" tamanho="grande">
              <HeartHandshake size={18} aria-hidden="true" /> Quero apoiar
            </Button>
          </FaixaCta>
        </motion.div>
      </Container>
    </section>
  );
}
