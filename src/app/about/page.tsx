/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { IconBrandInstagram, IconBrandLinkedin, IconBrandSoundcloud, IconBrandSpotify, IconBrandYoutube, IconMail } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Rohit Patnala (RO6IT) is a visual artist, DJ, and creative director with roots in the South Asian diaspora (b. June 30, 2004 — Houston, Texas). He began his creative practice at nine, making sports edits on Vine — an entry point that evolved into a sustained study spanning pop culture, technology, music, fashion, art, and philosophy.",
  keywords: [
    "about Rohit Patnala",
    "RO6IT bio",
    "Houston visual artist",
    "Texas creative director",
    "artist biography",
    "DJ Houston",
    "South Asian diaspora artist",
    "multidisciplinary creative",
  ],
  openGraph: {
    title: "About | Rohit Patnala",
    description:
      "Rohit Patnala (RO6IT) is a visual artist, DJ, and creative director with roots in the South Asian diaspora, based in Houston, Texas. Discover his journey from sports edits on Vine to multidisciplinary creative practice.",
    url: "https://ro6it.com/about",
    siteName: "Rohit Patnala",
    images: [
      {
        url: "https://ro6it.com/about/about-3.jpg",
        width: 1200,
        height: 800,
        alt: "Rohit Patnala portrait — visual artist and creative director",
      },
      {
        url: "https://ro6it.com/home.png",
        width: 1200,
        height: 630,
        alt: "Rohit Patnala - Visual Artist & Creative Director",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Rohit Patnala",
    description:
      "Rohit Patnala (RO6IT) — visual artist, DJ, and creative director with roots in the South Asian diaspora, based in Houston, Texas.",
    images: ["https://ro6it.com/about/about-3.jpg"],
  },
  alternates: {
    canonical: "https://ro6it.com/about",
  },
};

const AboutPage = () => {
  return (
    <MaxWidthWrapper className="mt-24 h-full gap-1">
      <div className="relative flex items-center justify-center h-full">
        {/* Center Bio Content */}
        <div className="text-center space-y-4 max-w-2xl mx-auto px-6 py-8">
          <img src="/about/about-3.jpg" alt="Rohit Patnala portrait — visual artist, DJ, and creative director from Houston, Texas" className="mx-auto h-40 object-cover" />
          <h1 className="text-3xl font-bold tracking-wide">RO6IT</h1>
          <p className="text-xs md:text-sm text-foreground">

            Rohit Patnala is a visual artist, DJ, and creative director with roots in the South Asian diaspora
            <br />
            (b. June 30, 2004 — Houston, Texas).
          </p>

          <p className="text-xs md:text-sm text-foreground">

            He began his creative practice at the age of nine, making sports edits on Vine, an entry point that evolved into a deeper fascination with culture and became a sustained study over time, spanning pop culture, technology, music, fashion, art, and philosophy. These disciplines continue to influence how he thinks and creates, with his work drawing from the reference points of these worlds and guided by a pursuit of cohesion across mediums and experiences.
          </p>

          <p className="text-xs md:text-sm text-foreground">

            Resume and EPK available upon request. For all inquiries, please reach out via email.  </p>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-4 pt-4">
            <a href="mailto:ropatnala@gmail.com">
              <IconMail className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
            <a href="https://instagram.com/ro6it" target="_blank" rel="noopener noreferrer" >
              <IconBrandInstagram className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
            <a
              href="https://soundcloud.com/user-735813520"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandSoundcloud className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
            <a href="https://www.linkedin.com/in/ropatnala" target="_blank" rel="noopener noreferrer">
              <IconBrandLinkedin className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
            <a href="https://open.spotify.com/user/31ik6ub332n34ficmjm6b4cdkt4i" target="_blank" rel="noopener noreferrer">
              <IconBrandSpotify className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
            <a href="https://www.youtube.com/@ro6it" target="_blank" rel="noopener noreferrer">
              <IconBrandYoutube className="size-5 transition-all hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default AboutPage;
