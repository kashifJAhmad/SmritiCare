const assert = require("node:assert/strict");
const {
  createMemoryObjectKey,
  isOwnedMemoryObjectKey,
  isLegacyMediaUrl,
  resolveMemoryMedia,
} = require("../dist/services/storage.service.js");

async function main() {
  const photo = createMemoryObjectKey("patient_123", "image/jpeg");
  const voice = createMemoryObjectKey("patient_123", "audio/mp4");
  assert.match(photo, /^memories\/patient_123\/[0-9a-f-]{36}\.jpg$/i);
  assert.match(voice, /^memories\/patient_123\/[0-9a-f-]{36}\.m4a$/i);
  assert.notEqual(photo, voice);
  console.log("PASS photo and voice keys use owner-scoped UUIDs and MIME-derived extensions");

  const valid = "memories/patient_123/550e8400-e29b-41d4-a716-446655440000.webp";
  assert.equal(isOwnedMemoryObjectKey(valid, "patient_123"), true);
  assert.equal(isOwnedMemoryObjectKey(valid, "patient_other"), false);
  assert.equal(isOwnedMemoryObjectKey("memories/patient_123/../private.jpg", "patient_123"), false);
  assert.equal(isOwnedMemoryObjectKey("memories/patient_123/550e8400-e29b-11d4-a716-446655440000.jpg", "patient_123"), false);
  console.log("PASS only valid media keys for the matching owner are accepted");

  const legacy = "https://api.example.test/uploads/memories/old-photo.jpg";
  assert.equal(isLegacyMediaUrl(legacy), true);
  assert.equal(isLegacyMediaUrl("/uploads/memories/old-photo.jpg"), true);
  assert.equal(await resolveMemoryMedia(legacy, "patient_123"), legacy);
  assert.equal(await resolveMemoryMedia("memories/another-user/550e8400-e29b-41d4-a716-446655440000.jpg", "patient_123"), null);
  assert.equal(await resolveMemoryMedia("s3://bucket/private.jpg", "patient_123"), null);
  console.log("PASS legacy media URLs remain unchanged and arbitrary S3 keys are not exposed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
