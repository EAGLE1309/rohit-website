import { NextResponse } from "next/server";
import { client } from "@/lib/dashboard/sanity-cilent";

// List all assets that need migration (videos and audio from Sanity CDN)
export async function GET() {
  try {
    // Fetch all projects with video assets
    const projects = await client.fetch(`
      *[_type == "projects" && defined(video.asset)] {
        _id,
        name,
        "videoUrl": video.asset->url,
        "videoSize": video.asset->size,
        "videoMimeType": video.asset->mimeType,
        r2Video
      }
    `);

    // Fetch all music with audio assets
    const musics = await client.fetch(`
      *[_type == "musics" && defined(track.asset)] {
        _id,
        title,
        "trackUrl": track.asset->url,
        "trackSize": track.asset->size,
        "trackMimeType": track.asset->mimeType,
        r2Track
      }
    `);

    // Filter to only include items that haven't been migrated yet
    // Check if r2Video/r2Track object exists and has a url
    const projectsToMigrate = projects.filter(
      (p: any) => p.videoUrl && !p.r2Video?.url
    );
    const musicsToMigrate = musics.filter(
      (m: any) => m.trackUrl && !m.r2Track?.url
    );

    // Calculate totals
    const totalVideoSize = projectsToMigrate.reduce(
      (acc: number, p: any) => acc + (p.videoSize || 0),
      0
    );
    const totalAudioSize = musicsToMigrate.reduce(
      (acc: number, m: any) => acc + (m.trackSize || 0),
      0
    );

    return NextResponse.json({
      projects: {
        total: projects.length,
        toMigrate: projectsToMigrate.length,
        migrated: projects.length - projectsToMigrate.length,
        items: projectsToMigrate,
        totalSize: totalVideoSize,
      },
      musics: {
        total: musics.length,
        toMigrate: musicsToMigrate.length,
        migrated: musics.length - musicsToMigrate.length,
        items: musicsToMigrate,
        totalSize: totalAudioSize,
      },
      summary: {
        totalItems: projectsToMigrate.length + musicsToMigrate.length,
        totalSize: totalVideoSize + totalAudioSize,
        totalSizeFormatted: formatBytes(totalVideoSize + totalAudioSize),
      },
    });
  } catch (error) {
    console.error("List migration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list assets" },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
