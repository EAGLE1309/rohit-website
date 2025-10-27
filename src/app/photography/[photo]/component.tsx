/* eslint-disable @next/next/no-img-element */
"use client";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { urlFor } from "@/lib/dashboard/sanity-cilent";

export default function PhotographyDetailsComponent({ photo, allPhotography }: { photo: any; allPhotography: any }) {
  return (
    <MaxWidthWrapper className="mt-8 py-16 relative">
      <div className="w-full flex flex-col gap-3">
        {/* Main project */}
        <div className="w-full h-[85vh] md:grid grid-cols-3 place-items-center  mb-8 gap-8">
          <div className="text-5xl py-8 font-bold">{photo?.name}</div>
          <div className="w-full">
            <img src={urlFor(photo.image).url()} className="w-fit h-full" alt={photo.name || ""} />
          </div>
          <div className="text-sm md:text-md py-8">{photo?.description}</div>
        </div>

        {/* Sidebar projects */}
        <div className="text-5xl py-8 font-bold">More Photographies</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {allPhotography.map((p: any) => (
            <div className="w-full h-full" key={p._id}>
              <img src={urlFor(p.image).url()} alt={p.name || ""} className="w-full object-cover" />
              <p className="text-sm mt-2">{p.name}</p>
            </div>
          ))}
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
