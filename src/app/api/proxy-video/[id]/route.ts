import { NextRequest } from "next/server";

/**
 * Sanity CDN Video Proxy
 * Provides CORS-compliant access to Sanity CDN video assets
 * Supports range requests for video streaming
 */

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  "http://localhost:3000",
  "https://ro6it.com",
  "https://rohit.solithix.com",
].filter(Boolean) as string[];

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = new Headers();

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Range, Content-Type");
    headers.set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");
    headers.set("Vary", "Origin");
  }

  return new Response(null, { status: 204, headers });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const origin = req.headers.get("origin");
    const range = req.headers.get("range");

    // Construct Sanity CDN URL for the video asset
    // Sanity assets follow the pattern: https://cdn.sanity.io/files/{projectId}/{dataset}/{assetId}-{format}.{extension}
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

    if (!projectId || !dataset) {
      console.error("Sanity configuration missing:", { projectId, dataset });
      return new Response("Sanity configuration missing", { status: 500 });
    }

    // The ID might be the full asset ID or just the base part
    // Try different URL patterns to find the correct one
    const possibleUrls = [
      `https://cdn.sanity.io/files/${projectId}/${dataset}/${params.id}`,
      `https://cdn.sanity.io/files/${projectId}/${dataset}/${params.id}-mp4`,
      `https://cdn.sanity.io/files/${projectId}/${dataset}/${params.id}.mp4`,
    ];

    let videoResponse: Response | null = null;
    let workingUrl: string | null = null;

    // Try each URL pattern
    for (const url of possibleUrls) {
      try {
        console.log("Trying URL:", url);
        const response = await fetch(url, {
          headers: {
            ...(range && { Range: range }),
            'User-Agent': 'Next.js Video Proxy',
          },
        });

        if (response.ok) {
          videoResponse = response;
          workingUrl = url;
          console.log("Success with URL:", url);
          break;
        }
      } catch (error) {
        console.log("Failed URL:", url, error);
        continue;
      }
    }

    if (!videoResponse) {
      console.error("All URL patterns failed for asset ID:", params.id);
      return new Response("Video not found - tried all URL patterns", { status: 404 });
    }

    const headers = new Headers();

    // CORS
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");
      headers.set("Vary", "Origin");
    }

    // Pass through proper video streaming headers
    headers.set("Content-Type", videoResponse.headers.get("content-type") || "video/mp4");
    headers.set("Accept-Ranges", "bytes");

    const contentLength = videoResponse.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    const contentRange = videoResponse.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);

    // Optimized caching for Sanity CDN assets
    // Sanity CDN assets are immutable, so we can cache aggressively
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    // Add Sanity-specific headers
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "SAMEORIGIN");

    return new Response(videoResponse.body, {
      status: videoResponse.status,
      headers,
    });

  } catch (err) {
    console.error("Video proxy error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
