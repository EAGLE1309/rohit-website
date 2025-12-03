import { MetadataRoute } from "next";
import { getProjects, Project } from "@/lib/dashboard/queries/projects";

const BASE_URL = "https://ro6it.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/work`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/photography`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sounds`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic work routes from Sanity
  let workRoutes: MetadataRoute.Sitemap = [];

  try {
    const projects: Project[] = await getProjects();

    workRoutes = projects.map((project) => ({
      url: `${BASE_URL}/work/${project._id}`,
      lastModified: new Date(project._updatedAt || project._createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching projects for sitemap:", error);
  }

  return [...staticRoutes, ...workRoutes];
}
