"use client";

/**
 * Página /admin — painel administrativo
 * ------------------------------------------------------------
 * Permissões (INALTERADAS): enquanto carrega mostra "Validando
 * permissões"; sem login vai para /admin/login; com perfil diferente de
 * "admin" (visitante logado) volta para "/". O papel exibido vem de isGod (ADM DEUS) do AuthContext.
 *
 * Navegação:
 *  - Seção ativa na URL (?secao=associados): recarregar e o botão
 *    "voltar" do celular funcionam.
 *  - Barra lateral recolhível no desktop (salva no localStorage).
 *  - Gaveta no tablet/celular e barra rápida inferior no celular.
 *  - Sair pede confirmação.
 *
 * Responsividade: celular, tablet e notebook são tratados nos componentes de
 * src/components/admin/layout (classes Tailwind).
 */

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import MfaPortao from "@/components/admin/MfaPortao";
import { useInatividade, MINUTOS_INATIVIDADE } from "@/hooks/useInatividade";
import { PapelProvider } from "@/components/admin/layout/PapelAdmin";
import AdministradoresSection from "@/components/admin/sections/AdministradoresSection";
import MinhaContaSection from "@/components/admin/sections/MinhaContaSection";
import { podeVer, ROTULO_PAPEL, type PapelAdmin } from "@/constants/permissoes";
import AdminContainer from "@/components/admin/layout/AdminContainer";
import AdminContent from "@/components/admin/layout/AdminContent";
import AdminHeader from "@/components/admin/layout/AdminHeader";
import AdminBottomNav from "@/components/admin/layout/AdminBottomNav";
import { itemPorId, secaoValida, type SecaoId } from "@/constants/adminNav";

/* Seções */
import VisaoGeral from "@/components/admin/visao-geral/VisaoGeral";
import AssociadosSection from "@/components/admin/sections/AssociadosSection";
import VisitantesSection from "@/components/admin/sections/VisitantesSection";
import DenunciasSection from "@/components/admin/sections/DenunciasSection";
import VisaoMapaSection from "@/components/admin/sections/VisaoMapaSection";
import ApoiadoresSection from "@/components/admin/sections/ApoiadoresSection";
import LogisticaSection from "@/components/admin/sections/LogisticaSection";
import ProjetosSection from "@/components/admin/sections/ProjetosSection";
import MensagensSection from "@/components/admin/sections/MensagensSection";
import ColetasSection from "@/components/admin/sections/ColetasSection";
import CalendarioSection from "@/components/admin/sections/CalendarioSection";
import ESGSection from "@/components/admin/sections/ESGSection";
import RelatoriosSection from "@/components/admin/sections/RelatoriosSection";
import ConfiguracoesSection from "@/components/admin/sections/ConfiguracoesSection";
import NoticiasSection from "@/components/admin/sections/NoticiasSection";
import MaterialsSection from "@/components/admin/materials/MaterialsSection";
import { avisar } from "@/utils/alertas";

const CHAVE_RECOLHIDA = "acmrb-admin-menu-recolhido";

/** Tela de espera (mesma mensagem de antes) */
function Validando() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f5f7f4] p-4">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white px-8 py-8 text-center shadow-card">
        <div className="mx-auto mb-5 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-brand-mint text-brand motion-reduce:animate-none">
          <ShieldCheck size={26} aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-black text-ink">Carregando painel</h2>
        <p className="mt-3 text-sm leading-7 text-ink-muted">Validando permissões administrativas...</p>
      </div>
    </div>
  );
}

/** Seção bloqueada para o papel logado (ex.: link direto ?secao=esg) */
function SemPermissao() {
  return (
    <div role="alert" className="rounded-3xl border border-line bg-white p-6 text-center shadow-card sm:p-10">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning">
        <Lock size={26} aria-hidden="true" />
      </div>
      <h2 className="text-xl font-black text-ink sm:text-2xl">Acesso restrito</h2>
      <p className="mx-auto mt-2 max-w-md text-ink-muted">Esta área é exclusiva do ADM DEUS.</p>
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
      // sem login → volta pra home (não mostra o endereço secreto do login)
      router.replace("/");
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
    void avisar(`Sessão encerrada após ${MINUTOS_INATIVIDADE} minutos sem uso.`, "info", "Sessão encerrada");
    logout();
  }, [logout]);
  useInatividade(!!user && perfil?.tipo === "admin", expirar);

  if (loading || !perfil) return <Validando />;

  // Papel e permissões (src/constants/permissoes.ts)
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

      {/* Coluna principal: no desktop deixa espaço (margem) para a barra fixa */}
      <div className="min-w-0 transition-[margin-left] duration-300 motion-reduce:transition-none lg:ml-(--admin-sidebar)">
        <AdminHeader
          titulo={item.rotulo}
          descricao={item.descricao}
          icone={item.icone}
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
              {ativa === "dashboard" && <VisaoGeral papel={papel} nome={usuario.nome} />}
              {ativa === "noticias" && <NoticiasSection />}
              {ativa === "projetos" && <ProjetosSection />}
              {ativa === "apoiadores" && <ApoiadoresSection />}
              {ativa === "logistica" && <LogisticaSection />}
              {ativa === "visao-mapa" && <VisaoMapaSection />}
              {ativa === "associados" && <AssociadosSection />}
              {ativa === "visitantes" && papel === "deus" && <VisitantesSection />}
              {ativa === "mensagens" && <MensagensSection />}
              {ativa === "denuncias" && <DenunciasSection />}
              {ativa === "materiais" && <MaterialsSection />}
              {ativa === "coletas" && <ColetasSection />}
              {ativa === "calendario" && <CalendarioSection />}
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
