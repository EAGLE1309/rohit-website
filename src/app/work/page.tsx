import type { Metadata } from "next";
import WorkComponent from "./component";
import { getProjects } from "@/lib/dashboard/queries/projects";
import { getPhotography } from "@/lib/dashboard/queries/photography";

export const metadata: Metadata = {
  title: "Work & Projects",
  description:
    "Explore the creative portfolio of Rohit Patnala featuring visual art projects, photography, graphic design, and creative direction work.",
  keywords: [
    "Rohit Patnala work",
    "creative projects",
    "visual art portfolio",
    "photography portfolio",
    "graphic design work",
    "art direction projects",
  ],
  openGraph: {
    title: "Work & Projects | Rohit Patnala",
    description:
      "Explore the creative portfolio of Rohit Patnala featuring visual art projects, photography, graphic design, and creative direction work.",
    url: "https://ro6it.com/work",
    siteName: "Rohit Patnala",
    images: [
      {
        url: "https://ro6it.com/home.png",
        width: 1200,
        height: 630,
        alt: "Rohit Patnala - Visual Artist & Creative Director",
      },
    ],
  },
  alternates: {
    canonical: "https://ro6it.com/work",
  },
};

const WorksPage = async () => {
  const projects = await getProjects();
  const photography = await getPhotography();

  return <WorkComponent projects={projects} photography={photography} />;
};

export default WorksPage;
