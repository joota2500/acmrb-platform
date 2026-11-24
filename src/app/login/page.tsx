"use client";

/**
 * /login — Área do VISITANTE
 * ------------------------------------------------------------
 * Três modos no mesmo cartão: Entrar, Criar conta e Esqueci minha senha.
 *  - Entrar: signInWithPassword. Se a conta for de administrador (deus
 *    ou normal), sai na hora e mostra a MESMA mensagem de conta
 *    inexistente — aqui os admins "não existem". Eles entram pelas telas
 *    próprias: /admin/login (e o login do ADM DEUS, só do dono).
 *  - Criar conta: nome, telefone (máscara), cidade, nascimento, e-mail,
 *    senha e confirmação (zod). O perfil é criado pelo gatilho do banco
 *    (migration 20261020260000_visitantes_perfil.sql).
 *  - Esqueci minha senha: envia o link para /redefinir-senha.
 * Visual (Tailwind): no computador, 2 colunas que cabem na tela sem
 * rolagem (painel verde da marca à esquerda + cartão do formulário à
 * direita). No celular, só o formulário, compacto para caber em 100dvh
 * sem rolagem; o cadastro é feito em 2 passos (dados → senha).
 */

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  MapPin,
  MessagesSquare,
  Phone,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Captcha, { MSG_CAPTCHA, MSG_CAPTCHA_RECUSADO, ehErroCaptcha, useCaptcha } from "@/components/ui/Captcha";
import { cn } from "@/utils/cn";
import { supabase } from "@/lib/supabase";
import { podeTentar, registrarResultado } from "@/services/loginSeguro";
import { mascaraTelefone, somenteDigitos } from "@/utils/validacao";
import { ESPERA_EMAIL_SEG, urlRedefinir } from "@/services/apiAdmin";
import {
  MSG_CONTA_INVALIDA,
  errosDoZod,
  esquemaCadastro,
  esquemaEntrar,
  esquemaRecuperar,
  type ErrosCampos,
} from "@/utils/visitanteAuth";

type Modo = "entrar" | "cadastro" | "recuperar";
type Aviso = { tipo: "erro" | "sucesso"; texto: string } | null;

const TITULOS: Record<Modo, { titulo: string; sub: string }> = {
  entrar: { titulo: "Entrar", sub: "Acesse sua conta de visitante para interagir com a ACMRB." },
  cadastro: { titulo: "Criar conta", sub: "Cadastro rápido e gratuito. Leva menos de um minuto." },
  recuperar: { titulo: "Recuperar senha", sub: "Enviaremos um link para você criar uma nova senha." },
};

/** Traduz os erros do Supabase Auth no cadastro para mensagens claras */
function mensagemErroCadastro(error: { status?: number; code?: string; message: string }): string {
  const cod = error.code ?? "";
  const msg = error.message ?? "";
  if (ehErroCaptcha(error)) return MSG_CAPTCHA_RECUSADO;
  if (cod === "user_already_exists" || cod === "email_exists" || /already|registered|exists/i.test(msg))
    return "Este e-mail já tem cadastro. Tente entrar ou recuperar a senha.";
  if (cod.includes("rate_limit") || error.status === 429 || /rate|limit/i.test(msg))
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.";
  if (cod === "signup_disabled" || cod === "email_provider_disabled" || /signups? not allowed|disabled/i.test(msg))
    return "O cadastro de novas contas está temporariamente desativado. Fale com a ACMRB pelo contato do site.";
  if (cod === "weak_password" || /password/i.test(msg))
    return "Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.";
  if (cod === "email_address_invalid" || /invalid.*email|email.*invalid/i.test(msg))
    return "Este endereço de e-mail não foi aceito. Confira se está correto ou use outro e-mail.";
  if (cod === "unexpected_failure" || /database error/i.test(msg))
    return "Erro no servidor ao salvar o cadastro. A equipe já pode verificar; tente novamente mais tarde.";
  if (/fetch|network/i.test(msg)) return "Sem conexão com o servidor. Verifique sua internet e tente de novo.";
  return "Não foi possível criar a conta agora. Tente novamente.";
}

// Classes que se repetem no formulário
const CAIXA_CAMPO =
  "flex h-11 items-center max-sm:h-10.5 gap-2.5 rounded-control border bg-white px-3.5 text-ink-muted transition focus-within:border-brand focus-within:text-brand focus-within:shadow-focus";
const ENTRADA =
  "h-full w-full min-w-0 flex-1 border-0 bg-transparent text-base text-ink outline-none placeholder:text-zinc-400 sm:text-[0.95rem]";
