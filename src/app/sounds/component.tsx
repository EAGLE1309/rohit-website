"use client";

import { Suspense } from "react";
import MusicsComponent from "./components/musics";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FlyersComponent from "./components/flyers";
import PhotographsComponent from "./components/photographs";

interface Types {
  id: "music" | "flyers" | "photographies";
}

const SoundsComponent = ({ tracks, flyers, photographs }: { tracks: any; flyers: any; photographs: any }) => {
  const searchParams = useSearchParams();

  const type = searchParams.get("id") as Types["id"];
  return (
    <MaxWidthWrapper className="h-[100vh] w-full overflow-hidden relative flex items-center justify-center">
      <div className="absolute flex flex-col top-[calc(50%-5rem)] translate-y-1/2 left-1">
        <Link href={`?id=music`} className={`text-sm uppercase font-medium md:font-normal cursor-pointer`}>
          Music
          {type === "music" || !type ? (
            <span className="text-red-500 relative">
              &nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span className="after:absolute after:h-[2px] after:top-1/2 after:-translate-y-1/2 after:w-[28px] after:bg-current after:left-0" />]
            </span>
          ) : (
            <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]</span>
          )}
        </Link>
        <Link href={`?id=flyers`} className={`text-sm uppercase font-medium md:font-normal cursor-pointer`}>
          Flyers
          {type === "flyers" ? (
            <span className="text-red-500 relative">
              &nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span className="after:absolute after:h-[2px] after:top-1/2 after:-translate-y-1/2 after:w-[28px] after:bg-current after:left-0" />]
            </span>
          ) : (
            <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]</span>
          )}
        </Link>
        <Link href={`?id=photographies`} className={`text-sm uppercase font-medium md:font-normal cursor-pointer`}>
          Photographs
          {type === "photographies" ? (
            <span className="text-red-500 relative">
              &nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span className="after:absolute after:h-[2px] after:top-1/2 after:-translate-y-1/2 after:w-[28px] after:bg-current after:left-0" />]
            </span>
          ) : (
            <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]</span>
          )}
        </Link>
      </div>

      {type === "music" || !type ? (
        <MusicsComponent TRACKS={tracks} />
      ) : type === "flyers" ? (
        <FlyersComponent flyers={flyers} />
      ) : (
        <PhotographsComponent photographs={photographs} />
      )}
    </MaxWidthWrapper>
  );
};

export default SoundsComponent;
