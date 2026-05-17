"use client";

import { useRouter } from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";

import AdminSidebar from "@/components/admin/layout/AdminSidebar";

import AdminContainer from "@/components/admin/layout/AdminContainer";

import AdminContent from "@/components/admin/layout/AdminContent";

import AdminHeader from "@/components/admin/layout/AdminHeader";

import DashboardSection from "@/components/admin/sections/DashboardSection";

import AssociadosSection from "@/components/admin/sections/AssociadosSection";

import DenunciasSection from "@/components/admin/sections/DenunciasSection";

import ParceirosSection from "@/components/admin/sections/ParceirosSection";

import ProjetosSection from "@/components/admin/sections/ProjetosSection";

import ESGSection from "@/components/admin/sections/ESGSection";

import ContatoSection from "@/components/admin/sections/ContatoSection";

import ConfiguracoesSection from "@/components/admin/sections/ConfiguracoesSection";

import NoticiasSection from "@/components/admin/sections/NoticiasSection";

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

        <p className="text-zinc-500">

          Carregando painel...

        </p>

      </div>

    );

  }

  return (

    <AdminContainer>

      {/* SIDEBAR */}

      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* CONTENT */}

      <AdminContent>

        {/* TOPO */}

        <div
          className="
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-8
            mb-10
          "
        >

          <div className="space-y-6">

            <AdminHeader
              title="Painel Administrativo"
              description="
                Plataforma operacional ESG da ACMRB
                para gestão institucional, ambiental
                e administrativa.
              "
            />

            {user && (

              <div
                className="
                  inline-flex
                  items-center
                  gap-4
                  bg-white
                  border
                  border-black/5
                  rounded-3xl
                  px-5
                  py-4
                  shadow-sm
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    bg-[#2E5E4E]
                    text-white
                    flex
                    items-center
                    justify-center
                    font-black
                    text-lg
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
                      font-bold
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
              px-8
              rounded-2xl
              bg-red-500
              hover:bg-red-600
              transition-all
              text-white
              font-bold
              shadow-lg
              hover:scale-[1.02]
            "
          >

            Sair do painel

          </button>

        </div>

        {/* SECTIONS */}

        {activeSection === "Dashboard" && (
          <DashboardSection />
        )}

        {activeSection === "Associados" && (
          <AssociadosSection />
        )}

        {activeSection === "Notícias" && (
          <NoticiasSection />
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

      </AdminContent>

    </AdminContainer>

  );

} 