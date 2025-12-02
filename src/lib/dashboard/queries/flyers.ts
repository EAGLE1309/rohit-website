import { sanityFetch } from "../sanity-cilent";

export interface Flyer {
  _id: string;
  _type: "flyers";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  name: string;
  description: string;
  image: any;
}

// Fetch all flyers
export const getFlyers = async () => {
  const req: any = await sanityFetch({
    query: '*[_type == "flyers"] | order(_createdAt desc)',
    revalidate: 300, // revalidate every 5 minutes (reduces API calls)
    tags: [], // no tag-based revalidation interference
  });

  return req;
};

// Fetch single flyer by ID
export const getFlyerById = async (id: string): Promise<Flyer | null> => {
  const req = await sanityFetch({
    query: `*[_type == "flyers" && _id == $id][0]{
      ...,
      "imageUrl": image.asset->url
    }`,
    params: { id },
    revalidate: 300,
    tags: [],
  });

  return req || null;
};
