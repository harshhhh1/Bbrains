"use client";

import { useEffect, useState } from "react";
import { landingData } from "@/data/landing";
import { cn } from "@/lib/utils";

function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState("0");
  
  useEffect(() => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += 1;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(numericValue * eased);
      setDisplayValue(currentValue.toString());
      
      if (current >= steps) {
        setDisplayValue(numericValue.toString());
        clearInterval(timer);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <span>
      {displayValue}{suffix}
    </span>
  );
}

export function StatsBanner() {
  const stats = landingData.stats;
  
  return (
    <section className="py-16 px-6 bg-hand-pencil">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="font-kalam text-2xl text-white/80">
            {landingData.trustBadges.title}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className="text-center p-6 bg-white/10 rounded-wobbly backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
            >
              <div className="font-kalam text-4xl md:text-5xl font-bold text-hand-yellow">
                <AnimatedNumber value={stat.value} />
              </div>
              <div className="font-patrick text-lg text-white/80 mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {landingData.trustBadges.badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div 
                key={idx}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white font-patrick"
              >
                <Icon className="w-5 h-5 text-hand-yellow" />
                {badge.label}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}