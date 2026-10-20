"use client";

/**
 * AdminBottomNav — navegação rápida no celular (<640px)
 * ------------------------------------------------------------
 * 4 seções mais usadas (rapido: true em adminNav.ts) + "Mais", que abre
 * a gaveta com o menu completo. Alvos de toque de 56px de altura.
 */

import { MoreHorizontal } from "lucide-react";
import { ITENS_NAV, type SecaoId } from "./adminNav";
import { usePapelAdmin } from "./PapelAdmin";
import { podeVer } from "@/lib/permissions";

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

  const botao = (ativo: boolean) =>
    `flex-1 min-h-14 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2E5E4E] ${
      ativo ? "text-[#2E5E4E]" : "text-zinc-500"
    }`;

  return (
    <nav aria-label="Navegação rápida" className="admin-bottomnav sm:hidden">
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
            <span className={`w-10 h-7 rounded-full flex items-center justify-center ${ativo ? "bg-[#DDF5EC]" : ""}`}>
              <Icone size={20} aria-hidden="true" />
            </span>
            {item.rotulo}
          </button>
        );
      })}
      <button type="button" onClick={onMais} className={botao(!ativaEhRapida)} aria-label="Mais seções">
        <span className={`w-10 h-7 rounded-full flex items-center justify-center ${!ativaEhRapida ? "bg-[#DDF5EC]" : ""}`}>
          <MoreHorizontal size={20} aria-hidden="true" />
        </span>
        Mais
      </button>
    </nav>
  );
}
