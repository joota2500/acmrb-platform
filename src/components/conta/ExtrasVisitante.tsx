"use client";

/**
 * ExtrasVisitante — elementos fixos para o VISITANTE logado (layout raiz)
 * ------------------------------------------------------------
 *  1. Aviso gentil de contato: se o telefone/WhatsApp estiver vazio ou
 *     inválido, mostra um cartão no canto pedindo para completar em
 *     /minha-conta. "Agora não" esconde até a próxima sessão do navegador.
 *  2. Botão flutuante de chat → /mensagens, com selo de não lidas.
 * Não aparece em /admin, /login, /mensagens (botão) e /minha-conta (aviso).
 * Visual: Tailwind.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, PhoneCall, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { precisaContato } from "@/services/contaVisitante";
import { useChatNaoLidas } from "@/hooks/useChatNaoLidas";

const CHAVE_ADIADO = "acmrb-aviso-contato-adiado";

export default function ExtrasVisitante() {
  const { user, perfil, loading } = useAuth();
  const caminho = usePathname() ?? "/";
  const visitante = !loading && !!user && perfil?.tipo === "visitante";
  const naoLidas = useChatNaoLidas(visitante);
  const [faltaContato, setFaltaContato] = useState(false);
  const [adiado, setAdiado] = useState(true);

  useEffect(() => {
    setAdiado(sessionStorage.getItem(CHAVE_ADIADO) === "1");
  }, []);

  useEffect(() => {
    if (!visitante || !user) return setFaltaContato(false);
    const verificar = () => void precisaContato(user.id).then(setFaltaContato);
    verificar();
    // /minha-conta avisa quando salva
    window.addEventListener("acmrb-conta-atualizada", verificar);
    return () => window.removeEventListener("acmrb-conta-atualizada", verificar);
  }, [visitante, user]);

  const oculto = caminho.startsWith("/admin") || caminho.startsWith("/login");
  if (!visitante || oculto) return null;

  const mostrarAviso = faltaContato && !adiado && !caminho.startsWith("/minha-conta");
  const mostrarBotao = !caminho.startsWith("/mensagens");

  const adiar = () => {
    sessionStorage.setItem(CHAVE_ADIADO, "1");
    setAdiado(true);
  };

  return (
    <>
      {mostrarAviso && (
        <aside
          className="fixed bottom-22.5 right-5 z-901 flex w-[min(22rem,calc(100vw-2rem))] animate-subir gap-3 rounded-2xl border border-brand-mint bg-white py-4 pl-3.5 pr-4 shadow-[0_16px_40px_rgb(33_70_58/0.2)] motion-reduce:animate-none max-[480px]:bottom-20 max-[480px]:left-4 max-[480px]:right-4 max-[480px]:w-auto"
          role="dialog"
          aria-labelledby="xvis-aviso-titulo"
          aria-live="polite"
        >
          <button
            type="button"
            className="absolute right-[0.45rem] top-[0.45rem] flex size-[1.9rem] cursor-pointer items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
            aria-label="Fechar aviso"
            onClick={adiar}
          >
            <X size={16} aria-hidden="true" />
          </button>
          <span className="flex size-[2.4rem] shrink-0 items-center justify-center rounded-[0.8rem] bg-brand-soft text-brand" aria-hidden="true">
            <PhoneCall size={18} />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5 pr-5">
            <p id="xvis-aviso-titulo" className="m-0 text-left text-[0.95rem] font-extrabold text-brand-dark">Deixe um contato para a equipe</p>
            <p className="m-0 text-left text-[0.84rem] leading-snug text-zinc-600 hyphens-none">Informe seu telefone/WhatsApp para a ACMRB poder falar com você sobre coletas e mensagens.</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3.5 gap-y-2">
              <Button href="/minha-conta" tamanho="pequeno" className="min-h-[2.4rem] rounded-xl font-extrabold">Completar agora</Button>
              <button
                type="button"
                className="min-h-[2.4rem] cursor-pointer text-[0.82rem] font-bold text-zinc-600 hover:text-brand-dark hover:underline"
                onClick={adiar}
              >
                Agora não
              </button>
            </div>
          </div>
        </aside>
      )}

      {mostrarBotao && (
        <Link
          href="/mensagens"
          className="fixed bottom-5 right-5 z-900 flex size-14.5 items-center justify-center rounded-full bg-brand text-white no-underline shadow-[0_10px_25px_rgb(33_70_58/0.35)] transition hover:-translate-y-0.5 hover:bg-brand-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-mint motion-reduce:transition-none max-[480px]:bottom-4 max-[480px]:right-4 max-[480px]:size-13"
          aria-label={naoLidas ? `Mensagens: ${naoLidas} não lida${naoLidas > 1 ? "s" : ""}` : "Falar com a equipe ACMRB"}
          title="Falar com a equipe"
        >
          <MessageCircle size={26} aria-hidden="true" />
          {naoLidas > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[1.35rem] min-w-[1.35rem] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[0.72rem] font-extrabold text-white" aria-hidden="true">
              {naoLidas > 9 ? "9+" : naoLidas}
            </span>
          )}
        </Link>
      )}
    </>
  );
}
