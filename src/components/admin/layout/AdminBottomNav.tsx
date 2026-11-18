"use client";

/**
 * AdminBottomNav — navegação rápida no celular (<640px)
 * ------------------------------------------------------------
 * 4 seções mais usadas (rapido: true em adminNav.ts) + "Mais", que abre
 * a gaveta com o menu completo. Alvos de toque de 56px de altura.
 */

import { MoreHorizontal } from "lucide-react";
import { ITENS_NAV, type SecaoId } from "@/constants/adminNav";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import { podeVer } from "@/constants/permissoes";
import { cn } from "@/utils/cn";

type Props = {
  ativa: SecaoId;
  onSelecionar: (id: SecaoId) => void;
  onMais: () => void;
};

export default function AdminBottomNav({ ativa, onSelecionar, onMais }: Props) {
  const papel = usePapelAdmin();
  // Atalhos só das seções permitidas ao papel logado
  const rapidos = ITENS_NAV.filter((i) => i.rapido && podeVer(papel, i.id));
  const ativaEhRapida = rapidos.some((i) => i.id === ativa);

  // Classes do botão (texto verde quando ativo) e da "pílula" atrás do ícone
  const botao = (ativo: boolean) =>
    cn(
      "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 pt-1 text-[11px] font-semibold transition-colors",
      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
      ativo ? "text-brand" : "text-ink-muted hover:text-brand",
    );
  const pilula = (ativo: boolean) =>
    cn(
      "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
      ativo ? "bg-brand-mint" : "bg-transparent",
    );

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-35 flex rounded-t-3xl border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(4_120_87/0.08)] backdrop-blur-xl sm:hidden"
    >
      {rapidos.map((item) => {
        const Icone = item.icone;
        const ativo = item.id === ativa;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelecionar(item.id)}
            aria-current={ativo ? "page" : undefined}
            className={botao(ativo)}
          >
            <span className={pilula(ativo)}>
              <Icone size={20} aria-hidden="true" />
            </span>
            {item.rotulo}
          </button>
        );
      })}
      <button type="button" onClick={onMais} className={botao(!ativaEhRapida)} aria-label="Mais seções">
        <span className={pilula(!ativaEhRapida)}>
          <MoreHorizontal size={20} aria-hidden="true" />
        </span>
        Mais
      </button>
    </nav>
  );
}
