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
 * Visual: igual à tela /login — duas colunas no computador e cartão
 * compacto no celular/tablet, tudo cabendo na tela (sem rolagem).
 */

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, Eye, EyeOff, Fingerprint, Leaf, Loader2, Lock, Mail, ShieldCheck, Smartphone } from "lucide-react";

import Button from "@/components/ui/Button";
import Captcha, { MSG_CAPTCHA, MSG_CAPTCHA_RECUSADO, ehErroCaptcha, useCaptcha } from "@/components/ui/Captcha";
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

/** Itens de segurança mostrados no painel verde (só no computador) */
const SEGURANCA = [
  { icone: Fingerprint, texto: "Verificação anti-robô em cada entrada" },
  { icone: Smartphone, texto: "Código do app autenticador (2 etapas)" },
  { icone: ShieldCheck, texto: "Tentativas limitadas e registradas" },
];

/** Rótulo dos campos (pequeno para a tela caber sem rolagem) */
const ROTULO = "text-[0.82rem] font-semibold text-ink";

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
      // recusado pelo captcha: não é senha errada (não conta como tentativa)
      if (ehErroCaptcha(error)) {
        void avisar(MSG_CAPTCHA_RECUSADO, "aviso");
        return;
      }
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
      if (ehErroCaptcha(error)) {
        setEspera(0);
        void avisar(MSG_CAPTCHA_RECUSADO, "aviso");
        return;
      }
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
    // Computador (lg): duas colunas na altura exata da tela, sem rolagem.
    // Celular/tablet: só o cartão, compacto para caber em 100dvh (sem rolagem).
    <main
      className="flex min-h-dvh flex-col overflow-x-hidden bg-emerald-950 lg:grid lg:h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:overflow-hidden lg:bg-surface-alt"
      lang="pt-BR"
    >
      {/* ===== Painel da marca (só no computador) ===== */}
      <aside className="relative isolate hidden overflow-hidden bg-linear-to-br from-emerald-950 via-brand-dark to-emerald-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        {/* brilhos de fundo (só decoração) */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 -z-10 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <span
          aria-hidden="true"
          className={cn("pointer-events-none absolute -right-20 bottom-0 -z-10 size-80 rounded-full blur-3xl", modo === "deus" ? "bg-sun/20" : "bg-emerald-300/10")}
        />

        <Link
          href="/"
          className="inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <Leaf size={22} aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-black tracking-tight">Reciclaê</span>
            <span className="block text-xs font-semibold text-emerald-100/80">ACMRB · Painel administrativo</span>
          </span>
        </Link>

        <div className="max-w-md">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-widest ring-1",
              modo === "deus" ? "bg-sun/15 text-amber-200 ring-sun/30" : "bg-white/10 text-emerald-100 ring-white/20",
            )}
          >
            <Icone size={13} aria-hidden="true" /> {t.etiqueta}
          </span>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight xl:text-5xl">
            {modo === "deus" ? "Controle total da plataforma." : "Gestão da ACMRB em um só lugar."}
          </h2>
          <ul className="mt-7 flex flex-col gap-3.5">
            {SEGURANCA.map(({ icone: I, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-[0.95rem] font-semibold text-emerald-50/95">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/12">
                  <I size={18} aria-hidden="true" />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm text-emerald-50/75">
          <p className="max-w-xs leading-relaxed">Acesso restrito. Todas as tentativas ficam registradas.</p>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md font-bold text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Voltar ao site
          </Link>
        </div>
      </aside>

      {/* ===== Coluna do formulário ===== */}
      {/* no computador, se a tela for baixa demais, rola só esta coluna (nunca a página) */}
      <div className="relative isolate flex min-h-dvh flex-col overflow-hidden lg:min-h-0 lg:overflow-y-auto">
        {/* brilho de fundo do celular/tablet (no computador o painel da marca faz esse papel) */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 -z-10 size-80 rounded-full bg-emerald-500/20 blur-3xl lg:hidden" />

        {/* topo do celular/tablet: voltar + marca */}
        <div className="flex items-center justify-between px-4 pt-3 sm:px-6 sm:pt-5 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-emerald-200 hover:text-white hover:underline">
            <ArrowLeft size={16} aria-hidden="true" /> Voltar ao site
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-[0.14em] text-emerald-300">
            <Leaf size={15} aria-hidden="true" /> RECICLAÊ
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-3 py-4 sm:px-6 sm:py-8 lg:px-10 lg:py-6">
          <section
            className="w-full max-w-[26rem] rounded-3xl border border-black/5 bg-white p-4 shadow-pop min-[400px]:p-5 sm:p-7 lg:shadow-[0_20px_50px_-24px_rgb(46_94_78/0.35)]"
            aria-labelledby="login-adm-titulo"
          >
            {/* cabeçalho em linha (ícone + textos) para ocupar pouca altura */}
            <header className="flex items-center gap-3.5">
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-2xl",
                  modo === "deus" ? "bg-amber-100 text-amber-600" : "bg-brand-mint text-leaf",
                )}
              >
                <Icone size={24} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <span className={cn("text-[0.66rem] font-bold uppercase tracking-widest", modo === "deus" ? "text-amber-600" : "text-leaf")}>
                  {t.etiqueta}
                </span>
                <h1 id="login-adm-titulo" className="text-[1.4rem] font-black leading-tight tracking-tight text-ink sm:text-[1.6rem]">
                  {t.titulo}
                </h1>
              </div>
            </header>
            <p className="mt-2.5 text-[0.84rem] leading-snug text-ink-soft sm:text-sm">{t.sub}</p>

            <form onSubmit={entrar} className="mt-4 flex flex-col gap-3 sm:mt-5 sm:gap-3.5" noValidate>
              <div className="flex flex-col gap-1">
                <label htmlFor="adm-email" className={ROTULO}>E-mail</label>
                <div className="relative">
                  <Mail size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <Input
                    id="adm-email"
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="adm-senha" className={ROTULO}>Senha</label>
                <div className="relative">
                  <Lock size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <Input
                    id="adm-senha"
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
              </div>

              {/* verificação anti-robô (aparece só com o Turnstile configurado) */}
              <Captcha controle={captcha} />

              <Button type="submit" tamanho="grande" larguraTotal carregando={enviando} className="h-12">
                Entrar
              </Button>

              <button
                type="button"
                onClick={recuperar}
                disabled={recuperando || espera > 0}
                className="mx-auto cursor-pointer rounded-md text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                {espera > 0 ? `Enviar de novo em ${espera}s` : "Esqueci minha senha"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
