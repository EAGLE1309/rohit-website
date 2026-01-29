"use client";

import { useState } from "react";
import { thumbnailUrl } from "@/lib/dashboard/sanity-cilent";
import { VideoPlayer } from "./video-player";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";

export default function WorkDetailsComponent({ project }: { project: any; allProjects: any }) {
  const videoUrl = project?.videoUrl;
  const [isHorizontalVideo, setIsHorizontalVideo] = useState<boolean | null>(null);

  return (
    <MaxWidthWrapper className={`md:mt-24 overflow-hidden relative ${isHorizontalVideo ? "" : "h-[calc(100dvh-5.6875rem)]"}`}>
      <div className="w-full h-full flex flex-col gap-3 py-8">
        {/* Main project */}
        <div className={`w-full h-full gap-8 overflow-hidden ${isHorizontalVideo ? "flex flex-col" : "md:flex"}`}>
          <div className={`${isHorizontalVideo ? "w-full" : "flex-1 min-w-0"} flex flex-col justify-between gap-8 ${isHorizontalVideo ? "" : "h-full overflow-y-auto"}`}>
            {/* Title section */}
            <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
              <div className="w-full col-span-1 md:col-span-2">
                <p className="text-3xl md:text-5xl font-medium">
                  {(() => {
                    const name = project?.name || "";
                    const num = name ? String(name.split("").reduce((acc: any, c: any) => acc + c.charCodeAt(0), 0) % 100).padStart(2, "0") : "--";
                    return <span className="text-3xl md:text-5xl font-medium">{num}.</span>;
                  })()}
                </p>
              </div>
              <div className="w-full col-span-2 md:col-span-3">
                <div className="text-3xl md:text-5xl uppercase font-medium ">{project?.name}</div>
              </div>
            </div>

            <div className="flex flex-col my-8 gap-8">
              {/* About section */}
              <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                <div className="w-full col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base font-medium">About</p>
                </div>
                <div className="w-full col-span-2 md:col-span-3">
                  <p className="text-sm md:text-base text-foreground/55 leading-relaxed">{project?.description}</p>
                </div>
              </div>

              {/* Project Details section */}
              <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
                <div className="w-full col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base">Project Details</p>
                </div>
                <div className="w-full col-span-2 md:col-span-3 flex flex-col gap-2 text-sm md:text-base text-foreground/55">
                  <p>Category - {project?.category || "Personal"} </p>
                  <p>Service - Mix Media Video</p>
                  <p>Client - {project?.client || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Video section */}
          <div className={`flex ${isHorizontalVideo ? "w-full h-full justify-center" : "flex-shrink-0 h-full items-center justify-end"}`}>
            <VideoPlayer
              videoUrl={videoUrl}
              className={`${isHorizontalVideo && "w-full! h-full!"} `}
              poster={thumbnailUrl(project.thumbnail, "lg") ?? undefined}
              onAspectRatioDetected={setIsHorizontalVideo}
            />
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
