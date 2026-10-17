import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const REGION = process.env.AWS_REGION || "ap-south-1";
const BUCKET = process.env.S3_BUCKET_NAME || "smriticcare-private-files-kashif-2026-2";
const SIGNED_URL_TTL_SECONDS = 300;
const s3 = new S3Client({ region: REGION }); // Uses the SDK default credential provider chain (EC2 role in production).

const extensionByMime: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "audio/m4a": ".m4a",
  "audio/mp4": ".m4a",
  "audio/aac": ".aac",
  "audio/webm": ".webm",
  "audio/mpeg": ".mp3",
  "audio/wav": ".wav",
  "audio/x-m4a": ".m4a",
};

export function createMemoryObjectKey(userId: string, mimeType: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(userId)) throw new Error("Invalid memory owner ID.");
  const extension = extensionByMime[mimeType];
  if (!extension) throw new Error("Unsupported memory media type.");
  return `memories/${userId}/${randomUUID()}${extension}`;
}

/** Only keys created for this exact owner are considered managed S3 references. */
export function isOwnedMemoryObjectKey(value: string | null | undefined, userId: string): value is string {
  if (!value || value.includes("\\") || value.startsWith("/")) return false;
  const match = value.match(/^memories\/([^/]+)\/([0-9a-f-]{36})\.(jpg|png|webp|m4a|aac|webm|mp3|wav)$/i);
  return !!match && match[1] === userId && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(match[2]);
}

export function isLegacyMediaUrl(value: string): boolean {
  if (value.startsWith("/uploads/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function uploadMemoryObject(key: string, body: Buffer, contentType: string): Promise<void> {
  if (!key.startsWith("memories/")) throw new Error("Invalid memory storage key.");
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
}

export async function deleteMemoryObject(key: string, ownerId: string): Promise<void> {
  if (!isOwnedMemoryObjectKey(key, ownerId)) throw new Error("Invalid memory media reference.");
  // S3 DeleteObject is idempotent; repeated deletes of a missing key succeed.
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function resolveMemoryMedia(value: string | null, ownerId: string): Promise<string | null> {
  if (!value) return null;
  if (isLegacyMediaUrl(value)) return value;
  if (!isOwnedMemoryObjectKey(value, ownerId)) return null;
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: value }), { expiresIn: SIGNED_URL_TTL_SECONDS });
}

export async function serializeMemoryMedia<T extends { userId: string; imageUrl: string | null; audioUrl: string | null }>(memory: T): Promise<T> {
  const [imageUrl, audioUrl] = await Promise.all([
    resolveMemoryMedia(memory.imageUrl, memory.userId),
    resolveMemoryMedia(memory.audioUrl, memory.userId),
  ]);
  return { ...memory, imageUrl, audioUrl };
}

export async function serializeMemoriesMedia<T extends { userId: string; imageUrl: string | null; audioUrl: string | null }>(memories: T[]): Promise<T[]> {
  return Promise.all(memories.map(serializeMemoryMedia));
}

export function getMemoryMediaObjectKeys(memory: { userId: string; imageUrl: string | null; audioUrl: string | null }): string[] {
  return [memory.imageUrl, memory.audioUrl].filter((value): value is string => isOwnedMemoryObjectKey(value, memory.userId));
}
