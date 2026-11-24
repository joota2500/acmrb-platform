"use client";

/**
 * AdminSidebar — navegação do painel
 * ------------------------------------------------------------
 * - Computador (>=1024px): barra fixa à esquerda (16,5rem) que pode ser
 *   recolhida para só ícones (5rem). Recolhida, o nome de cada item aparece
 *   no balão (Tooltip do item 12) ao passar o mouse ou focar.
 *   A preferência fica salva no localStorage (controlado pela página).
 * - Tablet e celular (<1024px): gaveta lateral com fundo escuro. Fecha com
 *   Esc, clique fora ou ao escolher um item; trava a rolagem da página e
 *   devolve o foco ao botão que abriu.
 * - Em cima do menu: botão "Buscar seção" (abre o Ir para…, atalho Ctrl+K).
 * - Embaixo: cartão com nome, papel (ADM DEUS / Administrador) e Sair.
 * Itens agrupados (adminNav.ts), item ativo destacado e selo "em breve".
 */

import { useEffect, useRef } from "react";
import { ChevronsLeft, ChevronsRight, LogOut, Recycle, Search, X } from "lucide-react";

import { GRUPOS_NAV, type SecaoId } from "@/constants/adminNav";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import { podeVer } from "@/constants/permissoes";
import { cn } from "@/utils/cn";

// Fundo verde escuro da barra e da gaveta (o mesmo nos dois)
const FUNDO_MENU = "bg-linear-to-b from-brand-dark via-brand-dark to-[#14302a]";

// Botões pequenos do menu (recolher, fechar, expandir, sair)
const BOTAO_ICONE =
  "grid shrink-0 cursor-pointer place-items-center rounded-xl text-emerald-100 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300";

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
  onBuscar: () => void;
  /** mensagens de visitantes ainda não lidas (selo em "Mensagens") */
  naoLidas: number;
};

/** Marca + nome do painel */
function Marca({ compacta }: { compacta?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="grid size-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 text-white shadow-lg ring-1 ring-white/20"
        aria-hidden="true"
      >
        <Recycle size={24} />
      </span>
      {!compacta && (
        <span className="min-w-0 leading-tight">
          <span className="block text-lg font-black tracking-tight text-white">ACMRB</span>
          <span className="block truncate text-xs text-emerald-200/80">Painel administrativo</span>
        </span>
      )}
    </div>
  );
}

/** Botão "Buscar seção" (abre o Ir para…) */
function BotaoBuscar({ onBuscar, compacta }: { onBuscar: () => void; compacta?: boolean }) {
  if (compacta) {
    return (
      <button type="button" onClick={onBuscar} aria-label="Buscar seção (Ctrl+K)" className={cn(BOTAO_ICONE, "mx-auto mt-3 size-11")}>
        <Search size={19} aria-hidden="true" />
      </button>
    );
  }
  return (
    <div className="px-3 pt-3">
      <button
        type="button"
        onClick={onBuscar}
        className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl bg-white/8 px-3 text-sm text-emerald-100/80 ring-1 ring-white/10 transition-colors hover:bg-white/12 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300"
      >
        <Search size={16} aria-hidden="true" />
        <span className="flex-1 text-left">Buscar seção…</span>
        <kbd className="hidden rounded-md bg-white/10 lg:inline px-1.5 py-0.5 text-[10px] font-bold text-emerald-100/80">Ctrl K</kbd>
      </button>
    </div>
  );
}

