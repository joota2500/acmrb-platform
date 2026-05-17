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

/* NOVAS SECTIONS */

import MaterialsPublicSection from "@/components/home/MaterialsPublicSection";

import EnvironmentalImpactSection from "@/components/home/EnvironmentalImpactSection";

import ESGHighlightsSection from "@/components/home/ESGHighlightsSection";

export default function Home() {

  return (

    <main
      className="
        overflow-hidden
        bg-white
      "
    >

      {/* HEADER */}

      <Header />

      {/* HERO */}

      <HeroSection />

      {/* STATS */}

      <StatsSection />

      {/* ABOUT */}

      <AboutSection />

      {/* ESG */}

      <ESGMetrics />

      {/* IMPACTOS */}

      <EnvironmentalImpactSection />

      {/* MATERIAIS */}

      <MaterialsPublicSection />

      {/* LOGÍSTICA */}

      <ReverseLogisticsSection />

      {/* ESG HIGHLIGHTS */}

      <ESGHighlightsSection />

      {/* NOTÍCIAS */}

      <NewsSection />

      {/* DENÚNCIAS */}

      <DenunciasSection />

      {/* PARCEIROS */}

      <PartnersSection />

      {/* CONTATO */}

      <ContactSection />

      {/* INSTITUCIONAL */}

      <InstitutionalSection />

      {/* FOOTER */}

      <Footer />

    </main>

  );

}