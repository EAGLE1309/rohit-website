import { S3Client } from "@aws-sdk/client-s3";

// R2 configuration - these are checked at runtime when the client is used
const getR2Config = () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId) throw new Error("R2_ACCOUNT_ID is required");
  if (!accessKeyId) throw new Error("R2_ACCESS_KEY_ID is required");
  if (!secretAccessKey) throw new Error("R2_SECRET_ACCESS_KEY is required");

  return { accountId, accessKeyId, secretAccessKey };
};

// Lazy initialization of R2 client to avoid errors during build
let _r2Client: S3Client | null = null;

export const getR2Client = (): S3Client => {
  if (!_r2Client) {
    const config = getR2Config();
    _r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return _r2Client;
};

export const R2_BUCKET = process.env.R2_BUCKET_NAME || "rohit-media";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

// Allowed MIME types for uploads
export const ALLOWED_TYPES = {
  video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"],
} as const;

// Size limits
export const MAX_SINGLE_UPLOAD_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
export const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB for multipart uploads

// Helper to check if a URL is from R2
export const isR2Url = (url: string): boolean => {
  if (!url || !R2_PUBLIC_URL) return false;
  return url.startsWith(R2_PUBLIC_URL);
};

// Helper to check if a URL is from Sanity CDN
export const isSanityCdnUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes("cdn.sanity.io");
};

// Get the appropriate URL for media (supports both R2 and Sanity CDN)
export const getMediaUrl = (r2Url?: string | null, sanityCdnUrl?: string | null): string | null => {
  // Prefer R2 URL if available
  if (r2Url && isR2Url(r2Url)) return r2Url;
  // Fall back to Sanity CDN
  if (sanityCdnUrl) return sanityCdnUrl;
  return null;
};

/**
 * Get the best playable URL for media:
 * - R2 URLs: Use proxy for Web Audio API compatibility (MediaElementAudioSource needs CORS)
 * - Sanity CDN: Use proxy for CORS handling
 */
export const getPlayableUrl = (r2Url?: string | null, sanityCdnUrl?: string | null): string | null => {
  // R2 needs proxy for Web Audio API (MediaElementAudioSource requires CORS)
  if (r2Url && isR2Url(r2Url)) {
    return `/api/proxy-audio?url=${encodeURIComponent(r2Url)}`;
  }
  // Sanity CDN needs proxy for CORS
  if (sanityCdnUrl && isSanityCdnUrl(sanityCdnUrl)) {
    return `/api/proxy-audio?url=${encodeURIComponent(sanityCdnUrl)}`;
  }
  return null;
};
