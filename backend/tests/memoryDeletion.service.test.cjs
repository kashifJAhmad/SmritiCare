const assert = require("node:assert/strict");
const { createMemoryDeletionCoordinator } = require("../dist/services/memoryDeletion.service.js");

const key = "memories/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg";

async function databaseFailureLeavesMediaUntouched() {
  let s3Calls = 0;
  const remove = createMemoryDeletionCoordinator({
    async commitMemoryDeletion() { throw new Error("database unavailable"); },
    async getDeletionRecords() { return []; },
    async deleteObject() { s3Calls += 1; },
    async markDeleted() {},
    async markFailed() {},
  });
  await assert.rejects(remove("patient_123", "memory_1"), /database unavailable/);
  assert.equal(s3Calls, 0);
  console.log("PASS database failure does not delete S3 media");
}

async function failedS3CleanupCanBeRetriedAndIsIdempotent() {
  let memoryExists = true;
  let deletedAt = null;
  let attempts = 0;
  let failFirstDelete = true;
  const remove = createMemoryDeletionCoordinator({
    async commitMemoryDeletion() {
      if (!memoryExists) return false;
      memoryExists = false;
      return true;
    },
    async getDeletionRecords(userId, memoryId) {
      return [{ id: "outbox_1", userId: "patient_123", memoryId, objectKey: key, deletedAt }];
    },
    async deleteObject(objectKey, ownerId) {
      assert.equal(objectKey, key);
      assert.equal(ownerId, "patient_123");
      attempts += 1;
      if (failFirstDelete) {
        failFirstDelete = false;
        throw new Error("temporary S3 error");
      }
      // DeleteObject succeeds when the S3 key is already missing.
    },
    async markDeleted() { deletedAt = new Date(); },
    async markFailed() {},
  });

  await assert.rejects(remove("patient_123", "memory_1"), /cleanup is pending/);
  assert.equal(memoryExists, false);
  assert.equal(deletedAt, null);
  assert.deepEqual(await remove("patient_123", "memory_1"), { id: "memory_1" });
  assert.ok(deletedAt);
  assert.deepEqual(await remove("patient_123", "memory_1"), { id: "memory_1" });
  assert.equal(attempts, 2);
  console.log("PASS S3 failure remains queued, retry succeeds, and completed retry is idempotent");
}

async function anotherUserCannotDeleteMedia() {
  let s3Calls = 0;
  const remove = createMemoryDeletionCoordinator({
    async commitMemoryDeletion() { return false; },
    async getDeletionRecords() { return []; },
    async deleteObject() { s3Calls += 1; },
    async markDeleted() {},
    async markFailed() {},
  });
  await assert.rejects(remove("patient_other", "memory_1"), /Memory not found/);
  assert.equal(s3Calls, 0);

  const mismatchedOutbox = createMemoryDeletionCoordinator({
    async commitMemoryDeletion() { return false; },
    async getDeletionRecords(_userId, memoryId) {
      return [{ id: "foreign_outbox", userId: "patient_123", memoryId, objectKey: key, deletedAt: null }];
    },
    async deleteObject() { s3Calls += 1; },
    async markDeleted() {},
    async markFailed() {},
  });
  await assert.rejects(mismatchedOutbox("patient_other", "memory_1"), /cleanup is pending/);
  assert.equal(s3Calls, 0);
  console.log("PASS another user's deletion request cannot reach the media delete call");
}

async function main() {
  await databaseFailureLeavesMediaUntouched();
  await failedS3CleanupCanBeRetriedAndIsIdempotent();
  await anotherUserCannotDeleteMedia();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
