import { sanityFetch } from "../sanity-cilent";
import { getPlayableUrl } from "@/lib/r2";

export interface R2Track {
  url?: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  duration?: number;
}

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
  trackUrl?: string;
  r2Track?: R2Track;
}

// Fetch all musics
export const getMusics = async (): Promise<Music[]> => {
  const req: Music[] = await sanityFetch({
    query: `
      *[_type == "musics"] | order(_createdAt desc){
        ...,
        "trackUrl": track.asset->url,
        "coverUrl": cover.asset->url,
        r2Track
      }
    `,
    revalidate: 300,
    tags: [],
  });

  // Map to prefer R2 URLs (direct) over Sanity CDN (proxied)
  return req.map((music) => ({
    ...music,
    trackUrl: getPlayableUrl(music.r2Track?.url, music.trackUrl) || music.trackUrl,
  }));
};

// Fetch single music by ID
export const getMusicById = async (id: string): Promise<Music | null> => {
  const req = await sanityFetch({
    query: `
      *[_type == "musics" && _id == $id][0]{
        ...,
        "trackUrl": track.asset->url,
        "coverUrl": cover.asset->url,
        r2Track
      }
    `,
    params: { id },
    revalidate: 300,
    tags: [],
  });

  if (!req) return null;

  // Prefer R2 URL (direct) over Sanity CDN (proxied)
  const music = req as Music;

  return {
    ...music,
    trackUrl: getPlayableUrl(music.r2Track?.url, music.trackUrl) || music.trackUrl,
  };
};
