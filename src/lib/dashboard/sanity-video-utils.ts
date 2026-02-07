import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-06";

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable");
}

export const writeClient = createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion,
  token: process.env.SANITY_API_TOKEN,
});

export interface VideoAsset {
  _id: string;
  _type: string;
  url: string;
  originalFilename: string;
  size: number;
  mimeType: string;
}

export async function getAllVideoAssets(): Promise<VideoAsset[]> {
  const query = `*[_type == "sanity.fileAsset" && mimeType match "video/*"] {
    _id,
    _type,
    url,
    originalFilename,
    size,
    mimeType
  }`;

  return writeClient.fetch(query);
}

export async function getVideoAssetById(assetId: string): Promise<VideoAsset | null> {
  const query = `*[_type == "sanity.fileAsset" && _id == $assetId][0] {
    _id,
    _type,
    url,
    originalFilename,
    size,
    mimeType
  }`;

  return writeClient.fetch(query, { assetId });
}

export async function uploadVideoAsset(
  fileBuffer: Buffer,
  filename: string
): Promise<{ _id: string; url: string }> {
  const asset = await writeClient.assets.upload("file", fileBuffer, {
    filename,
    contentType: "video/mp4",
  });

  return {
    _id: asset._id,
    url: asset.url,
  };
}

export async function deleteVideoAsset(assetId: string): Promise<void> {
  await writeClient.delete(assetId);
}

export async function findDocumentsReferencingAsset(assetId: string): Promise<any[]> {
  const query = `*[references($assetId)] {
    _id,
    _type,
    name,
    "videoField": video.asset._ref
  }`;

  return writeClient.fetch(query, { assetId });
}

export async function updateDocumentVideoReference(
  documentId: string,
  fieldPath: string,
  newAssetId: string
): Promise<void> {
  await writeClient.patch(documentId).set({
    [fieldPath]: {
      _type: "file",
      asset: {
        _type: "reference",
        _ref: newAssetId,
      },
    },
  }).commit();
}
