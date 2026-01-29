import { sanityFetch } from "../sanity-cilent";

export interface Gallery {
  _id: string;
  _type: "gallery";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  name: string;
  description: string;
  image: any;
}

// Fetch all gallery documents
export const getGallery = async () => {
  const req: any = await sanityFetch({
    query: '*[_type == "gallery"] | order(_createdAt desc)',
    revalidate: 300, // revalidate every 5 minutes (reduces API calls)
    tags: [], // no tag-based revalidation interference
  });

  return req;
};

// Fetch single gallery photo by ID
export const getGalleryById = async (id: string): Promise<Gallery | null> => {
  const req = await sanityFetch({
    query: `*[_type == "gallery" && _id == $id][0]{
      ...,
      "imageUrl": image.asset->url
    }`,
    params: { id },
    revalidate: 300,
    tags: [],
  });

  return req || null;
};
