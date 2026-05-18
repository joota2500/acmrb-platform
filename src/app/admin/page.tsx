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

/* SECTIONS */

import DashboardSection from "@/components/admin/sections/DashboardSection";

import AssociadosSection from "@/components/admin/sections/AssociadosSection";

import DenunciasSection from "@/components/admin/sections/DenunciasSection";

import ParceirosSection from "@/components/admin/sections/ParceirosSection";

import ProjetosSection from "@/components/admin/sections/ProjetosSection";

import ESGSection from "@/components/admin/sections/ESGSection";

import ContatoSection from "@/components/admin/sections/ContatoSection";

import ConfiguracoesSection from "@/components/admin/sections/ConfiguracoesSection";

import NoticiasSection from "@/components/admin/sections/NoticiasSection";

/* MATERIALS */

import MaterialsSection from "@/components/admin/materials/MaterialsSection";

/* ICONS */

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

  const router =
    useRouter();

  const [
    activeSection,
    setActiveSection,
  ] = useState(
    "Dashboard",
  );

  /* =========================
     AUTH
  ========================= */

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

  /* =========================
     LOADING
  ========================= */

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
            max-w-md
            w-full
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

            <ShieldCheck
              size={24}
            />

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
              leading-7
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

  /* =========================
     NO USER
  ========================= */

  if (!user) {

    return null;

  }

  /* =========================
     PAGE
  ========================= */

  return (

    <AdminContainer>

      {/* SIDEBAR */}

      <AdminSidebar
        activeSection={
          activeSection
        }
        setActiveSection={
          setActiveSection
        }
      />

      {/* CONTENT */}

      <AdminContent>

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            xl:flex-row
            xl:items-start
            xl:justify-between
            gap-8
            mb-10
          "
        >

          {/* LEFT */}

          <div
            className="
              flex-1
              min-w-0
            "
          >

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

            <div
              className="
                mt-6
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
                overflow-hidden
              "
            >

              {/* AVATAR */}

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

              {/* INFO */}

              <div
                className="
                  min-w-0
                "
              >

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

          </div>

          {/* RIGHT */}

          <div
            className="
              flex
              items-center
              gap-4
              flex-wrap
              w-full
              xl:w-auto
            "
          >

            <button
              onClick={logout}
              className="
                w-full
                sm:w-auto
                h-14
                px-8
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

              <LogOut
                size={18}
              />

              Sair do painel

            </button>

          </div>

        </div>

        {/* SECTION CONTENT */}

        <div
          className="
            pb-10
            min-w-0
          "
        >

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