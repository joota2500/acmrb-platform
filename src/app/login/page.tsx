"use client";

/**
 * /login — Área do VISITANTE
 * ------------------------------------------------------------
 * Três modos no mesmo cartão: Entrar, Criar conta e Esqueci minha senha.
 *  - Entrar: signInWithPassword. Se a conta for de administrador (deus
 *    ou normal), sai na hora e mostra a MESMA mensagem de conta
 *    inexistente — aqui os admins "não existem". Eles entram pelo
 *    acesso restrito (5 cliques na logo → AdminModal).
 *  - Criar conta: nome, telefone (máscara), cidade, nascimento, e-mail,
 *    senha e confirmação (zod). O perfil é criado pelo gatilho do banco
 *    (migration 20261020260000_visitantes_perfil.sql).
 *  - Esqueci minha senha: envia o link para /redefinir-senha.
 * CSS: src/styles/login.css (prefixo "login__").
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
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import "@/styles/login.css";
import { supabase } from "@/lib/supabase";
import { mascaraTelefone, somenteDigitos } from "@/lib/validacao";
import { ESPERA_EMAIL_SEG, urlRedefinir } from "@/lib/apiAdmin";
import {
  MSG_CONTA_INVALIDA,
  errosDoZod,
  esquemaCadastro,
  esquemaEntrar,
  esquemaRecuperar,
  type ErrosCampos,
} from "@/lib/visitanteAuth";

type Modo = "entrar" | "cadastro" | "recuperar";
type Aviso = { tipo: "erro" | "sucesso"; texto: string } | null;

const TITULOS: Record<Modo, { titulo: string; sub: string }> = {
  entrar: { titulo: "Entrar", sub: "Acesse sua conta de visitante para interagir com a ACMRB." },
  cadastro: { titulo: "Criar conta", sub: "Cadastro rápido e gratuito. Leva menos de um minuto." },
  recuperar: { titulo: "Recuperar senha", sub: "Enviaremos um link para você criar uma nova senha." },
};

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

    const { data, error } = await supabase.auth.signInWithPassword({ email: r.data.email, password: r.data.senha });
    if (error || !data.user) {
      if (error && /confirm/i.test(error.message)) {
        return setAviso({ tipo: "erro", texto: "Confirme seu e-mail antes de entrar (veja a caixa de entrada e o spam)." });
      }
      return setAviso({ tipo: "erro", texto: MSG_CONTA_INVALIDA });
    }

    // Administrador? Sai na hora e responde como se a conta não existisse
    const { data: ehAdmin } = await supabase.rpc("is_active_admin");
    if (ehAdmin === true) {
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

    setAviso({ tipo: "sucesso", texto: `Bem-vindo(a)${perfil?.nome ? `, ${perfil.nome.split(" ")[0]}` : ""}! Redirecionando…` });
    setTimeout(() => router.push("/"), 900);
  }

  // ---------- CADASTRO ----------
  async function cadastrar() {
    const r = esquemaCadastro.safeParse({ nome, telefone, cidade, nascimento, email, senha, confirmar });
    if (!r.success) return setErros(errosDoZod(r.error));
    const d = r.data;

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

    if (error) {
      if (/rate|limit/i.test(error.message)) return setAviso({ tipo: "erro", texto: "Muitas tentativas. Aguarde alguns minutos." });
      if (/already|registered|exists/i.test(error.message)) return setAviso({ tipo: "erro", texto: "Este e-mail já tem cadastro. Tente entrar ou recuperar a senha." });
      return setAviso({ tipo: "erro", texto: "Não foi possível criar a conta agora. Tente novamente." });
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
    setEspera(ESPERA_EMAIL_SEG);
    const { error } = await supabase.auth.resetPasswordForEmail(r.data.email, { redirectTo: urlRedefinir() });
    if (error && /rate|limit/i.test(error.message)) {
      return setAviso({ tipo: "erro", texto: "Muitos envios em pouco tempo. Aguarde alguns minutos." });
    }
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
      <div className="login__campo">
        <label htmlFor={`login-${id}`}>{rotulo}</label>
        <div className={`login__input${erro ? " login__input--erro" : ""}`}>
          <Icone size={17} aria-hidden="true" />
          <input
            id={`login-${id}`}
            aria-invalid={!!erro}
            aria-describedby={erro ? `login-${id}-erro` : undefined}
            {...props}
          />
        </div>
        {erro && <span id={`login-${id}-erro`} className="login__erro">{erro}</span>}
      </div>
    );
  }

  const tipoSenha = verSenha ? "text" : "password";
  const t = TITULOS[modo];

  return (
    <main className="login">
      <div className="login__brilho" aria-hidden="true" />

      <Link href="/" className="login__voltar">
        <ArrowLeft size={17} aria-hidden="true" /> Voltar ao site
      </Link>

      <motion.section
        className="login__cartao"
        initial={reduzir ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        aria-labelledby="login-titulo"
      >
        <header className="login__topo">
          <span className="login__selo"><Leaf size={22} aria-hidden="true" /></span>
          <p className="login__marca">RECICLAÊ • ACMRB</p>
          <h1 id="login-titulo" className="login__titulo">{t.titulo}</h1>
          <p className="login__sub">{t.sub}</p>
        </header>

        {modo !== "recuperar" && (
          <div className="login__abas" role="tablist" aria-label="Entrar ou criar conta">
            <button type="button" role="tab" aria-selected={modo === "entrar"} className={`login__aba${modo === "entrar" ? " login__aba--ativa" : ""}`} onClick={() => trocarModo("entrar")}>
              Entrar
            </button>
            <button type="button" role="tab" aria-selected={modo === "cadastro"} className={`login__aba${modo === "cadastro" ? " login__aba--ativa" : ""}`} onClick={() => trocarModo("cadastro")}>
              Criar conta
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {aviso && (
            <motion.div
              key={aviso.texto}
              role={aviso.tipo === "erro" ? "alert" : "status"}
              className={`login__aviso login__aviso--${aviso.tipo}`}
              initial={reduzir ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {aviso.tipo === "erro" ? <AlertCircle size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
              <span>{aviso.texto}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form className="login__form" onSubmit={enviar} noValidate>
          {modo === "cadastro" && (
            <>
              {campo("nome", "Nome completo", User, { type: "text", autoComplete: "name", maxLength: 100, value: nome, onChange: (e) => setNome(e.target.value), placeholder: "Seu nome e sobrenome" })}
              <div className="login__linha">
                {campo("telefone", "Telefone", Phone, { type: "tel", inputMode: "numeric", autoComplete: "tel-national", value: telefone, onChange: (e) => setTelefone(mascaraTelefone(e.target.value)), placeholder: "(85) 98888-7777" })}
                {campo("nascimento", "Data de nascimento", CalendarDays, { type: "date", autoComplete: "bday", max: new Date().toISOString().slice(0, 10), value: nascimento, onChange: (e) => setNascimento(e.target.value) })}
              </div>
              {campo("cidade", "Cidade", MapPin, { type: "text", autoComplete: "address-level2", maxLength: 80, value: cidade, onChange: (e) => setCidade(e.target.value), placeholder: "Ex.: Baturité" })}
            </>
          )}

          {campo("email", "E-mail", Mail, { type: "email", autoComplete: "email", inputMode: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "voce@email.com" })}

          {modo !== "recuperar" && (
            <div className="login__campo">
              <label htmlFor="login-senha">Senha</label>
              <div className={`login__input${erros.senha ? " login__input--erro" : ""}`}>
                <Lock size={17} aria-hidden="true" />
                <input
                  id="login-senha"
                  type={tipoSenha}
                  autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  aria-invalid={!!erros.senha}
                  aria-describedby={erros.senha ? "login-senha-erro" : modo === "cadastro" ? "login-senha-dica" : undefined}
                  placeholder="••••••••"
                />
                <button type="button" className="login__olho" onClick={() => setVerSenha((v) => !v)} aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}>
                  {verSenha ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {erros.senha ? (
                <span id="login-senha-erro" className="login__erro">{erros.senha}</span>
              ) : (
                modo === "cadastro" && <span id="login-senha-dica" className="login__dica">Mínimo 8 caracteres, com maiúscula, minúscula e número.</span>
              )}
            </div>
          )}

          {modo === "cadastro" &&
            campo("confirmar", "Confirmar senha", Lock, { type: tipoSenha, autoComplete: "new-password", value: confirmar, onChange: (e) => setConfirmar(e.target.value), placeholder: "Repita a senha" })}

          {modo === "entrar" && (
            <button type="button" className="login__link login__link--direita" onClick={() => trocarModo("recuperar")}>
              Esqueci minha senha
            </button>
          )}

          <button type="submit" className="login__botao" disabled={carregando || (modo === "recuperar" && espera > 0)}>
            {carregando && <Loader2 size={18} className="login__giro" aria-hidden="true" />}
            {modo === "entrar" && (carregando ? "Entrando…" : "Entrar")}
            {modo === "cadastro" && (carregando ? "Criando conta…" : "Criar minha conta")}
            {modo === "recuperar" && (espera > 0 ? `Reenviar em ${espera}s` : carregando ? "Enviando…" : "Enviar link")}
          </button>

          {modo === "recuperar" && (
            <button type="button" className="login__link" onClick={() => trocarModo("entrar")}>
              <ArrowLeft size={15} aria-hidden="true" /> Voltar para entrar
            </button>
          )}
        </form>

        <p className="login__rodape">
          Sem conta você pode navegar e ler todo o site. Com a conta de visitante você também pode enviar mensagens e interagir com a ACMRB.
        </p>
      </motion.section>
    </main>
  );
}
