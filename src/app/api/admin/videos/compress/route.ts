import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { isDevEnvironment, devOnlyResponse } from "@/lib/dashboard/dev-only";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  if (!isDevEnvironment()) return devOnlyResponse();
  try {
    const { inputPath } = await request.json();

    if (!inputPath) {
      return NextResponse.json(
        { success: false, error: "Input path is required" },
        { status: 400 }
      );
    }

    if (!existsSync(inputPath)) {
      return NextResponse.json(
        { success: false, error: "Input file not found" },
        { status: 404 }
      );
    }

    const inputStats = await stat(inputPath);
    const originalSize = inputStats.size;

    const dir = path.dirname(inputPath);
    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);
    const outputPath = path.join(dir, `compressed_${basename}${ext}`);

    const ffmpegCommand = `ffmpeg -i "${inputPath}" -c:v libx264 -preset fast -crf 18 -c:a aac -movflags +faststart -y "${outputPath}"`;

    console.log("Running FFmpeg command:", ffmpegCommand);

    const { stdout, stderr } = await execAsync(ffmpegCommand, {
      maxBuffer: 50 * 1024 * 1024,
    });

    if (!existsSync(outputPath)) {
      throw new Error("Compression failed - output file not created");
    }

    const outputStats = await stat(outputPath);
    const compressedSize = outputStats.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

    return NextResponse.json({
      success: true,
      outputPath,
      originalSize,
      compressedSize,
      compressionRatio: `${compressionRatio}%`,
      ffmpegOutput: stderr || stdout,
    });
  } catch (error: any) {
    console.error("Error compressing video:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to compress video",
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}
