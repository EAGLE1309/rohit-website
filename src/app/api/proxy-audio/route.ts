import { NextRequest, NextResponse } from "next/server";

// Allowlist of trusted domains for audio proxying (prevents SSRF attacks)
const ALLOWED_AUDIO_DOMAINS = [
  "cdn.sanity.io",
  // Add other trusted audio CDN domains here
];

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // Only allow HTTPS
    if (url.protocol !== "https:") {
      return false;
    }
    // Check against allowlist
    return ALLOWED_AUDIO_DOMAINS.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Validate URL against allowlist to prevent SSRF
    if (!isAllowedUrl(url)) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
    }

    const rangeHeader = req.headers.get("range");
    const fetchOptions: RequestInit = {
      headers: rangeHeader
        ? {
          Range: rangeHeader,
        }
        : undefined,
    };
    if (!rangeHeader) {
      fetchOptions.cache = "force-cache";
    }
    const r = await fetch(url, fetchOptions);
    if (!r.ok) {
      return NextResponse.json({ error: "Failed to fetch remote audio" }, { status: r.status });
    }

    const fallbackContentType = (() => {
      try {
        const extension = new URL(url).pathname.split(".").pop()?.toLowerCase();
        switch (extension) {
          case "wav":
            return "audio/wav";
          case "mp3":
            return "audio/mpeg";
          default:
            return undefined;
        }
      } catch {
        return undefined;
      }
    })();
    const remoteContentType = r.headers.get("content-type") || fallbackContentType || "application/octet-stream";

    const headers = new Headers();
    // Restrict CORS to same origin (remove if cross-origin access is needed)
    const origin = req.headers.get("origin");
    if (origin) {
      // Only allow requests from the same site
      const allowedOrigins = [process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000", "https://rohit.solithix.com"].filter(Boolean);
      if (allowedOrigins.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
      }
    }
    headers.set("Content-Type", remoteContentType);
    const upstreamCacheControl = r.headers.get("cache-control");
    if (upstreamCacheControl) {
      headers.set("Cache-Control", upstreamCacheControl);
    } else {
      headers.set("Cache-Control", "public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400");
    }
    const contentLength = r.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    const acceptRanges = r.headers.get("accept-ranges");
    if (acceptRanges) {
      headers.set("Accept-Ranges", acceptRanges);
    }
    const contentRange = r.headers.get("content-range");
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    if (r.body) {
      return new NextResponse(r.body, {
        status: r.status,
        headers,
      });
    }

    const arrayBuffer = await r.arrayBuffer();
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: r.status,
      headers,
    });
  } catch (err) {
    // Don't expose error details to clients
    console.error("Proxy audio error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
