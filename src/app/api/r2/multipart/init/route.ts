import { NextRequest, NextResponse } from "next/server";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getR2Client, R2_BUCKET, R2_PUBLIC_URL, ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType, type, size } = await request.json();

    // Validate required fields
    if (!filename || !contentType || !type || !size) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate size
    if (size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 1GB." }, { status: 413 });
    }

    // Validate type
    const allowedMimeTypes = ALLOWED_TYPES[type as keyof typeof ALLOWED_TYPES] as readonly string[] | undefined;
    if (!allowedMimeTypes || !allowedMimeTypes.includes(contentType)) {
      return NextResponse.json({ error: `Invalid file type: ${contentType}` }, { status: 400 });
    }

    // Generate unique key
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const key = `${type}/${uuidv4()}.${extension}`;

    // Initialize multipart upload
    const r2Client = getR2Client();
    const command = new CreateMultipartUploadCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const response = await r2Client.send(command);

    return NextResponse.json({
      uploadId: response.UploadId,
      key,
      publicUrl: `${R2_PUBLIC_URL}/${key}`,
    });
  } catch (error) {
    console.error("Multipart init error:", error);
    return NextResponse.json({ error: "Failed to initialize upload" }, { status: 500 });
  }
}
