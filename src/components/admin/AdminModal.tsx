"use client";

import { useState } from "react";

import { supabase } from "../../lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdminModal({
  open,
  onClose,
}: Props) {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleLogin() {

    try {

      setLoading(true);

      setError("");

      const { error } =
        await supabase.auth.signInWithPassword({

          email,
          password,

        });

      if (error) {

        setError(error.message);

        return;

      }

      alert("Login realizado com sucesso.");

      onClose();

    } catch {

      setError("Erro inesperado.");

    } finally {

      setLoading(false);

    }

  }

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-999 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">

      <div className="w-full max-w-md rounded-4xl bg-white shadow-2xl p-8">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h2 className="text-3xl font-black text-zinc-900">
              Admin Login
            </h2>

            <p className="text-zinc-500 mt-2">
              Acesso administrativo ACMRB
            </p>

          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900"
          >
            ✕
          </button>

        </div>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full h-14 rounded-2xl border border-zinc-200 px-5 outline-none focus:border-emerald-500"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full h-14 rounded-2xl border border-zinc-200 px-5 outline-none focus:border-emerald-500"
          />

          {error && (

            <div className="text-red-500 text-sm">
              {error}
            </div>

          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold hover:scale-[1.02] transition-all"
          >

            {loading
              ? "Entrando..."
              : "Entrar"}

          </button>

        </div>

      </div>

    </div>
  );
}