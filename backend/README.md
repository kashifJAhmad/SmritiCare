# SmritiCare Backend

## Private memory media storage

Memory photos and voice recordings are stored in the private S3 bucket. The existing `Memory.imageUrl` / `Memory.audioUrl` columns contain stable keys such as `memories/<userId>/<uuid>.jpg`, not public S3 URLs. Authenticated memory reads convert owner-scoped keys into presigned GET URLs that expire after five minutes. The upload API and `Memory` model remain unchanged; the migration adds a separate deletion outbox table.

Configure the backend process environment:

| Variable | Value |
| --- | --- |
| `AWS_REGION` | `ap-south-1` |
| `S3_BUCKET_NAME` | `smriticcare-private-files-kashif-2026-2` |

The AWS SDK default credential provider chain is used. On production EC2, attach the `SmritiCareEC2S3Role` instance profile and grant it the required object actions for this bucket. Do not add access keys to source files or `.env`. Local development may use the developer's normal AWS SDK credential chain (for example, an AWS CLI profile); it does not require static application credentials.

Deploy by installing backend dependencies, setting the two environment variables in the process manager/EC2 environment, applying the committed migration with `npx prisma migrate deploy`, and running `npm run build` before restarting the backend through the normal deployment process. The migration creates `MemoryMediaDeletion`, a durable outbox used to retry S3 cleanup after a memory row is removed. Keep S3 Block Public Access enabled; the application only uses private object operations and short-lived signed reads.

The Express `/uploads` static route remains enabled for compatibility. Existing memory records containing local URLs continue to use those URLs. Existing files are not migrated or deleted. Profile images remain in `backend/uploads/profiles` and continue to use the same local storage and static route. Existing memory files remain under `backend/uploads/memories` on deployments that already have them; retain those files and backups while old records reference them.

## Checks

Run `npx tsc --noEmit`, `npm run build`, and `npm test` from this directory. Tests cover owner-scoped key validation and legacy URL compatibility, plus database-failure safety, S3 cleanup failure/retry, idempotent retries, and cross-user deletion rejection through the deletion coordinator. Real Prisma transaction and AWS S3 calls still require deployment/integration testing.

Completed media deletion outbox records are retained so duplicate direct DELETE requests can return idempotently after cleanup. Failed records are retried when the same direct deletion or offline sync DELETE is retried; there is no scheduled background worker in this backend.
