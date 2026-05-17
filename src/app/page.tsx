import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";
import AboutSection from "../components/home/AboutSection";
import ReverseLogisticsSection from "../components/home/ReverseLogisticsSection";
import NewsSection from "../components/home/NewsSection";
import PartnersSection from "../components/home/PartnersSection";
import InstitutionalSection from "../components/home/InstitutionalSection";
import ContactSection from "../components/home/ContactSection";
import ESGMetrics from "../components/home/ESGMetrics";
import DenunciasSection from "@/components/home/DenunciasSection";


export default function Home() {
  return (
    <main>

      <Header />

      <HeroSection />

      <StatsSection /> 

      <AboutSection />

      <ESGMetrics />

      <ReverseLogisticsSection />

      <NewsSection />

      <DenunciasSection />

      <PartnersSection />

      <ContactSection />

      <InstitutionalSection />

      <Footer />

    </main>
  );
}