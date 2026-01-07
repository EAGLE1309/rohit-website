import { sanityFetch } from "../sanity-cilent";


export interface Project {
  _id: string;
  _type: "projects";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  index: number;
  name: string;
  description: string;
  category: string;
  thumbnail: any;
  video: any;
  videoUrl?: string;
}

// Fetch all projects
export const getProjects = async (): Promise<Project[]> => {
  const req: Project[] = await sanityFetch({
    query: `*[_type == "projects"] | order(_createdAt desc){
      ...,
      "videoUrl": video.asset->url
    }`,
    revalidate: 300, // revalidate every 5 minutes (reduces API calls)
    tags: [], // no tag-based revalidation interference
  });

  // Map to use Sanity CDN URLs
  return req.map((project) => ({
    ...project,
    videoUrl: project.videoUrl,
  }));
};

// Fetch single project by ID
export const getProjectById = async (id: string): Promise<Project | null> => {
  const req = await sanityFetch({
    query: `*[_type == "projects" && _id == $id][0]{
      ...,
      "videoUrl": video.asset->url
    }`,
    params: { id },
    revalidate: 300,
    tags: [],
  });

  if (!req) return null;

  // Use Sanity CDN URL
  const project = req as Project;

  return {
    ...project,
    videoUrl: project.videoUrl,
  };
};
