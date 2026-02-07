import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import { deleteVideoAsset } from "@/lib/dashboard/sanity-video-utils";
import { isDevEnvironment, devOnlyResponse } from "@/lib/dashboard/dev-only";

export async function POST(request: NextRequest) {
  if (!isDevEnvironment()) return devOnlyResponse();
  try {
    const {
      inputPath,
      compressedPath,
      originalAssetId,
      deleteOriginalFromSanity,
      deleteTempFiles = true,
    } = await request.json();

    const cleanedFiles: string[] = [];
    const keptFiles: string[] = [];
    const errors: string[] = [];

    if (deleteTempFiles) {
      if (inputPath && existsSync(inputPath)) {
        try {
          await unlink(inputPath);
          cleanedFiles.push(inputPath);
        } catch (e: any) {
          errors.push(`Failed to delete input file: ${e.message}`);
        }
      }

      if (compressedPath && existsSync(compressedPath)) {
        try {
          await unlink(compressedPath);
          cleanedFiles.push(compressedPath);
        } catch (e: any) {
          errors.push(`Failed to delete compressed file: ${e.message}`);
        }
      }
    } else {
      if (inputPath && existsSync(inputPath)) {
        keptFiles.push(inputPath);
      }
      if (compressedPath && existsSync(compressedPath)) {
        keptFiles.push(compressedPath);
      }
    }

    if (deleteOriginalFromSanity && originalAssetId) {
      try {
        await deleteVideoAsset(originalAssetId);
        cleanedFiles.push(`Sanity asset: ${originalAssetId}`);
      } catch (e: any) {
        errors.push(`Failed to delete Sanity asset: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      cleanedFiles,
      keptFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error during cleanup:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup",
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}
