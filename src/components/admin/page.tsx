"use client";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

import { motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {

  const {
    user,
    loading,
    logout,
  } = useAuth();

  const router = useRouter();

  useEffect(() => {

    if (!loading && !user) {

      router.push("/");

    }

  }, [user, loading, router]);

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );

  }

  return (
    <main className="min-h-screen bg-[#F5F7F4] p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-4xl font-black text-[#1F2937]">
              Painel Administrativo
            </h1>

            <p className="text-zinc-600 mt-2">
              Plataforma ESG ACMRB
            </p>

            {user && (

              <div className="mt-4 inline-flex items-center gap-3 bg-white border border-black/5 rounded-2xl px-4 py-3">

                <div className="w-10 h-10 rounded-full bg-[#2E5E4E] text-white flex items-center justify-center font-bold">

                  {user.email
                    ?.charAt(0)
                    .toUpperCase()}

                </div>

                <div>

                  <p className="text-sm text-zinc-500">
                    Administrador logado
                  </p>

                  <p className="font-semibold text-[#1F2937]">
                    {user.email}
                  </p>

                </div>

              </div>

            )}

          </div>

          <button
            onClick={logout}
            className="
              px-5
              py-3
              rounded-2xl
              bg-red-500
              text-white
              font-semibold
            "
          >
            Sair
          </button>

        </div>

        {/* GRID */}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

          {[
            "Notícias",
            "Parceiros",
            "Projetos",
            "Impacto ESG",
          ].map((item) => (

            <motion.div
              key={item}
              whileHover={{
                y: -4,
              }}
              className="
                bg-white
                rounded-3xl
                p-8
                shadow-sm
                border
                border-black/5
              "
            >

              <h2 className="text-2xl font-bold text-[#1F2937]">
                {item}
              </h2>

              <p className="text-zinc-500 mt-3 leading-7">
                Área administrativa preparada
                para gerenciamento completo.
              </p>

            </motion.div>

          ))}

        </div>

      </div>

    </main>
  );
}