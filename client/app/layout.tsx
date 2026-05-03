import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Kalam, Patrick_Hand } from "next/font/google";
import { cookies } from "next/headers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const kalam = Kalam({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-kalam",
});

const patrickHand = Patrick_Hand({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-patrick",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: "BBrains - Smart Learning Platform",
  description: "A modern platform for smart learning and collaboration.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "BBrains - Smart Learning Platform",
    description: "Transform student engagement with our gamified learning platform.",
    url: "https://bbrains.com",
    siteName: "BBrains",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BBrains - Smart Learning Platform",
    description: "Transform student engagement with our gamified learning platform.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BBrains",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

import { ThemeProvider } from "@/context/theme"
import { UiModeProvider, type UiMode } from "@/context/ui-mode"
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const uiModeCookie = cookieStore.get("ui-mode")?.value;
  const initialUiMode: UiMode = uiModeCookie === "new" ? "new" : "classic";

  return (
    <html lang="en" className={`${inter.variable} ${kalam.variable} ${patrickHand.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect to critical origins */}
        {process.env.NEXT_PUBLIC_API_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} crossOrigin="anonymous" />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* LCP Logo Preloads */}
        <link rel="preload" href="/logo-dark.png" as="image" fetchpriority="high" />
        <link rel="preload" href="/logo-white.png" as="image" fetchpriority="high" />
        
        {/* PWA & iOS meta tags */}
        <link rel="icon" type="image/png" sizes="196x196" href="/favicon-196.png" />
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <UiModeProvider initialMode={initialUiMode}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TooltipProvider>
              {children}
              <Toaster position="top-right" />
            </TooltipProvider>
          </ThemeProvider>
        </UiModeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
