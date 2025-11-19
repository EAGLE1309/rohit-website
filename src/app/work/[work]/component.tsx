"use client";

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { urlFor } from "@/lib/dashboard/sanity-cilent";

export default function WorkDetailsComponent({ project }: { project: any; allProjects: any }) {
  const videoUrl = project?.videoUrl;

  return (
    <MaxWidthWrapper className="mt-24 overflow-hidden relative">
      <div className="w-full mt-28 flex flex-col gap-3">
        {/* Main project */}
        <div className="w-full md:grid md:grid-cols-2 gap-8">
          <div className="w-full flex flex-col gap-8">
            {/* Title section */}
            <div className="w-full grid grid-cols-5 gap-8">
              <div className="w-full col-span-2">
                <p className="text-5xl">01.</p>
              </div>
              <div className="w-full col-span-3">
                <div className="text-5xl uppercase font-medium">{project?.name}</div>
              </div>
            </div>

            {/* About section */}
            <div className="w-full grid grid-cols-5 gap-8">
              <div className="w-full col-span-2">
                <p className="text-sm font-medium">About</p>
              </div>
              <div className="w-full col-span-3">
                <p className="text-sm text-neutral-500 leading-relaxed">{project?.description}</p>
              </div>
            </div>

            {/* Project Details section */}
            <div className="w-full grid grid-cols-5 gap-8">
              <div className="w-full col-span-2">
                <p className="text-sm font-medium">Project Details</p>
              </div>
              <div className="w-full col-span-3 flex flex-col gap-2 text-sm text-neutral-500">
                <p>
                  <span className="text-neutral-900">Category</span> - {project?.category || "Personal"}
                </p>
                <p>
                  <span className="text-neutral-900">Service</span> - Mix Media Video
                </p>
                <p>
                  <span className="text-neutral-900">Client</span> - {project?.client || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Video section */}
          <div className="w-full flex items-start justify-end">
            <video
              src={videoUrl}
              controls
              preload="metadata"
              poster={urlFor(project.thumbnail).url() ?? undefined}
              playsInline
              className="w-full h-auto max-h-[65vh]"
            >
              <source src={videoUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
