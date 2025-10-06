/* eslint-disable @next/next/no-img-element */

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { IconPlayerPlayFilled } from "@tabler/icons-react";

const SoundsPage = () => {
  return (
    <MaxWidthWrapper className="h-[100vh] w-full overflow-hidden relative flex items-center justify-center">
      {" "}
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="relative w-[375px] h-[482px]">
          <Image src="/tape.png" alt="Tape" fill className="object-contain" />

          <img
            src="/discs.png"
            className="w-[59px] animate-spin h-[59px] absolute top-[38%] rounded-full left-1/2 -translate-x-1/2 -translate-y-1/2"
            alt="Discs"
          />

          <div className="w-[163px] h-[71px] bg-black absolute flex items-center justify-center p-1.5 bottom-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <p className="text-white text-xs font-mono text-center">
              Don Toliver For Bape <br />
              [December 2024]
            </p>
          </div>
        </div>
        <Carousel className="max-w-[565px]">
          <CarouselContent>
            {Array.from({ length: 15 }).map((_, index) => (
              <CarouselItem className="basis-1/4 md:basis-1/5" key={index}>
                <Card />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </MaxWidthWrapper>
  );
};

export default SoundsPage;

const Card = () => {
  return (
    <div className="relative group hover:rounded-2xl overflow-hidden w-full h-full transition-all duration-300 ease-in-out cursor-pointer">
      <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-black/45 backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-300 ease-in-out transition-all">
        <IconPlayerPlayFilled className="w-8 h-8 text-white" />
      </div>
      <img src="/home.png" alt="Tape" className="object-contain h-[75px]" />
    </div>
  );
};
