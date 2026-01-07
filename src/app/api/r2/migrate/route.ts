import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getR2Client, R2_BUCKET, R2_PUBLIC_URL, ALLOWED_TYPES } from "@/lib/r2";

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

interface MigrateRequest {
  sourceUrl: string;
  type: "video" | "audio";
  filename?: string;
}

// Migrate a single file from Sanity CDN to R2
export async function POST(request: NextRequest) {
  try {
    const { sourceUrl, type, filename } = (await request.json()) as MigrateRequest;

    if (!sourceUrl || !type) {
      return NextResponse.json({ error: "Missing sourceUrl or type" }, { status: 400 });
    }

    // Validate source URL is from Sanity CDN
    if (!sourceUrl.includes("cdn.sanity.io")) {
      return NextResponse.json({ error: "Source URL must be from Sanity CDN" }, { status: 400 });
    }

    // Fetch the file from Sanity CDN with streaming
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from Sanity CDN: ${response.status}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const contentLength = response.headers.get("content-length");

    // Validate content type
    const allowedMimeTypes = ALLOWED_TYPES[type] as readonly string[];
    if (!allowedMimeTypes.some((allowed) => contentType.includes(allowed.split("/")[1]))) {
      // Be more lenient - check if it's a valid media type
      if (!contentType.startsWith(`${type}/`)) {
        return NextResponse.json(
          { error: `Invalid content type for ${type}: ${contentType}` },
          { status: 400 }
        );
      }
    }

    // Stream download and upload
    let downloadedBytes = 0;
    const chunks: Buffer[] = [];
    
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: "Failed to get readable stream from Sanity CDN" },
        { status: 502 }
      );
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = Buffer.from(value);
      chunks.push(chunk);
      downloadedBytes += chunk.length;
      
      // Log progress (could be enhanced with SSE for real-time updates)
      console.log(`Downloaded: ${formatBytes(downloadedBytes)}${contentLength ? ` / ${formatBytes(parseInt(contentLength))}` : ''}`);
    }

    const buffer = Buffer.concat(chunks);

    // Generate key
    const extension = getExtensionFromUrl(sourceUrl) || getExtensionFromContentType(contentType);
    const finalFilename = filename || `migrated-${uuidv4()}`;
    const key = `${type}/${uuidv4()}.${extension}`;

    // Upload to R2
    const r2Client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
    });

    await r2Client.send(command);

    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({
      success: true,
      sourceUrl,
      r2Url: publicUrl,
      key,
      size: buffer.length,
      contentType,
      filename: finalFilename,
      downloadedBytes,
      uploadBytes: buffer.length,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Migration failed" },
      { status: 500 }
    );
  }
}

function getExtensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split(".");
    if (parts.length > 1) {
      return parts.pop()?.toLowerCase() || "";
    }
  } catch {
    // ignore
  }
  return "";
}

function getExtensionFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "video/x-msvideo": "avi",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
    "audio/x-m4a": "m4a",
  };
  return map[contentType] || "bin";
}
