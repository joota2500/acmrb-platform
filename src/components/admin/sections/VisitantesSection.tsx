"use client";

/**
 * Seção "Usuários / Visitantes" (somente ADM DEUS)
 * ------------------------------------------------------------
 * Abas:
 *  - Visão geral: números dos cadastrados (novos, online, coleta, chat),
 *                 gráfico de cadastros e logins por dia e rankings.
 *  - Cadastrados: lista em cartões com selos, CRUD das contas e a gaveta
 *                 com o histórico de cada pessoa.
 *  - Tempo real / Resumo / Visitas / Aparelhos / Segurança: acessos ao site
 *                 (essas abas ainda usam o CSS antigo; vão para o Tailwind no item 10).
 * Leitura no banco só com RLS is_deus(); escrita pelas rotas /api/admin.
 */

import { useState } from "react";
import { Activity, BarChart3, LayoutDashboard, ListChecks, ShieldCheck, Smartphone, Users } from "lucide-react";

import AcessosTempoReal from "@/components/admin/acessos/AcessosTempoReal";
import AcessosResumo from "@/components/admin/acessos/AcessosResumo";
import AcessosLista from "@/components/admin/acessos/AcessosLista";
import AparelhosPainel from "@/components/admin/aparelhos/AparelhosPainel";
import SegurancaPainel from "@/components/admin/acessos/SegurancaPainel";
import VisitantesCadastrados from "@/components/admin/visitantes/VisitantesCadastrados";
import VisaoGeralVisitantes from "@/components/admin/visitantes/VisaoGeralVisitantes";
import { cn } from "@/utils/cn";

type Aba = "visao" | "cadastrados" | "tempo-real" | "resumo" | "visitas" | "aparelhos" | "seguranca";

const ABAS: { id: Aba; rotulo: string; icone: typeof Users }[] = [
  { id: "visao", rotulo: "Visão geral", icone: LayoutDashboard },
  { id: "cadastrados", rotulo: "Cadastrados", icone: Users },
  { id: "tempo-real", rotulo: "Tempo real", icone: Activity },
  { id: "resumo", rotulo: "Acessos", icone: BarChart3 },
  { id: "visitas", rotulo: "Visitas", icone: ListChecks },
  { id: "aparelhos", rotulo: "Aparelhos", icone: Smartphone },
  { id: "seguranca", rotulo: "Segurança", icone: ShieldCheck },
];

export default function VisitantesSection() {
  const [aba, setAba] = useState<Aba>("visao");

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {/* Cabeçalho */}
      <div className="min-w-0">
        <h2 className="text-xl font-black tracking-tight text-ink sm:text-2xl">Usuários e visitantes</h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-soft">
          Quem se cadastrou, quem está usando o site agora, pedidos de coleta, chat e acessos. Só o ADM DEUS vê esta seção.
        </p>
      </div>

      {/* Abas (no celular rolam de lado dentro da própria barra) */}
      <div className="rounded-card border border-black/5 bg-white p-1.5 shadow-card">
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:thin]" role="tablist" aria-label="Seções de usuários e visitantes">
          {ABAS.map(({ id, rotulo, icone: Icone }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              onClick={() => setAba(id)}
              className={cn(
                "inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-[0.85rem] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
                aba === id ? "bg-brand text-white shadow-sm" : "text-ink-muted hover:bg-brand-soft hover:text-brand",
              )}
            >
              <Icone size={16} aria-hidden="true" /> {rotulo}
            </button>
          ))}
        </div>
      </div>

      {aba === "visao" && <VisaoGeralVisitantes onVerCadastrados={() => setAba("cadastrados")} />}
      {aba === "cadastrados" && <VisitantesCadastrados />}
      {aba === "tempo-real" && <AcessosTempoReal />}
      {aba === "resumo" && <AcessosResumo />}
      {aba === "visitas" && <AcessosLista />}
      {aba === "aparelhos" && <AparelhosPainel />}
      {aba === "seguranca" && <SegurancaPainel />}
    </div>
  );
}
