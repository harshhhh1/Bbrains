"use client";

import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import {
  HandCard,
  HandCardContent,
  HandCardHeader,
  HandCardTitle,
  HandCardDescription,
} from "@/components/hand-drawn/card";
import { HandButton } from "@/components/hand-drawn/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-hand-paper bg-paper-texture bg-[size:24px_24px]">
      <div className="w-full max-w-sm rotate-1">
        <HandCard decoration="tape">
          <HandCardHeader>
            <div className="w-16 h-16 bg-hand-green/10 rounded-wobbly border-2 border-hand-green flex items-center justify-center mb-4 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-hand-green" />
            </div>
            <HandCardTitle className="text-4xl text-center">
              Transmission Sent
            </HandCardTitle>
            <HandCardDescription className="text-center font-bold">
              Protocol Initialization Success
            </HandCardDescription>
          </HandCardHeader>
          <HandCardContent className="space-y-8">
            <div className="space-y-4">
              <p className="font-patrick text-xl text-hand-pencil/80 text-center leading-relaxed">
                Thank you for joining the network. We&apos;ve dispatched a
                verification link to your inbox.
              </p>

              <div className="flex items-center gap-3 p-4 bg-hand-blue/5 border-2 border-hand-blue border-dashed rounded-wobbly">
                <Mail className="w-6 h-6 text-hand-blue shrink-0" />
                <p className="font-patrick text-sm text-hand-pencil leading-snug">
                  Please verify your identity via the link to finalize your
                  agent registration.
                </p>
              </div>
            </div>

            <HandButton asChild className="w-full -rotate-1">
              <Link href="/auth/login">
                Return to Base
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </HandButton>

            <p className="text-[10px] font-black uppercase text-hand-pencil/30 text-center tracking-[0.3em]">
              Bbrains Secure Authentication Protocol
            </p>
          </HandCardContent>
        </HandCard>
      </div>
    </div>
  );
}
