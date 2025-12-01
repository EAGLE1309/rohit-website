"use client";

import { useEffect } from "react";
import MusicsComponent from "./components/musics";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FlyersComponent from "./components/flyers";
import PhotographsComponent from "./components/photographs";

interface Types {
  id: "music" | "flyers" | "gallery";
}

const SoundsComponent = ({ tracks, flyers, photographs }: { tracks: any; flyers: any; photographs: any }) => {
  const searchParams = useSearchParams();
  const type = searchParams.get("id") as Types["id"];

  // 👇 Prevent body scroll when this component mounts (except for gallery)
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (type !== "gallery") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [type]);

  const isGallery = type === "gallery";

  return (
    <MaxWidthWrapper
      className={`w-full mt-24 md:mt-28 relative flex flex-col md:flex-row ${
        isGallery ? "min-h-screen h-full md:h-[80vh] justify-center" : "h-full md:h-[80vh] overflow-hidden items-center justify-center"
      }`}
    >
      <div
        className={`mb-5 pl-8 flex md:flex-col gap-3 md:gap-0 ${"md:fixed md:top-1/2 md:-translate-y-1/2 md:left-[max(0.25rem,calc(50vw-640px+0.875rem))]"}`}
      >
        <Link href={`?id=music`} className={`text-xs md:text-sm uppercase font-medium md:font-normal cursor-pointer`}>
          Music
          {type === "music" || !type ? <span>&nbsp;[&nbsp;•&nbsp;]</span> : <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;]</span>}
        </Link>
        <Link href={`?id=flyers`} className={`text-xs md:text-sm uppercase font-medium md:font-normal cursor-pointer`}>
          Flyers
          {type === "flyers" ? <span>&nbsp;[&nbsp;•&nbsp;]</span> : <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;]</span>}
        </Link>
        <Link href={`?id=gallery`} className={`text-xs md:text-sm uppercase font-medium md:font-normal cursor-pointer`}>
          Gallery
          {type === "gallery" ? <span>&nbsp;[&nbsp;•&nbsp;]</span> : <span>&nbsp;[&nbsp;&nbsp;&nbsp;&nbsp;]</span>}
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
