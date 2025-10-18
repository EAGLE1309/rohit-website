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
  variable: "--font-dm-mono",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal"],
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
  title: {
    default: "Rohit Patnala",
    template: "%s | Rohit Patnala",
  },
  description: "Rohit Patnala - A multidisciplinary visual artist, creative director",
  keywords: [""],
  authors: [
    {
      name: "Rohit Patnala",
      url: "https://rohit.solithix.com",
    },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rohit.solithix.com",
    siteName: "Rohit Patnala",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@Rohit",
    title: "Rohit Patnala",
    description: "Rohit Patnala - A multidisciplinary visual artist, creative director",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className="">
        <body className={`${DM_mono.variable} ${inter.variable} ${neueMontreal.variable} antialiased`}>
          <Lenis>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} themes={["light", "dark", "red", "bolt", "beige"]}>
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