const ROTULO = "text-[0.8rem] font-bold leading-tight text-ink-soft sm:text-[0.82rem]";
const LINK =
  "inline-flex items-center justify-center gap-1.5 rounded-md text-[0.85rem] font-bold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

// Vantagens da conta (painel verde do computador)
const VANTAGENS = [
  { icone: MessagesSquare, texto: "Converse direto com a associação" },
  { icone: Truck, texto: "Peça e acompanhe a coleta de recicláveis" },
  { icone: ShieldCheck, texto: "Seus dados protegidos e sem anúncios" },
];

// Campos que ficam no passo 1 do cadastro
const CAMPOS_PASSO1 = ["nome", "telefone", "nascimento", "cidade", "email"] as const;

const AVISO_VISITANTE =
  "Sem conta você pode navegar e ler todo o site. Com a conta de visitante você também pode enviar mensagens e interagir com a ACMRB.";

export default function LoginPage() {
  const router = useRouter();
  const reduzir = useReducedMotion();

  const [modo, setModo] = useState<Modo>("entrar");
  const captcha = useCaptcha(); // "não sou um robô" (Turnstile)
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [verSenha, setVerSenha] = useState(false);
  const [espera, setEspera] = useState(0);
  const [passo, setPasso] = useState<1 | 2>(1); // passos do cadastro

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");

  // /login?modo=cadastro abre direto em "Criar conta"
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("modo") === "cadastro") setModo("cadastro");
  }, []);

  // Contagem regressiva entre envios de e-mail de recuperação
  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  function trocarModo(m: Modo) {
    setModo(m);
    setAviso(null);
    setErros({});
    setSenha("");
    setConfirmar("");
    setPasso(1);
  }

  // ---------- CADASTRO: passo 1 → passo 2 ----------
  // Usa o mesmo esquema zod do cadastro, mas só olha os campos do passo 1.
  function avancarCadastro() {
    const r = esquemaCadastro.safeParse({ nome, telefone, cidade, nascimento, email, senha, confirmar });
    const errosPasso1: ErrosCampos = {};
    if (!r.success) {
      const todos = errosDoZod(r.error);
      for (const k of CAMPOS_PASSO1) if (todos[k]) errosPasso1[k] = todos[k];
    }
    setErros(errosPasso1);
    setAviso(null);
    if (Object.keys(errosPasso1).length === 0) setPasso(2);
  }

  // ---------- ENTRAR ----------
  async function entrar() {
    const r = esquemaEntrar.safeParse({ email, senha });
    if (!r.success) return setErros(errosDoZod(r.error));

    // Proteção: bloqueio temporário depois de várias senhas erradas
    const liberado = await podeTentar("login", r.data.email);
    if (!liberado.ok) return setAviso({ tipo: "erro", texto: liberado.mensagem ?? "Muitas tentativas. Aguarde." });

    // captcha (só quando o Turnstile estiver configurado); cada código vale uma vez
    const captchaToken = captcha.token;
    captcha.resetar();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: r.data.email,
      password: r.data.senha,
      options: { captchaToken },
    });
    // recusado pelo captcha: não é senha errada (não conta como tentativa)
    if (ehErroCaptcha(error)) return setAviso({ tipo: "erro", texto: MSG_CAPTCHA_RECUSADO });
    if (error || !data.user) {
      void registrarResultado("login", r.data.email, false, error && /confirm/i.test(error.message) ? "e-mail não confirmado" : "senha ou conta inválida");
      if (error && /confirm/i.test(error.message)) {
        return setAviso({ tipo: "erro", texto: "Confirme seu e-mail antes de entrar (veja a caixa de entrada e o spam)." });
      }
      return setAviso({ tipo: "erro", texto: MSG_CONTA_INVALIDA });
    }

    // Administrador? Sai na hora e responde como se a conta não existisse
    const { data: ehAdmin } = await supabase.rpc("is_active_admin");
    if (ehAdmin === true) {
      void registrarResultado("login", r.data.email, false, "conta de administrador no login de visitante");
      await supabase.auth.signOut();
      return setAviso({ tipo: "erro", texto: MSG_CONTA_INVALIDA });
    }

    // Perfil de visitante (contas antigas sem perfil: cria a partir dos metadados)
    const { data: perfil } = await supabase
      .from("visitantes")
      .select("id, nome, ativo")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();

    if (perfil && perfil.ativo === false) {
      void registrarResultado("login", r.data.email, false, "conta desativada");
      await supabase.auth.signOut();
      return setAviso({ tipo: "erro", texto: "Esta conta está desativada. Fale com a ACMRB pelo contato do site." });
    }
    if (!perfil) {
      const m = data.user.user_metadata ?? {};
      await supabase.from("visitantes").insert({
        auth_user_id: data.user.id,
        nome: m.nome_completo || r.data.email.split("@")[0],
        email: r.data.email,
        telefone: m.telefone ?? null,
        cidade: m.cidade ?? null,
        data_nascimento: m.data_nascimento || null,
        role: "visitante",
      });
    }

    void registrarResultado("login", r.data.email, true);
    setAviso({ tipo: "sucesso", texto: `Bem-vindo(a)${perfil?.nome ? `, ${perfil.nome.split(" ")[0]}` : ""}! Redirecionando…` });
    setTimeout(() => router.push("/"), 900);
  }

  // ---------- CADASTRO ----------
  async function cadastrar() {
    const r = esquemaCadastro.safeParse({ nome, telefone, cidade, nascimento, email, senha, confirmar });
    if (!r.success) {
      const todos = errosDoZod(r.error);
      // se o erro é de um campo do passo 1, volta para ele
      if (CAMPOS_PASSO1.some((k) => todos[k])) setPasso(1);
      return setErros(todos);
    }
    const d = r.data;

    // Proteção: limite de cadastros por rede
    const liberado = await podeTentar("cadastro", d.email);
    if (!liberado.ok) return setAviso({ tipo: "erro", texto: liberado.mensagem ?? "Muitos cadastros. Aguarde." });

    const captchaToken = captcha.token;
    captcha.resetar();
    const { data, error } = await supabase.auth.signUp({
      email: d.email,
      password: d.senha,
      options: {
        captchaToken,
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          nome_completo: d.nome,
          telefone: mascaraTelefone(somenteDigitos(d.telefone)),
          cidade: d.cidade,
          data_nascimento: d.nascimento,
          tipo: "visitante",
        },
      },
    });

    void registrarResultado("cadastro", d.email, !error && !!data.session, error ? "falha no cadastro" : data.session ? undefined : "aguardando confirmação de e-mail");
    if (error) {
      // Mostra no console o erro real (ajuda no suporte) e traduz para o visitante
      console.error("[cadastro] signUp falhou:", error.status, error.code, error.message);
      return setAviso({ tipo: "erro", texto: mensagemErroCadastro(error) });
    }

    // Com confirmação de e-mail ligada o Supabase não devolve sessão
    if (!data.session) {
      trocarModo("entrar");
      return setAviso({
        tipo: "sucesso",
        texto: `Conta criada! Enviamos um link de confirmação para ${d.email}. Confirme o e-mail e depois entre aqui.`,
      });
    }
    setAviso({ tipo: "sucesso", texto: "Conta criada com sucesso! Redirecionando…" });
    setTimeout(() => router.push("/"), 900);
  }

  // ---------- RECUPERAR ----------
  async function recuperar() {
    const r = esquemaRecuperar.safeParse({ email });
    if (!r.success) return setErros(errosDoZod(r.error));
    if (espera > 0) return;
    const liberado = await podeTentar("recuperar", r.data.email);
    if (!liberado.ok) return setAviso({ tipo: "erro", texto: liberado.mensagem ?? "Muitos pedidos. Aguarde." });
    setEspera(ESPERA_EMAIL_SEG);
    const captchaToken = captcha.token;
    captcha.resetar();
    const { error } = await supabase.auth.resetPasswordForEmail(r.data.email, { redirectTo: urlRedefinir(), captchaToken });
    if (ehErroCaptcha(error)) {
      setEspera(0);
      return setAviso({ tipo: "erro", texto: MSG_CAPTCHA_RECUSADO });
    }
    if (error && /rate|limit/i.test(error.message)) {
      return setAviso({ tipo: "erro", texto: "Muitos envios em pouco tempo. Aguarde alguns minutos." });
    }
    void registrarResultado("recuperar", r.data.email, !error);
    // Mensagem neutra: não revela se o e-mail existe
    setAviso({ tipo: "sucesso", texto: "Se este e-mail tiver cadastro, você receberá um link para criar uma nova senha." });
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    if (carregando) return;
    // no passo 1 do cadastro o Enter/botão só confere os dados e avança
    if (modo === "cadastro" && passo === 1) return avancarCadastro();
    setAviso(null);
    setErros({});
    // "não sou um robô" precisa estar marcado (quando o captcha está ligado)
    if (!captcha.pronto) return setAviso({ tipo: "erro", texto: MSG_CAPTCHA });
    setCarregando(true);
    try {
      if (modo === "entrar") await entrar();
      else if (modo === "cadastro") await cadastrar();
      else await recuperar();
    } catch {
      setAviso({ tipo: "erro", texto: "Erro de conexão. Verifique sua internet e tente de novo." });
    } finally {
      setCarregando(false);
    }
  }

  // Campo com ícone, rótulo e erro
  function campo(
    id: string,
    rotulo: string,
    Icone: typeof Mail,
    props: React.InputHTMLAttributes<HTMLInputElement>,
  ) {
    const erro = erros[id];
    return (
      <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
        {/* no celular, com erro, a mensagem vermelha toma o lugar do rótulo (não aumenta a altura) */}
        <label htmlFor={`login-${id}`} className={cn(ROTULO, erro && "max-sm:sr-only")}>{rotulo}</label>
        <div className={cn(CAIXA_CAMPO, erro ? "border-red-400" : "border-line")}>
          <Icone size={17} className="shrink-0" aria-hidden="true" />
          <input
            id={`login-${id}`}
            className={ENTRADA}
            aria-invalid={!!erro}
            aria-describedby={erro ? `login-${id}-erro` : undefined}
            {...props}
          />
        </div>
        {erro && <ErroCampo id={`login-${id}-erro`} texto={erro} className="max-sm:order-first" />}
      </div>
    );
  }

  const tipoSenha = verSenha ? "text" : "password";
  const t = TITULOS[modo];

  return (
    // Computador (lg): altura exata da tela e nada de rolagem na página.
    // Celular: tudo compacto para caber em 100dvh (sem rolagem), nunca na horizontal.
    <main className="min-h-dvh overflow-x-hidden bg-white sm:bg-surface-alt lg:grid lg:h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:overflow-hidden">
      {/* ===== Painel da marca (só no computador) ===== */}
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-brand-dark via-brand to-emerald-700 text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <Image
          src="/images/hero-reciclagem.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-15 mix-blend-luminosity"
        />
        {/* luz verde de fundo (só decoração) */}
        <span className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" aria-hidden="true" />

        <Link
          href="/"
          className="relative inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <Leaf size={22} aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-black tracking-tight">Reciclaê</span>
            <span className="block text-xs font-semibold text-emerald-100/80">ACMRB · Baturité – CE</span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-black leading-tight tracking-tight xl:text-5xl">
            Reciclar transforma a nossa cidade.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-emerald-50/90">
            Crie sua conta de visitante e fique mais perto da associação dos catadores de Baturité.
          </p>
          <ul className="mt-7 flex flex-col gap-3.5">
            {VANTAGENS.map(({ icone: Icone, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-[0.95rem] font-semibold">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15">
                  <Icone size={18} aria-hidden="true" />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between gap-4 text-sm text-emerald-50/80">
          <p className="max-w-sm leading-relaxed">{AVISO_VISITANTE}</p>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md font-bold text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Voltar ao site
          </Link>
        </div>
      </aside>

      {/* ===== Coluna do formulário ===== */}
      {/* no computador, se uma tela bem baixa não couber, rola só esta coluna (nunca a página) */}
      <div className="flex min-h-dvh flex-col lg:min-h-0 lg:overflow-y-auto">
        {/* topo do celular/tablet: voltar + marca */}
        <div className="flex items-center justify-between px-4 pt-3 sm:px-6 sm:pt-4 lg:hidden">
          <Link href="/" className={cn(LINK, "text-ink-soft")}>
            <ArrowLeft size={17} aria-hidden="true" /> Voltar ao site
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-[0.14em] text-brand">
            <Leaf size={15} aria-hidden="true" /> RECICLAÊ
          </span>
        </div>

        <div className="flex flex-1 items-start justify-center px-4 pb-4 pt-4 sm:items-center sm:px-6 sm:py-8 lg:px-10 lg:py-6">
          {/* no celular o formulário ocupa a tela toda (sem moldura de cartão) */}
          <motion.section
            className={cn(
              "w-full sm:rounded-[1.5rem] sm:border sm:border-black/5 sm:bg-white sm:p-7 sm:shadow-[0_20px_50px_-24px_rgb(46_94_78/0.35)]",
              modo === "cadastro" ? "max-w-[34rem]" : "max-w-[27rem]",
            )}
            initial={reduzir ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            aria-labelledby="login-titulo"
          >
            <header>
              <h1 id="login-titulo" className="text-[1.4rem] font-black leading-tight tracking-tight text-ink sm:text-[1.7rem]">
                {t.titulo}
              </h1>
              <p className="mt-1 text-[0.82rem] leading-snug text-ink-soft sm:text-sm sm:leading-relaxed">{t.sub}</p>
            </header>

            {/* Abas: Entrar / Criar conta (em "recuperar" aparece o botão de voltar no lugar) */}
            {modo !== "recuperar" ? (
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-surface-alt p-1 ring-1 ring-line sm:mt-5" role="tablist" aria-label="Entrar ou criar conta">
                {(["entrar", "cadastro"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={modo === m}
                    className={cn(
                      "h-9 cursor-pointer rounded-xl text-[0.9rem] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand sm:h-10",
                      modo === m ? "bg-white text-brand shadow-sm ring-1 ring-black/5" : "text-ink-muted hover:text-brand",
                    )}
                    onClick={() => trocarModo(m)}
                  >
                    {m === "entrar" ? "Entrar" : "Criar conta"}
                  </button>
                ))}
              </div>
            ) : (
              <button type="button" className={cn(LINK, "mt-3 cursor-pointer sm:mt-4")} onClick={() => trocarModo("entrar")}>
                <ArrowLeft size={15} aria-hidden="true" /> Voltar para entrar
              </button>
            )}

            {/* Indicador de passo do cadastro */}
            {modo === "cadastro" && <IndicadorPasso passo={passo} />}

            <AnimatePresence mode="wait">
              {aviso && (
                <motion.div
                  key={aviso.texto}
                  role={aviso.tipo === "erro" ? "alert" : "status"}
                  className={cn(
                    "mt-3 flex items-start gap-2.5 rounded-2xl border px-3.5 py-2.5 text-[0.85rem] leading-snug sm:mt-4 sm:py-3 sm:text-[0.88rem] [&>svg]:mt-0.5 [&>svg]:shrink-0",
                    aviso.tipo === "erro"
                      ? "border-red-200 bg-danger-soft text-danger"
                      : "border-brand-line bg-brand-mint text-brand-dark",
                  )}
                  initial={reduzir ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {aviso.tipo === "erro" ? <AlertCircle size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
                  <span>{aviso.texto}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form className="mt-3 flex flex-col gap-2.5 sm:mt-4 sm:gap-3" onSubmit={enviar} noValidate>
              {/* ---- Cadastro, passo 1: dados pessoais ---- */}
              {modo === "cadastro" && passo === 1 && (
                <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {campo("nome", "Nome completo", User, { type: "text", autoComplete: "name", maxLength: 100, value: nome, onChange: (e) => setNome(e.target.value), placeholder: "Seu nome e sobrenome" })}
                  {campo("telefone", "Telefone", Phone, { type: "tel", inputMode: "numeric", autoComplete: "tel-national", value: telefone, onChange: (e) => setTelefone(mascaraTelefone(e.target.value)), placeholder: "(85) 98888-7777" })}
                  {campo("nascimento", "Data de nascimento", CalendarDays, { type: "date", autoComplete: "bday", max: new Date().toISOString().slice(0, 10), value: nascimento, onChange: (e) => setNascimento(e.target.value) })}
                  {campo("cidade", "Cidade", MapPin, { type: "text", autoComplete: "address-level2", maxLength: 80, value: cidade, onChange: (e) => setCidade(e.target.value), placeholder: "Ex.: Baturité" })}
                  <div className="sm:col-span-2">
                    {campo("email", "E-mail", Mail, { type: "email", autoComplete: "email", inputMode: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "voce@email.com" })}
                  </div>
                </div>
              )}

              {/* Entrar e Recuperar pedem o e-mail aqui */}
              {modo !== "cadastro" &&
                campo("email", "E-mail", Mail, { type: "email", autoComplete: "email", inputMode: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "voce@email.com" })}

              {/* Senha: no Entrar e no passo 2 do cadastro */}
              {(modo === "entrar" || (modo === "cadastro" && passo === 2)) && (
                <div className="grid gap-2.5 sm:gap-3">
                  <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
                    <label htmlFor="login-senha" className={cn(ROTULO, erros.senha && "max-sm:sr-only")}>{modo === "cadastro" ? "Crie uma senha" : "Senha"}</label>
                    <div className={cn(CAIXA_CAMPO, "pr-1.5", erros.senha ? "border-red-400" : "border-line")}>
                      <Lock size={17} className="shrink-0" aria-hidden="true" />
                      <input
                        id="login-senha"
                        className={ENTRADA}
                        type={tipoSenha}
                        autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        aria-invalid={!!erros.senha}
                        aria-describedby={erros.senha ? "login-senha-erro" : modo === "cadastro" ? "login-senha-dica" : undefined}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-ink-muted hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                        onClick={() => setVerSenha((v) => !v)}
                        aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                        aria-pressed={verSenha}
                      >
                        {verSenha ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                      </button>
                    </div>
                    {erros.senha ? (
                      <ErroCampo id="login-senha-erro" texto={erros.senha} className="max-sm:order-first" />
                    ) : (
                      modo === "cadastro" && (
                        <span id="login-senha-dica" className="text-[0.75rem] text-ink-muted">
                          Mínimo 8 caracteres, com maiúscula, minúscula e número.
                        </span>
                      )
                    )}
                  </div>

                  {modo === "cadastro" &&
                    campo("confirmar", "Confirmar senha", Lock, { type: tipoSenha, autoComplete: "new-password", value: confirmar, onChange: (e) => setConfirmar(e.target.value), placeholder: "Repita a senha" })}
                </div>
              )}

              {modo === "entrar" && (
                <button type="button" className={cn(LINK, "-mt-0.5 cursor-pointer self-end")} onClick={() => trocarModo("recuperar")}>
                  Esqueci minha senha
                </button>
              )}

              {/* verificação anti-robô (some no passo 1 do cadastro; aparece só com o Turnstile configurado) */}
              {!(modo === "cadastro" && passo === 1) && <Captcha controle={captcha} />}

              <Button
                type="submit"
                larguraTotal
                carregando={carregando}
                className="h-11 rounded-control text-[0.95rem] font-extrabold sm:h-12"
                disabled={carregando || (modo === "recuperar" && espera > 0)}
              >
                {modo === "entrar" && (carregando ? "Entrando…" : "Entrar")}
                {modo === "cadastro" && passo === 1 && "Continuar"}
                {modo === "cadastro" && passo === 2 && (carregando ? "Criando conta…" : "Criar minha conta")}
                {modo === "recuperar" && (espera > 0 ? `Reenviar em ${espera}s` : carregando ? "Enviando…" : "Enviar link")}
              </Button>

              {modo === "cadastro" && passo === 2 && (
                <button type="button" className={cn(LINK, "cursor-pointer")} onClick={() => { setPasso(1); setErros({}); setAviso(null); }}>
                  <ArrowLeft size={15} aria-hidden="true" /> Voltar aos meus dados
                </button>
              )}
            </form>

            {/* aviso extra: só no tablet (no celular falta espaço; no computador fica no painel verde) */}
            <p className="mt-5 hidden border-t border-line pt-4 text-[0.8rem] leading-normal text-ink-muted sm:block lg:hidden">
              {AVISO_VISITANTE}
            </p>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

/** Bolinhas "1 Seus dados — 2 Senha" do cadastro */
function IndicadorPasso({ passo }: { passo: 1 | 2 }) {
  const etapas = ["Seus dados", "Senha"];
  return (
    <ol className="mt-3 flex items-center gap-2 sm:mt-4" aria-label={`Passo ${passo} de 2`}>
      {etapas.map((nome, i) => {
        const n = i + 1;
        const feito = passo > n;
        const atual = passo === n;
        return (
          <li key={nome} className="flex flex-1 items-center gap-2" aria-current={atual ? "step" : undefined}>
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-xs font-extrabold",
                atual || feito ? "bg-brand text-white" : "bg-surface-alt text-ink-muted ring-1 ring-line",
              )}
            >
              {feito ? <CheckCircle2 size={14} aria-hidden="true" /> : n}
            </span>
            <span className={cn("text-[0.8rem] font-bold", atual ? "text-ink" : "text-ink-muted")}>{nome}</span>
            {n === 1 && <span className={cn("h-0.5 flex-1 rounded-full", feito ? "bg-brand" : "bg-line")} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

/** Mensagem de erro embaixo de um campo */
function ErroCampo({ id, texto, className }: { id: string; texto: string; className?: string }) {
  return (
    <span id={id} className={cn("flex items-start gap-1 text-xs font-medium leading-tight text-danger", className)}>
      <AlertCircle size={13} className="mt-px shrink-0" aria-hidden="true" />
      {texto}
    </span>
  );
}
