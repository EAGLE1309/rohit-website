import { NextResponse } from "next/server";
import { getAllVideoAssets } from "@/lib/dashboard/sanity-video-utils";
import { isDevEnvironment, devOnlyResponse } from "@/lib/dashboard/dev-only";

export async function GET() {
  if (!isDevEnvironment()) return devOnlyResponse();
  try {
    const videos = await getAllVideoAssets();
    return NextResponse.json({ success: true, videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
