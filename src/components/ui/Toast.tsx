"use client";

/**
 * Toast — aviso rápido único do site, agora com a biblioteca Sonner
 * ------------------------------------------------------------
 * Mesmo jeito de usar de antes (item 12), só que por baixo é o Sonner:
 *
 *   import { aviso } from "@/components/ui/Toast";
 *   aviso("sucesso", "Notícia salva");            // sucesso | erro | aviso | info
 *   aviso("info", "Link copiado", "Pronto");      // com título
 *
 *   const { mostrar } = useToast();               // jeito antigo do painel
 *   mostrar("erro", "Não foi possível salvar");
 *
 * <Avisos /> (o <Toaster /> do Sonner) fica UMA vez no layout principal:
 * embaixo à direita no computador e embaixo, na largura da tela, no celular.
 * Cores fortes (richColors), botão de fechar e some sozinho (erro fica mais).
 */

import { useCallback, type ReactNode } from "react";
import { toast, Toaster } from "sonner";

export type TipoToast = "sucesso" | "erro" | "aviso" | "info";

/** Mostra um aviso rápido no canto da tela */
export function aviso(tipo: TipoToast, mensagem: ReactNode, titulo?: string) {
  // com título: o título vira o texto principal e a mensagem a descrição
  const texto = titulo ?? mensagem;
  const opcoes = titulo ? { description: mensagem } : {};
  if (tipo === "sucesso") toast.success(texto, opcoes);
  else if (tipo === "erro") toast.error(texto, { ...opcoes, duration: 7000 });
  else if (tipo === "aviso") toast.warning(texto, opcoes);
  else toast.info(texto, opcoes);
}

/** Jeito antigo (usado nas telas do painel): continua funcionando */
export function useToast() {
  const mostrar = useCallback((tipo: TipoToast, mensagem: string) => aviso(tipo, mensagem), []);
  return { mostrar };
}

/** Área dos avisos (vai no layout principal, uma vez só) */
export function Avisos() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      duration={5000}
      visibleToasts={4}
      // acima das janelas do SweetAlert (z 2000) e das gavetas
      style={{ zIndex: 2100 }}
      toastOptions={{
        // cara da ACMRB: cantos do cartão, sombra e fonte do site
        classNames: {
          toast: "!rounded-card !shadow-pop !font-sans !text-[0.88rem]",
          title: "!font-extrabold",
          closeButton: "!bg-white !border-line",
        },
      }}
    />
  );
}
