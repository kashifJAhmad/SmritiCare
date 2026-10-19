# S3 Integration Implementation Plan and Status

This document preserves the original architecture and records the implementation status based on the repository code and automated tests. A **Completed** status means code/test evidence exists; it does not mean the deployed AWS environment or production database was verified.

## Current state

### Existing memory-media integration — Completed; preserve unchanged

- `backend/src/services/storage.service.ts` uses AWS SDK v3 `S3Client`, `PutObjectCommand`, `GetObjectCommand`, and `DeleteObjectCommand`. It uses the SDK default credential chain and signs private reads for 300 seconds.
- Memory keys are stable owner-scoped UUID keys under `memories/<userId>/`; extensions are MIME-derived. `Memory.imageUrl` and `Memory.audioUrl` store keys for new uploads. Existing HTTP(S) and `/uploads/...` values are passed through.
- Authenticated memory reads, caregiver patient-memory reads, and authenticated sync pull serialize eligible media keys as signed URLs after their existing data access paths. Memory deletion and its retryable `MemoryMediaDeletion` outbox remain as implemented.
- No memory upload, signing, or deletion code was intentionally changed for the profile-image work. Backend tests still cover storage and deletion-coordinator behavior.

### Profile-image S3 migration — Implemented in repository

- `backend/src/controllers/profileImage.controller.ts` retains the authenticated profile-image upload endpoint and `image` multipart field, but stores incoming files in Multer memory storage and uploads new profile images to S3 instead of local disk.
- The handler requires an authenticated `req.userId`, applies the existing 5 MiB limit, accepts JPG/JPEG, PNG, and WEBP, and verifies basic file signatures against the declared MIME type using `backend/src/services/profileImage.validation.ts`. The extension is chosen from the validated canonical MIME type, not the client filename.
- `backend/src/services/storage.service.ts` creates unpredictable UUID keys under `profiles/<authenticatedUserId>/`, validates owner/key shape, and uses the same configured S3 client for upload, signing, and deletion. `User.profileImageUrl` stores the stable S3 key. No Prisma schema change was needed.
- The S3 upload occurs before the database update. If persistence fails, the handler checks whether the new key is already referenced before attempting compensating deletion. It deletes only when the read confirms the key is not referenced; if the outcome cannot be verified or the key is referenced, it retains the object and logs only a generic event (not the object key). It returns safe generic messages and does not expose raw AWS or database errors. The old profile image is not automatically deleted on replacement.
- `backend/src/routes/profileImage.routes.ts` preserves JWT middleware order and normalizes Multer errors into safe client messages.
- `normalizeProfileImageReference` in `backend/src/services/storage.service.ts`, called by `auth.service.ts` for profile updates, retains valid owner-matched stable keys, normalizes a URL only when it has the configured bucket's supported AWS S3 virtual-hosted or path-style structure and a valid owner-matched profile key, and rejects foreign or unrecognized S3 references (including S3-looking/custom hosts) with a generic validation error. It rejects extra/ambiguous path segments, traversal segments, and percent-encoded paths. Ordinary legacy HTTP(S) and `/uploads/...` values are preserved.
- `resolveProfileImage` validates and re-signs managed S3 URLs/keys only for the matching owner, so a previously stored foreign S3 URL is not returned as a legacy URL. It uses the existing five-minute URL lifetime, preserves null and ordinary legacy values, and wraps signing errors in a typed safe error. Auth and caregiver controllers return a safe 500 for that serialization failure; validation, authentication, missing-user, and existing caregiver authorization cases retain their respective handling. Auth responses, sync profile pull, and established caregiver-connection response paths serialize managed profile keys before returning them while keeping the existing `profileImageUrl` response field.
- Offline `PROFILE` sync push now applies `profileImageUrl` with the authenticated sync `userId`: an omitted field leaves the current value unchanged, explicit `null` clears it, and a non-null value passes through the same owner-aware normalization used for profile updates. Own signed S3 URLs become stable keys, supported legacy references remain compatible, and foreign/unrecognized S3 references return a per-item sync error before any profile fields are written. This path does not delete old objects and does not use `entityId` to select a user; the existing push-then-pull and last-write-wins behavior remains unchanged.
- Caregiver service failures now use typed validation, authorization, and not-found errors. Caregiver controllers map these to 400, 403, and 404 respectively; profile-image serialization and unexpected failures return safe 500 envelopes. Missing/invalid JWT handling remains in the existing authentication middleware, and unauthorized connection deletion remains 403. Successful response shapes and `caregiverAccess` redaction are unchanged.
- If profile-image upload succeeds and the database key is saved but signed-URL generation fails, the upload endpoint returns the additional error code `PROFILE_IMAGE_SAVED_SIGNING_FAILED` with its existing safe message/status. The mobile upload service recognizes only that code, makes one authenticated `GET /api/auth/me` request with the same JWT, and accepts only a usable `user.profileImageUrl` whose `user.id` matches the ID supplied by the active profile screen or saved with the authenticated session. It does not retry the multipart upload. A failed, timed-out, mismatched, or unusable refresh returns a safe UI error. Other upload failures do not trigger refresh.
- The existing `/uploads` static compatibility path and existing local profile files remain untouched. Existing database values that are legacy HTTP(S) or `/uploads/...` paths remain displayable. No existing files are migrated or deleted.

