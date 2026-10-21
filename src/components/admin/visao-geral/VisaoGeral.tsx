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
 * CSS: src/styles/admin-visao-geral.css (prefixo "vg-").
 */

import Link from "next/link";
import {
  AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Building2, CircleAlert, Coins, Info,
  MapPinned, MessagesSquare, Newspaper, RefreshCw, Scale, ShieldAlert, Truck, UserSearch, Users, History, type LucideIcon,
} from "lucide-react";

import "@/styles/admin-visao-geral.css";
import { usePainelResumo, type Resumo } from "@/hooks/usePainelResumo";
import { ITENS_NAV } from "@/components/admin/layout/adminNav";
import { podeVer, type PapelAdmin } from "@/lib/permissions";

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

/* ---------- Cartão de indicador ---------- */
function Kpi({ icone: Icone, rotulo, valor, detalhe, tendencia }: {
  icone: LucideIcon; rotulo: string; valor: string; detalhe?: string; tendencia?: number | null;
}) {
  return (
    <article className="vg-kpi">
      <div className="vg-kpi__topo">
        <span className="vg-kpi__icone"><Icone size={18} aria-hidden="true" /></span>
        {tendencia !== undefined && tendencia !== null && (
          <span className={`vg-tendencia ${tendencia >= 0 ? "vg-tendencia--alta" : "vg-tendencia--baixa"}`} title="Comparado ao mês anterior">
            {tendencia >= 0 ? <ArrowUpRight size={13} aria-hidden="true" /> : <ArrowDownRight size={13} aria-hidden="true" />}
            {Math.abs(tendencia)}%
          </span>
        )}
      </div>
      <strong className="vg-kpi__valor">{valor}</strong>
      <span className="vg-kpi__rotulo">{rotulo}</span>
      {detalhe && <span className="vg-kpi__detalhe">{detalhe}</span>}
    </article>
  );
}

