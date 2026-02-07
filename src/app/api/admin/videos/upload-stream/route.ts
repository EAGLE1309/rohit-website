import { NextRequest } from "next/server";
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { createClient } from "@sanity/client";
import {
  findDocumentsReferencingAsset,
  updateDocumentVideoReference,
} from "@/lib/dashboard/sanity-video-utils";
import { isDevEnvironment } from "@/lib/dashboard/dev-only";

export const dynamic = "force-dynamic";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-06";

export async function GET(request: NextRequest) {
  if (!isDevEnvironment()) {
    return new Response(
      JSON.stringify({ success: false, error: "This endpoint is only available in development" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const compressedPath = searchParams.get("compressedPath");
  const originalAssetId = searchParams.get("originalAssetId");
  const originalFilename = searchParams.get("originalFilename");

  if (!compressedPath || !originalAssetId) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing required parameters" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        if (!existsSync(compressedPath)) {
          sendEvent({ type: "error", message: "Compressed file not found" });
          controller.close();
          return;
        }

        const fileStats = await stat(compressedPath);
        const totalSize = fileStats.size;

        sendEvent({
          type: "start",
          totalSize,
          totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
          filename: originalFilename || path.basename(compressedPath),
        });

        sendEvent({ type: "status", message: "Reading file..." });
        const fileBuffer = await readFile(compressedPath);

        sendEvent({
          type: "progress",
          uploadedBytes: 0,
          uploadedMB: "0.00",
          totalBytes: totalSize,
          totalMB: (totalSize / (1024 * 1024)).toFixed(2),
          progress: "0.0",
          stage: "uploading",
        });

        sendEvent({ type: "status", message: "Uploading to Sanity..." });

        const writeClient = createClient({
          projectId,
          dataset,
          useCdn: false,
          apiVersion,
          token: process.env.SANITY_API_TOKEN,
        });

        const filename = originalFilename || path.basename(compressedPath);

        let uploadedBytes = 0;
        const chunkSize = 256 * 1024;
        const totalChunks = Math.ceil(totalSize / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
          uploadedBytes = Math.min((i + 1) * chunkSize, totalSize);
          const progress = (uploadedBytes / totalSize) * 100;

          sendEvent({
            type: "progress",
            uploadedBytes,
            uploadedMB: (uploadedBytes / (1024 * 1024)).toFixed(2),
            totalBytes: totalSize,
            totalMB: (totalSize / (1024 * 1024)).toFixed(2),
            progress: progress.toFixed(1),
            stage: "uploading",
          });

          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const asset = await writeClient.assets.upload("file", fileBuffer, {
          filename,
          contentType: "video/mp4",
        });

        sendEvent({
          type: "progress",
          uploadedBytes: totalSize,
          uploadedMB: (totalSize / (1024 * 1024)).toFixed(2),
          totalBytes: totalSize,
          totalMB: (totalSize / (1024 * 1024)).toFixed(2),
          progress: "100.0",
          stage: "uploaded",
        });

        sendEvent({ type: "status", message: "Updating document references..." });

        const referencingDocs = await findDocumentsReferencingAsset(originalAssetId);

        for (const doc of referencingDocs) {
          if (doc.videoField === originalAssetId) {
            await updateDocumentVideoReference(doc._id, "video", asset._id);
            sendEvent({
              type: "status",
              message: `Updated document: ${doc._id}`,
            });
          }
        }

        sendEvent({
          type: "complete",
          newAssetId: asset._id,
          newAssetUrl: asset.url,
          updatedDocuments: referencingDocs.length,
          originalAssetId,
          uploadedMB: (totalSize / (1024 * 1024)).toFixed(2),
        });

        controller.close();
      } catch (error: any) {
        sendEvent({ type: "error", message: error.message || "Upload failed" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
