"use client";

import { useRouter } from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";

import AdminSidebar from "@/components/admin/layout/AdminSidebar";

import DashboardSection from "@/components/admin/sections/DashboardSection";

import AssociadosSection from "@/components/admin/sections/AssociadosSection";

import DenunciasSection from "@/components/admin/sections/DenunciasSection";

import ParceirosSection from "@/components/admin/sections/ParceirosSection";

import ProjetosSection from "@/components/admin/sections/ProjetosSection";

import ESGSection from "@/components/admin/sections/ESGSection";

import ContatoSection from "@/components/admin/sections/ContatoSection";

import ConfiguracoesSection from "@/components/admin/sections/ConfiguracoesSection";

export default function AdminPage() {

  const {
    user,
    loading,
    logout,
  } = useAuth();

  const router = useRouter();

  const [
    activeSection,
    setActiveSection,
  ] = useState("Dashboard");

  useEffect(() => {

    if (!loading && !user) {

      router.push("/");

    }

  }, [user, loading, router]);

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-[#F5F7F4]
        "
      >
        Carregando...
      </div>

    );

  }

  return (

    <div
      className="
        min-h-screen
        bg-[#F5F7F4]
        flex
      "
    >

      {/* SIDEBAR */}

      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* CONTENT */}

      <main
        className="
          flex-1
          p-6
          md:p-10
        "
      >

        <div className="max-w-7xl mx-auto">

          {/* HEADER */}

          <div
            className="
              flex
              flex-col
              lg:flex-row
              lg:items-center
              lg:justify-between
              gap-6
              mb-10
            "
          >

            <div>

              <h1
                className="
                  text-4xl
                  font-black
                  text-[#1F2937]
                "
              >
                Painel Administrativo
              </h1>

              <p
                className="
                  text-zinc-600
                  mt-2
                "
              >
                Plataforma ESG ACMRB
              </p>

              {user && (

                <div
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-3
                    bg-white
                    border
                    border-black/5
                    rounded-2xl
                    px-4
                    py-3
                  "
                >

                  <div
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-[#2E5E4E]
                      text-white
                      flex
                      items-center
                      justify-center
                      font-bold
                    "
                  >

                    {user.email
                      ?.charAt(0)
                      .toUpperCase()}

                  </div>

                  <div>

                    <p
                      className="
                        text-sm
                        text-zinc-500
                      "
                    >
                      Administrador logado
                    </p>

                    <p
                      className="
                        font-semibold
                        text-[#1F2937]
                      "
                    >
                      {user.email}
                    </p>

                  </div>

                </div>

              )}

            </div>

            {/* LOGOUT */}

            <button
              onClick={logout}
              className="
                h-14
                px-6
                rounded-2xl
                bg-red-500
                hover:bg-red-600
                transition
                text-white
                font-semibold
              "
            >
              Sair
            </button>

          </div>

          {/* SECTIONS */}

          {activeSection === "Dashboard" && (
            <DashboardSection />
          )}

          {activeSection === "Associados" && (
            <AssociadosSection />
          )}

          {activeSection === "Denúncias" && (
            <DenunciasSection />
          )}

          {activeSection === "Parceiros" && (
            <ParceirosSection />
          )}

          {activeSection === "Projetos" && (
            <ProjetosSection />
          )}

          {activeSection === "Indicadores ESG" && (
            <ESGSection />
          )}

          {activeSection === "Contato" && (
            <ContatoSection />
          )}

          {activeSection === "Configurações" && (
            <ConfiguracoesSection />
          )}

        </div>

      </main>

    </div>

  );

}