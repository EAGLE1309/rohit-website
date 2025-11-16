import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const r = await fetch(url);
    if (!r.ok) {
      return NextResponse.json({ error: "Failed to fetch remote audio" }, { status: r.status });
    }

    const arrayBuffer = await r.arrayBuffer();
    const remoteContentType = r.headers.get("content-type");
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
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": remoteContentType || fallbackContentType || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error", details: err }, { status: 500 });
  }
}
