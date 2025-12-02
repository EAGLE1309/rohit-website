"use client";

import { useState, useEffect, useMemo } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { fullImageUrl, blurPlaceholderUrl, thumbnailUrl } from "@/lib/dashboard/sanity-cilent";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

const PhotographsComponent = ({ photographs }: { photographs: any[] }) => {
  const [selectedImage, setSelectedImage] = useState(photographs[0]?.image);
  const [loading, setLoading] = useState(true);

  const blurredPlaceholder = useMemo(() => {
    if (!selectedImage) return "";
    return blurPlaceholderUrl(selectedImage);
  }, [selectedImage]);

  // whenever selectedImage changes, show loader until next image loads
  useEffect(() => {
    setLoading(true);
  }, [selectedImage]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-16 w-full md:ml-48">
      {/* Main display image */}
      {photographs.map((photograph: any) => (
        <div key={photograph.id} className="relative w-[305px] h-[375px] md:w-[272px] md:h-[425px]">
          {/* Blurred placeholder sourced via Sanity image builder */}
          <div
            aria-hidden
            className={`absolute inset-0 overflow-hidden transition-opacity duration-300 ${
              loading ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={
              blurredPlaceholder
                ? { backgroundImage: `url(${blurredPlaceholder})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          >
            {!blurredPlaceholder && <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />}
          </div>
          <Image
            src={fullImageUrl(photograph.image, 600) || ""}
            alt="Selected Photograph"
            fill
            className={`object-contain pointer-events-none transition-all duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
            placeholder={blurredPlaceholder ? "blur" : "empty"}
            blurDataURL={blurredPlaceholder || undefined}
            priority
            // next/image provides onLoadingComplete; fall back to onError as well
            onLoadingComplete={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        </div>
      ))}
    </div>
  );
};

export default PhotographsComponent;

const Card = ({ title, image, onClick }: { title: string; image: string; onClick: () => void }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className="relative group overflow-hidden w-full h-full transition-all duration-300 ease-in-out cursor-pointer hover:scale-105"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl(image, "sm")} alt={title} className="object-contain w-full min-h-[75px] mx-auto" loading="lazy" />
        </div>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
};
