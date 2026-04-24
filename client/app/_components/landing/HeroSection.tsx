"use client";

import Link from "next/link";
import { HandButton } from "@/components/hand-drawn/button";
import { HandCard } from "@/components/hand-drawn/card";
import { ArrowRight, ArrowDown, Sparkles, Zap } from "lucide-react";
import { landingData } from "@/data/landing";
import { toast } from "sonner";

export function HeroSection() {
  const { title, subtitle, primaryCta, secondaryCta, floatingCard } = landingData.hero;

  return (
    <section className="pt-24 pb-20 px-6 max-w-6xl mx-auto relative">
      <div className="absolute top-20 left-10 md:left-0 hidden lg:block pointer-events-none">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-hand-yellow opacity-80 animate-bounce" style={{ animationDuration: '3s' }}>
          <path d="M60 10C87.6142 10 110 32.3858 110 60C110 87.6142 87.6142 110 60 110C32.3858 110 10 87.6142 10 60C10 32.3858 32.3858 10 60 10Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8" />
        </svg>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 z-10 relative">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-hand-cream rounded-full font-patrick text-hand-pencil/70 text-sm mb-4">
              <Zap className="w-4 h-4 text-hand-yellow" />
              Gamified Learning for Modern Colleges
            </span>
            <h1 className="font-kalam text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-hand-pencil">
              {title.part1} <br />
              {title.part2} <span className="text-hand-red relative inline-block group cursor-default">{title.highlight}
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-hand-yellow -z-10 -rotate-2 group-hover:rotate-0 transition-transform"></span>
              </span>
            </h1>
          </div>
          
          <p className="font-patrick text-lg md:text-xl text-hand-pencil/80 max-w-lg leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <HandButton size="lg" className="rotate-1" asChild>
              <Link href={primaryCta.url}>
                {primaryCta.text} 
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </HandButton>
            <HandButton size="lg" variant="secondary" className="-rotate-1" asChild>
              <Link href={secondaryCta.url}>
                {secondaryCta.text}
                <ArrowDown className="ml-2 w-5 h-5" />
              </Link>
            </HandButton>
          </div>
        </div>

        <div className="relative">
          <div className="relative z-10 p-4 -rotate-2 hover:rotate-0 transition-all duration-300">
            <HandCard variant="yellow" decoration="tack" className="p-2 sm:p-4 aspect-square max-w-[420px] mx-auto flex items-center justify-center bg-white">
              <div className="w-full h-full rounded-wobblyMd border-2 border-hand-pencil/40 border-dashed flex flex-col items-center justify-center p-8 text-center gap-4 group">
                <Sparkles className="w-16 h-16 text-hand-blue group-hover:scale-110 transition-transform" strokeWidth={2} />
                <h2 className="font-kalam text-3xl font-bold">{floatingCard.title}</h2>
                <p className="font-patrick text-xl">{floatingCard.subtitle}</p>
                <HandButton
                  variant="secondary"
                  className="mt-4"
                  onClick={() =>
                    toast.success(`${floatingCard.subtitle}`, { position: "bottom-right" })
                  }
                >
                  {floatingCard.buttonText}
                </HandButton>
              </div>
            </HandCard>
          </div>
          <div className="absolute inset-0 top-8 left-8 max-w-[420px] aspect-square bg-hand-muted border-4 border-hand-pencil rounded-wobbly rotate-3 -z-10 mx-auto"></div>
        </div>
      </div>
    </section>
  );
}