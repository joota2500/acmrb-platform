"use client";

/**
 * AdminSidebar — navegação do painel
 * ------------------------------------------------------------
 * - Desktop (>=1024px): barra fixa à esquerda, 16,5rem, que pode ser
 *   recolhida para só ícones (5rem). A preferência fica salva no
 *   localStorage (controlado pela página). A largura vem da variável
 *   --admin-sidebar definida no AdminContainer.
 * - Tablet e celular (<1024px): gaveta lateral (off-canvas) com fundo
 *   escuro. Fecha com Esc, clique fora ou ao escolher um item; trava a
 *   rolagem da página e devolve o foco ao botão que abriu.
 * Itens agrupados (adminNav.ts), com estado ativo, foco visível e selo
 * "em breve" nas seções ainda não implementadas.
 */

import { useEffect, useRef } from "react";
import { ChevronsLeft, ChevronsRight, LogOut, Recycle, X } from "lucide-react";

import { GRUPOS_NAV, type SecaoId } from "@/constants/adminNav";
import { usePapelAdmin } from "@/components/admin/layout/PapelAdmin";
import { podeVer } from "@/constants/permissoes";
import { useChatNaoLidas } from "@/hooks/useChatNaoLidas";
import { cn } from "@/utils/cn";

// Fundo verde escuro da barra e da gaveta (o mesmo nos dois)
const FUNDO_MENU = "bg-linear-to-b from-brand-dark via-brand-dark to-[#14302a]";

// Botões pequenos redondos do menu (recolher, fechar, expandir)
const BOTAO_ICONE =
  "flex shrink-0 items-center justify-center rounded-xl text-emerald-100 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-emerald-300";

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
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 text-white shadow-lg ring-1 ring-white/20"
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
    <nav aria-label="Seções do painel" className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-color:rgb(255_255_255/0.2)_transparent] [scrollbar-width:thin]">
      {grupos.map((grupo) => (
        <div key={grupo.titulo}>
          {compacta ? (
            <div className="mx-3 mb-2 h-px bg-white/10" aria-hidden="true" />
          ) : (
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-emerald-200/70">
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
                    className={cn(
                      "group relative flex min-h-11 w-full items-center gap-3 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300",
                      compacta ? "justify-center px-0" : "px-3",
                      ativo
                        ? "bg-white/15 text-white shadow-sm ring-1 ring-white/15"
                        : "text-emerald-50/85 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {/* Barrinha verde que marca o item da seção aberta */}
                    {ativo && (
                      <span className="absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-emerald-300" aria-hidden="true" />
                    )}
                    <span className={cn("relative shrink-0 transition-colors", ativo && "text-emerald-300")}>
                      <Icone size={20} aria-hidden="true" />
                      {/* Bolinha de não lidas no modo recolhido */}
                      {compacta && item.id === "mensagens" && naoLidas > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-brand-dark" aria-hidden="true" />
                      )}
                    </span>
                    {!compacta && (
                      <>
                        <span className="flex-1 truncate text-left text-sm font-semibold">
                          {item.rotulo}
                        </span>
                        {item.id === "mensagens" && naoLidas > 0 && (
                          <span
                            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white"
                            aria-label={`${naoLidas} não lidas`}
                          >
                            {naoLidas > 99 ? "99+" : naoLidas}
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
      <div className="flex flex-col items-center gap-2 border-t border-white/10 p-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 font-black text-white" title={usuario.nome}>
          {inicial}
        </span>
        <button
          type="button"
          onClick={onSair}
          aria-label="Sair do painel"
          title="Sair do painel"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-red-200 transition-colors hover:bg-red-500/20 focus-visible:outline-2 focus-visible:outline-red-300"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }
  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 text-lg font-black text-white">
          {inicial}
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-ink">
            {usuario.papel}
          </span>
          <p className="mt-1 truncate text-sm font-bold text-white">{usuario.nome}</p>
          <p className="text-xs text-emerald-200/70 truncate" title={usuario.email}>
            {usuario.email}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onSair}
        className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500/15 text-sm font-bold text-red-100 transition-colors hover:bg-red-500/30 focus-visible:outline-2 focus-visible:outline-red-300"
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
      <aside
        aria-label="Menu do painel"
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-(--admin-sidebar) flex-col shadow-[4px_0_24px_rgb(0_0_0/0.08)] transition-[width] duration-300 motion-reduce:transition-none lg:flex",
          FUNDO_MENU,
        )}
      >
        <div className={cn("flex h-20 items-center border-b border-white/10", recolhida ? "justify-center px-2" : "justify-between px-4")}>
          <Marca compacta={recolhida} />
          {!recolhida && (
            <button
              type="button"
              onClick={onAlternarRecolhida}
              aria-label="Recolher menu"
              title="Recolher menu"
              className={cn(BOTAO_ICONE, "h-10 w-10")}
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
            className={cn(BOTAO_ICONE, "mx-auto mt-3 h-11 w-11")}
          >
            <ChevronsRight size={20} />
          </button>
        )}
        <Menu ativa={ativa} onSelecionar={onSelecionar} compacta={recolhida} />
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
              "absolute inset-y-0 left-0 flex w-[min(300px,86vw)] animate-entrar-esquerda flex-col overscroll-contain shadow-[8px_0_40px_rgb(0_0_0/0.35)] motion-reduce:animate-none",
              FUNDO_MENU,
            )}
          >
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
              <Marca />
              <button
                ref={fecharRef}
                type="button"
                onClick={onFecharGaveta}
                aria-label="Fechar menu"
                className={cn(BOTAO_ICONE, "h-11 w-11")}
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
