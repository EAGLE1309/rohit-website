import { sanityFetch } from "../sanity-cilent";
import { getMediaUrl } from "@/lib/r2";

export interface R2Video {
  url?: string;
  filename?: string;
  size?: number;
  mimeType?: string;
}

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
  r2Video?: R2Video;
}

// Fetch all projects
export const getProjects = async (): Promise<Project[]> => {
  const req: Project[] = await sanityFetch({
    query: `*[_type == "projects"] | order(_createdAt desc){
      ...,
      "videoUrl": video.asset->url,
      r2Video
    }`,
    revalidate: 300, // revalidate every 5 minutes (reduces API calls)
    tags: [], // no tag-based revalidation interference
  });

  // Map to prefer R2 URLs (direct) over Sanity CDN
  return req.map((project) => ({
    ...project,
    videoUrl: getMediaUrl(project.r2Video?.url, project.videoUrl) || project.videoUrl,
  }));
};

// Fetch single project by ID
export const getProjectById = async (id: string): Promise<Project | null> => {
  const req = await sanityFetch({
    query: `*[_type == "projects" && _id == $id][0]{
      ...,
      "videoUrl": video.asset->url,
      r2Video
    }`,
    params: { id },
    revalidate: 300,
    tags: [],
  });

  if (!req) return null;

  // Prefer R2 URL (direct) over Sanity CDN
  const project = req as Project;

  return {
    ...project,
    videoUrl: getMediaUrl(project.r2Video?.url, project.videoUrl) || project.videoUrl,
  };
};
