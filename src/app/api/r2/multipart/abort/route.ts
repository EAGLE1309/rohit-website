import { NextRequest, NextResponse } from "next/server";
import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getR2Client, R2_BUCKET } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const { uploadId, key } = await request.json();

    if (!uploadId || !key) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const r2Client = getR2Client();
    const command = new AbortMultipartUploadCommand({
      Bucket: R2_BUCKET,
      Key: key,
      UploadId: uploadId,
    });

    await r2Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Abort multipart error:", error);
    return NextResponse.json({ error: "Failed to abort upload" }, { status: 500 });
  }
}
