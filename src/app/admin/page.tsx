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

import MaterialsSection from "@/components/admin/materials/MaterialsSection";

import {
  LogOut,
  ShieldCheck,
} from "lucide-react";

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

    if (
      !loading &&
      !user
    ) {

      router.push("/");

    }

  }, [
    user,
    loading,
    router,
  ]);

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-[#F5F7F4]
          px-6
        "
      >

        <div
          className="
            bg-white
            rounded-4xl
            border
            border-black/5
            px-8
            py-7
            shadow-sm
            text-center
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-[#E8F3EE]
              text-[#2E5E4E]
              flex
              items-center
              justify-center
              mx-auto
              mb-5
            "
          >

            <ShieldCheck size={24} />

          </div>

          <h2
            className="
              text-2xl
              font-black
              text-[#111827]
            "
          >

            Carregando painel

          </h2>

          <p
            className="
              text-zinc-500
              mt-3
              text-sm
            "
          >

            Aguarde enquanto
            os dados administrativos
            são carregados.

          </p>

        </div>

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
            2xl:flex-row
            2xl:items-center
            2xl:justify-between
            gap-8
            mb-10
          "
        >

          {/* LEFT */}

          <div className="space-y-6">

            <AdminHeader
              title="Painel Administrativo"
              description="
                Plataforma ESG-operacional
                da ACMRB para gestão
                institucional, ambiental
                e administrativa.
              "
            />

            {/* USER CARD */}

            {user && (

              <div
                className="
                  bg-white
                  border
                  border-black/5
                  rounded-4xl
                  px-5
                  py-5
                  shadow-sm
                  flex
                  items-center
                  gap-4
                  max-w-full
                  overflow-hidden
                "
              >

                <div
                  className="
                    shrink-0
                    w-14
                    h-14
                    rounded-3xl
                    bg-linear-to-br
                    from-[#2E5E4E]
                    to-[#5C9B80]
                    text-white
                    flex
                    items-center
                    justify-center
                    font-black
                    text-lg
                    shadow-lg
                  "
                >

                  {user.email
                    ?.charAt(0)
                    .toUpperCase()}

                </div>

                <div className="min-w-0">

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-wider
                      text-zinc-400
                      font-black
                    "
                  >

                    Administrador logado

                  </p>

                  <p
                    className="
                      font-black
                      text-[#111827]
                      mt-1
                      truncate
                      text-sm
                      md:text-base
                    "
                  >

                    {user.email}

                  </p>

                </div>

              </div>

            )}

          </div>

          {/* RIGHT */}

          <div
            className="
              flex
              items-center
              gap-4
              flex-wrap
            "
          >

            <button
              onClick={logout}
              className="
                h-12
                md:h-14
                px-6
                md:px-8
                rounded-2xl
                bg-red-500
                hover:bg-red-600
                transition-all
                text-white
                font-black
                shadow-lg
                hover:scale-[1.01]
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <LogOut size={18} />

              Sair do painel

            </button>

          </div>

        </div>

        {/* SECTIONS */}

        <div className="pb-10">

          {activeSection ===
            "Dashboard" && (
            <DashboardSection />
          )}

          {activeSection ===
            "Associados" && (
            <AssociadosSection />
          )}

          {activeSection ===
            "Notícias" && (
            <NoticiasSection />
          )}

          {activeSection ===
            "Denúncias" && (
            <DenunciasSection />
          )}

          {activeSection ===
            "Parceiros" && (
            <ParceirosSection />
          )}

          {activeSection ===
            "Projetos" && (
            <ProjetosSection />
          )}

          {activeSection ===
            "Indicadores ESG" && (
            <ESGSection />
          )}

          {activeSection ===
            "Materiais" && (
            <MaterialsSection />
          )}

          {activeSection ===
            "Contato" && (
            <ContatoSection />
          )}

          {activeSection ===
            "Configurações" && (
            <ConfiguracoesSection />
          )}

        </div>

      </AdminContent>

    </AdminContainer>

  );

}