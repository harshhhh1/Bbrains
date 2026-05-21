import Link from "next/link";
import Image from "next/image";
import { HandButton } from "@/components/hand-drawn/button";
import { landingData } from "@/data/landing";

export function Navbar() {
  const { brand, links, cta } = landingData.navbar;

  return (
    <nav className="border-b-[3px] border-hand-pencil border-dashed bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center group" aria-label="BBrains Logo">
          <Image
            src="/brain.svg"
            alt="Bbrains Logo"
            width={100}
            height={50}
            className="h-10 w-auto max-w-60 group-hover:scale-105 transition-transform"
            priority
          />
          <span className="text-3xl font-patrick font-medium"> &nbsp; &nbsp;  BBrains</span>
        </Link>
        <div className="flex items-center gap-4">
          {links.map((link, idx) => (
            <Link 
              key={idx} 
              href={link.url} 
              className="font-patrick text-xl font-medium hidden md:block hover:text-hand-blue hover:underline decoration-wavy decoration-2 underline-offset-4 transition-all"
            >
              {link.text}
            </Link>
          ))}
          <HandButton asChild size="sm" className="-rotate-1">
            <Link href={cta.url}>{cta.text}</Link>
          </HandButton>
        </div>
      </div>
    </nav>
  );
}
