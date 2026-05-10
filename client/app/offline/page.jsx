"use client";

import { WifiOff, RefreshCcw } from "lucide-react";
import { HandButton } from "@/components/hand-drawn/button";
import { HandCard, HandCardContent } from "@/components/hand-drawn/card";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-hand-paper flex items-center justify-center p-6 bg-paper-texture bg-[size:24px_24px]">
      <HandCard decoration="tack" className="max-w-md w-full rotate-1">
        <HandCardContent className="p-10 flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-hand-red/10 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-wobbly bg-hand-red/10 border-2 border-hand-red flex items-center justify-center">
              <WifiOff className="w-12 h-12 text-hand-red" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-kalam text-4xl font-bold text-hand-pencil tracking-tight">
              Signal Interrupted
            </h1>
            <p className="font-patrick text-xl text-hand-pencil/70 leading-relaxed">
              YO! It seems BBrains can&apos;t reach the network hub right now.
              Check your uplink and try again.
            </p>
          </div>

          <HandButton
            onClick={() => window.location.reload()}
            className="w-full h-14 bg-hand-blue text-white font-kalam text-xl rotate-1 group"
          >
            <RefreshCcw className="mr-2 w-5 h-5 group-active:rotate-180 transition-transform" />
            Retry Uplink
          </HandButton>

          <p className="text-xs font-patrick text-hand-pencil/40 uppercase tracking-widest">
            Protocol Error: Local Persistence Mode Active
          </p>
        </HandCardContent>
      </HandCard>
    </main>
  );
}
