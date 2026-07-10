"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, ShieldCheck } from "lucide-react";

import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminContainer from "@/components/admin/layout/AdminContainer";
import AdminContent from "@/components/admin/layout/AdminContent";
import AdminHeader from "@/components/admin/layout/AdminHeader";

/* Sections */
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

export default function AdminPage() {
  const router = useRouter();
  const { user, perfil, loading, logout, isGod } = useAuth();

  const [activeSection, setActiveSection] = useState("Dashboard");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (perfil?.tipo !== "admin") {
      router.push("/");
      return;
    }
  }, [user, perfil, loading, router]);

  if (loading || !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7F4]">
        <div className="bg-white rounded-4xl border border-black/5 px-8 py-7 shadow-sm text-center max-w-md w-full">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F3EE] text-[#2E5E4E] flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-2xl font-black text-[#111827]">
            Carregando painel
          </h2>
          <p className="text-zinc-500 mt-3 text-sm leading-7">
            Validando permissões administrativas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminContainer>
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <AdminContent>
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8 mb-10">
          {/* Header */}
          <div className="flex-1 min-w-0">
            <AdminHeader
              title="Painel Administrativo"
              description="Gestão completa da ACMRB - Transparência, Operações e Impacto ESG"
            />

            {/* User Info */}
            <div className="mt-6 bg-white border border-black/5 rounded-4xl px-6 py-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-3xl bg-linear-to-br from-emerald-700 to-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-lg">
                {perfil.nome?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-600 font-bold">
                  {isGod ? "ADM DEUS" : "ADMINISTRADOR"}
                </p>
                <p className="font-black text-zinc-900 mt-1">{perfil.nome}</p>
                <p className="text-sm text-zinc-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="h-14 px-8 rounded-3xl bg-red-500 hover:bg-red-600 text-white font-bold flex items-center gap-3 transition-all active:scale-95"
          >
            <LogOut size={20} />
            Sair do Painel
          </button>
        </div>

        {/* Content */}
        <div className="pb-10">
          {activeSection === "Dashboard" && <DashboardSection />}
          {activeSection === "Associados" && <AssociadosSection />}
          {activeSection === "Notícias" && <NoticiasSection />}
          {activeSection === "Denúncias" && <DenunciasSection />}
          {activeSection === "Parceiros" && <ParceirosSection />}
          {activeSection === "Projetos" && <ProjetosSection />}
          {activeSection === "Indicadores ESG" && <ESGSection />}
          {activeSection === "Materiais" && <MaterialsSection />}
          {activeSection === "Contato" && <ContatoSection />}
          {activeSection === "Configurações" && <ConfiguracoesSection />}
        </div>
      </AdminContent>
    </AdminContainer>
  );
}
