"use client";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { thumbnailUrl } from "@/lib/dashboard/sanity-cilent";

export default function WorkDetailsComponent({ project }: { project: any; allProjects: any }) {
  const videoUrl = project?.videoUrl;

  return (
    <MaxWidthWrapper className="md:mt-24 overflow-hidden relative">
      <div className="w-full mt-28 flex flex-col gap-3">
        {/* Main project */}
        <div className="w-full md:grid md:grid-cols-2 gap-8">
          <div className="w-full flex flex-col justify-between gap-8">
            {/* Title section */}
            <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-8">
              <div className="w-full col-span-1 md:col-span-2">
                <p className="text-3xl md:text-5xl font-medium">
                  {(() => {
                    const name = project?.name || "";
                    const num = name ? String(name.split("").reduce((acc: any, c: any) => acc + c.charCodeAt(0), 0) % 100).padStart(2, "0") : "--";
                    return <p className="text-3xl md:text-5xl font-medium">{num}.</p>;
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
          <div className="w-full mb-8 flex items-start justify-end">
            <div className="w-full overflow-hidden">
              <video
                src={videoUrl}
                controls
                controlsList="nodownload noplaybackrate noremoteplayback"
                preload="metadata"
                poster={thumbnailUrl(project.thumbnail, "lg") ?? undefined}
                playsInline
                autoPlay
                disablePictureInPicture
                className="w-full h-auto max-h-[65vh]"
              >
                <source src={videoUrl} />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
