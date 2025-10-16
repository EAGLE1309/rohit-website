/* eslint-disable @next/next/no-img-element */
"use client";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { urlFor } from "@/lib/dashboard/sanity-cilent";

export default function WorkDetailsComponent({ project, allProjects }: { project: any; allProjects: any }) {
  const videoUrl = project?.videoUrl;

  return (
    <MaxWidthWrapper className="mt-8 py-16 relative">
      <div className="w-full grid grid-cols-3 gap-16">
        {/* Sidebar projects */}
        <div className="grid grid-cols-2 col-span-1 gap-8">
          {allProjects.map((p: any) => (
            <div className="w-full h-full" key={p._id}>
              <img src={urlFor(p.thumbnail).url()} alt={p.name || ""} className="w-full object-cover" />
              <p className="text-sm mt-2">{p.name}</p>
            </div>
          ))}
        </div>

        {/* Main project */}
        <div className="w-full col-span-2 gap-8">
          <div className="text-5xl py-8 font-bold">{project?.name}</div>
          <div className="border-2 w-full">
            <video
              src={videoUrl}
              controls
              preload="metadata"
              poster={urlFor(project.thumbnail).url() ?? undefined}
              playsInline
              className="w-full h-auto"
            >
              <source src={videoUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="text-sm md:text-md py-8">{project?.description}</div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
