"use client";

/**
 * AdminSidebar — navegação do painel
 * ------------------------------------------------------------
 * - Desktop (>=1024px): barra fixa à esquerda, 260px, que pode ser
 *   recolhida para só ícones (80px). A preferência fica salva no
 *   localStorage (controlado pela página).
 * - Tablet e celular (<1024px): gaveta lateral (off-canvas) com fundo
 *   escuro. Fecha com Esc, clique fora ou ao escolher um item; trava a
 *   rolagem da página e devolve o foco ao botão que abriu.
 * Itens agrupados (adminNav.ts), com estado ativo, foco visível e selo
 * "em breve" nas seções ainda não implementadas.
 */

import { useEffect, useRef } from "react";
import { ChevronsLeft, ChevronsRight, LogOut, X } from "lucide-react";

import { GRUPOS_NAV, type SecaoId } from "./adminNav";
import { usePapelAdmin } from "./PapelAdmin";
import { podeVer } from "@/lib/permissions";
import { useChatNaoLidas } from "@/hooks/useChatNaoLidas";

interface Usuario {
  nome: string;
  email: string;
  papel: string;
}

type Props = {
  ativa: SecaoId;
  onSelecionar: (id: SecaoId) => void;
  recolhida: boolean;
  onAlternarRecolhida: () => void;
  gavetaAberta: boolean;
  onFecharGaveta: () => void;
  usuario: Usuario;
  onSair: () => void;
};

/** Marca + nome do painel */
function Marca({ compacta }: { compacta?: boolean }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span
        className="w-11 h-11 shrink-0 rounded-2xl bg-linear-to-br from-emerald-500 to-[#2E5E4E] text-white flex items-center justify-center text-2xl shadow-lg"
        aria-hidden="true"
      >
        ♻
      </span>
      {!compacta && (
        <span className="min-w-0 leading-tight">
          <span className="block font-black text-white text-lg tracking-tight">ACMRB</span>
          <span className="block text-xs text-emerald-200/80 truncate">Painel administrativo</span>
        </span>
      )}
    </div>
  );
}

