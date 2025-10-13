/* eslint-disable @next/next/no-img-element */

import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { getProjectById } from "@/lib/dashboard/queries/projects";
import { urlFor } from "@/lib/dashboard/sanity-cilent";

interface WorkDetailsPageProps {
  params: {
    work: string;
  };
}

export default async function WorkDetailsPage({ params }: WorkDetailsPageProps) {
  const { work } = await params;

  const project = await getProjectById(work);

  console.log(project);

  return (
    <MaxWidthWrapper className="mt-8 py-16 relative">
      <div className="w-full flex flex-col gap-16">
        <img src={urlFor(project?.thumbnail).url()} alt="" className="w-[75%]" />
        <div>WorkDetailsPage {project?.name}</div>
        <div>
          A sleek and high-energy visual edit inspired by Don Toliver’s unique sound and BAPE’s streetwear aesthetic. This project blends cinematic
          motion cuts with smooth transitions, glitch overlays, and bold typography to capture the essence of luxury street culture.
          <br />
          <br />
          The edit experiments with muted tones and neon accents, synchronized perfectly to the beat — creating a dynamic mix of rhythm, fashion, and
          personality. Built as part of a creative exploration into modern hip-hop branding visuals, this video emphasizes mood, flow, and visual
          storytelling over traditional structure — letting the vibe drive the narrative.
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
