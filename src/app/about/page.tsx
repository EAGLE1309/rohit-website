/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { IconBrandInstagram, IconBrandLinkedin, IconBrandSoundcloud, IconBrandSpotify, IconBrandYoutube, IconMail } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Rohit Patnala (RO6IT) - a visual artist, DJ, and creative director born June 30, 2004 in Houston, Texas. Discover his journey from sports edits on Vine to multidisciplinary creative practice.",
  keywords: ["about Rohit Patnala", "RO6IT bio", "Houston visual artist", "Texas creative director", "artist biography", "DJ Houston"],
  openGraph: {
    title: "About | Rohit Patnala",
    description: "Learn about Rohit Patnala (RO6IT) - a visual artist, DJ, and creative director born June 30, 2004 in Houston, Texas.",
    url: "https://ro6it.com/about",
    siteName: "Rohit Patnala",
    images: [
      {
        url: "https://ro6it.com/home.png",
        width: 1200,
        height: 630,
        alt: "Rohit Patnala - Visual Artist & Creative Director",
      },
    ],
  },
  alternates: {
    canonical: "https://ro6it.com/about",
  },
};

const AboutPage = () => {
  return (
    <MaxWidthWrapper className="mt-28">
      <div className="relative flex items-center justify-center">
        {/* Center Bio Content */}
        <div className="text-center space-y-4 max-w-lg mx-auto px-6 py-8">
          <img src="/about/about-2.png" alt="Rogit portrait 1" className="mx-auto w-32 h-40 object-cover" />
          <h1 className="text-3xl font-bold tracking-wide">RO6IT</h1>
          <p className="text-xs md:text-sm text-foreground">
            I’m a visual artist, DJ, and creative director <br />
            (b. June 30, 2004 — Houston, Texas).
          </p>

          <p className="text-xs md:text-sm text-foreground">
            I began my creative practice at the age of nine, making sports edits on Vine a small beginning that evolved into a deep fascination with
            culture and its movements. What started as playful experimentation quickly became a lifelong study of rhythm, image, and emotion.
          </p>

          <p className="text-xs md:text-sm text-foreground">
            Overtime, my interests expanded into pop culture, music, fashion, art, and philosophy disciplines that continue to shape the way I think
            and create. My work exists at the intersection of these worlds, guided by a pursuit of seamlessness across mediums and experiences.
          </p>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-4 pt-4">
            <a href="mailto:ropatnala@gmail.com" className="hover:text-gray-600 transition-colors">
              <IconMail className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
            <a href="https://instagram.com/ro6it" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
              <IconBrandInstagram className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
            <a
              href="https://soundcloud.com/user-735813520"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              <IconBrandSoundcloud className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
              <IconBrandLinkedin className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
              <IconBrandSpotify className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
              <IconBrandYoutube className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default AboutPage;