### Configuration and deployment — Incomplete / unverified

- Application code references `AWS_REGION` and `S3_BUCKET_NAME`, with fallback values in `storage.service.ts`; the AWS SDK default credential chain is used. The repository README describes configuring the variables and using the EC2 instance role.
- The root README calls Render the production API host, while `backend/README.md` gives EC2 process-environment and EC2 instance-role deployment instructions. No checked-in deployment manifest, process-manager configuration, container file, or workflow was found that establishes which platform is currently active. The documentation is therefore inconsistent/incomplete about the actual deployment target.
- Repository code/documentation does not independently confirm which values or credentials the deployed process receives, whether an EC2 role is attached (or what secure credential mechanism Render uses), or whether the live bucket is private and reachable. Deployment configuration and production verification remain incomplete until confirmed independently. This work did not contact AWS or production data and did not change AWS resources, deployment settings, bucket/region, or the credential chain.

## Architecture and data decisions

### Upload and retrieval workflow — Implemented

1. `src/services/profile.service.ts` continues using the existing Bearer-authenticated multipart endpoint and `image` field, reads `data.profileImageUrl` (with the existing fallback response field), and submits that returned URL through the profile update flow. The server normalizer converts its own signed URL back to the stable key. This contract was inspected statically, not exercised by running the mobile app.
2. The backend validates size, allowed declared MIME, and basic content signature, then generates a UUID key scoped to the JWT-authenticated user.
3. The backend uploads to the existing private bucket using the current S3 client/default credential provider chain, then saves the stable key in `User.profileImageUrl`.
4. On authorized response paths, managed keys are serialized as short-lived signed GET URLs. The response field remains `profileImageUrl`.
5. Memory media retains its existing owner-scoped key, signed URL, and deletion-outbox workflow.

### Permissions and authorization — Code paths present; production IAM unverified

- Upload remains behind `authenticate`; the handler uses the JWT middleware's `req.userId`, not an ID supplied in the multipart body, to generate the key and update the user row.
- Key validation binds profile S3 operations to `profiles/<ownerId>/<UUID>.<jpg|png|webp>`. Profile key normalization rejects another user's key. Resolvers do not sign keys that fail owner validation.
- Auth profile endpoints require the authenticated identity. Caregiver connection response serializers resolve keys with the ID of the profile record being serialized; those records are obtained by existing authenticated caregiver-connection queries. Sync pull queries the authenticated user's own profile. The initial caregiver-to-patient connection response now applies the same `caregiverAccess` field redaction as the connected-patient list.
- Current caregiver-list behavior retains a connected patient's basic name and profile image while `caregiverAccess` is false, but omits detailed profile fields. The code documents that the connection remains visible while care-data access is revoked; it does not establish whether the profile image is intentionally part of the permitted basic profile. Preserve this behavior pending product/privacy confirmation. Connection removal removes the connection row; detailed care endpoints use the caregiver/patient access boundary.
- Tests confirm authentication middleware precedes the upload handler, that the caregiver-connection router is authenticated, and that the list and initial connection response omit detailed fields when access is disabled. They do not prove real JWT verification or exhaustively exercise revoked-connection/permission-denial paths, nor do they prove live IAM policy.
- Keep the bucket private and do not expose permanent public object URLs. Do not add credentials to source or mobile configuration. Any IAM changes require separate evidence and approval; none are proposed here.

### MySQL metadata and compatibility — Implemented

- `User.profileImageUrl` stores a stable object key for new S3 profile images. Existing `Memory.imageUrl` and `Memory.audioUrl` remain unchanged. No database migration is required for this representation.
- Profile update normalization prevents a foreign or unrecognized signed/object S3 URL from being saved as an ordinary legacy URL. Ordinary HTTP(S) legacy profile URLs and `/uploads/...` remain supported, and null remains null.
- Existing local profile-image files are retained. Replacing an image does not remove old local files or automatically delete the previous S3 object.

