"use client";

/**
 * VisaoGeral — página inicial do painel (substitui o antigo "Dashboard Ambiental")
 * ------------------------------------------------------------
 * 1. Cabeçalho compacto: saudação, data e botão atualizar.
 * 2. Cartões de indicadores com dados reais (+ tendência quando há base).
 * 3. Gráficos simples em SVG/CSS: coleta mensal (6 meses) e mix de materiais.
 * 4. Pendências e alertas (migrations faltando, dados vazios etc.).
 * 5. Atividade recente (auditoria do painel — só o deus).
 * 6. Atalhos para as seções que o papel pode ver.
 * Nada é inventado: sem dado = 0 ou "sem dados".
 * Visual: só classes Tailwind (cards brancos arredondados, verde da marca).
 */

import Link from "next/link";
import {
  AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Building2, CircleAlert, Coins, Info,
  MapPinned, MessagesSquare, Newspaper, RefreshCw, Scale, ShieldAlert, Truck, UserSearch, Users, History, type LucideIcon,
} from "lucide-react";

import { usePainelResumo, type Resumo } from "@/hooks/usePainelResumo";
import { ITENS_NAV } from "@/constants/adminNav";
import { podeVer, type PapelAdmin } from "@/constants/permissoes";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface Props {
  papel: PapelAdmin;
  nome: string;
}

const kg = (v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} t` : `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`);
const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const inteiro = (v: number) => v.toLocaleString("pt-BR");

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

const ROTULO_ACAO: Record<string, string> = {
  criar_admin: "criou um administrador",
  excluir_admin: "excluiu um administrador",
  trocar_email: "trocou um e-mail de acesso",
  visitante_editar: "editou um visitante",
  visitante_excluir: "excluiu um visitante",
};
const textoAcao = (a: string) => ROTULO_ACAO[a] ?? a.replace(/_/g, " ");

function quando(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  if (min < 1440) return `há ${Math.round(min / 60)} h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}


/* Classes que se repetem (cada bloco da tela é um "cartão" branco arredondado) */
const CARTAO = "min-w-0 rounded-card border border-black/5 bg-white p-4 shadow-card sm:p-5";
const VAZIO = "px-2 py-8 text-center text-sm text-ink-muted";

/* ---------- Bloco com título (usado nos gráficos, pendências, atividade e atalhos) ---------- */
function Bloco({ titulo, nota, children }: { titulo: string; nota?: string | number; children: React.ReactNode }) {
  return (
    <section className={CARTAO}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-base font-black tracking-tight text-ink sm:text-lg">{titulo}</h2>
        {nota !== undefined && <span className="shrink-0 text-xs font-medium text-ink-muted">{nota}</span>}
      </div>
      {children}
    </section>
  );
}

/* ---------- Cartão de indicador ---------- */
function Kpi({ icone: Icone, rotulo, valor, detalhe, tendencia }: {
  icone: LucideIcon; rotulo: string; valor: string; detalhe?: string; tendencia?: number | null;
}) {
  const temTendencia = tendencia !== undefined && tendencia !== null;
  return (
    <article className="flex min-w-0 flex-col rounded-card border border-black/5 bg-white p-3.5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-mint text-brand">
          <Icone size={20} aria-hidden="true" />
        </span>
        {temTendencia && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-extrabold",
              tendencia >= 0 ? "bg-brand-mint text-leaf" : "bg-danger-soft text-danger",
            )}
            title="Comparado ao mês anterior"
          >
            {tendencia >= 0 ? <ArrowUpRight size={14} aria-hidden="true" /> : <ArrowDownRight size={14} aria-hidden="true" />}
            {Math.abs(tendencia)}%
          </span>
        )}
      </div>
      <strong className="text-2xl font-black leading-tight tracking-tight text-ink [overflow-wrap:anywhere] sm:text-3xl">{valor}</strong>
      <span className="mt-1 text-sm font-bold text-ink-soft">{rotulo}</span>
      {detalhe && <span className="mt-0.5 text-xs text-ink-muted">{detalhe}</span>}
    </article>
  );
}

