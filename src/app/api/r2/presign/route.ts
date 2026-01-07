import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { getR2Client, R2_BUCKET, R2_PUBLIC_URL, ALLOWED_TYPES, MAX_SINGLE_UPLOAD_SIZE } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType, type, size } = await request.json();

    // Validate required fields
    if (!filename || !contentType || !type || !size) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate size
    if (size > MAX_SINGLE_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "File too large for single upload. Use multipart upload." },
        { status: 413 }
      );
    }

    // Validate type
    const allowedMimeTypes = ALLOWED_TYPES[type as keyof typeof ALLOWED_TYPES] as readonly string[] | undefined;
    if (!allowedMimeTypes || !allowedMimeTypes.includes(contentType)) {
      return NextResponse.json({ error: `Invalid file type: ${contentType}` }, { status: 400 });
    }

    // Generate unique key
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const key = `${type}/${uuidv4()}.${extension}`;

    // Generate presigned URL
    const r2Client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({
      presignedUrl,
      publicUrl: `${R2_PUBLIC_URL}/${key}`,
      key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