## Failure handling, cleanup, and limitations

### Implemented rollback behavior

- Missing, empty, unsupported, MIME/signature-mismatched, and oversized files receive client-safe validation errors. The route handles Multer size and unexpected-file errors safely.
- S3 upload failure prevents the database reference from being changed and returns a generic server error.
- Database persistence failure after upload triggers a reference check and best-effort deletion only when the new key is confirmed unreferenced. If the DB outcome is unknown, the object is retained to avoid deleting a possibly committed reference. The prior row reference remains if the write did not commit.
- Signing failures are wrapped in a generic profile-image error. No AWS details are returned to clients.

### Known cleanup limitation

- If compensating deletion fails after a database write failure, the uploaded S3 object can remain orphaned. The handler intentionally keeps its response generic and writes only a generic `console.error` event without logging the object key, caught AWS/database exception, signed URL, or file contents. There is no profile-image deletion outbox or background retry worker, and no established alerting/monitoring pipeline.
- Successful replacement does not automatically delete the old profile image. This avoids deleting an object before the new reference is saved or deleting a possibly shared reference, but can leave unreferenced S3 objects. Any cleanup needs a separately reviewed ownership/reference and retention process.
- When the reference check itself fails, the handler safely skips deletion; this may leave an orphan and currently has no retry worker or alerting pipeline. The ambiguous-commit risk is mitigated by checking the persisted reference before deletion, but this read-after-error behavior is only mocked in tests, not validated against the deployed database.
- Existing local images are deliberately retained and may still depend on the deployed `/uploads` files being present.

## Tests and validation evidence — Implemented locally; integration verification incomplete

- `backend/tests/profileImage.service.test.cjs` additionally checks the post-persistence signing-failure code; profile sync application of owned keys, signed-URL normalization, null clearing, omitted-field preservation, foreign-reference rejection, authenticated-user scoping, and ordinary-field/response compatibility; auth serialization status classification; and caregiver invalid-input, wrong-role, missing-resource, unauthorized-deletion, serialization-failure, and safe internal-error handling. `src/services/profileImageUploadRecovery.test.cjs` exercises the mobile recovery helper for successful upload, same-session refresh, unusable/mismatched responses, refresh failure/timeout, and no upload retry or unrelated-error recovery.
- Existing `backend/tests/storage.service.test.cjs` and `backend/tests/memoryDeletion.service.test.cjs` run as part of `npm test`; they cover memory storage/key ownership and deletion coordinator behavior. Tests use mocks/helpers and do not establish live AWS, real database transaction, deployed authorization, or IAM behavior.
- Checks executed for this implementation: backend `npx tsc --noEmit`, backend `npm test` (TypeScript build plus storage, memory-deletion, and profile-image tests), root `npx tsc --noEmit`, and `node src/services/profileImageUploadRecovery.test.cjs`; each passed. `git diff --check` is also recorded after this task's final diff review. These repository tests use mocks/helpers and make no AWS or production DB calls. No app, server, live AWS call, production database connection, migration, or deployment was run.
- The profile signature check verifies basic JPEG/PNG/WEBP signatures; it is not a full image decoder or malware/content-safety scan. Tests do not exercise real AWS presigning/upload behavior, real JWT verification, every caregiver permission-denial path, background alerting, or cleanup retries. The mobile refresh handles the post-persistence signing failure without another multipart upload, but it cannot make the image available if subsequent signing continues to fail. Sync and caregiver controller tests use mocked Prisma/service behavior and do not verify production transactions or deployed authorization configuration.

## Outstanding work

1. Independently verify deployed `AWS_REGION`, `S3_BUCKET_NAME`, and the credential provider/EC2 instance-role path without exposing values; confirm effective private-bucket permissions using the approved deployment process.
2. Perform deployment-level verification of upload, authorized read/signing, and caregiver access behavior without changing AWS resources unnecessarily.
3. Decide whether profile cleanup needs durable retry/alerting and define a safe orphan/old-object retention process before deleting any objects.
4. Confirm the product privacy policy for retaining a connected patient's profile image while `caregiverAccess` is disabled; tests currently lock in the existing basic-profile behavior.
5. Consider deeper image decoding/security validation, durable cleanup retry/alerting, and additional denial/partial-failure tests.

No live AWS or production database verification is claimed by this document.
