import { sanityFetch } from "../sanity-cilent";

export interface TextBlock {
  _type: "textBlock";
  _key: string;
  content: any[];
}

export interface VideoBlock {
  _type: "videoBlock";
  _key: string;
  video: any;
  videoUrl?: string;
  caption?: string;
}

export interface ImageBlock {
  _type: "imageBlock";
  _key: string;
  image: any;
  caption?: string;
}

export interface ImageGrid {
  _type: "imageGrid";
  _key: string;
  images: any[];
  layout: "two-column" | "three-column" | "four-column";
}

export type CaseStudyBlock = TextBlock | VideoBlock | ImageBlock | ImageGrid;

export interface ProjectMain {
  _id: string;
  _type: "projectsMain";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  index: number;
  name: string;
  description: string;
  date?: string;
  video: any;
  thumbnail: any;
  hideThumbnail?: boolean;
  client?: string;
  service?: string;
  category: "commercial" | "personal" | "projects" | "archives" | "none";
  caseStudyContent?: CaseStudyBlock[];
}

export const getProjectsMain = async (): Promise<ProjectMain[]> => {
  const req = await sanityFetch({
    query: `*[_type == "projectsMain"] | order(index asc) {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      _rev,
      index,
      name,
      description,
      date,
      video,
      thumbnail,
      hideThumbnail,
      client,
      service,
      category,
      caseStudyContent[] {
        _type,
        _key,
        _type == "textBlock" => {
          content
        },
        _type == "videoBlock" => {
          video,
          caption,
          "videoUrl": video.asset->url
        },
        _type == "imageBlock" => {
          image,
          caption
        },
        _type == "imageGrid" => {
          images,
          layout
        }
      }
    }`,
    revalidate: 300,
    tags: [],
  });

  return req || [];
};

export const getProjectMainById = async (id: string): Promise<ProjectMain | null> => {
  const req = await sanityFetch({
    query: `*[_type == "projectsMain" && _id == $id][0]{
      _id,
      _type,
      _createdAt,
      _updatedAt,
      _rev,
      index,
      name,
      description,
      date,
      video,
      thumbnail,
      hideThumbnail,
      client,
      service,
      category,
      caseStudyContent[] {
        _type,
        _key,
        _type == "textBlock" => {
          content
        },
        _type == "videoBlock" => {
          video,
          caption,
          "videoUrl": video.asset->url
        },
        _type == "imageBlock" => {
          image,
          caption
        },
        _type == "imageGrid" => {
          images,
          layout
        }
      },
      "videoUrl": video.asset->url
    }`,
    params: { id },
    revalidate: 300,
    tags: [],
  });

  return req || null;
};
