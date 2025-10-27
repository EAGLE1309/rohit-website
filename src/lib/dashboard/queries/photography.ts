import { sanityFetch } from "../sanity-cilent";

export interface Photography {
  _id: string;
  _type: "photography";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  name: string;
  description: string;
  image: any;
}

// Fetch all photography documents
export const getPhotography = async () => {
  const req: any = await sanityFetch({
    query: '*[_type == "photography"] | order(_createdAt desc)',
    revalidate: 30, // revalidate every 30s
    tags: [], // no tag-based revalidation interference
  });

  return req;
};

// Fetch single photo by ID
export const getPhotographyById = async (id: string): Promise<Photography | null> => {
  const req = await sanityFetch({
    query: `*[_type == "photography" && _id == $id][0]{
      ...,
      "imageUrl": image.asset->url
    }`,
    params: { id },
    revalidate: 30,
    tags: [],
  });

  return req || null;
};
