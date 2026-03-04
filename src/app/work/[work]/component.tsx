"use client";

import { thumbnailUrl } from "@/lib/dashboard/sanity-cilent";
import { VideoPlayer } from "./video-player";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";

export default function WorkDetailsComponent({ project }: { project: any; allProjects: any }) {
  const videoUrl = project?.videoUrl;

  return (
    <MaxWidthWrapper className={`mt-16 md:mt-24 overflow-hidden relative ${project?.isHorizontalVideo ? "" : "lg:h-[calc(100dvh-5.6875rem)]"}`}>
      <div className="w-full h-full flex flex-col gap-3 py-8">
        {/* Main project */}
        <div className={`w-full h-full gap-8 overflow-hidden ${project?.isHorizontalVideo ? "flex flex-col" : "flex flex-col md:flex-row"}`}>
          <div className={`${project?.isHorizontalVideo ? "w-full" : "flex-1 min-w-0"} flex flex-col justify-between gap-8 ${project?.isHorizontalVideo ? "" : "h-full overflow-y-auto"}`}>
            {/* Title section */}
            <div className="w-full flex flex-col gap-3">
              <div className="w-full">
                <div className="text-3xl md:text-4xl font-medium">{project?.name}</div>
              </div>
            </div>

            <div className="flex flex-col max-w-xl my-8 md:my-0 gap-8">
              {/* About section */}
              <div className="w-full flex flex-col gap-3">
                <div className="w-full col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base font-mono text-foreground/55">About</p>
                </div>
                <div className="w-full col-span-2 md:col-span-3">
                  <p className="text-sm md:text-base leading-relaxed">{project?.description}</p>
                </div>
              </div>

              {/* Project Details section */}
              <div className="w-full flex flex-col gap-3">
                <div className="w-full col-span-1 md:col-span-2">
                  <p className="text-sm font-mono text-foreground/55 md:text-base">Project Details</p>
                </div>
                <div className="w-full col-span-2 md:col-span-3 flex flex-col gap-2 text-sm md:text-base">
                  <p><span className="font-mono text-foreground/55">Category : </span> {Array.isArray(project?.category) ? project?.category?.map((cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1)).join(", ") : (project?.category ? project.category.charAt(0).toUpperCase() + project.category.slice(1) : "Personal")} </p>
                  <span className="w-[75%] border-t-2 border-foreground/35" />
                  <p className="max-w-[75%]"><span className="font-mono text-foreground/55">Role : </span> {project?.role || "Director"} </p>
                  <span className="w-[75%] border-t-2 border-foreground/35" />
                  {
                    !project?.client && (
                      <>
                        <p><span className="font-mono text-foreground/55">Client : </span> {project?.client || "N/A"}</p>
                        <span className="w-[75%] border-t-2 border-foreground/35" />
                      </>
                    )
                  }
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
