"use client";

/**
 * Aba "Visão geral" dos visitantes (somente ADM DEUS)
 * ------------------------------------------------------------
 * Cartões de números, gráfico simples (só CSS) de cadastros e logins
 * nos últimos 30 dias e rankings (cidades, bairros, aparelhos, páginas).
 * Os dados vêm de services/visitantesAdmin (leitura com RLS is_deus).
 */

import { useCallback, useEffect, useState } from "react";
import {
  CalendarPlus, FileText, Inbox, LogIn, MapPin, MessageCircle, RefreshCw, Smartphone, Truck, UserCheck, Users, Wifi,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Button from "@/components/ui/Button";
import { CAIXA_VAZIA, CARTAO } from "@/components/admin/apoiadores/estilos";
import { carregarPainelVisitantes, type PainelVisitantes } from "@/services/visitantesAdmin";
import { cn } from "@/utils/cn";

interface Props {
  onVerCadastrados: () => void;
}

export default function VisaoGeralVisitantes({ onVerCadastrados }: Props) {
  const [dados, setDados] = useState<PainelVisitantes | null>(null);
  const [erro, setErro] = useState("");
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    setAtualizando(true);
    try {
      setDados(await carregarPainelVisitantes());
      setErro("");
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const d = dados;
  const cartoes: { rotulo: string; valor: number | undefined; dica?: string; icone: typeof Users; cor: string }[] = [
    { rotulo: "Cadastrados", valor: d?.total, dica: d ? `${d.ativos} ativos · ${d.inativos} inativos` : undefined, icone: Users, cor: "bg-brand-mint text-brand" },
    { rotulo: "Online agora", valor: d?.onlineAgora, dica: "logados nos últimos 15 min", icone: Wifi, cor: "bg-emerald-50 text-emerald-700" },
    { rotulo: "Novos hoje", valor: d?.novosHoje, icone: CalendarPlus, cor: "bg-sky-50 text-sky-700" },
    { rotulo: "Novos em 7 dias", valor: d?.novos7, dica: d ? `${d.novos30} em 30 dias` : undefined, icone: UserCheck, cor: "bg-indigo-50 text-indigo-700" },
    { rotulo: "Pediram coleta", valor: d?.comColeta, dica: "cadastrados com pedido", icone: Truck, cor: "bg-amber-50 text-amber-700" },
    { rotulo: "Usam o chat", valor: d?.comChat, dica: "mandaram ou receberam mensagem", icone: MessageCircle, cor: "bg-violet-50 text-violet-700" },
    { rotulo: "Logins em 30 dias", valor: d?.logins30, dica: "sessões de quem tem conta", icone: LogIn, cor: "bg-zinc-100 text-zinc-700" },
  ];

  if (erro && !dados) {
    return (
      <div className={cn(CAIXA_VAZIA, "border-red-200 text-danger")} role="alert">
        {erro}
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void carregar()}>
          <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">Números só de quem tem conta. Visitas anônimas ficam nas abas Tempo real e Acessos.</p>
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void carregar()} className="max-sm:w-full">
          <RefreshCw size={16} aria-hidden="true" className={cn(atualizando && "animate-spin")} /> Atualizar
        </Button>
      </div>

      {/* Cartões de números */}
      <ul className="grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4 xl:grid-cols-7" aria-label="Resumo dos visitantes">
        {cartoes.map((k) => {
          const Icone = k.icone;
          return (
            <li key={k.rotulo} className={cn(CARTAO, "flex min-w-0 flex-col gap-2 p-3 last:max-md:col-span-2 sm:p-4", !d && "animate-pulse")}>
              <span className={cn("grid size-9 place-items-center rounded-xl", k.cor)}><Icone size={17} aria-hidden="true" /></span>
              <strong className="text-2xl font-black leading-none text-ink">{k.valor ?? "–"}</strong>
              <span className="text-[0.78rem] font-bold leading-tight text-ink-soft">{k.rotulo}</span>
              {k.dica && <span className="text-[0.7rem] leading-tight text-ink-muted">{k.dica}</span>}
            </li>
          );
        })}
      </ul>

      {/* Gráfico: cadastros e logins por dia */}
      <section className={cn(CARTAO, "min-w-0 p-4 sm:p-5")} aria-label="Cadastros e logins nos últimos 30 dias">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[0.95rem] font-extrabold text-ink">Últimos 30 dias</h3>
          <div className="flex gap-3 text-[0.75rem] font-bold text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-brand" /> Cadastros</span>
            <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-amber-400" /> Logins</span>
          </div>
        </div>
        {!d ? (
          <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />
        ) : (
          <Grafico dias={d.porDia} />
        )}
      </section>

      {/* Rankings */}
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <Ranking titulo="Cidades dos cadastrados" icone={MapPin} itens={d?.cidades} vazio="Nenhum cadastro ainda." />
        <Ranking titulo="Bairros dos cadastrados" icone={MapPin} itens={d?.bairros} vazio="Ninguém informou o bairro ainda." />
        <Ranking titulo="Aparelhos e navegadores (30 dias)" icone={Smartphone} itens={d?.aparelhos} vazio="Nenhum login nos últimos 30 dias." />
        <Ranking titulo="Páginas mais vistas por quem tem conta (30 dias)" icone={FileText} itens={d?.paginas} vazio="Nenhuma página registrada." />
      </div>

      <div className="flex justify-center">
        <Button type="button" tamanho="pequeno" onClick={onVerCadastrados}>
          <Users size={16} aria-hidden="true" /> Ver a lista de cadastrados
        </Button>
      </div>
    </div>
  );
}

/* ---------- gráficos com Recharts (passar o mouse/tocar mostra os números) ---------- */
// cores da ACMRB (o SVG do Recharts não lê as variáveis do CSS, então vão em hexa)
const COR_VERDE = "#2e5e4e";
const COR_AMARELO = "#fbbf24";
const COR_FOLHA = "#34d399";
const DICA = { borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 12, boxShadow: "0 8px 24px rgb(0 0 0 / 0.08)" };

const rotuloDia = (dia: string) => dia.slice(8, 10) + "/" + dia.slice(5, 7);

function Grafico({ dias }: { dias: PainelVisitantes["porDia"] }) {
  const total = dias.reduce((s, x) => s + x.cadastros + x.logins, 0);
  if (!total) {
    return (
      <div className={CAIXA_VAZIA}>
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-brand"><Inbox size={22} aria-hidden="true" /></span>
        Nenhum cadastro ou login nos últimos 30 dias.
      </div>
    );
  }
  return (
    <div className="h-56 min-w-0 sm:h-64" role="img" aria-label="Gráfico de cadastros e logins por dia nos últimos 30 dias">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dias} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} barGap={1}>
          <CartesianGrid vertical={false} stroke="#eef2f0" />
          <XAxis dataKey="dia" tickFormatter={rotuloDia} tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} minTickGap={18} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={DICA} cursor={{ fill: "#eef6f2" }} labelFormatter={(d) => rotuloDia(String(d))} />
          <Bar dataKey="cadastros" name="Cadastros" fill={COR_VERDE} radius={[4, 4, 0, 0]} />
          <Bar dataKey="logins" name="Logins" fill={COR_AMARELO} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- "top" em barras deitadas (Recharts) ---------- */
