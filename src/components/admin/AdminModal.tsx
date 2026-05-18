"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  ShieldCheck,
  Mail,
  Lock,
  AlertTriangle,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdminModal({
  open,
  onClose,
}: Props) {

  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin() {

    try {

      setLoading(true);

      setError("");

      // LOGIN

      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword({

          email:
            email
              .trim()
              .toLowerCase(),

          password,

        });

      if (loginError) {

        setError(
          "Email ou senha inválidos.",
        );

        return;

      }

      if (!data.user) {

        setError(
          "Usuário inválido.",
        );

        return;

      }

      // ESPERA SESSÃO ESTABILIZAR

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1200,
          ),
      );

      // PEGA SESSÃO REAL

      const {
        data: sessionData,
      } =
        await supabase.auth.getSession();

      const sessionUser =
        sessionData
          ?.session?.user;

      if (!sessionUser) {

        setError(
          "Sessão inválida.",
        );

        return;

      }

      // BUSCA ADMIN

      const {
        data: admin,
        error: adminError,
      } = await supabase
        .from("admins")
        .select("*")
        .eq(
          "auth_user_id",
          sessionUser.id,
        )
        .eq("ativo", true)
        .maybeSingle();

      console.log(
        "ADMIN:",
        admin,
      );

      console.log(
        "ADMIN ERROR:",
        adminError,
      );

      if (
        adminError ||
        !admin
      ) {

        await supabase.auth.signOut();

        setError(
          "Acesso permitido apenas para administradores.",
        );

        return;

      }

      // UPDATE LOGIN

      await supabase
        .from("admins")
        .update({
          ultimo_login:
            new Date().toISOString(),
        })
        .eq(
          "auth_user_id",
          sessionUser.id,
        );

      onClose();

      router.push("/admin");

      router.refresh();

    } catch (err) {

      console.log(err);

      setError(
        "Erro inesperado.",
      );

    } finally {

      setLoading(false);

    }

  }

  if (!open) return null;

  return (

    <div
      className="
        fixed
        inset-0
        z-999
        bg-black/60
        backdrop-blur-md
        flex
        items-center
        justify-center
        p-5
      "
    >

      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-[38px]
          bg-white
          shadow-[0_25px_90px_rgba(0,0,0,0.35)]
        "
      >

        {/* HEADER */}

        <div
          className="
            relative
            bg-linear-to-br
            from-[#111827]
            via-[#1F2937]
            to-[#0F172A]
            px-8
            pt-8
            pb-20
          "
        >

          {/* CLOSE */}

          <button
            onClick={onClose}
            className="
              absolute
              top-5
              right-5
              w-11
              h-11
              rounded-2xl
              bg-white/10
              hover:bg-white/20
              transition-all
              flex
              items-center
              justify-center
              text-white
            "
          >

            <X size={18} />

          </button>

          {/* ICON */}

          <div
            className="
              w-20
              h-20
              rounded-[28px]
              bg-white
              text-[#111827]
              flex
              items-center
              justify-center
              shadow-2xl
            "
          >

            <ShieldCheck
              size={34}
            />

          </div>

          {/* TITLE */}

          <h2
            className="
              mt-7
              text-4xl
              font-black
              tracking-tight
              text-white
            "
          >

            Administração

          </h2>

          <p
            className="
              mt-3
              text-white/70
              leading-7
            "
          >

            Área exclusiva para
            administradores ACMRB.

          </p>

        </div>

        {/* FORM */}

        <div
          className="
            relative
            px-8
            pb-8
            -mt-10
          "
        >

          <div
            className="
              rounded-4xl
              bg-white
              border
              border-black/5
              shadow-xl
              p-6
              space-y-5
            "
          >

            {/* EMAIL */}

            <div>

              <label
                className="
                  text-sm
                  font-black
                  text-zinc-700
                "
              >

                Email administrativo

              </label>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-3
                  h-14
                  px-5
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-zinc-50
                "
              >

                <Mail
                  size={18}
                  className="
                    text-zinc-400
                  "
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
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

            {/* PASSWORD */}

            <div>

              <label
                className="
                  text-sm
                  font-black
                  text-zinc-700
                "
              >

                Senha

              </label>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-3
                  h-14
                  px-5
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-zinc-50
                "
              >

                <Lock
                  size={18}
                  className="
                    text-zinc-400
                  "
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
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

            {/* ERROR */}

            {error && (

              <div
                className="
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-4
                  text-sm
                  text-red-600
                "
              >

                <AlertTriangle
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                  "
                />

                <span>
                  {error}
                </span>

              </div>

            )}

            {/* BUTTON */}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="
                w-full
                h-14
                rounded-2xl
                bg-linear-to-r
                from-[#2E5E4E]
                to-[#1E3A32]
                hover:opacity-95
                text-white
                font-black
                transition-all
                shadow-xl
                disabled:opacity-60
              "
            >

              {loading
                ? "Entrando..."
                : "Entrar no painel"}

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}