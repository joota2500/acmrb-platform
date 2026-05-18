"use client";

import { useState } from "react";

import Link from "next/link";

import Image from "next/image";

import { motion } from "framer-motion";

import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Upload,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {

  const [loading, setLoading] =
    useState(false);

  const [isCadastro, setIsCadastro] =
    useState(false);

  const [isReset, setIsReset] =
    useState(false);

  const [nome, setNome] =
    useState("");

  const [telefone, setTelefone] =
    useState("");

  const [cidade, setCidade] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const [avatarFile, setAvatarFile] =
    useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] =
    useState("");

  // LOGIN VISITANTE

  async function handleLogin() {

    try {

      setLoading(true);

      const cleanEmail =
        email.trim().toLowerCase();

      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: senha,
        });

      if (authError) {

        console.log(authError);

        alert(
          "Email ou senha inválidos.",
        );

        return;

      }

      if (!authData.user) {

        alert(
          "Conta não encontrada.",
        );

        return;

      }

      // BUSCA VISITANTE

      const {
        data: visitante,
        error: visitanteError,
      } = await supabase
        .from("visitantes")
        .select("*")
        .eq(
          "auth_user_id",
          authData.user.id,
        )
        .maybeSingle();

      if (
        visitanteError ||
        !visitante
      ) {

        console.log(
          visitanteError,
        );

        await supabase.auth.signOut();

        alert(
          "Conta de visitante não encontrada.",
        );

        return;

      }

      // CONTA DESATIVADA

      if (
        visitante.ativo === false
      ) {

        await supabase.auth.signOut();

        alert(
          "Sua conta foi desativada.",
        );

        return;

      }

      alert(
        `Bem-vindo ${visitante.nome}!`,
      );

      window.location.href = "/";

    } catch (err) {

      console.log(err);

      alert(
        "Erro interno ao entrar.",
      );

    } finally {

      setLoading(false);

    }

  }

  // UPLOAD AVATAR

  async function uploadAvatar(
    userId: string,
  ) {

    try {

      if (!avatarFile)
        return "";

      const fileExt =
        avatarFile.name
          .split(".")
          .pop();

      const fileName =
        `${userId}.${fileExt}`;

      const filePath =
        `avatars/${fileName}`;

      const { error } =
        await supabase.storage
          .from("visitantes")
          .upload(
            filePath,
            avatarFile,
            {
              upsert: true,
            },
          );

      if (error) {

        console.log(
          "UPLOAD ERROR:",
          error,
        );

        return "";

      }

      const {
        data: publicUrl,
      } = supabase.storage
        .from("visitantes")
        .getPublicUrl(
          filePath,
        );

      return publicUrl.publicUrl;

    } catch (err) {

      console.log(err);

      return "";

    }

  }

  // CADASTRO VISITANTE

  async function handleCadastro() {

    try {

      setLoading(true);

      const cleanEmail =
        email.trim().toLowerCase();

      const cleanNome =
        nome.trim();

      const cleanCidade =
        cidade.trim();

      const cleanTelefone =
        telefone.trim();

      // VALIDAÇÃO

      if (
        !cleanNome ||
        !cleanTelefone ||
        !cleanCidade ||
        !cleanEmail ||
        !senha
      ) {

        alert(
          "Preencha todos os campos.",
        );

        return;

      }

      if (senha.length < 6) {

        alert(
          "A senha precisa ter pelo menos 6 caracteres.",
        );

        return;

      }

      // VERIFICA VISITANTE EXISTENTE

      const {
        data: visitanteExiste,
      } = await supabase
        .from("visitantes")
        .select("id")
        .eq(
          "email",
          cleanEmail,
        )
        .maybeSingle();

      if (visitanteExiste) {

        alert(
          "Este email já possui cadastro.",
        );

        return;

      }

      // AUTH

      const {
        data,
        error,
      } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password: senha,
          options: {
            data: {
              nome_completo:
                cleanNome,
            },
          },
        });

      if (error) {

        console.log(error);

        if (
          error.message
            .toLowerCase()
            .includes("already")
        ) {

          alert(
            "Este email já está registrado.",
          );

          return;

        }

        if (
          error.message
            .toLowerCase()
            .includes("rate")
        ) {

          alert(
            "Muitas tentativas. Aguarde alguns minutos.",
          );

          return;

        }

        alert(
          "Erro ao criar conta.",
        );

        return;

      }

      if (!data.user) {

        alert(
          "Erro ao criar usuário.",
        );

        return;

      }

      // UPLOAD AVATAR

      let avatarUrl = "";

      try {

        avatarUrl =
          await uploadAvatar(
            data.user.id,
          );

      } catch (err) {

        console.log(err);

      }

      // CRIA PERFIL VISITANTE

      const {
        error: visitanteError,
      } = await supabase
        .from("visitantes")
        .upsert(
          {
            auth_user_id:
              data.user.id,

            nome:
              cleanNome,

            email:
              cleanEmail,

            telefone:
              cleanTelefone,

            cidade:
              cleanCidade,

            avatar_url:
              avatarUrl,

            ativo: true,

            role: "visitante",
          },
          {
            onConflict:
              "auth_user_id",
          },
        );

      if (visitanteError) {

        console.log(
          "VISITANTE ERROR:",
          visitanteError,
        );

        await supabase.auth.signOut();

        if (
          visitanteError.message.includes(
            "visitantes_email_key",
          )
        ) {

          alert(
            "Este email já está cadastrado.",
          );

          return;

        }

        alert(
          "Erro ao criar perfil do visitante.",
        );

        return;

      }

      alert(
        "Conta criada com sucesso!",
      );

      window.location.href = "/";

    } catch (err) {

      console.log(err);

      alert(
        "Erro interno no cadastro.",
      );

    } finally {

      setLoading(false);

    }

  }

  // RESET SENHA

  async function handleResetSenha() {

    try {

      setLoading(true);

      if (!email) {

        alert(
          "Digite seu email.",
        );

        return;

      }

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo:
              "http://localhost:3000/reset-password",
          },
        );

      if (error) {

        console.log(error);

        alert(
          "Erro ao enviar email.",
        );

        return;

      }

      alert(
        "Link de recuperação enviado.",
      );

      setIsReset(false);

    } catch (err) {

      console.log(err);

      alert(
        "Erro interno.",
      );

    } finally {

      setLoading(false);

    }

  }

  async function handleSubmit() {

    if (loading) return;

    if (isReset) {

      await handleResetSenha();

      return;

    }

    if (isCadastro) {

      await handleCadastro();

      return;

    }

    await handleLogin();

  }

  return (

    <main
      className="
        relative
        min-h-screen
        bg-[#F7FAF8]
        flex
        items-center
        justify-center
        px-5
        py-16
        overflow-hidden
      "
    >

      {/* BG */}

      <div
        className="
          fixed
          top-0
          left-1/2
          -translate-x-1/2
          w-162.5
          h-162.5
          bg-emerald-400/10
          blur-[140px]
          rounded-full
          pointer-events-none
        "
      />

      {/* VOLTAR */}

      <Link
        href="/"
        className="
          absolute
          top-7
          left-5
          md:left-10
          inline-flex
          items-center
          gap-2
          text-zinc-600
          hover:text-[#2E5E4E]
          font-semibold
          transition-all
          z-20
        "
      >

        <ArrowLeft size={18} />

        Voltar ao portal

      </Link>

      {/* CARD */}

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          relative
          z-10
          w-full
          max-w-md
          bg-white/85
          backdrop-blur-2xl
          border
          border-black/5
          rounded-[36px]
          p-7
          md:p-10
          shadow-[0_25px_80px_rgba(15,23,42,0.08)]
        "
      >

        {/* HEADER */}

        <div className="text-center">

          <div
            className="
              w-18
              h-18
              mx-auto
              rounded-[26px]
              bg-linear-to-br
              from-[#2E5E4E]
              to-[#5F9B83]
              flex
              items-center
              justify-center
              text-white
              text-3xl
            "
          >

            ♻

          </div>

          <h1
            className="
              mt-6
              text-3xl
              font-black
              text-zinc-900
            "
          >

            {isReset
              ? "Recuperar senha"
              : isCadastro
              ? "Criar conta"
              : "Entrar"}

          </h1>

          <p
            className="
              mt-3
              text-zinc-500
              text-sm
            "
          >

            Plataforma oficial
            RECICLAÊ • ACMRB

          </p>

        </div>

        {/* FORM */}

        <div className="mt-10 space-y-5">

          {isCadastro && !isReset && (

            <div className="flex justify-center">

              <label
                className="
                  relative
                  cursor-pointer
                "
              >

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {

                    const file =
                      e.target.files?.[0];

                    if (!file) return;

                    setAvatarFile(file);

                    setAvatarPreview(
                      URL.createObjectURL(
                        file,
                      ),
                    );

                  }}
                />

                <div
                  className="
                    w-28
                    h-28
                    rounded-full
                    border-4
                    border-white
                    shadow-xl
                    overflow-hidden
                    bg-zinc-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  {avatarPreview ? (

                    <Image
                      src={avatarPreview}
                      alt="Avatar"
                      width={112}
                      height={112}
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />

                  ) : (

                    <User
                      size={38}
                      className="
                        text-zinc-400
                      "
                    />

                  )}

                </div>

                <div
                  className="
                    absolute
                    bottom-1
                    right-1
                    w-9
                    h-9
                    rounded-full
                    bg-[#2E5E4E]
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                  "
                >

                  <Upload size={16} />

                </div>

              </label>

            </div>

          )}

          {isCadastro && !isReset && (

            <>
              <Input
                label="Nome completo"
                icon={<User size={18} />}
                value={nome}
                onChange={setNome}
                type="text"
              />

              <Input
                label="Telefone"
                icon={<Phone size={18} />}
                value={telefone}
                onChange={setTelefone}
                type="text"
              />

              <Input
                label="Cidade"
                icon={<MapPin size={18} />}
                value={cidade}
                onChange={setCidade}
                type="text"
              />
            </>

          )}

          <Input
            label="Email"
            icon={<Mail size={18} />}
            value={email}
            onChange={setEmail}
            type="email"
          />

          {!isReset && (

            <Input
              label="Senha"
              icon={<Lock size={18} />}
              value={senha}
              onChange={setSenha}
              type="password"
            />

          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              w-full
              h-14
              rounded-2xl
              bg-[#2E5E4E]
              hover:bg-[#23473A]
              disabled:opacity-70
              text-white
              font-black
              flex
              items-center
              justify-center
              gap-3
              transition-all
            "
          >

            {loading
              ? "Carregando..."
              : (
                <>
                  {isReset
                    ? "Enviar link"
                    : isCadastro
                    ? "Criar conta"
                    : "Entrar"}

                  <ArrowRight
                    size={18}
                  />
                </>
              )}

          </button>

        </div>

        {/* ACTIONS */}

        <div
          className="
            mt-8
            text-center
            space-y-3
          "
        >

          {!isReset && (

            <button
              onClick={() =>
                setIsCadastro(
                  !isCadastro,
                )
              }
              className="
                block
                w-full
                text-sm
                text-[#2E5E4E]
                font-bold
              "
            >

              {isCadastro
                ? "Já possui conta? Entrar"
                : "Criar nova conta"}

            </button>

          )}

          <button
            onClick={() => {

              setIsReset(
                !isReset,
              );

              setIsCadastro(false);

            }}
            className="
              block
              w-full
              text-sm
              text-zinc-500
              hover:text-[#2E5E4E]
              font-semibold
            "
          >

            {isReset
              ? "Voltar"
              : "Esqueci minha senha"}

          </button>

        </div>

      </motion.div>

    </main>

  );

}

// INPUT COMPONENT

function Input({
  label,
  icon,
  value,
  onChange,
  type,
}: {
  label: string;

  icon: React.ReactNode;

  value: string;

  onChange: (
    value: string,
  ) => void;

  type: string;
}) {

  return (

    <div>

      <label
        className="
          text-sm
          font-bold
          text-zinc-700
        "
      >

        {label}

      </label>

      <div
        className="
          mt-2
          flex
          items-center
          gap-3
          h-14
          px-4
          rounded-2xl
          border
          border-black/5
          bg-zinc-50
        "
      >

        <div
          className="
            text-zinc-400
          "
        >

          {icon}

        </div>

        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value,
            )
          }
          className="
            w-full
            bg-transparent
            outline-none
            text-zinc-800
          "
        />

      </div>

    </div>

  );

}