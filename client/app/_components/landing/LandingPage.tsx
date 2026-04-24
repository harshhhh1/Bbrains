import { Navbar } from "@/app/_components/landing/Navbar";
import { HeroSection } from "@/app/_components/landing/HeroSection";
import { StatsBanner } from "@/app/_components/landing/StatsBanner";
import { RoleSwitcher } from "@/app/_components/landing/RoleSwitcher";
import { CtaSection } from "@/app/_components/landing/CtaSection";
import { FooterSection } from "@/app/_components/landing/FooterSection";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-hand-cream/30">
      <Navbar />
      <HeroSection />
      <StatsBanner />
      <RoleSwitcher />
      <CtaSection />
      <FooterSection />
    </main>
  );
}