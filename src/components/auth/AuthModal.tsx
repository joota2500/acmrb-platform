"use client";

import {
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AuthModal({
  open,
  onClose,
}: Props) {

  const [isLogin, setIsLogin] =
    useState(true);

  const [nome, setNome] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleAuth() {

    try {

      setLoading(true);

      if (isLogin) {

        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password: senha,
          });

        if (error) {

          alert(error.message);

          return;

        }

      } else {

        const { error } =
          await supabase.auth.signUp({

            email,

            password: senha,

            options: {

              data: {

                nome,

              },

            },

          });

        if (error) {

          alert(error.message);

          return;

        }

      }

      onClose();

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  }

  return (

    <AnimatePresence>

      {open && (

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="
            fixed
            inset-0
            z-200
            bg-black/60
            backdrop-blur-md
            flex
            items-center
            justify-center
            p-5
          "
        >

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 30,
              scale: 0.95,
            }}
            className="
              w-full
              max-w-md
              rounded-4xl
              bg-white
              border
              border-black/5
              shadow-[0_30px_100px_rgba(0,0,0,0.15)]
              p-8
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                mb-8
              "
            >

              <div>

                <h2
                  className="
                    text-3xl
                    font-black
                    text-zinc-900
                  "
                >

                  {isLogin
                    ? "Entrar"
                    : "Criar conta"}

                </h2>

                <p
                  className="
                    text-zinc-500
                    mt-2
                  "
                >

                  Plataforma ACMRB

                </p>

              </div>

              <button
                onClick={onClose}
              >

                <X />

              </button>

            </div>

            <div
              className="
                flex
                flex-col
                gap-4
              "
            >

              {!isLogin && (

                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) =>
                    setNome(e.target.value)
                  }
                  className="
                    h-14
                    px-5
                    rounded-2xl
                    border
                    border-zinc-200
                    outline-none
                  "
                />

              )}

              <input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="
                  h-14
                  px-5
                  rounded-2xl
                  border
                  border-zinc-200
                  outline-none
                "
              />

              <input
                type="password"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) =>
                  setSenha(e.target.value)
                }
                className="
                  h-14
                  px-5
                  rounded-2xl
                  border
                  border-zinc-200
                  outline-none
                "
              />

              <button
                onClick={handleAuth}
                disabled={loading}
                className="
                  h-14
                  rounded-2xl
                  bg-[#2E5E4E]
                  hover:bg-[#23473A]
                  text-white
                  font-bold
                  transition-all
                  mt-2
                "
              >

                {loading
                  ? "Carregando..."
                  : isLogin
                  ? "Entrar"
                  : "Criar conta"}

              </button>

              <button
                onClick={() =>
                  setIsLogin(!isLogin)
                }
                className="
                  text-sm
                  text-[#2E5E4E]
                  font-semibold
                  mt-2
                "
              >

                {isLogin
                  ? "Criar nova conta"
                  : "Já tenho conta"}

              </button>

            </div>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>

  );

}