/* ---------- Gráfico de barras (SVG) ---------- */
function GraficoMensal({ serie }: { serie: Resumo["serie"] }) {
  const max = Math.max(...serie.map((s) => s.kg), 0);
  if (max === 0) return <p className={VAZIO}>Sem coletas nos últimos 6 meses.</p>;
  // L = largura do desenho, A = altura, base = linha de baixo das barras
  const L = 480, A = 200, base = 170, largura = L / serie.length;
  return (
    <svg className="block h-auto w-full" viewBox={`0 0 ${L} ${A}`} role="img" aria-label="Coleta mensal em quilos nos últimos 6 meses">
      {/* linhas de fundo */}
      {[0.25, 0.5, 0.75, 1].map((p) => (
        <line key={p} x1="0" x2={L} y1={base - p * 140} y2={base - p * 140} className="stroke-zinc-100" strokeWidth="1" />
      ))}
      {serie.map((s, i) => {
        const h = (s.kg / max) * 140;
        const x = i * largura + largura * 0.2;
        const w = largura * 0.6;
        const atual = i === serie.length - 1; // o mês atual fica em verde forte
        return (
          <g key={s.chave}>
            <title>{`${s.rotulo}: ${kg(s.kg)} · ${reais(s.valor)}`}</title>
            <rect
              x={x} y={base - h} width={w} height={Math.max(h, s.kg > 0 ? 2 : 0)} rx="6"
              className={cn("transition-colors", atual ? "fill-brand" : "fill-emerald-200 hover:fill-emerald-300")}
            />
            {s.kg > 0 && (
              <text x={x + w / 2} y={base - h - 6} textAnchor="middle" className="fill-ink text-[14px] font-extrabold">
                {s.kg >= 1000 ? `${(s.kg / 1000).toFixed(1)}t` : Math.round(s.kg)}
              </text>
            )}
            <text x={x + w / 2} y={base + 20} textAnchor="middle" className="fill-ink-muted text-[14px] font-medium">{s.rotulo}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Mix de materiais (rosca em conic-gradient) ---------- */
function MixMateriais({ mix }: { mix: Resumo["mix"] }) {
  const total = mix.reduce((a, f) => a + f.kg, 0);
  if (!total) return <p className={VAZIO}>Sem materiais registrados.</p>;
  const principais = mix.slice(0, 6);
  const resto = mix.slice(6).reduce((a, f) => a + f.kg, 0);
  const fatias = resto ? [...principais, { nome: "Outros", cor: "#d4d4d8", kg: resto }] : principais;
  let acc = 0;
  const gradiente = fatias.map((f) => {
    const ini = (acc / total) * 360;
    acc += f.kg;
    return `${f.cor} ${ini}deg ${(acc / total) * 360}deg`;
  }).join(", ");
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
      {/* a rosca: o gradiente precisa do style porque as cores vêm dos dados */}
      <div
        className="relative h-36 w-36 shrink-0 rounded-full sm:h-38 sm:w-38"
        style={{ background: `conic-gradient(${gradiente})` }}
        role="img"
        aria-label="Distribuição dos materiais por peso"
      >
        <span className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
          <strong className="text-base font-black text-ink">{kg(total)}</strong>
          <small className="text-xs text-ink-muted">total</small>
        </span>
      </div>
      <ul className="flex w-full min-w-0 flex-1 flex-col gap-2">
        {fatias.map((f) => (
          <li key={f.nome} className="flex items-center gap-2 text-sm text-ink-soft">
            <i className="h-3 w-3 shrink-0 rounded-sm" style={{ background: f.cor }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{f.nome}</span>
            <b className="font-extrabold text-ink">{Math.round((f.kg / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Esqueleto de carregamento (quadros piscando) ---------- */
const ESQUELETO = "animate-pulse rounded-card bg-emerald-100/60 motion-reduce:animate-none";

function Carregando() {
  return (
    <div className="flex flex-col gap-4 sm:gap-5" aria-busy="true" aria-label="Carregando visão geral">
      <div className={cn(ESQUELETO, "h-32")} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className={cn(ESQUELETO, "h-36")} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cn(ESQUELETO, "h-60")} />
        <div className={cn(ESQUELETO, "h-60")} />
      </div>
    </div>
  );
}

/* Cores de cada nível de pendência */
const NIVEL_PENDENCIA: Record<string, string> = {
  erro: "border-red-100 bg-danger-soft text-danger",
  aviso: "border-amber-100 bg-warning-soft text-amber-800",
  info: "border-brand-line/60 bg-brand-soft text-brand-dark",
};

export default function VisaoGeral({ papel, nome }: Props) {
  const ehDeus = papel === "deus";
  const { resumo: r, carregando, recarregar } = usePainelResumo(ehDeus);

  if (carregando && !r) return <Carregando />;
  if (!r) return null;

  const tendKg =
    r.kgMes !== null && r.kgMesAnterior ? Math.round(((r.kgMes - r.kgMesAnterior) / r.kgMesAnterior) * 100) : null;
  const semDados = "sem dados";
  const v = (x: number | null, f: (n: number) => string = inteiro) => (x === null ? semDados : f(x));

  const atalhos = ITENS_NAV.filter((i) => i.pronto && i.id !== "dashboard" && podeVer(papel, i.id));
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* 1. Cabeçalho */}
      <header className="relative flex flex-col gap-4 overflow-hidden rounded-card bg-linear-to-br from-brand-dark to-brand p-5 text-white shadow-pop sm:flex-row sm:items-center sm:justify-between sm:p-6">
        {/* bolas de luz decorativas */}
        <span className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-emerald-300/15 blur-2xl" aria-hidden="true" />
        <span className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="relative min-w-0">
          <p className="text-sm font-semibold capitalize text-emerald-100/80">{hoje}</p>
          <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight sm:text-3xl">{saudacao()}, {nome.split(" ")[0]} 👋</h1>
          <p className="mt-1.5 max-w-xl text-sm text-emerald-50/90 sm:text-base">Resumo da operação da ACMRB com os dados cadastrados no sistema.</p>
        </div>
        <Button type="button" variante="claro" tamanho="pequeno" className="relative self-start sm:self-center" onClick={() => void recarregar()} disabled={carregando}>
          <RefreshCw size={16} className={carregando ? "animate-spin motion-reduce:animate-none" : undefined} aria-hidden="true" />
          <span>Atualizar</span>
        </Button>
      </header>

      {/* 2. Indicadores */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-4" aria-label="Indicadores">
        <Kpi icone={Scale} rotulo="Material coletado" valor={v(r.kgTotal, kg)} detalhe={r.kgMes !== null ? `${kg(r.kgMes)} neste mês` : undefined} tendencia={tendKg} />
        <Kpi icone={Coins} rotulo="Receita com materiais" valor={v(r.receitaTotal, reais)} detalhe={r.registros !== null ? `${inteiro(r.registros)} registros` : undefined} />
        <Kpi icone={Users} rotulo="Associados ativos" valor={v(r.associados)} />
        <Kpi icone={MapPinned} rotulo="Apoiadores no mapa" valor={v(r.apoiadoresMapa)} detalhe={r.apoiadoresAtivos !== null ? `${inteiro(r.apoiadoresAtivos)} apoiadores ativos` : undefined} />
        <Kpi icone={Truck} rotulo="Empresas de logística" valor={v(r.empresasLogistica)} detalhe="parcerias ativas" />
        <Kpi icone={Newspaper} rotulo="Notícias publicadas" valor={v(r.noticiasPublicadas)} detalhe={r.noticiasMes !== null ? `${inteiro(r.noticiasMes)} neste mês` : undefined} />
        {ehDeus && <Kpi icone={UserSearch} rotulo="Visitantes cadastrados" valor={v(r.visitantes)} detalhe={r.visitantesMes !== null ? `${inteiro(r.visitantesMes)} novos neste mês` : undefined} />}
        <Kpi icone={ShieldAlert} rotulo="Denúncias em aberto" valor={v(r.denunciasAbertas)} />
        <Kpi icone={MessagesSquare} rotulo="Mensagens não lidas" valor={v(r.mensagensNaoLidas)} detalhe="chat com visitantes" />
      </section>

      {/* 3. Gráficos */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] sm:gap-5">
        <Bloco titulo="Coleta mensal" nota="últimos 6 meses · kg">
          <GraficoMensal serie={r.serie} />
        </Bloco>
        <Bloco titulo="Mix de materiais" nota="por peso">
          <MixMateriais mix={r.mix} />
        </Bloco>
      </div>

      {/* 4. Pendências + 5. Atividade */}
      <div className="grid gap-4 lg:grid-cols-2 sm:gap-5">
        <Bloco titulo="Pendências e alertas" nota={r.pendencias.length || "nenhuma"}>
          {r.pendencias.length === 0 ? (
            <p className={cn(VAZIO, "font-semibold text-brand")}>Tudo em dia. Nenhuma pendência encontrada.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {r.pendencias.map((p, i) => {
                const Icone = p.nivel === "erro" ? CircleAlert : p.nivel === "aviso" ? AlertTriangle : Info;
                const destino = p.secao && podeVer(papel, p.secao as never) ? p.secao : null;
                return (
                  <li
                    key={i}
                    className={cn("flex flex-wrap items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm leading-relaxed sm:flex-nowrap", NIVEL_PENDENCIA[p.nivel])}
                  >
                    <Icone size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1">{p.texto}</span>
                    {destino && (
                      <Link
                        href={`/admin?secao=${destino}`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md text-xs font-extrabold text-inherit hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        aria-label="Abrir seção"
                      >
                        Abrir <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Bloco>

        <Bloco titulo="Atividade recente" nota="auditoria do painel">
          {!ehDeus ? (
            <p className={VAZIO}>A auditoria é visível apenas para o ADM DEUS.</p>
          ) : r.atividades === null ? (
            <p className={VAZIO}>Sem dados de auditoria.</p>
          ) : r.atividades.length === 0 ? (
            <p className={VAZIO}>Nenhuma ação registrada ainda.</p>
          ) : (
            <ul className="flex flex-col gap-3.5">
              {r.atividades.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm text-ink-soft">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <History size={15} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="[overflow-wrap:anywhere]">
                      <b className="font-bold text-ink">{a.ator_email.split("@")[0]}</b> {textoAcao(a.acao)}
                      {a.alvo_email ? <> · <span className="text-ink-muted [word-break:break-all]">{a.alvo_email}</span></> : null}
                    </p>
                    <time className="text-xs text-ink-muted" dateTime={a.created_at}>{quando(a.created_at)}</time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Bloco>
      </div>

      {/* 6. Atalhos */}
      <Bloco titulo="Acesso rápido" nota={`${atalhos.length} seções`}>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {atalhos.map(({ id, rotulo, icone: Icone, descricao }) => (
            <Link
              key={id}
              href={`/admin?secao=${id}`}
              className="group flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-surface-alt px-3.5 py-3 transition-colors hover:border-brand-line hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-soft bg-white text-brand">
                <Icone size={20} aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <strong className="text-sm font-extrabold text-ink">{rotulo}</strong>
                <small className="truncate text-xs text-ink-muted">{descricao}</small>
              </span>
              <ArrowRight size={16} className="shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </Bloco>

      <p className="flex items-center justify-end gap-1.5 text-xs text-ink-muted">
        <Building2 size={14} aria-hidden="true" /> Atualizado às {r.atualizadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}