/* ---------- Gráfico de barras (SVG) ---------- */
function GraficoMensal({ serie }: { serie: Resumo["serie"] }) {
  const max = Math.max(...serie.map((s) => s.kg), 0);
  if (max === 0) return <p className="vg-vazio">Sem coletas nos últimos 6 meses.</p>;
  const L = 600, A = 200, base = 170, largura = L / serie.length;
  return (
    <svg className="vg-barras" viewBox={`0 0 ${L} ${A}`} role="img" aria-label="Coleta mensal em quilos nos últimos 6 meses">
      {[0.25, 0.5, 0.75, 1].map((p) => (
        <line key={p} x1="0" x2={L} y1={base - p * 140} y2={base - p * 140} className="vg-barras__grade" />
      ))}
      {serie.map((s, i) => {
        const h = (s.kg / max) * 140;
        const x = i * largura + largura * 0.22;
        const w = largura * 0.56;
        return (
          <g key={s.chave}>
            <title>{`${s.rotulo}: ${kg(s.kg)} · ${reais(s.valor)}`}</title>
            <rect x={x} y={base - h} width={w} height={Math.max(h, s.kg > 0 ? 2 : 0)} rx="6" className={i === serie.length - 1 ? "vg-barras__barra vg-barras__barra--atual" : "vg-barras__barra"} />
            {s.kg > 0 && <text x={x + w / 2} y={base - h - 6} textAnchor="middle" className="vg-barras__valor">{s.kg >= 1000 ? `${(s.kg / 1000).toFixed(1)}t` : Math.round(s.kg)}</text>}
            <text x={x + w / 2} y={base + 20} textAnchor="middle" className="vg-barras__mes">{s.rotulo}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Mix de materiais (rosca em conic-gradient) ---------- */
function MixMateriais({ mix }: { mix: Resumo["mix"] }) {
  const total = mix.reduce((a, f) => a + f.kg, 0);
  if (!total) return <p className="vg-vazio">Sem materiais registrados.</p>;
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
    <div className="vg-mix">
      <div className="vg-mix__rosca" style={{ background: `conic-gradient(${gradiente})` }} role="img" aria-label="Distribuição dos materiais por peso">
        <span><strong>{kg(total)}</strong><small>total</small></span>
      </div>
      <ul className="vg-mix__legenda">
        {fatias.map((f) => (
          <li key={f.nome}>
            <i style={{ background: f.cor }} aria-hidden="true" />
            <span>{f.nome}</span>
            <b>{Math.round((f.kg / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Carregando() {
  return (
    <div className="vg" aria-busy="true" aria-label="Carregando visão geral">
      <div className="vg-esqueleto vg-esqueleto--topo" />
      <div className="vg-kpis">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="vg-esqueleto vg-esqueleto--kpi" />)}</div>
      <div className="vg-grade"><div className="vg-esqueleto vg-esqueleto--bloco" /><div className="vg-esqueleto vg-esqueleto--bloco" /></div>
    </div>
  );
}

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
    <div className="vg">
      {/* 1. Cabeçalho */}
      <header className="vg-cabecalho">
        <div>
          <p className="vg-cabecalho__data">{hoje}</p>
          <h1 className="vg-cabecalho__titulo">{saudacao()}, {nome.split(" ")[0]} 👋</h1>
          <p className="vg-cabecalho__sub">Resumo da operação da ACMRB com os dados cadastrados no sistema.</p>
        </div>
        <button type="button" className="vg-btn" onClick={() => void recarregar()} disabled={carregando}>
          <RefreshCw size={16} className={carregando ? "vg-giro" : undefined} aria-hidden="true" />
          <span>Atualizar</span>
        </button>
      </header>

      {/* 2. Indicadores */}
      <section className="vg-kpis" aria-label="Indicadores">
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
      <div className="vg-grade">
        <section className="vg-bloco vg-bloco--largo">
          <div className="vg-bloco__topo">
            <h2>Coleta mensal</h2>
            <span>últimos 6 meses · kg</span>
          </div>
          <GraficoMensal serie={r.serie} />
        </section>
        <section className="vg-bloco">
          <div className="vg-bloco__topo">
            <h2>Mix de materiais</h2>
            <span>por peso</span>
          </div>
          <MixMateriais mix={r.mix} />
        </section>
      </div>

      {/* 4. Pendências + 5. Atividade */}
      <div className="vg-grade">
        <section className="vg-bloco">
          <div className="vg-bloco__topo">
            <h2>Pendências e alertas</h2>
            <span>{r.pendencias.length || "nenhuma"}</span>
          </div>
          {r.pendencias.length === 0 ? (
            <p className="vg-vazio vg-vazio--ok">Tudo em dia. Nenhuma pendência encontrada.</p>
          ) : (
            <ul className="vg-pendencias">
              {r.pendencias.map((p, i) => {
                const Icone = p.nivel === "erro" ? CircleAlert : p.nivel === "aviso" ? AlertTriangle : Info;
                const destino = p.secao && podeVer(papel, p.secao as never) ? p.secao : null;
                return (
                  <li key={i} className={`vg-pendencia vg-pendencia--${p.nivel}`}>
                    <Icone size={17} aria-hidden="true" />
                    <span>{p.texto}</span>
                    {destino && <Link href={`/admin?secao=${destino}`} className="vg-pendencia__ir" aria-label="Abrir seção">Abrir <ArrowRight size={14} aria-hidden="true" /></Link>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="vg-bloco">
          <div className="vg-bloco__topo">
            <h2>Atividade recente</h2>
            <span>auditoria do painel</span>
          </div>
          {!ehDeus ? (
            <p className="vg-vazio">A auditoria é visível apenas para o ADM DEUS.</p>
          ) : r.atividades === null ? (
            <p className="vg-vazio">Sem dados de auditoria.</p>
          ) : r.atividades.length === 0 ? (
            <p className="vg-vazio">Nenhuma ação registrada ainda.</p>
          ) : (
            <ul className="vg-feed">
              {r.atividades.map((a) => (
                <li key={a.id}>
                  <span className="vg-feed__icone"><History size={14} aria-hidden="true" /></span>
                  <div>
                    <p><b>{a.ator_email.split("@")[0]}</b> {textoAcao(a.acao)}{a.alvo_email ? <> · <span className="vg-feed__alvo">{a.alvo_email}</span></> : null}</p>
                    <time dateTime={a.created_at}>{quando(a.created_at)}</time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* 6. Atalhos */}
      <section className="vg-bloco">
        <div className="vg-bloco__topo">
          <h2>Acesso rápido</h2>
          <span>{atalhos.length} seções</span>
        </div>
        <div className="vg-atalhos">
          {atalhos.map(({ id, rotulo, icone: Icone, descricao }) => (
            <Link key={id} href={`/admin?secao=${id}`} className="vg-atalho">
              <span className="vg-atalho__icone"><Icone size={18} aria-hidden="true" /></span>
              <span className="vg-atalho__texto"><strong>{rotulo}</strong><small>{descricao}</small></span>
              <ArrowRight size={15} className="vg-atalho__seta" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <p className="vg-rodape">
        <Building2 size={13} aria-hidden="true" /> Atualizado às {r.atualizadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}
