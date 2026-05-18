import Header from "../components/layout/Header";

import Footer from "../components/layout/Footer";

import HeroSection from "../components/home/HeroSection";

import StatsSection from "../components/home/StatsSection";

import AboutSection from "../components/home/AboutSection";

import ESGMetrics from "../components/home/ESGMetrics";

import ReverseLogisticsSection from "../components/home/ReverseLogisticsSection";

import NewsSection from "../components/home/NewsSection";

import DenunciasSection from "@/components/home/DenunciasSection";

import PartnersSection from "../components/home/PartnersSection";

import ContactSection from "../components/home/ContactSection";

import InstitutionalSection from "../components/home/InstitutionalSection";

import MaterialsPublicSection from "@/components/home/MaterialsPublicSection";

export default function Home() {

  return (

    <main
      className="
        overflow-hidden
        bg-white
      "
    >

      {/* =========================
          HEADER
      ========================= */}

      <Header />

      {/* =========================
          HERO
      ========================= */}

      <HeroSection />


      {/* =========================
          QUEM SOMOS
      ========================= */}


      <AboutSection />

       {/* =========================
          RESUMO ESG
          (dados rápidos)
      ========================= */}

      <StatsSection />

      {/* =========================
          DASHBOARD ESG
          (impactos resumidos)
      ========================= */}

      <ESGMetrics />

      {/* =========================
          PRINCIPAIS MATERIAIS
          (somente top 3)
      ========================= */}

      <MaterialsPublicSection />

      {/* =========================
          LOGÍSTICA REVERSA
      ========================= */}

      <ReverseLogisticsSection />

      {/* =========================
          ESG + TRANSPARÊNCIA
      ========================= */}

      <InstitutionalSection />

      {/* =========================
          NOTÍCIAS
      ========================= */}

      <NewsSection />

      {/* =========================
          DENÚNCIAS
      ========================= */}

      <DenunciasSection />

      {/* =========================
          PARCEIROS
      ========================= */}

      <PartnersSection />

      {/* =========================
          CONTATO
      ========================= */}

      <ContactSection />

      {/* =========================
          FOOTER
      ========================= */}

      <Footer />

    </main>

  );

}