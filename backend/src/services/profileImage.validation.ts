const canonicalImageType: Record<string, "image/jpeg" | "image/png" | "image/webp"> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
};

/** Require an allowed declared MIME type and matching basic file signatures. */
export function validateProfileImageContent(mimeType: string, body: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  const canonical = canonicalImageType[mimeType.toLowerCase()];
  if (!canonical || body.length < 12) return null;

  const isJpeg = body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff;
  const isPng = body.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = body.toString("ascii", 0, 4) === "RIFF" && body.toString("ascii", 8, 12) === "WEBP";

  if ((canonical === "image/jpeg" && isJpeg) || (canonical === "image/png" && isPng) || (canonical === "image/webp" && isWebp)) {
    return canonical;
  }
  return null;
}

export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
