import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./client-body";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: {
    default: "Holosuite | AI-Powered Interactive Simulations & Entertainment",
    template: "%s | Holosuite",
  },
  description:
    "Create immersive AI-powered simulations, interactive stories, and entertainment experiences. Generate dynamic content with Google Gemini AI, custom images with Imagen 4.0, and cinematic videos with Veo 3.1.",
  keywords: [
    "AI simulation",
    "interactive entertainment",
    "story generation",
    "AI-powered content",
    "simulation platform",
    "artificial intelligence",
    "dynamic storytelling",
    "AI image generation",
    "AI video generation",
    "Google Gemini",
    "Imagen 4.0",
    "Veo 3.1",
    "holosuite",
    "simulation creator",
    "AI entertainment",
  ],
  authors: [{ name: "Holosuite Team" }],
  creator: "Holosuite",
  publisher: "Holosuite",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://holosuite.lol",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Holosuite",
    title: "Holosuite | AI-Powered Interactive Simulations & Entertainment",
    description:
      "Create immersive AI-powered simulations, interactive stories, and entertainment experiences. Generate dynamic content with Google Gemini AI, custom images with Imagen 4.0, and cinematic videos with Veo 3.1.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Holosuite - AI-Powered Interactive Simulations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Holosuite | AI-Powered Interactive Simulations & Entertainment",
    description:
      "Create immersive AI-powered simulations, interactive stories, and entertainment experiences.",
    images: ["/og-image.png"],
    creator: "@holosuite",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
