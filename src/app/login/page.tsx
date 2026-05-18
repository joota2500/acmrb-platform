"use client";

import { useState } from "react";

import Link from "next/link";

import Image from "next/image";

import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";

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

  // LOGIN

  async function handleLogin() {

  try {

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

    if (error) {

      alert(error.message);

      return;

    }

    // BUSCA VISITANTE

    const {
      data: visitante,
    } = await supabase
      .from("visitantes")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    // NÃO É VISITANTE

    if (!visitante) {

      await supabase.auth.signOut();

      alert(
        "Use o acesso administrativo secreto.",
      );

      return;

    }

    // DESATIVADO

    if (
      visitante.ativo === false
    ) {

      await supabase.auth.signOut();

      alert(
        "Sua conta foi desativada.",
      );

      return;

    }

    window.location.href = "/";

  } catch (err) {

    console.log(err);

    alert("Erro ao entrar.");

  } finally {

    setLoading(false);

  }

}
  // UPLOAD AVATAR

  async function uploadAvatar(
    userId: string,
  ) {

    if (!avatarFile) return "";

    const fileExt =
      avatarFile.name.split(".").pop();

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

      console.log(error);

      return "";

    }

    const {
      data: publicUrl,
    } = supabase.storage
      .from("visitantes")
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;

  }

  // CADASTRO

  async function handleCadastro() {

    try {

      setLoading(true);

      if (
        !nome ||
        !telefone ||
        !cidade ||
        !email ||
        !senha
      ) {

        alert(
          "Preencha todos os campos."
        );

        return;

      }

      // VERIFICA ADMIN ANTES

      const {
        data: adminExiste,
      } = await supabase
        .from("admins")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (adminExiste) {

        alert(
          "Este email pertence a um administrador."
        );

        return;

      }

      // AUTH

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome_completo:
              nome.trim(),
          },
        },
      });

      if (error) {

        if (
          error.message.includes(
            "rate limit",
          )
        ) {

          alert(
            "Muitas tentativas. Aguarde alguns minutos."
          );

          return;

        }

        alert(error.message);

        return;

      }

      if (!data.user) {

        alert(
          "Erro ao criar usuário."
        );

        return;

      }

      // UPLOAD AVATAR

      const avatarUrl =
        await uploadAvatar(
          data.user.id,
        );

      // CRIA VISITANTE

      const {
        error: visitanteError,
      } = await supabase
        .from("visitantes")
        .insert({
          auth_user_id:
            data.user.id,

          nome:
            nome.trim(),

          email,

          telefone,

          cidade,

          avatar_url:
            avatarUrl,

          ativo: true,

          role: "visitante",
        });

      if (visitanteError) {

        console.log(
          visitanteError,
        );

        alert(
          "Erro ao criar perfil."
        );

        return;

      }

      alert(
        "Conta criada com sucesso."
      );

      window.location.href = "/";

    } catch (err) {

      console.log(err);

      alert("Erro no cadastro.");

    } finally {

      setLoading(false);

    }

  }

  // RESET SENHA

  async function handleResetSenha() {

    try {

      setLoading(true);

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo:
              "http://localhost:3000/reset-password",
          },
        );

      if (error) {

        alert(error.message);

        return;

      }

      alert(
        "Link enviado para seu email."
      );

      setIsReset(false);

    } catch (err) {

      console.log(err);

      alert(
        "Erro ao enviar email."
      );

    } finally {

      setLoading(false);

    }

  }

  async function handleSubmit() {

    if (isReset) {

      handleResetSenha();

      return;

    }

    if (isCadastro) {

      handleCadastro();

      return;

    }

    handleLogin();

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

          {/* AVATAR */}

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

          {/* NOME */}

          {isCadastro && !isReset && (

            <Input
              label="Nome completo"
              icon={
                <User size={18} />
              }
              value={nome}
              onChange={setNome}
              type="text"
            />

          )}

          {/* TELEFONE */}

          {isCadastro && !isReset && (

            <Input
              label="Telefone"
              icon={
                <Phone size={18} />
              }
              value={telefone}
              onChange={setTelefone}
              type="text"
            />

          )}

          {/* CIDADE */}

          {isCadastro && !isReset && (

            <Input
              label="Cidade"
              icon={
                <MapPin size={18} />
              }
              value={cidade}
              onChange={setCidade}
              type="text"
            />

          )}

          {/* EMAIL */}

          <Input
            label="Email"
            icon={
              <Mail size={18} />
            }
            value={email}
            onChange={setEmail}
            type="email"
          />

          {/* SENHA */}

          {!isReset && (

            <Input
              label="Senha"
              icon={
                <Lock size={18} />
              }
              value={senha}
              onChange={setSenha}
              type="password"
            />

          )}

          {/* BUTTON */}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              w-full
              h-14
              rounded-2xl
              bg-[#2E5E4E]
              hover:bg-[#23473A]
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