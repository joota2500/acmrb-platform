/**
 * ============================================================
 * PÁGINA INICIAL (rota "/")
 * ============================================================
 * Esta é a página principal do site público da ACMRB.
 * Ela não tem lógica própria: apenas monta, em ordem, as seções
 * que ficam em `src/components/home/`, entre o Header e o Footer.
 *
 * Para mudar a ordem das seções no site, basta mudar a ordem
 * dos componentes no JSX abaixo.
 *
 * Seções que buscam dados no Supabase (ESGMetrics e NewsSection)
 * ficam dentro de <Suspense>, que mostra um carregamento
 * (<Loading />) enquanto os dados chegam.
 * ============================================================
 */

// ---------- Layout (cabeçalho e rodapé do site) ----------
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ---------- Seções da página inicial ----------
import HeroSection from "@/components/home/HeroSection"; // Banner principal com título, botões e números
import StatsSection from "@/components/home/StatsSection"; // Números de impacto
import AboutSection from "@/components/home/AboutSection"; // Quem somos (âncora #quem-somos)
import OperationsSection from "@/components/home/OperationsSection"; // Como a associação opera
import ESGMetrics from "@/components/home/ESGMetrics"; // Indicadores ESG (dados do Supabase)
import ReverseLogisticsSection from "@/components/home/ReverseLogisticsSection"; // Logística reversa
import NewsSection from "@/components/home/NewsSection"; // Últimas notícias (dados do Supabase)
import DenunciasSection from "@/components/home/DenunciasSection"; // Formulário de denúncias
import PartnersSection from "@/components/home/PartnersSection"; // Parceiros
import ContactSection from "@/components/home/ContactSection"; // Formulário de contato
import InstitutionalSection from "@/components/home/InstitutionalSection"; // Informações institucionais
import MaterialsPublicSection from "@/components/home/MaterialsPublicSection"; // Materiais recicláveis aceitos

// ---------- Utilitários ----------
import { Suspense } from "react";
import Loading from "@/components/ui/LoadingState"; // Indicador de carregamento

export default function Home() {
  return (
    // <main> envolve toda a página. "overflow-hidden" evita rolagem
    // horizontal causada por animações que saem da tela.
    <main className="overflow-hidden bg-white min-h-screen">
      {/* Cabeçalho fixo com logo, menu e menu mobile */}
      <Header />

      {/* Banner de abertura (primeira coisa que o visitante vê) */}
      <HeroSection />

      {/* ===== Conteúdo principal, na ordem em que aparece no site ===== */}
      <div>
        {/* 1. Apresentação da associação */}
        <AboutSection />

        {/* 2. Como funciona o trabalho dos catadores */}
        <OperationsSection />

        {/* 3. Números de impacto */}
        <StatsSection />

        {/* 4. Indicadores ESG (carrega dados do banco) */}
        <Suspense fallback={<Loading />}>
          <ESGMetrics />
        </Suspense>

        {/* 5. Materiais recicláveis aceitos */}
        <MaterialsPublicSection />

        {/* 6. Logística reversa */}
        <ReverseLogisticsSection />

        {/* 7. Informações institucionais */}
        <InstitutionalSection />

        {/* 8. Notícias recentes (carrega dados do banco) */}
        <Suspense fallback={<Loading />}>
          <NewsSection />
        </Suspense>

        {/* 9. Canal de denúncias */}
        <DenunciasSection />

        {/* 10. Parceiros e apoiadores */}
        <PartnersSection />

        {/* 11. Contato */}
        <ContactSection />
      </div>

      {/* Rodapé com links, contatos e informações legais */}
      <Footer />
    </main>
  );
}
