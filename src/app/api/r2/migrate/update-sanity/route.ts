import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";

// Create a client with write access for mutations
const getWriteClient = () => {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId) {
    throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  }
  if (!token) {
    throw new Error("Missing SANITY_API_TOKEN - required for write operations");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2025-02-06",
    useCdn: false,
    token,
  });
};

interface UpdateRequest {
  documentId: string;
  documentType: "projects" | "musics";
  r2Url: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  duration?: number;
}

// Update a Sanity document with the new R2 URL
export async function POST(request: NextRequest) {
  try {
    const { documentId, documentType, r2Url, filename, size, mimeType, duration } = (await request.json()) as UpdateRequest;

    if (!documentId || !documentType || !r2Url) {
      return NextResponse.json(
        { error: "Missing documentId, documentType, or r2Url" },
        { status: 400 }
      );
    }

    const client = getWriteClient();

    // Determine which field to update based on document type
    // Now using r2Video/r2Track objects instead of flat fields
    const fieldName = documentType === "projects" ? "r2Video" : "r2Track";

    // Build the object to set
    const fieldValue: Record<string, string | number | undefined> = {
      url: r2Url,
      filename,
      size,
      mimeType,
    };

    // Add duration for audio tracks
    if (documentType === "musics" && duration !== undefined) {
      fieldValue.duration = duration;
    }

    // Patch the document
    const result = await client
      .patch(documentId)
      .set({ [fieldName]: fieldValue })
      .commit();

    return NextResponse.json({
      success: true,
      documentId: result._id,
      updatedField: fieldName,
      r2Url,
    });
  } catch (error) {
    console.error("Update Sanity error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update document" },
      { status: 500 }
    );
  }
}

// Batch update multiple documents
export async function PUT(request: NextRequest) {
  try {
    const { updates } = (await request.json()) as {
      updates: UpdateRequest[];
    };

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "Missing or empty updates array" }, { status: 400 });
    }

    const client = getWriteClient();
    const results: { documentId: string; success: boolean; error?: string }[] = [];

    for (const update of updates) {
      try {
        const fieldName = update.documentType === "projects" ? "r2Video" : "r2Track";

        const fieldValue: Record<string, string | number | undefined> = {
          url: update.r2Url,
          filename: update.filename,
          size: update.size,
          mimeType: update.mimeType,
        };

        if (update.documentType === "musics" && update.duration !== undefined) {
          fieldValue.duration = update.duration;
        }

        await client
          .patch(update.documentId)
          .set({ [fieldName]: fieldValue })
          .commit();

        results.push({ documentId: update.documentId, success: true });
      } catch (err) {
        results.push({
          documentId: update.documentId,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: errorCount === 0,
      total: updates.length,
      successCount,
      errorCount,
      results,
    });
  } catch (error) {
    console.error("Batch update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Batch update failed" },
      { status: 500 }
    );
  }
}
