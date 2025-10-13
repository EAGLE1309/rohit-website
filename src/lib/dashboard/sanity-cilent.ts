import { createClient, QueryParams } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
}

export interface SanityFile {
  _type: "file";
  asset: {
    _ref: string;
    _type: "reference";
  };
}

export const client = createClient({
  projectId: "ozn9n8zp",
  dataset: "production",
  useCdn: true,
  apiVersion: "2025-02-06",
});

const builder = imageUrlBuilder(client);

export const urlFor = (source: string) => builder.image(source);

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 60, // default revalidation time in seconds
  tags = [],
}: {
  query: QueryString;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
}) {
  return client.fetch(query, params, {
    next: {
      revalidate: tags.length ? false : revalidate, // for simple, time-based revalidation
      tags, // for tag-based revalidation
    },
  });
}
