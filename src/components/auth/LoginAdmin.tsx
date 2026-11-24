"use client";

/**
 * LoginAdmin — tela de login do painel (usada em dois endereços)
 * ------------------------------------------------------------
 *  - modo "admin": /admin/login → aceita admin ou deus.
 *  - modo "deus":  login do ADM DEUS (ver src/constants/rotasAcesso.ts)
 *                  → só aceita admins.role = "deus".
 * Passos ao clicar em Entrar:
 *  1. podeTentar("login"): limite de tentativas (rota /api/seguranca/login).
 *  2. signInWithPassword (Supabase Auth).
 *  3. /api/admin/verificar confere NO SERVIDOR se é admin ativo (e deus,
 *     no modo deus). Se não for: registra a falha, faz signOut e mostra
 *     a MESMA mensagem de senha errada (não revela se a conta existe).
 *  4. Deu certo: registra o acerto e atualiza ultimo_login.
 *  5. MfaPortao pede o código do app autenticador (se a conta tiver) e
 *     só então leva para /admin.
 * "Esqueci minha senha" envia o link de redefinição (mensagem neutra).
 * Avisos com SweetAlert2 (src/utils/alertas.ts).
 */

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

import Button from "@/components/ui/Button";
import Captcha, { MSG_CAPTCHA, useCaptcha } from "@/components/ui/Captcha";
import Campo from "@/components/ui/Campo";
import Input from "@/components/ui/Input";
import MfaPortao from "@/components/admin/MfaPortao";
import { supabase } from "@/lib/supabase";
import { podeTentar, registrarResultado } from "@/services/loginSeguro";
import { ESPERA_EMAIL_SEG, urlRedefinir } from "@/services/apiAdmin";
import { avisar } from "@/utils/alertas";
import { cn } from "@/utils/cn";

type Modo = "admin" | "deus";

/** Mensagem única para qualquer falha (senha errada, conta sem permissão...) */
const MSG_INVALIDO = "E-mail ou senha inválidos.";

const TEXTOS: Record<Modo, { etiqueta: string; titulo: string; sub: string }> = {
  admin: { etiqueta: "Área restrita", titulo: "Acesso administrativo", sub: "Entre com a conta de administrador da ACMRB." },
  deus: { etiqueta: "Acesso máximo", titulo: "ADM DEUS", sub: "Área exclusiva. Entre com a conta de administrador principal." },
};

/** Depois do login (e do código de 2 etapas, se houver) segue para o painel */
function IrParaPainel() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
    router.refresh();
  }, [router]);
  return (
    <div className="grid min-h-dvh place-items-center bg-emerald-950">
      <Loader2 className="animate-spin text-emerald-300" aria-label="Abrindo o painel" />
    </div>
  );
}

