import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import {
  uploadVideoAsset,
  findDocumentsReferencingAsset,
  updateDocumentVideoReference,
} from "@/lib/dashboard/sanity-video-utils";
import { isDevEnvironment, devOnlyResponse } from "@/lib/dashboard/dev-only";

export async function POST(request: NextRequest) {
  if (!isDevEnvironment()) return devOnlyResponse();
  try {
    const { compressedPath, originalAssetId, originalFilename } = await request.json();

    if (!compressedPath || !originalAssetId) {
      return NextResponse.json(
        { success: false, error: "Compressed path and original asset ID are required" },
        { status: 400 }
      );
    }

    if (!existsSync(compressedPath)) {
      return NextResponse.json(
        { success: false, error: "Compressed file not found" },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(compressedPath);
    const filename = originalFilename || path.basename(compressedPath);

    console.log("Uploading compressed video to Sanity...");
    const newAsset = await uploadVideoAsset(fileBuffer, filename);
    console.log("New asset uploaded:", newAsset._id);

    const referencingDocs = await findDocumentsReferencingAsset(originalAssetId);
    console.log("Documents referencing original asset:", referencingDocs.length);

    for (const doc of referencingDocs) {
      if (doc.videoField === originalAssetId) {
        await updateDocumentVideoReference(doc._id, "video", newAsset._id);
        console.log(`Updated document ${doc._id} with new video reference`);
      }
    }

    return NextResponse.json({
      success: true,
      newAssetId: newAsset._id,
      newAssetUrl: newAsset.url,
      updatedDocuments: referencingDocs.length,
      originalAssetId,
    });
  } catch (error: any) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload video",
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}
