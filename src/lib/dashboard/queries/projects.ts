import { sanityFetch } from "../sanity-cilent";

export interface Project {
  _id: string;
  _type: "projects";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  name: string;
  description: string;
  category: string;
  thumbnail: any;
  video: any;
}

// Fetch all projects
export const getProjects = async () => {
  const req: any = await sanityFetch({
    query: '*[_type == "projects"] | order(_createdAt desc)',
    revalidate: 300, // revalidate every 5 minutes (reduces API calls)
    tags: [], // no tag-based revalidation interference
  });

  return req;
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

  return req || null;
};
