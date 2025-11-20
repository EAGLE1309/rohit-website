/* eslint-disable @next/next/no-img-element */
"use client";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { urlFor } from "@/lib/dashboard/sanity-cilent";

export default function PhotographyDetailsComponent({ photo }: { photo: any }) {
  return (
    <MaxWidthWrapper className="md:mt-24 overflow-hidden relative">
      <div className="w-full mt-28 flex flex-col gap-3">
        {/* Main project */}
        <div className="w-full md:grid md:grid-cols-3 gap-8">
          <div className="w-full flex flex-col col-span-2 justify-between gap-8">
            {/* Title section */}
            <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
              <div className="w-full col-span-1 md:col-span-2">
                {(() => {
                  const name = photo?.name || "";
                  const num = name ? String(name.split("").reduce((acc: any, c: any) => acc + c.charCodeAt(0), 0) % 100).padStart(2, "0") : "--";
                  return <p className="text-3xl md:text-5xl font-medium">{num}.</p>;
                })()}
              </div>
              <div className="w-full col-span-2 md:col-span-3">
                <div className="text-3xl md:text-5xl uppercase font-medium ">{photo?.name}</div>
              </div>
            </div>

            <div className="flex flex-col my-8 gap-8">
              {/* About section */}
              <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                <div className="w-full col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base">About</p>
                </div>
                <div className="w-full col-span-2 md:col-span-3">
                  <p className="text-sm md:text-base text-foreground/55 leading-relaxed">{photo?.description}</p>
                </div>
              </div>

              {/* Project Details section */}
              <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                <div className="w-full col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base">Project Details</p>
                </div>
                <div className="w-full col-span-2 md:col-span-3 flex flex-col gap-2 text-sm md:text-base text-foreground/55">
                  <p>Category - {photo?.category || "Personal"} </p>
                  <p>Service - Mix Media Video</p>
                  <p>Client - {photo?.client || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Video section */}
          <div className="w-fit mb-8 place-self-end md:mb-0 flex items-start justify-end">
            <div className="w-full ">
              <img src={urlFor(photo.image).url()} className="w-fit object-contain h-full max-h-[68vh]" alt={photo.name || ""} />
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
