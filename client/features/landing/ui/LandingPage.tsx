import { Navbar } from "@/features/landing/ui/Navbar";
import { HeroSection } from "@/features/landing/ui/HeroSection";
import { StatsBanner } from "@/features/landing/ui/StatsBanner";
import { RoleSwitcher } from "@/features/landing/ui/RoleSwitcher";
import { CtaSection } from "@/features/landing/ui/CtaSection";
import { FooterSection } from "@/features/landing/ui/FooterSection";

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