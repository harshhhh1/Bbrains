"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/features/landing/ui/Navbar";
import { HeroSection } from "@/features/landing/ui/HeroSection";
import { StatsBanner } from "@/features/landing/ui/StatsBanner";
import { RoleSwitcher } from "@/features/landing/ui/RoleSwitcher";
import { CtaSection } from "@/features/landing/ui/CtaSection";
import { FooterSection } from "@/features/landing/ui/FooterSection";

export function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.setProperty("--background", "#fdf6e3");
    root.style.setProperty("--foreground", "#1a1a1a");
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#fdf6e3]">
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      </main>
    );
  }

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
