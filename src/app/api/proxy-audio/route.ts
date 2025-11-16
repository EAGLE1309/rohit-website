import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const rangeHeader = req.headers.get("range");
    const r = await fetch(url, {
      headers: rangeHeader
        ? {
            Range: rangeHeader,
          }
        : undefined,
      cache: "no-store",
    });
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
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Content-Type", remoteContentType);
    headers.set("Cache-Control", "no-store");
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
    return NextResponse.json({ error: "Server error", details: err }, { status: 500 });
  }
}
