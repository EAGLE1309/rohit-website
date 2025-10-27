"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { urlFor } from "@/lib/dashboard/sanity-cilent";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
/* eslint-disable @next/next/no-img-element */

import Image from "next/image";

const PhotographsComponent = ({ photographs }: { photographs: any }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-[272px] h-[425px]">
        <Image src={urlFor(photographs[0]?.image).url() || ""} alt="Tape" fill className="object-contain pointer-events-none" priority />
      </div>

      <Carousel opts={{ loop: true }} className="w-[565px]">
        <CarouselContent>
          {photographs.map((photograph: any) => (
            <CarouselItem className="basis-1/4 md:basis-1/5" key={photograph.id}>
              <Card title={photograph?.name} image={photograph?.image} />
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

const Card = ({ title, image }: { title: string; image: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`relative group overflow-hidden w-full h-full transition-all duration-300 ease-in-out cursor-pointer`}>
          <img src={urlFor(image).url()} alt={title} className="object-contain w-full min-h-[75px] mx-auto" />
        </div>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
};