function Ranking({ titulo, icone: Icone, itens, vazio }: { titulo: string; icone: typeof Users; itens?: [string, number][]; vazio: string }) {
  const dados = (itens ?? []).map(([nome, total]) => ({ nome, total }));
  const curto = (t: string) => (t.length > 16 ? t.slice(0, 15) + "…" : t);
  return (
    <section className={cn(CARTAO, "min-w-0 p-4 sm:p-5")}>
      <h3 className="mb-3 flex items-center gap-2 text-[0.9rem] font-extrabold text-ink">
        <Icone size={16} aria-hidden="true" className="shrink-0 text-brand" /> <span className="min-w-0">{titulo}</span>
      </h3>
      {!itens ? (
        <div className="flex animate-pulse flex-col gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-4 rounded-full bg-zinc-100" />)}</div>
      ) : itens.length === 0 ? (
        <p className="text-sm text-ink-muted">{vazio}</p>
      ) : (
        <>
          <div className="min-w-0" style={{ height: dados.length * 34 + 8 }} aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis type="category" dataKey="nome" width={118} tickFormatter={curto} tick={{ fontSize: 12, fill: "#3f3f46" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={DICA} cursor={{ fill: "#eef6f2" }} formatter={(v) => [v, "Total"]} />
                <Bar dataKey="total" fill={COR_FOLHA} radius={[0, 6, 6, 0]} barSize={16} label={{ position: "right", fontSize: 12, fontWeight: 700, fill: "#18181b" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* a mesma lista em texto, para leitores de tela */}
          <ul className="sr-only">
            {dados.map((d) => <li key={d.nome}>{d.nome}: {d.total}</li>)}
          </ul>
        </>
      )}
    </section>
  );
}
