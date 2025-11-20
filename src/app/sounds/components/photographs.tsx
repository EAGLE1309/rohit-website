"use client";

import { useState, useEffect, useMemo } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { urlFor } from "@/lib/dashboard/sanity-cilent";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

const PhotographsComponent = ({ photographs }: { photographs: any[] }) => {
  const [selectedImage, setSelectedImage] = useState(photographs[0]?.image);
  const [loading, setLoading] = useState(true);

  const blurredPlaceholder = useMemo(() => {
    if (!selectedImage) return "";
    return urlFor(selectedImage).width(32).height(32).quality(40).blur(50).url();
  }, [selectedImage]);

  // whenever selectedImage changes, show loader until next image loads
  useEffect(() => {
    setLoading(true);
  }, [selectedImage]);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Main display image */}
      <div className="relative w-[305px] h-[375px] md:w-[272px] md:h-[425px]">
        {/* Blurred placeholder sourced via Sanity image builder */}
        <div
          aria-hidden
          className={`absolute inset-0 overflow-hidden transition-opacity duration-300 ${loading ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          style={
            blurredPlaceholder ? { backgroundImage: `url(${blurredPlaceholder})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined
          }
        >
          {!blurredPlaceholder && <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />}
        </div>

        <Image
          src={urlFor(selectedImage).url() || ""}
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

      {/* Carousel */}
      <Carousel opts={{ loop: true, skipSnaps: true }} className="w-full md:w-[565px]">
        <CarouselContent>
          {photographs.map((photograph: any) => (
            <CarouselItem className="basis-1/4 md:basis-1/5" key={photograph.id}>
              <Card title={photograph?.name} image={photograph?.image} onClick={() => setSelectedImage(photograph.image)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
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
          <img src={urlFor(image).url()} alt={title} className="object-contain w-full min-h-[75px] mx-auto" />
        </div>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
};
