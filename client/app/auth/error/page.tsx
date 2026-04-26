"use client";

import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { HandCard, HandCardContent, HandCardHeader, HandCardTitle, HandCardDescription } from "@/components/hand-drawn/card";
import { HandButton } from "@/components/hand-drawn/button";
import Link from "next/link";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="w-full max-w-sm rotate-1">
      <HandCard decoration="tack" variant="yellow">
        <HandCardHeader>
          <div className="w-16 h-16 bg-hand-red/10 rounded-wobbly border-2 border-hand-red flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-8 h-8 text-hand-red" />
          </div>
          <HandCardTitle className="text-4xl text-center">Uplink Failed</HandCardTitle>
          <HandCardDescription className="text-center font-bold">Secure Protocol Error</HandCardDescription>
        </HandCardHeader>
        <HandCardContent className="space-y-8">
          <div className="space-y-4">
            <p className="font-patrick text-xl text-hand-pencil/80 text-center leading-relaxed">
              We encountered an issue during the authentication sequence.
            </p>
            
            <div className="p-4 bg-hand-paper/50 border-2 border-hand-pencil/10 border-dashed rounded-wobbly">
              <p className="text-xs font-black uppercase text-hand-pencil/40 mb-1 tracking-widest">Error Log</p>
              <p className="font-mono text-xs font-bold text-hand-red break-all">
                {error || "Unknown cryptographic failure"}
              </p>
            </div>
          </div>

          <HandButton asChild className="w-full -rotate-1">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Return to Login
            </Link>
          </HandButton>
          
          <p className="text-[10px] font-black uppercase text-hand-pencil/30 text-center tracking-[0.3em]">
            Bbrains Security Operations Center
          </p>
        </HandCardContent>
      </HandCard>
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-hand-paper bg-paper-texture bg-[size:24px_24px]">
      <Suspense fallback={
        <div className="font-kalam text-2xl animate-pulse text-hand-pencil">Loading Log...</div>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
