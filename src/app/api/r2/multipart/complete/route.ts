import { NextRequest, NextResponse } from "next/server";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getR2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

interface PartInfo {
  partNumber: number;
  etag: string;
}

export async function POST(request: NextRequest) {
  try {
    const { uploadId, key, parts } = await request.json();

    if (!uploadId || !key || !parts?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Sort parts by part number and format for S3
    const sortedParts = (parts as PartInfo[])
      .sort((a, b) => a.partNumber - b.partNumber)
      .map((part) => ({
        PartNumber: part.partNumber,
        ETag: part.etag,
      }));

    const r2Client = getR2Client();
    const command = new CompleteMultipartUploadCommand({
      Bucket: R2_BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: sortedParts },
    });

    await r2Client.send(command);

    return NextResponse.json({
      success: true,
      url: `${R2_PUBLIC_URL}/${key}`,
    });
  } catch (error) {
    console.error("Complete multipart error:", error);
    return NextResponse.json({ error: "Failed to complete upload" }, { status: 500 });
  }
}
