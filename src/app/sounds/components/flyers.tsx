"use client";

import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { urlFor } from "@/lib/dashboard/sanity-cilent";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
/* eslint-disable @next/next/no-img-element */

import Image from "next/image";

const FlyersComponent = ({ flyers }: { flyers: any[] }) => {
  const [selectedImage, setSelectedImage] = useState(flyers[0]?.image);
  const [loading, setLoading] = useState(true);

  // reset loading whenever the main image changes
  useEffect(() => {
    setLoading(true);
  }, [selectedImage]);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Main Image Display */}
      <div className="relative w-[272px] h-[425px]">
        {/* Loading Skeleton */}
        <div
          aria-hidden
          className={`absolute inset-0 rounded-md overflow-hidden transition-opacity duration-300 ${
            loading ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>

        {/* Main Flyer Image */}
        <Image
          src={urlFor(selectedImage).url() || ""}
          alt="Selected Flyer"
          fill
          className={`object-contain pointer-events-none transition-all duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
          priority
          onLoadingComplete={() => setLoading(false)}
          onError={() => setLoading(false)}
        />

        {/* Small Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Carousel Thumbnails */}
      <Carousel opts={{ loop: true }} className="w-[565px]">
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
