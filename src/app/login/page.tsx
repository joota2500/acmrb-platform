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
 * Visual: Tailwind + Button.
 */

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
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
  Phone,
  User,
} from "lucide-react";

import Button from "@/components/ui/Button";
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
  "flex h-12 items-center gap-2.5 rounded-[0.9rem] border bg-white px-3.5 text-zinc-500 transition focus-within:border-brand focus-within:text-brand focus-within:shadow-[0_0_0_3px_rgb(46_94_78/0.15)] max-[480px]:h-11.5";
const ENTRADA =
  "h-full min-w-0 flex-1 border-0 bg-transparent text-[0.95rem] text-zinc-900 outline-none max-[480px]:text-base";
const ROTULO = "text-[0.82rem] font-bold text-zinc-700";
const LINK = "inline-flex items-center justify-center gap-1.5 text-[0.85rem] font-bold text-brand hover:underline";

export default function LoginPage() {
  const router = useRouter();
  const reduzir = useReducedMotion();

  const [modo, setModo] = useState<Modo>("entrar");
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [verSenha, setVerSenha] = useState(false);
  const [espera, setEspera] = useState(0);

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
  }

  // ---------- ENTRAR ----------
  async function entrar() {
    const r = esquemaEntrar.safeParse({ email, senha });
    if (!r.success) return setErros(errosDoZod(r.error));

    // Proteção: bloqueio temporário depois de várias senhas erradas
    const liberado = await podeTentar("login", r.data.email);
    if (!liberado.ok) return setAviso({ tipo: "erro", texto: liberado.mensagem ?? "Muitas tentativas. Aguarde." });

    const { data, error } = await supabase.auth.signInWithPassword({ email: r.data.email, password: r.data.senha });
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
    if (!r.success) return setErros(errosDoZod(r.error));
    const d = r.data;

    // Proteção: limite de cadastros por rede
    const liberado = await podeTentar("cadastro", d.email);
    if (!liberado.ok) return setAviso({ tipo: "erro", texto: liberado.mensagem ?? "Muitos cadastros. Aguarde." });

    const { data, error } = await supabase.auth.signUp({
      email: d.email,
      password: d.senha,
      options: {
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
    const { error } = await supabase.auth.resetPasswordForEmail(r.data.email, { redirectTo: urlRedefinir() });
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
    setAviso(null);
    setErros({});
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
      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor={`login-${id}`} className={ROTULO}>{rotulo}</label>
        <div className={cn(CAIXA_CAMPO, erro ? "border-red-400" : "border-zinc-200")}>
          <Icone size={17} aria-hidden="true" />
          <input
            id={`login-${id}`}
            className={ENTRADA}
            aria-invalid={!!erro}
            aria-describedby={erro ? `login-${id}-erro` : undefined}
            {...props}
          />
        </div>
        {erro && <span id={`login-${id}-erro`} className="text-xs text-red-600">{erro}</span>}
      </div>
    );
  }

  const tipoSenha = verSenha ? "text" : "password";
  const t = TITULOS[modo];

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface-alt px-5 pb-12 pt-20 max-[768px]:pt-18 max-[480px]:items-start max-[480px]:px-3.5 max-[480px]:pb-6 max-[480px]:pt-15">
      <div
        className="pointer-events-none absolute -top-48 left-1/2 size-160 -translate-x-1/2 rounded-full bg-emerald-400/12 blur-[120px]"
        aria-hidden="true"
      />

      <Link
        href="/"
        className="absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-zinc-600 transition-colors hover:text-brand max-[480px]:left-4 max-[480px]:top-4 max-[480px]:text-[0.85rem]"
      >
        <ArrowLeft size={17} aria-hidden="true" /> Voltar ao site
      </Link>

      <motion.section
        className="relative z-1 w-full max-w-120 rounded-[1.75rem] border border-black/5 bg-white/90 p-8 shadow-[0_20px_50px_-20px_rgb(46_94_78/0.25)] backdrop-blur-lg max-[768px]:p-7 max-[480px]:rounded-[1.25rem] max-[480px]:p-5"
        initial={reduzir ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        aria-labelledby="login-titulo"
      >
        <header className="text-center">
          <span className="inline-flex size-13 items-center justify-center rounded-2xl bg-brand-mint text-brand max-[480px]:size-11">
            <Leaf size={22} aria-hidden="true" />
          </span>
          <p className="mt-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-brand">RECICLAÊ • ACMRB</p>
          <h1 id="login-titulo" className="mt-1 text-center text-[1.75rem] font-black text-zinc-900 max-[480px]:text-[1.45rem]">
            {t.titulo}
          </h1>
          <p className="texto-justo mt-1.5 text-[0.92rem] text-zinc-600 [text-align-last:center] max-[480px]:text-[0.85rem]">{t.sub}</p>
        </header>

        {modo !== "recuperar" && (
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-surface-alt p-1" role="tablist" aria-label="Entrar ou criar conta">
            {(["entrar", "cadastro"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={modo === m}
                className={cn(
                  "h-10 cursor-pointer rounded-[0.8rem] text-[0.9rem] font-bold transition-colors",
                  modo === m ? "bg-white text-brand shadow-[0_2px_8px_rgb(0_0_0/0.06)]" : "text-zinc-600",
                )}
                onClick={() => trocarModo(m)}
              >
                {m === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {aviso && (
            <motion.div
              key={aviso.texto}
              role={aviso.tipo === "erro" ? "alert" : "status"}
              className={cn(
                "texto-justo mt-5 flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-[0.88rem] leading-snug [&>svg]:mt-0.5 [&>svg]:shrink-0",
                aviso.tipo === "erro"
                  ? "border-red-200 bg-red-50 text-danger"
                  : "border-[#a7e3cb] bg-brand-mint text-[#1f4a3c]",
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

        <form className="mt-5 flex flex-col gap-3.5" onSubmit={enviar} noValidate>
          {modo === "cadastro" && (
            <>
              {campo("nome", "Nome completo", User, { type: "text", autoComplete: "name", maxLength: 100, value: nome, onChange: (e) => setNome(e.target.value), placeholder: "Seu nome e sobrenome" })}
              <div className="grid grid-cols-2 gap-3.5 max-[480px]:grid-cols-1">
                {campo("telefone", "Telefone", Phone, { type: "tel", inputMode: "numeric", autoComplete: "tel-national", value: telefone, onChange: (e) => setTelefone(mascaraTelefone(e.target.value)), placeholder: "(85) 98888-7777" })}
                {campo("nascimento", "Data de nascimento", CalendarDays, { type: "date", autoComplete: "bday", max: new Date().toISOString().slice(0, 10), value: nascimento, onChange: (e) => setNascimento(e.target.value) })}
              </div>
              {campo("cidade", "Cidade", MapPin, { type: "text", autoComplete: "address-level2", maxLength: 80, value: cidade, onChange: (e) => setCidade(e.target.value), placeholder: "Ex.: Baturité" })}
            </>
          )}

          {campo("email", "E-mail", Mail, { type: "email", autoComplete: "email", inputMode: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "voce@email.com" })}

          {modo !== "recuperar" && (
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="login-senha" className={ROTULO}>Senha</label>
              <div className={cn(CAIXA_CAMPO, erros.senha ? "border-red-400" : "border-zinc-200")}>
                <Lock size={17} aria-hidden="true" />
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
                  className="inline-flex cursor-pointer p-1 text-zinc-500 hover:text-brand"
                  onClick={() => setVerSenha((v) => !v)}
                  aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {verSenha ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {erros.senha ? (
                <span id="login-senha-erro" className="text-xs text-red-600">{erros.senha}</span>
              ) : (
                modo === "cadastro" && (
                  <span id="login-senha-dica" className="text-[0.76rem] text-zinc-500">
                    Mínimo 8 caracteres, com maiúscula, minúscula e número.
                  </span>
                )
              )}
            </div>
          )}

          {modo === "cadastro" &&
            campo("confirmar", "Confirmar senha", Lock, { type: tipoSenha, autoComplete: "new-password", value: confirmar, onChange: (e) => setConfirmar(e.target.value), placeholder: "Repita a senha" })}

          {modo === "entrar" && (
            <button type="button" className={cn(LINK, "-mt-1 cursor-pointer self-end")} onClick={() => trocarModo("recuperar")}>
              Esqueci minha senha
            </button>
          )}

          <Button
            type="submit"
            larguraTotal
            carregando={carregando}
            className="h-12.5 rounded-[0.9rem] text-[0.95rem] font-extrabold max-[480px]:h-11.5"
            disabled={carregando || (modo === "recuperar" && espera > 0)}
          >
            {modo === "entrar" && (carregando ? "Entrando…" : "Entrar")}
            {modo === "cadastro" && (carregando ? "Criando conta…" : "Criar minha conta")}
            {modo === "recuperar" && (espera > 0 ? `Reenviar em ${espera}s` : carregando ? "Enviando…" : "Enviar link")}
          </Button>

          {modo === "recuperar" && (
            <button type="button" className={cn(LINK, "cursor-pointer")} onClick={() => trocarModo("entrar")}>
              <ArrowLeft size={15} aria-hidden="true" /> Voltar para entrar
            </button>
          )}
        </form>

        <p className="texto-justo mt-5.5 border-t border-zinc-100 pt-4.5 text-[0.8rem] leading-normal text-zinc-500">
          Sem conta você pode navegar e ler todo o site. Com a conta de visitante você também pode enviar mensagens e interagir com a ACMRB.
        </p>
      </motion.section>
    </main>
  );
}
