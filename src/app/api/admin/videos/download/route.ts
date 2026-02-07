import { NextRequest, NextResponse } from "next/server";
import { getVideoAssetById } from "@/lib/dashboard/sanity-video-utils";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { isDevEnvironment, devOnlyResponse } from "@/lib/dashboard/dev-only";

export async function POST(request: NextRequest) {
  if (!isDevEnvironment()) return devOnlyResponse();
  try {
    const { assetId } = await request.json();

    if (!assetId) {
      return NextResponse.json(
        { success: false, error: "Asset ID is required" },
        { status: 400 }
      );
    }

    const asset = await getVideoAssetById(assetId);

    if (!asset) {
      return NextResponse.json(
        { success: false, error: "Video asset not found" },
        { status: 404 }
      );
    }

    const response = await fetch(asset.url);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempDir = path.join(process.cwd(), "temp-videos");
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    const sanitizedFilename = asset.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, "_") || `video_${assetId}`;
    const inputPath = path.join(tempDir, `input_${sanitizedFilename}`);

    await writeFile(inputPath, buffer);

    return NextResponse.json({
      success: true,
      inputPath,
      originalFilename: asset.originalFilename,
      originalSize: asset.size,
      assetId: asset._id,
    });
  } catch (error) {
    console.error("Error downloading video:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download video" },
      { status: 500 }
    );
  }
}
