import type { Metadata } from "next";
import "./globals.css";
import { DM_Mono, Inter } from "next/font/google";

import localFont from "next/font/local";

import Navbar from "@/components/layout/navbar";
import Lenis from "@/components/layout/lenis";
import { Toaster } from "sonner";
import { ViewTransitions } from "next-view-transitions";
import { ThemeProvider } from "next-themes";

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
  metadataBase: new URL("https://rohit.solithix.com"),
  title: {
    default: "Rohit Patnala | Visual Artist & Creative Director",
    template: "%s | Rohit Patnala",
  },
  description:
    "Rohit Patnala is a multidisciplinary visual artist, DJ, and creative director based in Houston, Texas. Specializing in visual art, music, photography, and creative direction.",
  keywords: [
    "Rohit Patnala",
    "visual artist",
    "creative director",
    "DJ",
    "Houston artist",
    "Texas creative",
    "photography",
    "music producer",
    "graphic design",
    "art direction",
    "RO6IT",
  ],
  authors: [
    {
      name: "Rohit Patnala",
      url: "https://rohit.solithix.com",
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
    url: "https://rohit.solithix.com",
    siteName: "Rohit Patnala",
    title: "Rohit Patnala | Visual Artist & Creative Director",
    description:
      "Rohit Patnala is a multidisciplinary visual artist, DJ, and creative director based in Houston, Texas. Specializing in visual art, music, photography, and creative direction.",
    images: [
      {
        url: "/home.png",
        width: 1200,
        height: 630,
        alt: "Rohit Patnala - Visual Artist & Creative Director",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@ro6itism",
    site: "@ro6itism",
    title: "Rohit Patnala | Visual Artist & Creative Director",
    description: "Rohit Patnala is a multidisciplinary visual artist, DJ, and creative director based in Houston, Texas.",
    images: ["/home.png"],
  },
  alternates: {
    canonical: "https://rohit.solithix.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body className={`${DM_mono.variable} ${inter.variable} ${neueMontreal.variable} antialiased`}>
          <Lenis>
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
              <Navbar />
              {children}
              <Toaster />
            </ThemeProvider>
          </Lenis>
        </body>
      </html>
    </ViewTransitions>
  );
}
