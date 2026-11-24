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
const CAPTCHA_ATIVO = CHAVE_SITE.length > 0;

export const MSG_CAPTCHA = "Confirme que você não é um robô (marque a caixinha da verificação).";

/** Mensagem curta para erro do captcha nas telas da conta (Minha conta / Segurança) */
export const MSG_CAPTCHA_FALHOU = "Falha na verificação de segurança, recarregue a página e tente de novo.";

/** Mensagem quando o Supabase recusa o login/cadastro por causa do captcha */
export const MSG_CAPTCHA_RECUSADO =
  "A verificação “não sou um robô” não foi aceita. Recarregue a página e marque a caixinha de novo. Se continuar, desative extensões/VPN ou use outro navegador.";

/** O erro do Supabase Auth foi por causa do captcha? (ex.: captcha_failed) */
export function ehErroCaptcha(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  return /captcha|110\d{3}/i.test(error.code ?? "") || /captcha|110\d{3}/i.test(error.message ?? "");
}

/** Traduz o código de erro do Turnstile para o visitante (doc: Cloudflare → Turnstile → Error codes) */
function mensagemDoErro(codigo: string): string {
  const familia = codigo.slice(0, 3);
  if (familia === "110" && codigo !== "110600" && codigo !== "110620")
    return `A verificação não está liberada para este endereço (código ${codigo}). Abra o site pelo endereço oficial.`;
  if (familia === "400") return `A verificação está mal configurada (código ${codigo}). Avise a ACMRB pelo contato do site.`;
  if (codigo === "200500") return `A caixinha do Cloudflare foi bloqueada (código ${codigo}). Desative bloqueadores de anúncio para este site e recarregue.`;
  if (codigo === "200100") return `O relógio do seu aparelho parece errado (código ${codigo}). Acerte a data/hora e recarregue.`;
  if (familia === "300" || familia === "600")
    return `O Cloudflare não conseguiu confirmar que você é humano (código ${codigo}). Clique em “Tentar de novo”; se continuar, desative extensões/VPN ou use outro navegador.`;
  return `Não foi possível concluir a verificação (código ${codigo}). Clique em “Tentar de novo”.`;
}

const MSG_SEM_SCRIPT =
  "Não foi possível carregar a verificação do Cloudflare. Confira sua internet ou desative bloqueadores e recarregue a página.";

/* Tipos mínimos do script do Turnstile (window.turnstile) */
interface OpcoesTurnstile {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": (codigo: string) => boolean | void;
  "timeout-callback"?: () => void;
  "refresh-expired"?: "auto" | "manual" | "never";
  appearance?: "always" | "execute" | "interaction-only";
  retry?: "auto" | "never";
  "retry-interval"?: number;
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

// Carrega o script do Cloudflare uma vez só (vale para a página toda).
// Se o script já estiver na página (outra tela carregou), só espera ele ficar pronto.
let carregandoScript: Promise<void> | null = null;
function carregarScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!carregandoScript) {
    carregandoScript = new Promise((ok, falha) => {
      const existente = document.querySelector<HTMLScriptElement>('script[data-turnstile="1"]');
      if (existente) existente.remove(); // tentativa anterior que falhou
      const s = document.createElement("script");
      s.dataset.turnstile = "1";
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
  // mensagem quando o quadrinho falhou de vez (null = tudo certo)
  const [falha, setFalha] = useState<string | null>(null);

  const resetar = useCallback(() => {
    setToken(null);
    setFalha(null);
    setVersao((v) => v + 1);
  }, []);

  return {
    ativo: CAPTCHA_ATIVO,
    // undefined quando o captcha está desligado (o Supabase ignora)
    token: token ?? undefined,
    // pode enviar? Sem captcha sempre pode. Se o quadrinho falhou de vez,
    // também deixa enviar: quem decide é o Supabase (se o captcha estiver
    // desligado lá, o login funciona; se estiver ligado, ele recusa e a
    // tela mostra MSG_CAPTCHA_RECUSADO). Assim ninguém fica preso na tela.
    pronto: !CAPTCHA_ATIVO || !!token || falha !== null,
    falha,
    setFalha,
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
  const { setToken, setFalha, falha, versao, resetar } = controle;

  useEffect(() => {
    if (!CAPTCHA_ATIVO || !caixa.current) return;
    let id: string | null = null;
    let ativo = true;
    let erros = 0;
    setFalha(null);

    // se o script do Cloudflare não chegar em 20s (rede ruim ou bloqueador), avisa
    const limite = setTimeout(() => {
      if (ativo && !window.turnstile) setFalha(MSG_SEM_SCRIPT);
    }, 20000);

    carregarScript()
      .then(() => {
        if (!ativo || !caixa.current || !window.turnstile) return;
        caixa.current.innerHTML = ""; // garante que não sobrou quadrinho antigo
        id = window.turnstile.render(caixa.current, {
          sitekey: CHAVE_SITE,
          language: "pt-br",
          theme: "light",
          size: "flexible",
          appearance: "always", // sempre mostra o quadrinho (nunca fica invisível)
          retry: "auto",
          "retry-interval": 4000,
          "refresh-expired": "auto",
          callback: (t) => {
            erros = 0;
            setFalha(null); // deu certo: some qualquer aviso antigo
            setToken(t);
          },
          "expired-callback": () => setToken(null), // código vence em ~5 min
          "timeout-callback": () => setToken(null),
          "error-callback": (codigo) => {
            erros += 1;
            setToken(null);
            // o código aparece no console (F12) para ajudar no suporte
            console.warn("[captcha] Turnstile erro", codigo, "tentativa", erros);
            const fatal = /^(110[12]|400)/.test(String(codigo));
            // erros passageiros: deixa o próprio Turnstile tentar de novo 2 vezes antes de avisar
            if (!fatal && erros <= 2) return false;
            setFalha(mensagemDoErro(String(codigo)));
            return true;
          },
        });
      })
      .catch(() => ativo && setFalha(MSG_SEM_SCRIPT));

    // ao sair (ou ao resetar), apaga o quadrinho antigo
    return () => {
      ativo = false;
      clearTimeout(limite);
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [versao, setToken, setFalha]);

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
      {falha && (
        <p role="alert" className="text-xs leading-snug text-danger">
          {falha}{" "}
          <button type="button" onClick={resetar} className="cursor-pointer font-bold underline">
            Tentar de novo
          </button>
        </p>
      )}
    </div>
  );
}
