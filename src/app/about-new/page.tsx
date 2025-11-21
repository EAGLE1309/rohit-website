/* eslint-disable @next/next/no-img-element */
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { IconBrandInstagram, IconBrandSoundcloud, IconBrandTwitter, IconMail } from "@tabler/icons-react";

const AboutPage = () => {
  return (
    <MaxWidthWrapper className="mt-28 pb-20">
      <div className="relative min-h-screen flex overflow-hidden items-center justify-center">
        <div className="pointer-events-none md:hidden absolute inset-0">
          <img src="/about 3.png" alt="Rogit portrait 1" className="absolute top-0 left-1/2 w-32 h-40 -translate-x-1/2 object-cover" />
          <img src="/about 3.png" alt="Rogit portrait 2" className="absolute top-12 right-[-58px] w-32 h-44 object-cover" />
          <img src="/about 3.png" alt="Rogit portrait 8" className="absolute top-12 left-[-58px] w-32 h-40 object-cover" />

          <img src="/about 3.png" alt="Rogit portrait 3" className="absolute top-1/2 right-[-58px] hidden w-32 h-48 -translate-y-1/2 object-cover" />
          <img src="/about 3.png" alt="Rogit portrait 4" className="absolute bottom-12 right-[-58px] w-32 h-40 object-cover" />
          <img src="/about 3.png" alt="Rogit portrait 5" className="absolute bottom-0 left-1/2 w-32 h-40 -translate-x-1/2 object-cover" />
          <img src="/about 3.png" alt="Rogit portrait 6" className="absolute bottom-12 left-[-58px] w-32 h-44 object-cover" />
          <img src="/about 3.png" alt="Rogit portrait 7" className="absolute top-1/2 left-[-58px] hidden w-32 h-48 -translate-y-1/2 object-cover" />
        </div>
        <div className="relative w-full max-w-5xl aspect-[4/3]">
          {/* Scattered Images Grid */}
          <div className="pointer-events-none hidden md:block absolute inset-0">
            <img src="/about 3.png" alt="Rogit portrait 1" className="absolute top-0 left-1/2 w-32 h-40 -translate-x-1/2 object-cover" />
            <img src="/about 3.png" alt="Rogit portrait 2" className="absolute top-12 right-28 w-32 h-44 object-cover" />
            <img src="/about 3.png" alt="Rogit portrait 3" className="absolute top-1/2 right-0 w-32 h-48 -translate-y-1/2 object-cover" />
            <img src="/about 3.png" alt="Rogit portrait 4" className="absolute bottom-12 right-28 w-36 h-40 object-cover" />
            <img src="/about 3.png" alt="Rogit portrait 5" className="absolute bottom-0 left-1/2 w-40 h-44 -translate-x-1/2 object-cover" />
            <img src="/about 3.png" alt="Rogit portrait 6" className="absolute bottom-12 left-28 w-36 h-44 object-cover" />
            <img src="/about 3.png" alt="Rogit portrait 7" className="absolute top-1/2 left-0 w-32 h-48 -translate-y-1/2 object-cover" />
            <img src="/about 3.png" alt="Rogit portrait 8" className="absolute top-12 left-28 w-32 h-40 object-cover" />
          </div>

          {/* Middle Section with Images and Bio */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Center Bio Content */}
            <div className="text-center space-y-4 max-w-lg mx-auto px-6 py-8">
              <h1 className="text-3xl font-bold tracking-wide">RO6IT</h1>
              <p className="text-xs md:text-sm text-foreground">
                I’m a visual artist, DJ, and creative director <br />
                (b. June 30, 2004 — Houston, Texas).
              </p>

              <p className="text-xs md:text-sm text-foreground">
                I began my creative practice at the age of nine, making sports edits on Vine a small beginning that evolved into a deep fascination
                with culture and its movements. What started as playful experimentation quickly became a lifelong study of rhythm, image, and emotion.
              </p>

              <p className="text-xs md:text-sm text-foreground">
                Overtime, my interests expanded into pop culture, music, fashion, art, and philosophy disciplines that continue to shape the way I
                think and create. My work exists at the intersection of these worlds, guided by a pursuit of seamlessness across mediums and
                experiences.
              </p>

              {/* Social Media Icons */}
              <div className="flex justify-center gap-4 pt-4">
                <a href="mailto:rogit@example.com" className="hover:text-gray-600 transition-colors">
                  <IconMail className="size-5 transition-all hover:-translate-y-0.5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
                  <IconBrandInstagram className="size-5 transition-all hover:-translate-y-0.5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
                  <IconBrandTwitter className="size-5 transition-all hover:-translate-y-0.5" />
                </a>
                <a href="https://soundcloud.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
                  <IconBrandSoundcloud className="size-5 transition-all hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default AboutPage;
