"use client";

/**
 * Captcha — "Não sou um robô" do Cloudflare Turnstile
 * ------------------------------------------------------------
 * Só liga quando existe a variável NEXT_PUBLIC_TURNSTILE_SITE_KEY.
 * Sem ela, o componente não mostra nada e o login funciona como antes
 * (assim o site não quebra antes de configurar o Turnstile).
 *
 * Como usar num formulário:
 *   const captcha = useCaptcha();
 *   ...
 *   if (!captcha.pronto) return avisar(MSG_CAPTCHA);
 *   await supabase.auth.signInWithPassword({ email, password, options: { captchaToken: captcha.token } });
 *   captcha.resetar(); // cada código só vale UMA vez
 *   ...
 *   <Captcha controle={captcha} />
 *
 * O Supabase confere o código com o Cloudflare (a chave secreta fica
 * no painel do Supabase, nunca no site).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

// Chave pública do site no Turnstile (pode ficar no navegador)
const CHAVE_SITE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
export const CAPTCHA_ATIVO = CHAVE_SITE.length > 0;

export const MSG_CAPTCHA = "Confirme a verificação “não sou um robô” antes de continuar.";

/* Tipos mínimos do script do Turnstile (window.turnstile) */
interface OpcoesTurnstile {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  "timeout-callback"?: () => void;
  "refresh-expired"?: "auto" | "manual" | "never";
  appearance?: "always" | "execute" | "interaction-only";
  language?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
}
interface Turnstile {
  render: (el: HTMLElement, opcoes: OpcoesTurnstile) => string;
  remove: (id: string) => void;
}
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

// Carrega o script do Cloudflare uma vez só (vale para a página toda)
let carregandoScript: Promise<void> | null = null;
function carregarScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!carregandoScript) {
    carregandoScript = new Promise((ok, falha) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => ok();
      s.onerror = () => {
        carregandoScript = null; // deixa tentar de novo depois
        falha(new Error("não carregou o Turnstile"));
      };
      document.head.appendChild(s);
    });
  }
  return carregandoScript;
}

/** Estado do captcha de um formulário */
export function useCaptcha() {
  const [token, setToken] = useState<string | null>(null);
  const [versao, setVersao] = useState(0); // muda → o quadrinho é recriado

  const resetar = useCallback(() => {
    setToken(null);
    setVersao((v) => v + 1);
  }, []);

  return {
    ativo: CAPTCHA_ATIVO,
    // undefined quando o captcha está desligado (o Supabase ignora)
    token: token ?? undefined,
    // pode enviar? (sem captcha sempre pode)
    pronto: !CAPTCHA_ATIVO || !!token,
    setToken,
    versao,
    resetar,
  };
}

export type ControleCaptcha = ReturnType<typeof useCaptcha>;

type Props = {
  controle: ControleCaptcha;
  className?: string;
};

export default function Captcha({ controle, className }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const [falhou, setFalhou] = useState(false);
  const { setToken, versao } = controle;

  useEffect(() => {
    if (!CAPTCHA_ATIVO || !caixa.current) return;
    let id: string | null = null;
    let ativo = true;
    setFalhou(false);

    // se o script do Cloudflare não chegar em 15s (rede ruim ou bloqueador), avisa
    const limite = setTimeout(() => ativo && !window.turnstile && setFalhou(true), 15000);

    carregarScript()
      .then(() => {
        if (!ativo || !caixa.current || !window.turnstile) return;
        id = window.turnstile.render(caixa.current, {
          sitekey: CHAVE_SITE,
          language: "pt-br",
          theme: "light",
          size: "flexible",
          appearance: "always", // sempre mostra o quadrinho (nunca fica invisível)
          "refresh-expired": "auto",
          callback: (t) => setToken(t),
          "expired-callback": () => setToken(null), // código vence em ~5 min
          "timeout-callback": () => setToken(null),
          "error-callback": () => {
            setToken(null);
            setFalhou(true);
          },
        });
      })
      .catch(() => ativo && setFalhou(true));

    // ao sair (ou ao resetar), apaga o quadrinho antigo
    return () => {
      ativo = false;
      clearTimeout(limite);
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [versao, setToken]);

  if (!CAPTCHA_ATIVO) return null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="relative min-h-[65px] w-full">
        {/* aparece enquanto o Cloudflare não desenha a caixinha por cima */}
        <span className="absolute inset-0 flex items-center gap-2 rounded-lg border border-dashed border-line bg-surface-alt px-3 text-xs text-ink-muted">
          <span className="size-3.5 animate-spin rounded-full border-2 border-brand/30 border-t-brand" aria-hidden="true" />
          Carregando verificação “não sou um robô”…
        </span>
        {/* o Cloudflare desenha a caixinha aqui dentro */}
        <div ref={caixa} className="relative min-h-[65px] w-full" />
      </div>
      {falhou && (
        <p role="alert" className="text-xs text-danger">
          Não foi possível carregar a verificação. Confira sua internet ou desative bloqueadores e recarregue a página.
        </p>
      )}
    </div>
  );
}
