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

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-06";

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable");
}

export const client = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion,
});

const builder = imageUrlBuilder(client);

export const urlFor = (source: string) => builder.image(source);

/**
 * Optimized image URL helper - automatically applies:
 * - WebP format (25-50% smaller than JPEG/PNG)
 * - Quality optimization
 * - Proper sizing
 * - Auto format for best compression
 */
export const optimizedImageUrl = (
  source: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    blur?: number;
  } = {}
) => {
  const { width, height, quality = 75, blur } = options;
  let imgBuilder = builder.image(source).format("webp").quality(quality).auto("format");

  if (width) imgBuilder = imgBuilder.width(width);
  if (height) imgBuilder = imgBuilder.height(height);
  if (blur) imgBuilder = imgBuilder.blur(blur);

  return imgBuilder.url();
};

/**
 * Thumbnail-optimized URL (for grids, cards, carousels)
 */
export const thumbnailUrl = (source: string, size: "sm" | "md" | "lg" = "md") => {
  const sizes = { sm: 200, md: 400, lg: 600 };
  return optimizedImageUrl(source, { width: sizes[size], quality: 70 });
};

/**
 * Full-size optimized URL (for detail pages)
 */
export const fullImageUrl = (source: string, maxWidth = 1200) => {
  return optimizedImageUrl(source, { width: maxWidth, quality: 80 });
};

/**
 * Blur placeholder URL (tiny, heavily compressed)
 */
export const blurPlaceholderUrl = (source: string) => {
  return optimizedImageUrl(source, { width: 20, quality: 30, blur: 50 });
};

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