/** Lista agrupada de itens (usada na barra fixa e na gaveta) */
function Menu({
  ativa,
  onSelecionar,
  compacta,
}: {
  ativa: SecaoId;
  onSelecionar: (id: SecaoId) => void;
  compacta?: boolean;
}) {
  // Esconde as seções sem permissão para o papel logado
  const papel = usePapelAdmin();
  // Total de mensagens de visitantes ainda não lidas (selo em "Mensagens")
  const naoLidas = useChatNaoLidas(podeVer(papel, "mensagens"));
  const grupos = GRUPOS_NAV.map((g) => ({ ...g, itens: g.itens.filter((i) => podeVer(papel, i.id)) })).filter(
    (g) => g.itens.length > 0,
  );

  return (
    <nav aria-label="Seções do painel" className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {grupos.map((grupo) => (
        <div key={grupo.titulo}>
          {compacta ? (
            <div className="mx-3 mb-2 h-px bg-white/10" aria-hidden="true" />
          ) : (
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-200/60">
              {grupo.titulo}
            </p>
          )}
          <ul className="space-y-1">
            {grupo.itens.map((item) => {
              const Icone = item.icone;
              const ativo = item.id === ativa;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelecionar(item.id)}
                    aria-current={ativo ? "page" : undefined}
                    title={compacta ? item.rotulo : undefined}
                    aria-label={compacta ? item.rotulo : undefined}
                    className={`group w-full min-h-11 rounded-xl flex items-center gap-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                      compacta ? "justify-center px-0" : "px-3"
                    } ${
                      ativo
                        ? "bg-white text-[#21463A] shadow-md"
                        : "text-emerald-50/85 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="relative shrink-0">
                      <Icone size={20} aria-hidden="true" />
                      {/* Bolinha de não lidas no modo recolhido */}
                      {compacta && item.id === "mensagens" && naoLidas > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#21463A]" aria-hidden="true" />
                      )}
                    </span>
                    {!compacta && (
                      <>
                        <span className="flex-1 text-left text-sm font-semibold truncate">
                          {item.rotulo}
                        </span>
                        {item.id === "mensagens" && naoLidas > 0 && (
                          <span
                            className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center"
                            aria-label={`${naoLidas} não lidas`}
                          >
                            {naoLidas > 99 ? "99+" : naoLidas}
                          </span>
                        )}
                        {!item.pronto && (
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              ativo ? "bg-[#DDF5EC] text-[#2E5E4E]" : "bg-white/10 text-emerald-200"
                            }`}
                          >
                            em breve
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Cartão do usuário + sair */
function CartaoUsuario({
  usuario,
  onSair,
  compacta,
}: {
  usuario: Usuario;
  onSair: () => void;
  compacta?: boolean;
}) {
  const inicial = (usuario.nome || "A").charAt(0).toUpperCase();
  if (compacta) {
    return (
      <div className="p-3 border-t border-white/10 flex flex-col items-center gap-2">
        <span className="w-11 h-11 rounded-2xl bg-emerald-500 text-white font-black flex items-center justify-center" title={usuario.nome}>
          {inicial}
        </span>
        <button
          type="button"
          onClick={onSair}
          aria-label="Sair do painel"
          title="Sair do painel"
          className="w-11 h-11 rounded-xl text-red-200 hover:bg-red-500/20 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-red-300"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }
  return (
    <div className="p-3 border-t border-white/10">
      <div className="rounded-2xl bg-white/5 p-3 flex items-center gap-3">
        <span className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-500 text-white font-black flex items-center justify-center text-lg">
          {inicial}
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-amber-400 text-[#111827] px-2 py-0.5 rounded-full">
            {usuario.papel}
          </span>
          <p className="mt-1 text-sm font-bold text-white truncate">{usuario.nome}</p>
          <p className="text-xs text-emerald-200/70 truncate" title={usuario.email}>
            {usuario.email}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onSair}
        className="mt-2 w-full min-h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-red-100 bg-red-500/15 hover:bg-red-500/30 focus-visible:outline-2 focus-visible:outline-red-300"
      >
        <LogOut size={18} aria-hidden="true" /> Sair do painel
      </button>
    </div>
  );
}

export default function AdminSidebar({
  ativa,
  onSelecionar,
  recolhida,
  onAlternarRecolhida,
  gavetaAberta,
  onFecharGaveta,
  usuario,
  onSair,
}: Props) {
  const fecharRef = useRef<HTMLButtonElement>(null);

  // Gaveta: Esc fecha, trava rolagem, foco no botão fechar (e volta ao sair)
  useEffect(() => {
    if (!gavetaAberta) return;
    const anterior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fecharRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFecharGaveta();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [gavetaAberta, onFecharGaveta]);

  const escolherNaGaveta = (id: SecaoId) => {
    onSelecionar(id);
    onFecharGaveta();
  };

  return (
    <>
      {/* ===== Desktop: barra fixa (some abaixo de 1024px) ===== */}
      <aside className="admin-sidebar" aria-label="Menu do painel">
        <div className={`h-20 flex items-center border-b border-white/10 ${recolhida ? "justify-center px-2" : "justify-between px-4"}`}>
          <Marca compacta={recolhida} />
          {!recolhida && (
            <button
              type="button"
              onClick={onAlternarRecolhida}
              aria-label="Recolher menu"
              title="Recolher menu"
              className="w-10 h-10 rounded-xl text-emerald-100 hover:bg-white/10 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-emerald-300"
            >
              <ChevronsLeft size={20} />
            </button>
          )}
        </div>
        {recolhida && (
          <button
            type="button"
            onClick={onAlternarRecolhida}
            aria-label="Expandir menu"
            title="Expandir menu"
            className="mx-auto mt-3 w-11 h-11 rounded-xl text-emerald-100 hover:bg-white/10 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-emerald-300"
          >
            <ChevronsRight size={20} />
          </button>
        )}
        <Menu ativa={ativa} onSelecionar={onSelecionar} compacta={recolhida} />
        <CartaoUsuario usuario={usuario} onSair={onSair} compacta={recolhida} />
      </aside>

      {/* ===== Tablet/celular: gaveta ===== */}
      {gavetaAberta && (
        <div className="admin-gaveta lg:hidden">
          <div className="admin-gaveta__fundo" onClick={onFecharGaveta} aria-hidden="true" />
          <div
            id="admin-gaveta"
            role="dialog"
            aria-modal="true"
            aria-label="Menu do painel"
            className="admin-gaveta__painel"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
              <Marca />
              <button
                ref={fecharRef}
                type="button"
                onClick={onFecharGaveta}
                aria-label="Fechar menu"
                className="w-11 h-11 rounded-xl text-emerald-100 hover:bg-white/10 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-emerald-300"
              >
                <X size={22} />
              </button>
            </div>
            <Menu ativa={ativa} onSelecionar={escolherNaGaveta} />
            <CartaoUsuario usuario={usuario} onSair={() => { onFecharGaveta(); onSair(); }} />
          </div>
        </div>
      )}
    </>
  );
}
