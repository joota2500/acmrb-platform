"use client";

/**
 * ExtrasVisitante — elementos fixos para o VISITANTE logado (layout raiz)
 * ------------------------------------------------------------
 *  1. Aviso gentil de contato: se o telefone/WhatsApp estiver vazio ou
 *     inválido, mostra um cartão no canto pedindo para completar em
 *     /minha-conta. "Agora não" esconde até a próxima sessão do navegador.
 *  2. Botão flutuante de chat → /mensagens, com selo de não lidas.
 * Não aparece em /admin, /login, /mensagens (botão) e /minha-conta (aviso).
 * CSS: src/styles/extras-visitante.css (prefixo "xvis").
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, PhoneCall, X } from "lucide-react";
import "@/styles/extras-visitante.css";
import { useAuth } from "@/contexts/AuthContext";
import { precisaContato } from "@/lib/contaVisitante";
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

  return (
    <>
      {mostrarAviso && (
        <aside className="xvis-aviso" role="dialog" aria-labelledby="xvis-aviso-titulo" aria-live="polite">
          <button
            type="button"
            className="xvis-aviso__fechar"
            aria-label="Fechar aviso"
            onClick={() => {
              sessionStorage.setItem(CHAVE_ADIADO, "1");
              setAdiado(true);
            }}
          >
            <X size={16} aria-hidden="true" />
          </button>
          <span className="xvis-aviso__icone" aria-hidden="true"><PhoneCall size={18} /></span>
          <div className="xvis-aviso__corpo">
            <p id="xvis-aviso-titulo" className="xvis-aviso__titulo">Deixe um contato para a equipe</p>
            <p className="xvis-aviso__texto">Informe seu telefone/WhatsApp para a ACMRB poder falar com você sobre coletas e mensagens.</p>
            <div className="xvis-aviso__acoes">
              <Link href="/minha-conta" className="xvis-aviso__btn">Completar agora</Link>
              <button
                type="button"
                className="xvis-aviso__depois"
                onClick={() => {
                  sessionStorage.setItem(CHAVE_ADIADO, "1");
                  setAdiado(true);
                }}
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
          className="xvis-fab"
          aria-label={naoLidas ? `Mensagens: ${naoLidas} não lida${naoLidas > 1 ? "s" : ""}` : "Falar com a equipe ACMRB"}
          title="Falar com a equipe"
        >
          <MessageCircle size={26} aria-hidden="true" />
          {naoLidas > 0 && <span className="xvis-fab__selo" aria-hidden="true">{naoLidas > 9 ? "9+" : naoLidas}</span>}
        </Link>
      )}
    </>
  );
}
