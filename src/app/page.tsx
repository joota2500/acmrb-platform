import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import AboutSection from "@/components/home/AboutSection";
import OperationsSection from "@/components/home/OperationsSection";
import ESGMetrics from "@/components/home/ESGMetrics";
import ReverseLogisticsSection from "@/components/home/ReverseLogisticsSection";
import NewsSection from "@/components/home/NewsSection";
import DenunciasSection from "@/components/home/DenunciasSection";
import PartnersSection from "@/components/home/PartnersSection";
import ContactSection from "@/components/home/ContactSection";
import InstitutionalSection from "@/components/home/InstitutionalSection";
import MaterialsPublicSection from "@/components/home/MaterialsPublicSection";

import { Suspense } from "react";
import Loading from "@/components/ui/LoadingState"; // vamos criar depois se não existir

export default function Home() {
  return (
    <main className="overflow-hidden bg-white dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero */}
      <HeroSection />

      {/* Conteúdo Principal */}
      <div className="space-y-20">
        <AboutSection />
        <OperationsSection />

        {/* Stats + ESG */}
        <StatsSection />

        <Suspense fallback={<Loading />}>
          <ESGMetrics />
        </Suspense>

        <MaterialsPublicSection />
        <ReverseLogisticsSection />
        <InstitutionalSection />

        <Suspense fallback={<Loading />}>
          <NewsSection />
        </Suspense>

        <DenunciasSection />
        <PartnersSection />
        <ContactSection />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
