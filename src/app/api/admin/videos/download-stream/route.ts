import { NextRequest } from "next/server";
import { getVideoAssetById } from "@/lib/dashboard/sanity-video-utils";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { isDevEnvironment } from "@/lib/dashboard/dev-only";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isDevEnvironment()) {
    return new Response(
      JSON.stringify({ success: false, error: "This endpoint is only available in development" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const assetId = searchParams.get("assetId");

  if (!assetId) {
    return new Response(
      JSON.stringify({ success: false, error: "Asset ID is required" }),
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
        sendEvent({ type: "status", message: "Fetching video metadata..." });

        const asset = await getVideoAssetById(assetId);

        if (!asset) {
          sendEvent({ type: "error", message: "Video asset not found" });
          controller.close();
          return;
        }

        const totalSize = asset.size;
        sendEvent({
          type: "start",
          totalSize,
          totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
          filename: asset.originalFilename,
        });

        const response = await fetch(asset.url);
        if (!response.ok || !response.body) {
          sendEvent({ type: "error", message: `Failed to download: ${response.statusText}` });
          controller.close();
          return;
        }

        const tempDir = path.join(process.cwd(), "temp-videos");
        if (!existsSync(tempDir)) {
          await mkdir(tempDir, { recursive: true });
        }

        const sanitizedFilename = asset.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, "_") || `video_${assetId}`;
        const inputPath = path.join(tempDir, `input_${sanitizedFilename}`);

        const fileStream = createWriteStream(inputPath);
        const reader = response.body.getReader();

        let downloadedBytes = 0;
        let lastProgressUpdate = 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          fileStream.write(Buffer.from(value));
          downloadedBytes += value.length;

          const now = Date.now();
          if (now - lastProgressUpdate > 100) {
            const progress = (downloadedBytes / totalSize) * 100;
            sendEvent({
              type: "progress",
              downloadedBytes,
              downloadedMB: (downloadedBytes / (1024 * 1024)).toFixed(2),
              totalBytes: totalSize,
              totalMB: (totalSize / (1024 * 1024)).toFixed(2),
              progress: progress.toFixed(1),
            });
            lastProgressUpdate = now;
          }
        }

        fileStream.end();

        await new Promise<void>((resolve, reject) => {
          fileStream.on("finish", resolve);
          fileStream.on("error", reject);
        });

        sendEvent({
          type: "complete",
          inputPath,
          originalFilename: asset.originalFilename,
          originalSize: asset.size,
          assetId: asset._id,
          downloadedMB: (downloadedBytes / (1024 * 1024)).toFixed(2),
        });

        controller.close();
      } catch (error: any) {
        sendEvent({ type: "error", message: error.message || "Download failed" });
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