/** Lista agrupada de itens (usada na barra fixa e na gaveta) */
function Menu({
  ativa,
  onSelecionar,
  compacta,
  naoLidas,
}: {
  ativa: SecaoId;
  onSelecionar: (id: SecaoId) => void;
  compacta?: boolean;
  naoLidas: number;
}) {
  // Esconde as seções sem permissão para o papel logado
  const papel = usePapelAdmin();
  const navRef = useRef<HTMLElement>(null);
  // em telas baixas (ex.: notebook 768px) o menu rola: mantém o item aberto à vista
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [ativa, compacta]);
  const grupos = GRUPOS_NAV.map((g) => ({ ...g, itens: g.itens.filter((i) => podeVer(papel, i.id)) })).filter(
    (g) => g.itens.length > 0,
  );

  return (
    <nav
      ref={navRef}
      aria-label="Seções do painel"
      className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-color:rgb(255_255_255/0.2)_transparent] [scrollbar-width:thin]"
    >
      {grupos.map((grupo) => (
        <div key={grupo.titulo} role="group" aria-label={grupo.titulo}>
          {compacta ? (
            <div className="mx-3 mb-2 h-px bg-white/10" aria-hidden="true" />
          ) : (
            <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-widest text-emerald-200/60">{grupo.titulo}</p>
          )}
          <ul className="space-y-0.5">
            {grupo.itens.map((item) => {
              const Icone = item.icone;
              const ativo = item.id === ativa;
              const temSelo = item.id === "mensagens" && naoLidas > 0;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelecionar(item.id)}
                    aria-current={ativo ? "page" : undefined}
                    // recolhida: sem texto visível → o balão do Tooltip mostra o nome
                    aria-label={compacta ? item.rotulo + (temSelo ? ` (${naoLidas} não lidas)` : "") : undefined}
                    className={cn(
                      "group relative flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300",
                      compacta ? "justify-center px-0" : "px-3",
                      ativo
                        ? "bg-white text-brand-dark shadow-md"
                        : "text-emerald-50/85 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <span
                      className={cn(
                        "relative grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
                        ativo ? "bg-brand-mint text-brand" : "group-hover:text-white",
                      )}
                    >
                      <Icone size={19} aria-hidden="true" />
                      {/* Bolinha de não lidas no modo recolhido */}
                      {compacta && temSelo && (
                        <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-red-500 ring-2 ring-brand-dark" aria-hidden="true" />
                      )}
                    </span>
                    {!compacta && (
                      <>
                        <span className={cn("flex-1 truncate text-left text-sm", ativo ? "font-extrabold" : "font-semibold")}>{item.rotulo}</span>
                        {temSelo && (
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                            {naoLidas > 99 ? "99+" : naoLidas}
                            <span className="sr-only"> não lidas</span>
                          </span>
                        )}
                        {!item.pronto && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                              ativo ? "bg-brand-mint text-brand" : "bg-white/10 text-emerald-200",
                            )}
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
function CartaoUsuario({ usuario, onSair, compacta }: { usuario: Usuario; onSair: () => void; compacta?: boolean }) {
  const inicial = (usuario.nome || "A").charAt(0).toUpperCase();
  const avatar = (
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 font-black text-white" aria-hidden="true">
      {inicial}
    </span>
  );
  if (compacta) {
    return (
      <div className="flex flex-col items-center gap-2 border-t border-white/10 p-3">
        <span data-dica={`${usuario.nome} · ${usuario.papel}`} tabIndex={0} className="rounded-xl focus-visible:outline-2 focus-visible:outline-emerald-300">
          {avatar}
        </span>
        <button type="button" onClick={onSair} aria-label="Sair do painel" className={cn(BOTAO_ICONE, "size-11 text-red-200 hover:bg-red-500/20 hover:text-red-100")}>
          <LogOut size={20} aria-hidden="true" />
        </button>
      </div>
    );
  }
  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-2xl bg-white/8 p-2.5 ring-1 ring-white/10">
        {avatar}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{usuario.nome}</p>
          <span className="mt-0.5 inline-block rounded-full bg-amber-400 px-2 py-px text-[10px] font-black uppercase tracking-wider text-ink">
            {usuario.papel}
          </span>
        </div>
        <button type="button" onClick={onSair} aria-label="Sair do painel" className={cn(BOTAO_ICONE, "size-10 text-red-200 hover:bg-red-500/20 hover:text-red-100")}>
          <LogOut size={18} aria-hidden="true" />
        </button>
      </div>
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
  onBuscar,
  naoLidas,
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
      {/* ===== Computador: barra fixa (some abaixo de 1024px) ===== */}
      <aside
        aria-label="Menu do painel"
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-(--admin-sidebar) flex-col shadow-[4px_0_24px_rgb(0_0_0/0.08)] transition-[width] duration-300 motion-reduce:transition-none lg:flex",
          FUNDO_MENU,
        )}
      >
        <div className={cn("flex h-19 shrink-0 items-center border-b border-white/10", recolhida ? "justify-center px-2" : "justify-between px-4")}>
          <Marca compacta={recolhida} />
          {!recolhida && (
            <button type="button" onClick={onAlternarRecolhida} aria-label="Recolher menu" className={cn(BOTAO_ICONE, "size-10")}>
              <ChevronsLeft size={20} aria-hidden="true" />
            </button>
          )}
        </div>
        {recolhida && (
          <button type="button" onClick={onAlternarRecolhida} aria-label="Expandir menu" className={cn(BOTAO_ICONE, "mx-auto mt-3 size-11")}>
            <ChevronsRight size={20} aria-hidden="true" />
          </button>
        )}
        <BotaoBuscar onBuscar={onBuscar} compacta={recolhida} />
        <Menu ativa={ativa} onSelecionar={onSelecionar} compacta={recolhida} naoLidas={naoLidas} />
        <CartaoUsuario usuario={usuario} onSair={onSair} compacta={recolhida} />
      </aside>

      {/* ===== Tablet/celular: gaveta ===== */}
      {gavetaAberta && (
        <div className="fixed inset-0 z-70 lg:hidden">
          <div
            className="absolute inset-0 animate-aparecer bg-black/55 backdrop-blur-xs motion-reduce:animate-none"
            onClick={onFecharGaveta}
            aria-hidden="true"
          />
          <div
            id="admin-gaveta"
            role="dialog"
            aria-modal="true"
            aria-label="Menu do painel"
            className={cn(
              "absolute inset-y-0 left-0 flex w-[min(320px,86vw)] animate-entrar-esquerda flex-col overscroll-contain pb-[env(safe-area-inset-bottom)] shadow-[8px_0_40px_rgb(0_0_0/0.35)] motion-reduce:animate-none",
              FUNDO_MENU,
            )}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
              <Marca />
              <button ref={fecharRef} type="button" onClick={onFecharGaveta} aria-label="Fechar menu" className={cn(BOTAO_ICONE, "size-11")}>
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <BotaoBuscar
              onBuscar={() => {
                onFecharGaveta();
                onBuscar();
              }}
            />
            <Menu ativa={ativa} onSelecionar={escolherNaGaveta} naoLidas={naoLidas} />
            <CartaoUsuario
              usuario={usuario}
              onSair={() => {
                onFecharGaveta();
                onSair();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
