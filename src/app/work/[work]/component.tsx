"use client";

import { thumbnailUrl } from "@/lib/dashboard/sanity-cilent";
import { VideoPlayer } from "./video-player";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";

export default function WorkDetailsComponent({ project }: { project: any; allProjects: any }) {
  const videoUrl = project?.videoUrl;

  return (
    <MaxWidthWrapper className={`md:mt-24 overflow-hidden relative ${project?.isHorizontalVideo ? "" : "h-[calc(100dvh-5.6875rem)]"}`}>
      <div className="w-full h-full flex flex-col gap-3 py-8">
        {/* Main project */}
        <div className={`w-full h-full gap-8 overflow-hidden ${project?.isHorizontalVideo ? "flex flex-col" : "md:flex"}`}>
          <div className={`${project?.isHorizontalVideo ? "w-full" : "flex-1 min-w-0"} flex flex-col justify-between gap-8 ${project?.isHorizontalVideo ? "" : "h-full overflow-y-auto"}`}>
            {/* Title section */}
            <div className="w-full flex flex-col gap-3">
              <p className="text-3xl md:text-4xl font-medium">
                {(() => {
                  const name = project?.name || "";
                  const num = name ? String(name.split("").reduce((acc: any, c: any) => acc + c.charCodeAt(0), 0) % 100).padStart(2, "0") : "--";
                  return <span className="text-3xl md:text-4xl font-medium">{num}.</span>;
                })()}
              </p>
              <div className="w-full">
                <div className="text-3xl md:text-4xl font-medium">{project?.name}</div>
              </div>
            </div>

            <div className="flex flex-col my-8 md:my-0 gap-8">
              {/* About section */}
              <div className="w-full flex flex-col gap-3">
                <div className="w-full col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base">About</p>
                </div>
                <div className="w-full col-span-2 md:col-span-3">
                  <p className="text-sm md:text-base text-foreground/55 leading-relaxed">{project?.description}</p>
                </div>
              </div>

              {/* Project Details section */}
              <div className="w-full flex flex-col gap-3">
                <div className="w-full col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base">Project Details</p>
                </div>
                <div className="w-full col-span-2 md:col-span-3 flex flex-col gap-2 text-sm md:text-base text-foreground/55">
                  <p>Category - {project?.category?.map((cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1)).join(", ") || "Personal"} </p>
                  <span className="w-full border-t border-foreground" />
                  <p>Role - {project?.role || "Director"} </p>
                  <span className="w-full border-t border-foreground" />
                  <p>Client - {project?.client || "N/A"}</p>
                  <span className="w-full border-t border-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Video section */}
          <div className={`flex ${project?.isHorizontalVideo ? "w-full h-full justify-center" : "flex-shrink-0 h-full items-center justify-end"}`}>
            <VideoPlayer
              videoUrl={videoUrl}
              className={`${project?.isHorizontalVideo && "w-full! h-full!"} `}
              poster={thumbnailUrl(project.thumbnail, "lg") ?? undefined}
            />
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
