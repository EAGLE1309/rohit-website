"use client";

import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { urlFor } from "@/lib/dashboard/sanity-cilent";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

/* eslint-disable @next/next/no-img-element */

const FlyersComponent = ({ flyers }: { flyers: any[] }) => {
  const [selectedImage, setSelectedImage] = useState(flyers[0]?.image);
  const [loading, setLoading] = useState(true);

  // whenever selectedImage changes, show loader until next image loads
  useEffect(() => {
    setLoading(true);
  }, [selectedImage]);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Main display image */}
      <div className="relative w-[305px] h-[375px] md:w-[272px] md:h-[425px]">
        {/* Skeleton / placeholder */}
        <div
          aria-hidden
          className={`absolute inset-0 rounded-md overflow-hidden transition-opacity duration-300 ${
            loading ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>

        <Image
          src={urlFor(selectedImage).url() || ""}
          alt="Selected Photograph"
          fill
          className={`object-contain pointer-events-none transition-all duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
          priority
          // next/image provides onLoadingComplete; fall back to onError as well
          onLoadingComplete={() => setLoading(false)}
          onError={() => setLoading(false)}
        />

        {/* Spinner overlay */}
        {loading && <div className="absolute inset-0 flex items-center justify-center"></div>}
      </div>

      {/* Carousel */}
      <Carousel opts={{ loop: true }} className="w-full md:w-[565px]">
        <CarouselContent>
          {flyers.map((flyer: any) => (
            <CarouselItem className="basis-1/4 md:basis-1/5" key={flyer.id}>
              <Card title={flyer?.name} image={flyer?.image} onClick={() => setSelectedImage(flyer.image)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default FlyersComponent;

const Card = ({ title, image, onClick }: { title: string; image: string; onClick: () => void }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className="relative group overflow-hidden w-full h-full transition-all duration-300 ease-in-out cursor-pointer hover:scale-105"
        >
          <img src={urlFor(image).url()} alt={title} className="object-contain w-full min-h-[75px] mx-auto" />
        </div>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
};
