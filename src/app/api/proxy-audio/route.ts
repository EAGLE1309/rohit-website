import { NextRequest, NextResponse } from "next/server";

// Proxy for Sanity CDN and R2 media (handles CORS for Web Audio API)
// Web Audio API requires CORS-compliant media for MediaElementAudioSource

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  "http://localhost:3000",
  "https://rohit.solithix.com",
  "https://ro6it.com",
].filter(Boolean) as string[];

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
};

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // Allow both Sanity CDN and R2 URLs for Web Audio API compatibility
    return url.protocol === "https:" &&
      (url.hostname === "cdn.sanity.io" || url.hostname === "cdn.eagledev.in");
  } catch {
    return false;
  }
}

function getMimeType(url: string): string {
  try {
    const ext = new URL(url).pathname.split(".").pop()?.toLowerCase();
    return ext ? MIME_TYPES[ext] || "application/octet-stream" : "application/octet-stream";
  } catch {
    return "application/octet-stream";
  }
}

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = new Headers();
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Range, Content-Type");
    headers.set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");
  }
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    if (!isAllowedUrl(url)) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
    }

    const rangeHeader = req.headers.get("range");
    const origin = req.headers.get("origin");

    // Fetch with Range header if provided (for seeking)
    const fetchHeaders: HeadersInit = {};
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const response = await fetch(url, {
      headers: fetchHeaders,
      cache: rangeHeader ? "no-store" : "force-cache",
    });

    if (!response.ok && response.status !== 206) {
      return NextResponse.json({ error: "Failed to fetch media" }, { status: response.status });
    }

    // Build response headers
    const headers = new Headers();

    // CORS
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");
    }

    // Content-Type
    headers.set("Content-Type", response.headers.get("content-type") || getMimeType(url));

    // Content-Length
    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // Range support
    headers.set("Accept-Ranges", "bytes");

    // Content-Range for partial content
    const contentRange = response.headers.get("content-range");
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    // Caching
    if (rangeHeader) {
      headers.set("Cache-Control", "no-cache, no-store");
    } else {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    }

    // Stream the response
    if (response.body) {
      return new NextResponse(response.body, {
        status: response.status,
        headers,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: response.status,
      headers,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
