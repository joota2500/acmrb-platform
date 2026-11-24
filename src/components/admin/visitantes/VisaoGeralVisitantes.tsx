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

/* ---------- gráfico de barras feito só com divs ---------- */
function Grafico({ dias }: { dias: PainelVisitantes["porDia"] }) {
  const maior = Math.max(1, ...dias.map((x) => Math.max(x.cadastros, x.logins)));
  const total = dias.reduce((s, x) => s + x.cadastros + x.logins, 0);
  if (!total) {
    return (
      <div className={CAIXA_VAZIA}>
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-brand"><Inbox size={22} aria-hidden="true" /></span>
        Nenhum cadastro ou login nos últimos 30 dias.
      </div>
    );
  }
  const rotulo = (dia: string) => dia.slice(8, 10) + "/" + dia.slice(5, 7);
  return (
    <div className="min-w-0">
      <div className="flex h-40 items-end gap-px sm:gap-0.5" role="img" aria-label="Gráfico de cadastros e logins por dia">
        {dias.map((x) => (
          <div key={x.dia} className="group relative flex h-full min-w-0 flex-1 items-end justify-center gap-px" title={`${rotulo(x.dia)}: ${x.cadastros} cadastro(s), ${x.logins} login(s)`}>
            <span className="w-1/2 rounded-t-sm bg-brand transition group-hover:opacity-80" style={{ height: `${(x.cadastros / maior) * 100}%` }} />
            <span className="w-1/2 rounded-t-sm bg-amber-400 transition group-hover:opacity-80" style={{ height: `${(x.logins / maior) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between border-t border-line pt-1.5 text-[0.7rem] text-ink-muted">
        <span>{rotulo(dias[0].dia)}</span>
        <span>{rotulo(dias[Math.floor(dias.length / 2)].dia)}</span>
        <span>hoje</span>
      </div>
    </div>
  );
}

/* ---------- lista "top" com barrinha ---------- */
function Ranking({ titulo, icone: Icone, itens, vazio }: { titulo: string; icone: typeof Users; itens?: [string, number][]; vazio: string }) {
  const maior = itens?.[0]?.[1] ?? 1;
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
        <ul className="flex flex-col gap-2">
          {itens.map(([nome, n]) => (
            <li key={nome} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-[0.82rem]">
              <span className="truncate font-semibold text-zinc-700" title={nome}>{nome}</span>
              <b className="text-ink">{n}</b>
              <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-brand-soft">
                <i className="block h-full rounded-full bg-leaf-bright" style={{ width: `${(n / maior) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
