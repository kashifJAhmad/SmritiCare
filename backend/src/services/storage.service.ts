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

export class ProfileImageSerializationError extends Error {
  constructor() {
    super("Unable to prepare profile image.");
    this.name = "ProfileImageSerializationError";
  }
}

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

export function createProfileImageObjectKey(userId: string, mimeType: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(userId)) throw new Error("Invalid profile image owner ID.");
  const extension = extensionByMime[mimeType];
  if (!extension || ![".jpg", ".png", ".webp"].includes(extension)) throw new Error("Unsupported profile image type.");
  return `profiles/${userId}/${randomUUID()}${extension}`;
}

/** Only keys created for this exact owner are considered managed S3 references. */
export function isOwnedMemoryObjectKey(value: string | null | undefined, userId: string): value is string {
  if (!value || value.includes("\\") || value.startsWith("/")) return false;
  const match = value.match(/^memories\/([^/]+)\/([0-9a-f-]{36})\.(jpg|png|webp|m4a|aac|webm|mp3|wav)$/i);
  return !!match && match[1] === userId && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(match[2]);
}

export function isOwnedProfileImageObjectKey(value: string | null | undefined, userId: string): boolean {
  if (!value || value.includes("\\") || value.startsWith("/")) return false;
  const match = value.match(/^profiles\/([^/]+)\/([0-9a-f-]{36})\.(jpg|png|webp)$/i);
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

export async function uploadProfileImageObject(key: string, body: Buffer, contentType: string, ownerId: string): Promise<void> {
  if (!isOwnedProfileImageObjectKey(key, ownerId)) throw new Error("Invalid profile image storage key.");
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
}

export async function deleteMemoryObject(key: string, ownerId: string): Promise<void> {
  if (!isOwnedMemoryObjectKey(key, ownerId)) throw new Error("Invalid memory media reference.");
  // S3 DeleteObject is idempotent; repeated deletes of a missing key succeed.
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function deleteProfileImageObject(key: string, ownerId: string): Promise<void> {
  if (!isOwnedProfileImageObjectKey(key, ownerId)) throw new Error("Invalid profile image reference.");
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function resolveMemoryMedia(value: string | null, ownerId: string): Promise<string | null> {
  if (!value) return null;
  if (isLegacyMediaUrl(value)) return value;
  if (!isOwnedMemoryObjectKey(value, ownerId)) return null;
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: value }), { expiresIn: SIGNED_URL_TTL_SECONDS });
}

export async function resolveProfileImage(
  value: string | null | undefined,
  ownerId: string,
  signUrl: typeof getSignedUrl = getSignedUrl,
  client: S3Client = s3,
): Promise<string | null> {
  if (!value) return null;
  if (value.startsWith("/uploads/")) return value;

  let reference: string | null;
  try {
    reference = normalizeProfileImageReference(value, ownerId);
  } catch {
    return null;
  }
  if (!reference) return null;
  if (!isOwnedProfileImageObjectKey(reference, ownerId)) return reference;

  try {
    return await signUrl(client, new GetObjectCommand({ Bucket: BUCKET, Key: reference }), { expiresIn: SIGNED_URL_TTL_SECONDS });
  } catch {
    throw new ProfileImageSerializationError();
  }
}

export async function serializeProfileImageUser<T extends { id: string; profileImageUrl?: string | null }>(user: T): Promise<T> {
  return { ...user, profileImageUrl: await resolveProfileImage(user.profileImageUrl, user.id) };
}

/** Convert this user's own profile-image URL/key to a stable DB key, while preserving legacy URLs. */
function hasAwsSigningParameters(url: URL): boolean {
  const names = Array.from(url.searchParams.keys()).map((name) => name.toLowerCase());
  if (names.some((name) => name.startsWith("x-amz-"))) return true;
  return names.includes("awsaccesskeyid") && names.includes("signature") && names.includes("expires");
}

function hasS3EndpointHost(hostname: string): boolean {
  return /(^|\.)s3(?:[.-][a-z0-9-]+)*\.amazonaws\.com(?:\.cn)?$/i.test(hostname);
}

function isS3UrlCandidate(value: string, url?: URL): boolean {
  if (/[?&](?:x-amz-[a-z0-9-]+|awsaccesskeyid)(?:=|&|#|$)/i.test(value)) return true;
  if (url && (hasS3EndpointHost(url.hostname) || /(^|[.-])s3([.-]|$)/i.test(url.hostname) || hasAwsSigningParameters(url))) return true;
  return /(?:^|\/\/)[^/?#]*s3(?:[.-][a-z0-9-]+)*\.amazonaws\.com(?:\.cn)?(?:[/:?#]|$)/i.test(value);
}

function getProfileKeyFromS3Url(url: URL, expectedBucket: string, input: string): string | null {
  if (url.username || url.password || url.port || url.hash || url.pathname.includes("\\")) return null;

  const authorityStart = input.indexOf("://") + 3;
  const afterAuthority = input.slice(authorityStart);
  const firstDelimiter = afterAuthority.search(/[/?#]/);
  const rawPath = firstDelimiter >= 0 && afterAuthority[firstDelimiter] === "/"
    ? afterAuthority.slice(firstDelimiter).split(/[?#]/, 1)[0]
    : "/";
  if (rawPath.includes("\\") || rawPath.includes("%")) return null;

  const hostname = url.hostname.toLowerCase();
  const normalizedBucket = expectedBucket.toLowerCase();
  const virtualHostedSuffix = hostname.match(/\.s3(?:[.-][a-z0-9-]+)*\.amazonaws\.com(?:\.cn)?$/i)?.[0];
  const virtualHosted = !!virtualHostedSuffix;
  if (virtualHosted) {
    if (hostname.slice(0, -virtualHostedSuffix!.length) !== normalizedBucket) return null;
  } else if (!hasS3EndpointHost(hostname)) {
    return null;
  }

  let segments: string[];
  try {
    const rawSegments = rawPath.slice(1).split("/");
    if (rawSegments.some((segment) => segment.length === 0 || segment === "." || segment === "..")) return null;
    segments = rawSegments.map((segment) => decodeURIComponent(segment));
  } catch {
    return null;
  }
  if (rawPath !== url.pathname) return null;

  if (virtualHosted) {
    if (segments.length !== 3 || segments[0] !== "profiles") return null;
  } else {
    if (segments.length !== 4 || segments[0] !== expectedBucket || segments[1] !== "profiles") return null;
    segments = segments.slice(1);
  }

  return segments.join("/");
}

export function normalizeProfileImageReference(value: unknown, ownerId: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new Error("Invalid profile image reference.");
  if (isOwnedProfileImageObjectKey(value, ownerId)) return value;
  if (value.startsWith("/uploads/")) return value;

  let url: URL | undefined;
  try {
    url = new URL(value);
  } catch {
    if (isS3UrlCandidate(value)) throw new Error("Invalid profile image reference.");
  }

  if (url && (url.protocol === "http:" || url.protocol === "https:")) {
    if (isS3UrlCandidate(value, url)) {
      const key = getProfileKeyFromS3Url(url, BUCKET, value);
      if (key && isOwnedProfileImageObjectKey(key, ownerId)) return key;
      throw new Error("Invalid profile image reference.");
    }
    return value;
  }

  throw new Error("Invalid profile image reference.");
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
