# Private S3 Storage Implementation Plan

## Repository findings

- The backend is Express/TypeScript with Prisma and MySQL. `Memory.imageUrl` and `Memory.audioUrl` are nullable strings, so the storage migration can retain the schema.
- `POST /api/memories/upload` currently uses Multer disk storage and stores a local URL in the memory row. The route is Bearer-authenticated.
- Memory reads include the authenticated user's `GET /api/memories` and `GET /api/memories/:id`, plus caregiver `GET /api/memories/patient/:patientId`; the caregiver endpoint already checks the connection and access setting.
- Direct deletion is in `memory.service.ts`; offline sync DELETE is in `sync.service.ts`. Sync pull also returns memory rows. Sync push can currently write arbitrary image/audio strings, so it must be prevented from assigning arbitrary S3 objects.
- `/uploads` serves both old memory media and profile images. Profile images are separately stored under `uploads/profiles`; this task will not migrate or remove them. Old local memory URLs and files must remain usable.
- The local backend package currently does not declare AWS SDK packages; the existing `storage.service.ts` is empty. No test script exists. A small Prisma migration is required for the deletion outbox because cross-system deletion cannot be retried reliably without durable state.
- The versioned Expo v57 documentation was reviewed as required by repository instructions; this backend change does not require mobile SDK changes.

## Data representation and compatibility

- Store new media references as the stable S3 key `memories/<userId>/<uuid>.<mime-derived-extension>` in the existing image/audio column.
- Resolve only keys matching the authenticated/authorized memory owner's exact prefix to short-lived (300 second) signed GET URLs. Treat existing absolute HTTP(S) URLs and legacy `/uploads/...` values as legacy URLs and pass them through unchanged.
- Keep object keys in the database/API on write. Before returning the standard API payload, replace key-valued image/audio fields with signed URLs so existing mobile render/play behavior remains compatible.
- Never sign or delete an arbitrary client-supplied key. Sync writes preserve existing media values on update, and only accept media keys already recorded on that same user's existing memory. New media must enter through the authenticated upload endpoint.

## Implementation steps

1. Add AWS SDK v3 S3 client and presigner dependencies to backend package metadata/lockfile. Configure region and bucket through `AWS_REGION` and `S3_BUCKET_NAME`; rely on SDK default credential resolution (EC2 instance role), with no static credentials.
2. Implement a reusable storage service for upload, private read URL generation, recognized object-key validation, and safe deletion. Restrict keys to `memories/<ownerId>/...`; use the existing configured bucket and avoid logging content or credentials.
3. Change the memory upload route to in-memory Multer storage with the existing 25 MiB cap and supported MIME set. Validate required file/title/type and ensure photo/audio type matches MIME. Derive extension from MIME (never the client filename), upload a UUID key, create the Memory row with that key, and delete the new S3 object if persistence fails. Return a response with usable signed media URLs while retaining stable keys in the database.
4. Add a media serialization helper for reads. Apply it after ownership checks to own-memory list/detail, caregiver patient memories (after existing caregiver authorization), and sync pull (authenticated owner's memories). Do not add an unauthenticated arbitrary-key signing endpoint.
5. Update direct deletion and sync DELETE to atomically write validated owner-scoped keys to a durable outbox and delete the caller-owned row in one database transaction. Process S3 deletions from that outbox; mark each completed only after S3 succeeds. Keep failed work for an idempotent retry, treat missing S3 objects as successful deletes, and return an error while cleanup is pending. Legacy local files stay untouched.
6. Harden sync MEMORY upserts: never allow client payloads to attach/change arbitrary media references or claim another user's row; preserve existing server media on update, and use no media for sync-created records. This protects the S3 namespace and prevents sync overwriting existing references.
7. Preserve the `/uploads` static route and profile-image implementation. Do not delete/migrate any existing files. Document the local files that remain and deployment requirements.
8. Add focused tests if the repository's current test tooling can support them without introducing a disproportionate test stack; otherwise add a practical test harness for storage/media helpers and document any coverage gap. Validate upload, signing, failure cleanup, authorization, deletion, and local URL compatibility where practical.
9. Update backend documentation with required environment variables, IAM role/default credential behavior, deployment/build steps, private bucket expectations, and compatibility behavior.
10. Run `npx tsc --noEmit`, `npm run build`, available relevant tests, inspect `git diff`, and ensure no unrelated/profile/mobile/database changes.

## Acceptance criteria

- New photo and voice media are persisted to S3 under owner-scoped UUID keys, while DB fields never contain public S3 URLs.
- All media URLs returned to authorized existing clients are short-lived signed URLs; caregiver URLs are issued only after the existing access check.
- Legacy local media continues to use the existing `/uploads` route, and profile images are unchanged.
- Direct and sync deletion remove only owner-scoped S3 objects and do not report success when required deletion fails.
- The Memory schema remains unchanged; a separate MemoryMediaDeletion outbox table is added. Authentication, Aiven connection, mobile UI, profile storage, and unrelated features remain unchanged.




