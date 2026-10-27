"use client";

/**
 * Seção "Usuários / Visitantes" (somente ADM DEUS)
 * ------------------------------------------------------------
 * Abas:
 *  - Tempo real:  quem está no site agora (anônimos e logados).
 *  - Resumo:      números e gráficos por período (visitas, aparelhos,
 *                 origem, cidades, páginas, anônimos x logados x cadastrados).
 *  - Visitas:     lista filtrável de todos os acessos.
 *  - Cadastrados: CRUD das contas (criar, editar, ativar/desativar,
 *                 redefinir senha, excluir) e histórico de cada pessoa.
 *  - Segurança:   tentativas de login, auditoria do painel e limpeza.
 * Leitura no banco só com RLS is_deus(); escrita pelas rotas /api/admin.
 * CSS: src/styles/admin-visitantes.css (prefixo "advis-").
 */

import { useState } from "react";
import { Activity, BarChart3, ListChecks, ShieldCheck, Users } from "lucide-react";

import "@/styles/admin-visitantes.css";
import AcessosTempoReal from "@/components/admin/acessos/AcessosTempoReal";
import AcessosResumo from "@/components/admin/acessos/AcessosResumo";
import AcessosLista from "@/components/admin/acessos/AcessosLista";
import SegurancaPainel from "@/components/admin/acessos/SegurancaPainel";
import VisitantesCadastrados from "@/components/admin/visitantes/VisitantesCadastrados";

type Aba = "tempo-real" | "resumo" | "visitas" | "cadastrados" | "seguranca";

const ABAS: { id: Aba; rotulo: string; icone: typeof Users }[] = [
  { id: "tempo-real", rotulo: "Tempo real", icone: Activity },
  { id: "resumo", rotulo: "Resumo", icone: BarChart3 },
  { id: "visitas", rotulo: "Visitas", icone: ListChecks },
  { id: "cadastrados", rotulo: "Cadastrados", icone: Users },
  { id: "seguranca", rotulo: "Segurança", icone: ShieldCheck },
];

export default function VisitantesSection() {
  const [aba, setAba] = useState<Aba>("tempo-real");

  return (
    <div className="advis">
      <div>
        <h2 className="advis-titulo"><Users size={20} aria-hidden="true" /> Usuários e acessos</h2>
        <p className="advis-sub">Quem visita o site (com ou sem cadastro), de onde vem, quanto tempo fica e a gestão das contas. Só o ADM DEUS vê esta seção.</p>
      </div>

      <div className="advis-abas" role="tablist" aria-label="Seções de usuários e acessos">
        {ABAS.map(({ id, rotulo, icone: Icone }) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id} className={aba === id ? "advis-aba advis-aba--ativa" : "advis-aba"} onClick={() => setAba(id)}>
            <Icone size={16} aria-hidden="true" /> {rotulo}
          </button>
        ))}
      </div>

      {aba === "tempo-real" && <AcessosTempoReal />}
      {aba === "resumo" && <AcessosResumo />}
      {aba === "visitas" && <AcessosLista />}
      {aba === "cadastrados" && <VisitantesCadastrados />}
      {aba === "seguranca" && <SegurancaPainel />}
    </div>
  );
}
