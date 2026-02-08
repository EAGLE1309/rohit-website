import type { Metadata } from "next";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import ProjectsComponent from "./components/project";
import { getProjectsMain } from "@/lib/dashboard/queries/projects-main";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore the creative projects of Rohit Patnala (RO6IT) — spanning visual art, creative direction, graphic design, music, and photography.",
  keywords: [
    "Rohit Patnala projects",
    "RO6IT portfolio",
    "creative direction projects",
    "visual art Houston",
    "multidisciplinary artist",
    "graphic design portfolio",
    "South Asian creative",
  ],
  openGraph: {
    title: "Projects | Rohit Patnala",
    description:
      "Explore the creative projects of Rohit Patnala (RO6IT) — visual art, creative direction, graphic design, music, and photography.",
    url: "https://ro6it.com/projects",
    siteName: "Rohit Patnala",
    images: [
      {
        url: "https://ro6it.com/home.png",
        width: 1200,
        height: 630,
        alt: "Rohit Patnala - Projects Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Rohit Patnala",
    description:
      "Explore the creative projects of Rohit Patnala (RO6IT) — visual art, creative direction, graphic design, music, and photography.",
    images: ["https://ro6it.com/home.png"],
  },
  alternates: {
    canonical: "https://ro6it.com/projects",
  },
};

const ProjectsPage = async () => {
  const projects = await getProjectsMain();

  return (
    <MaxWidthWrapper className="overflow-hidden h-[90vh] md:h-[calc(100vh-6.125rem)] py-1 mt-[5.6875rem] relative flex items-center justify-center">
      <ProjectsComponent data={projects} />
    </MaxWidthWrapper>
  );
};

export default ProjectsPage;