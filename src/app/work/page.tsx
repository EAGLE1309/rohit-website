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
    url: "https://rohit.solithix.com/work",
  },
  alternates: {
    canonical: "https://rohit.solithix.com/work",
  },
};

const WorksPage = async () => {
  const projects = await getProjects();
  const photography = await getPhotography();

  return <WorkComponent projects={projects} photography={photography} />;
};

export default WorksPage;
