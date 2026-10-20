"use client";

/**
 * Página /admin — painel administrativo
 * ------------------------------------------------------------
 * Permissões (INALTERADAS): enquanto carrega mostra "Validando
 * permissões"; sem login ou com perfil diferente de "admin" volta para
 * "/". O papel exibido vem de isGod (ADM DEUS) do AuthContext.
 *
 * Navegação:
 *  - Seção ativa na URL (?secao=associados): recarregar e o botão
 *    "voltar" do celular funcionam.
 *  - Barra lateral recolhível no desktop (salva no localStorage).
 *  - Gaveta no tablet/celular e barra rápida inferior no celular.
 *  - Sair pede confirmação.
 *
 * Responsividade: ver src/styles/admin-shell.css.
 */

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Clock3, ShieldCheck } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import MfaPortao from "@/components/admin/MfaPortao";
import { useInatividade, MINUTOS_INATIVIDADE } from "@/hooks/useInatividade";
import { PapelProvider } from "@/components/admin/layout/PapelAdmin";
import AdministradoresSection from "@/components/admin/sections/AdministradoresSection";
import MinhaContaSection from "@/components/admin/sections/MinhaContaSection";
import { podeEditar, podeVer, ROTULO_PAPEL, type PapelAdmin } from "@/lib/permissions";
import AdminContainer from "@/components/admin/layout/AdminContainer";
import AdminContent from "@/components/admin/layout/AdminContent";
import AdminHeader from "@/components/admin/layout/AdminHeader";
import AdminBottomNav from "@/components/admin/layout/AdminBottomNav";
import { itemPorId, secaoValida, type SecaoId } from "@/components/admin/layout/adminNav";

/* Seções */
import DashboardSection from "@/components/admin/sections/DashboardSection";
import AssociadosSection from "@/components/admin/sections/AssociadosSection";
import VisitantesSection from "@/components/admin/sections/VisitantesSection";
import DenunciasSection from "@/components/admin/sections/DenunciasSection";
// ParceirosSection: NÃO UTILIZADO (substituída por VisaoMapaSection)
import VisaoMapaSection from "@/components/admin/sections/VisaoMapaSection";
import ApoiadoresSection from "@/components/admin/sections/ApoiadoresSection";
import LogisticaSection from "@/components/admin/sections/LogisticaSection";
import ProjetosSection from "@/components/admin/sections/ProjetosSection";
import ESGSection from "@/components/admin/sections/ESGSection";
import RelatoriosSection from "@/components/admin/sections/RelatoriosSection";
import ConfiguracoesSection from "@/components/admin/sections/ConfiguracoesSection";
import NoticiasSection from "@/components/admin/sections/NoticiasSection";
import MaterialsSection from "@/components/admin/materials/MaterialsSection";

const CHAVE_RECOLHIDA = "acmrb-admin-menu-recolhido";

/** Tela de espera (mesma mensagem de antes) */
function Validando() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F5F7F4] p-4">
      <div className="bg-white rounded-3xl border border-black/5 px-8 py-7 shadow-sm text-center max-w-md w-full">
        <div className="w-14 h-14 rounded-2xl bg-[#E8F3EE] text-[#2E5E4E] flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={24} />
        </div>
        <h2 className="text-2xl font-black text-[#111827]">Carregando painel</h2>
        <p className="text-zinc-500 mt-3 text-sm leading-7">Validando permissões administrativas...</p>
      </div>
    </div>
  );
}

/** Aviso para seções ainda sem tela própria (Coletas, Relatórios) */
function EmBreve({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-10 text-center">
      <span className="w-14 h-14 rounded-2xl bg-[#DDF5EC] text-[#2E5E4E] flex items-center justify-center mx-auto">
        <Clock3 size={26} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-xl sm:text-2xl font-black text-zinc-900">{titulo}: em breve</h2>
      <p className="mt-2 text-zinc-500 max-w-md mx-auto">{descricao}. Esta seção ainda está em desenvolvimento.</p>
    </div>
  );
}

/** Seção bloqueada para o papel logado (ex.: link direto ?secao=esg) */
function SemPermissao() {
  return (
    <div role="alert" className="bg-white rounded-3xl border border-black/5 p-6 sm:p-10 text-center">
      <h2 className="text-xl sm:text-2xl font-black text-zinc-900">Acesso restrito</h2>
      <p className="mt-2 text-zinc-500 max-w-md mx-auto">Esta área é exclusiva do ADM DEUS.</p>
    </div>
  );
}

function PainelAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { user, perfil, loading, logout, isGod } = useAuth();

  const ativa = secaoValida(params.get("secao"));
  const item = itemPorId(ativa);

  const [recolhida, setRecolhida] = useState(false);
  const [gaveta, setGaveta] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);

  // Permissões: mesma regra da versão anterior
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

  // Preferência da barra recolhida (lida só no navegador)
  useEffect(() => {
    setRecolhida(localStorage.getItem(CHAVE_RECOLHIDA) === "1");
  }, []);

  const alternarRecolhida = () => {
    setRecolhida((v) => {
      localStorage.setItem(CHAVE_RECOLHIDA, v ? "0" : "1");
      return !v;
    });
  };

  // Troca de seção: grava na URL (push → o "voltar" volta à seção anterior)
  const selecionar = useCallback(
    (id: SecaoId) => {
      if (id === ativa) return;
      router.push(`${pathname}?secao=${id}`, { scroll: false });
      window.scrollTo({ top: 0 });
    },
    [ativa, pathname, router],
  );

  const fecharGaveta = useCallback(() => setGaveta(false), []);
  const cancelarSaida = useCallback(() => setConfirmarSaida(false), []);

  // Sai sozinho após MINUTOS_INATIVIDADE sem uso (segurança em viagem)
  const expirar = useCallback(() => {
    alert(`Sessão encerrada após ${MINUTOS_INATIVIDADE} minutos sem uso.`);
    logout();
  }, [logout]);
  useInatividade(!!user && perfil?.tipo === "admin", expirar);

  if (loading || !perfil) return <Validando />;

  // Papel e permissões (src/lib/permissions.ts)
  const papel: PapelAdmin = isGod ? "deus" : "admin";
  const permitido = podeVer(papel, ativa);

  const usuario = {
    nome: perfil.nome ?? "Administrador",
    email: user?.email ?? "",
    papel: ROTULO_PAPEL[papel],
  };

  return (
    <MfaPortao onSair={logout}>
    <PapelProvider value={papel}>
    <AdminContainer recolhida={recolhida}>
      <AdminSidebar
        ativa={ativa}
        onSelecionar={selecionar}
        recolhida={recolhida}
        onAlternarRecolhida={alternarRecolhida}
        gavetaAberta={gaveta}
        onFecharGaveta={fecharGaveta}
        usuario={usuario}
        onSair={() => setConfirmarSaida(true)}
      />

      <div className="admin-coluna">
        <AdminHeader
          titulo={item.rotulo}
          descricao={item.descricao}
          emBreve={!item.pronto}
          onAbrirGaveta={() => setGaveta(true)}
          gavetaAberta={gaveta}
          usuario={usuario}
          onSair={() => setConfirmarSaida(true)}
        />

        <AdminContent>
          {!permitido ? (
            <SemPermissao />
          ) : (
            <>
              {ativa === "dashboard" && <DashboardSection podeEditar={podeEditar(papel, "dashboard")} />}
              {ativa === "noticias" && <NoticiasSection />}
              {ativa === "projetos" && <ProjetosSection />}
              {ativa === "apoiadores" && <ApoiadoresSection />}
              {ativa === "logistica" && <LogisticaSection />}
              {ativa === "visao-mapa" && <VisaoMapaSection />}
              {ativa === "associados" && <AssociadosSection />}
              {ativa === "visitantes" && papel === "deus" && <VisitantesSection />}
              {ativa === "denuncias" && <DenunciasSection />}
              {ativa === "materiais" && <MaterialsSection />}
              {ativa === "coletas" && <EmBreve titulo="Coletas" descricao={item.descricao} />}
              {ativa === "esg" && <ESGSection />}
              {ativa === "relatorios" && <RelatoriosSection />}
              {ativa === "administradores" && <AdministradoresSection />}
              {ativa === "configuracoes" && <ConfiguracoesSection />}
              {ativa === "minha-conta" && <MinhaContaSection />}
            </>
          )}
        </AdminContent>
      </div>

      <AdminBottomNav ativa={ativa} onSelecionar={selecionar} onMais={() => setGaveta(true)} />

      <ConfirmDialog
        aberto={confirmarSaida}
        titulo="Sair do painel?"
        mensagem="Você precisará entrar novamente para acessar o painel administrativo."
        textoConfirmar="Sair"
        perigo
        onConfirmar={() => {
          setConfirmarSaida(false);
          logout();
        }}
        onCancelar={cancelarSaida}
      />
    </AdminContainer>
    </PapelProvider>
    </MfaPortao>
  );
}

// useSearchParams exige Suspense no Next 15
export default function AdminPage() {
  return (
    <Suspense fallback={<Validando />}>
      <PainelAdmin />
    </Suspense>
  );
}
