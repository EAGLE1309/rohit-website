import type { Metadata } from "next";
import { getProjectById, getProjects } from "@/lib/dashboard/queries/projects";
import { thumbnailUrl } from "@/lib/dashboard/sanity-cilent";
import WorkDetailsComponent from "./component";

type Props = {
  params: Promise<{ work: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { work } = await params;
  const project = await getProjectById(work);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
    };
  }

  // Get dynamic thumbnail URL, fallback to home.png
  const thumbnailImage = project.thumbnail
    ? thumbnailUrl(project.thumbnail, "lg")
    : "https://ro6it.com/home.png";

  return {
    title: project.name,
    description:
      project.description ||
      `${project.name} - A creative project by Rohit Patnala.`,
    keywords: [project.name, ...(Array.isArray(project.category) ? project.category : [project.category]), "Rohit Patnala project", "creative work", "visual art", "RO6IT"],
    openGraph: {
      title: `${project.name} | Rohit Patnala`,
      description: project.description || `${project.name} - A creative project by Rohit Patnala.`,
      url: `https://ro6it.com/work/${work}`,
      siteName: "Rohit Patnala",
      images: [
        {
          url: thumbnailImage,
          width: 1200,
          height: 630,
          alt: `${project.name} - Project by Rohit Patnala`,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} | Rohit Patnala`,
      description: project.description || `${project.name} - A creative project by Rohit Patnala (RO6IT).`,
      images: [thumbnailImage],
    },
    alternates: {
      canonical: `https://ro6it.com/work/${work}`,
    },
  };
}

const WorkDetailsPage = async ({ params }: Props) => {
  const { work } = await params;

  const project = await getProjectById(work);
  const allProjects = await getProjects();

  return <WorkDetailsComponent project={project} allProjects={allProjects} />;
};

export default WorkDetailsPage;
