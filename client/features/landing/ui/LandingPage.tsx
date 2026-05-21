'use client'

import { useEffect, useState } from 'react'
import { Navbar } from "@/features/landing/ui/Navbar";
import { HeroSection } from "@/features/landing/ui/HeroSection";
import { StatsBanner } from "@/features/landing/ui/StatsBanner";
import { FeaturesSection } from "@/features/landing/ui/FeaturesSection";
import { RoleSwitcher } from "@/features/landing/ui/RoleSwitcher";
import { CtaSection } from "@/features/landing/ui/CtaSection";
import { FooterSection } from "@/features/landing/ui/FooterSection";

import { useTheme } from "@/context/theme";

export function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const { currentTheme, themes } = useTheme()

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement

    // Save original status
    const hadDark = root.classList.contains('dark')
    const originalTheme = root.getAttribute('data-theme')
    const originalBg = root.style.getPropertyValue('--background')
    const originalFg = root.style.getPropertyValue('--foreground')

    // Force light styles for landing page
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
    root.style.setProperty('--background', '#fdf6e3')
    root.style.setProperty('--foreground', '#1a1a1a')

    return () => {
      // Restore on unmount
      if (hadDark) {
        root.classList.add('dark')
      }
      if (originalTheme) {
        root.setAttribute('data-theme', originalTheme)
      }

      const activeDef = themes.find(t => t.id === currentTheme)
      if (activeDef) {
        Object.entries(activeDef.variables).forEach(([key, value]) => {
          root.style.setProperty(key, value as string)
        })
        if (activeDef.isDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      } else {
        if (originalBg) root.style.setProperty('--background', originalBg)
        if (originalFg) root.style.setProperty('--foreground', originalFg)
      }
    }
  }, [currentTheme, themes])

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#fdf6e3]">
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-hand-cream/30">
      <Navbar />
      <HeroSection />
      <StatsBanner />
      <FeaturesSection />
      <RoleSwitcher />
      <CtaSection />
      <FooterSection />
    </main>
  );
}