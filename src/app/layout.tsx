import type { Metadata } from "next";
import "./globals.css";
import { DM_Mono, Inter } from "next/font/google";

import localFont from "next/font/local";

import Navbar from "@/components/layout/navbar";
import { Toaster } from "sonner";
import { ViewTransitions } from "next-view-transitions";
import { ThemeProvider } from "next-themes";
import BandwidthPanel from "@/components/dev/bandwidth-panel";
import { PHProvider, PostHogPageView } from "./providers";
import { Suspense } from "react";

const DM_mono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal"],
  display: "swap",
  variable: "--font-dm-mono",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal"],
  display: "swap",
  variable: "--font-inter",
});

export const neueMontreal = localFont({
  src: [
    {
      path: "../lib/fonts/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../lib/fonts/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../lib/fonts/NeueMontreal-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../lib/fonts/NeueMontreal-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../lib/fonts/NeueMontreal-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../lib/fonts/NeueMontreal-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../lib/fonts/NeueMontreal-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ro6it.com"),
  title: {
    default: "Rohit Patnala | Visual Artist, DJ & Creative Director — Houston, TX",
    template: "%s | Rohit Patnala",
  },
  description:
    "Rohit Patnala (RO6IT) is a multidisciplinary visual artist, DJ, and creative director rooted in the South Asian diaspora, based in Houston, Texas. His practice spans visual art, music, photography, graphic design, and creative direction — drawing from pop culture, technology, fashion, art, and philosophy.",
  keywords: [
    "Rohit Patnala",
    "RO6IT",
    "visual artist",
    "creative director",
    "DJ",
    "Houston artist",
    "Texas creative",
    "South Asian diaspora artist",
    "photography",
    "music producer",
    "graphic design",
    "art direction",
    "multidisciplinary artist",
    "Houston DJ",
  ],
  authors: [
    {
      name: "Rohit Patnala",
      url: "https://ro6it.com",
    },
  ],
  creator: "Rohit Patnala",
  publisher: "Rohit Patnala",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ro6it.com",
    siteName: "Rohit Patnala",
    title: "Rohit Patnala | Visual Artist, DJ & Creative Director",
    description:
      "Rohit Patnala (RO6IT) is a multidisciplinary visual artist, DJ, and creative director, based in Houston, Texas. Explore visual art, music, photography, and creative direction.",
    images: [
      {
        url: "https://ro6it.com/home.png",
        width: 1200,
        height: 630,
        alt: "Rohit Patnala — Visual Artist, DJ & Creative Director",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@ro6itism",
    site: "@ro6itism",
    title: "Rohit Patnala | Visual Artist, DJ & Creative Director",
    description:
      "Rohit Patnala (RO6IT) — multidisciplinary visual artist, DJ, and creative director based in Houston, Texas. Explore visual art, music, photography, and creative direction.",
    images: ["https://ro6it.com/home.png"],
  },
  other: {
    "instagram:creator": "@ro6it",
  },
  alternates: {
    canonical: "https://ro6it.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Rohit Patnala",
  alternateName: "RO6IT",
  url: "https://ro6it.com",
  image: "https://ro6it.com/about/about-3.jpg",
  description:
    "Multidisciplinary visual artist, DJ, and creative director, based in Houston, Texas.",
  birthDate: "2004-06-30",
  birthPlace: {
    "@type": "Place",
    name: "Houston, Texas",
  },
  jobTitle: ["Visual Artist", "DJ", "Creative Director"],
  knowsAbout: ["Visual Art", "Music", "Photography", "Graphic Design", "Creative Direction", "DJing"],
  sameAs: [
    "https://instagram.com/ro6it",
    "https://soundcloud.com/user-735813520",
    "https://www.linkedin.com/in/ropatnala",
    "https://open.spotify.com/user/31ik6ub332n34ficmjm6b4cdkt4i",
    "https://www.youtube.com/@ro6it",
  ],
  email: "mailto:ropatnala@gmail.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className={`${DM_mono.variable} ${inter.variable} ${neueMontreal.variable} antialiased`}>
          <PHProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              themes={[
                "light",
                "dark",
                "one",
                "two",
                "three",
                "four",
                "five",
                "six",
                "seven",
                "eight",
                "nine",
                "ten",
                "eleven",
                "twelve",
                "thirteen",
                "fourteen",
              ]}
            >
              <Suspense fallback={null}>
                <PostHogPageView />
              </Suspense>
              <Navbar />
              {children}
              <Toaster />
              <BandwidthPanel />
            </ThemeProvider>
          </PHProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
