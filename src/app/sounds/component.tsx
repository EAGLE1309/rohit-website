"use client";

import { useEffect } from "react";
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

  // 👇 Prevent body scroll when this component mounts
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <MaxWidthWrapper className="w-full h-[80vh] mt-24 md:mt-28 overflow-hidden relative flex flex-col md:flex-row items-center justify-center">
      <div className="mb-5 md:absolute pl-8 flex md:flex-col md:top-[calc(50%-5rem)] gap-3 md:gap-0 md:translate-y-1/2 md:left-1">
        <Link href={`?id=music`} className={`text-xs md:text-sm uppercase font-medium md:font-normal cursor-pointer`}>
          Music
          {type === "music" || !type ? <span>&nbsp;[&nbsp;•&nbsp;]</span> : <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;]</span>}
        </Link>
        <Link href={`?id=flyers`} className={`text-xs md:text-sm uppercase font-medium md:font-normal cursor-pointer`}>
          Flyers
          {type === "flyers" ? <span>&nbsp;[&nbsp;•&nbsp;]</span> : <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;]</span>}
        </Link>
        <Link href={`?id=photographies`} className={`text-xs md:text-sm uppercase font-medium md:font-normal cursor-pointer`}>
          Photographs
          {type === "photographies" ? <span>&nbsp;[&nbsp;•&nbsp;]</span> : <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;]</span>}
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
