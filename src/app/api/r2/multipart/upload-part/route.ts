import { NextRequest, NextResponse } from "next/server";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, R2_BUCKET } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const { uploadId, key, partNumber } = await request.json();

    if (!uploadId || !key || !partNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const r2Client = getR2Client();
    const command = new UploadPartCommand({
      Bucket: R2_BUCKET,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({
      presignedUrl,
      partNumber,
    });
  } catch (error) {
    console.error("Upload part presign error:", error);
    return NextResponse.json({ error: "Failed to generate part upload URL" }, { status: 500 });
  }
}