export default function LoginAdmin({ modo }: { modo: Modo }) {
  const t = TEXTOS[modo];
  const Icone = modo === "deus" ? Crown : ShieldCheck;

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [entrou, setEntrou] = useState(false);
  const [recuperando, setRecuperando] = useState(false);
  const [espera, setEspera] = useState(0);
  const captcha = useCaptcha(); // "não sou um robô" (Turnstile)

  // contagem entre envios do e-mail de recuperação
  useEffect(() => {
    if (espera <= 0) return;
    const id = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [espera]);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    const alvo = email.trim().toLowerCase();
    if (!alvo || !senha) {
      void avisar("Informe e-mail e senha.", "aviso");
      return;
    }
    if (!captcha.pronto) {
      void avisar(MSG_CAPTCHA, "aviso");
      return;
    }
    setEnviando(true);
    try {
      const liberado = await podeTentar("login", alvo);
      if (!liberado.ok) {
        void avisar(liberado.mensagem ?? "Muitas tentativas. Aguarde alguns minutos.", "aviso", "Aguarde um pouco");
        return;
      }

      // cada código do captcha vale uma vez: usa e já pede outro
      const captchaToken = captcha.token;
      captcha.resetar();
      const { data, error } = await supabase.auth.signInWithPassword({ email: alvo, password: senha, options: { captchaToken } });
      if (error || !data.session) {
        void registrarResultado("login", alvo, false, `senha ou conta inválida (${modo})`);
        void avisar(MSG_INVALIDO, "erro", "Não foi possível entrar");
        return;
      }

      // Conferência feita pelo servidor (não confiamos só no navegador)
      const r = await fetch("/api/admin/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ exigir: modo === "deus" ? "deus" : "admin" }),
      }).catch(() => null);

      if (!r?.ok) {
        // Falha ainda com a sessão aberta: registra e sai (mesma mensagem, sem pistas)
        void registrarResultado("login", alvo, false, modo === "deus" ? "conta sem permissão de deus" : "conta sem permissão de administrador");
        await supabase.auth.signOut();
        void avisar(r?.status === 429 ? "Muitas tentativas. Aguarde alguns minutos." : MSG_INVALIDO, "erro", "Não foi possível entrar");
        return;
      }

      void registrarResultado("login", alvo, true);
      await supabase.from("admins").update({ ultimo_login: new Date().toISOString() }).eq("auth_user_id", data.session.user.id);
      setEntrou(true);
    } catch {
      void avisar("Erro inesperado. Tente novamente.", "erro");
    } finally {
      setEnviando(false);
    }
  }

  async function recuperar() {
    const alvo = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alvo)) {
      void avisar("Digite o seu e-mail no campo acima e toque de novo em “Esqueci minha senha”.", "aviso");
      return;
    }
    if (!captcha.pronto) {
      void avisar(MSG_CAPTCHA, "aviso");
      return;
    }
    setRecuperando(true);
    try {
      const liberado = await podeTentar("recuperar", alvo);
      if (!liberado.ok) {
        void avisar(liberado.mensagem ?? "Muitos pedidos. Aguarde.", "aviso");
        return;
      }
      setEspera(ESPERA_EMAIL_SEG);
      const captchaToken = captcha.token;
      captcha.resetar();
      const { error } = await supabase.auth.resetPasswordForEmail(alvo, { redirectTo: urlRedefinir(), captchaToken });
      if (error && /rate|limit/i.test(error.message)) {
        void avisar("Muitos envios em pouco tempo. Aguarde alguns minutos.", "aviso");
        return;
      }
      // Mensagem neutra: não revela se o e-mail existe
      void avisar("Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.", "info", "Verifique seu e-mail");
    } finally {
      setRecuperando(false);
    }
  }

  // Já autenticado: pede o código de 2 etapas (se houver) e abre o painel
  if (entrou) {
    return (
      <MfaPortao
        onSair={async () => {
          await supabase.auth.signOut();
          setEntrou(false);
        }}
      >
        <IrParaPainel />
      </MfaPortao>
    );
  }

  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-emerald-950 px-4 py-10" lang="pt-BR">
      {/* brilhos decorativos no fundo */}
      <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 -z-10 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <span
        aria-hidden="true"
        className={cn("pointer-events-none absolute -right-20 bottom-0 -z-10 size-80 rounded-full blur-3xl", modo === "deus" ? "bg-sun/20" : "bg-emerald-300/10")}
      />

      <div className="w-full max-w-md">
        <section
          className="rounded-3xl border border-black/5 bg-white p-6 shadow-pop sm:p-8"
          aria-labelledby="login-adm-titulo"
        >
          <div className="flex flex-col items-center text-center">
            <span
              className={cn(
                "grid size-14 place-items-center rounded-2xl",
                modo === "deus" ? "bg-amber-100 text-amber-600" : "bg-brand-mint text-leaf",
              )}
            >
              <Icone size={26} aria-hidden="true" />
            </span>
            <span className="mt-4 rounded-full border border-leaf-bright/25 bg-leaf-bright/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-widest text-leaf">
              {t.etiqueta}
            </span>
            <h1 id="login-adm-titulo" className="mt-3 text-3xl font-black text-ink">
              {t.titulo}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.sub}</p>
          </div>

          <form onSubmit={entrar} className="mt-7 flex flex-col gap-4" noValidate>
            <Campo rotulo="E-mail">
              <div className="relative">
                <Mail size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <Input
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Campo>

            <Campo rotulo="Senha">
              <div className="relative">
                <Lock size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <Input
                  type={ver ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setVer((v) => !v)}
                  aria-label={ver ? "Esconder senha" : "Mostrar senha"}
                  className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-ink-muted hover:bg-brand-soft hover:text-brand"
                >
                  {ver ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </button>
              </div>
            </Campo>

            {/* verificação anti-robô (aparece só com o Turnstile configurado) */}
            <Captcha controle={captcha} />

            <Button type="submit" tamanho="grande" larguraTotal carregando={enviando} className="mt-1">
              Entrar
            </Button>

            <button
              type="button"
              onClick={recuperar}
              disabled={recuperando || espera > 0}
              className="mx-auto cursor-pointer text-sm font-semibold text-brand hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {espera > 0 ? `Enviar de novo em ${espera}s` : "Esqueci minha senha"}
            </button>
          </form>
        </section>

        <p className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-200 hover:text-white hover:underline">
            <ArrowLeft size={15} aria-hidden="true" /> Voltar ao site
          </Link>
        </p>
      </div>
    </main>
  );
}
