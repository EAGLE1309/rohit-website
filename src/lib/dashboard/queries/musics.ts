import { sanityFetch } from "../sanity-cilent";

export interface Music {
  _id: string;
  _type: "musics";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title: string;
  description: string;
  category: string;
  track: {
    _type: "file";
    asset: { _ref: string; _type: string };
    title?: string;
  };
  cover: any;
}

// Fetch all musics
export const getMusics = async (): Promise<Music[]> => {
  const req: Music[] = await sanityFetch({
    query: `
      *[_type == "musics"] | order(_createdAt desc){
        ...,
        "trackUrl": track.asset->url,
        "coverUrl": cover.asset->url
      }
    `,
    revalidate: 30,
    tags: [],
  });

  return req;
};

// Fetch single music by ID
export const getMusicById = async (id: string): Promise<Music | null> => {
  const req = await sanityFetch({
    query: `
      *[_type == "musics" && _id == $id][0]{
        ...,
        "trackUrl": track.asset->url,
        "coverUrl": cover.asset->url
      }
    `,
    params: { id },
    revalidate: 30,
    tags: [],
  });

  return req || null;
};
