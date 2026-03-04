import type { Metadata } from "next";
import WorkComponent from "./component";
import { getProjects } from "@/lib/dashboard/queries/projects";
import { getPhotography } from "@/lib/dashboard/queries/photography";

export const metadata: Metadata = {
  title: "Works",
  description:
    "Explore the creative portfolio of Rohit Patnala (RO6IT) — visual art projects, photography, graphic design, and creative direction work rooted in culture, technology, and the South Asian diaspora.",
  keywords: [
    "Rohit Patnala work",
    "RO6IT projects",
    "creative projects",
    "visual art portfolio",
    "photography portfolio",
    "graphic design work",
    "art direction projects",
    "Houston creative portfolio",
  ],
  openGraph: {
    title: "Works | Rohit Patnala",
    description:
      "Explore the creative portfolio of Rohit Patnala (RO6IT) — visual art, photography, graphic design, and creative direction.",
    url: "https://ro6it.com/work",
    siteName: "Rohit Patnala",
    images: [
      {
        url: "https://ro6it.com/home.png",
        width: 1200,
        height: 630,
        alt: "Rohit Patnala — Work & Projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work & Projects | Rohit Patnala",
    description:
      "Explore the creative portfolio of Rohit Patnala (RO6IT) — visual art, photography, graphic design, and creative direction.",
    images: ["https://ro6it.com/home.png"],
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
