import { prisma } from "../config/database";
import { deleteMemoryObject, getMemoryMediaObjectKeys, isOwnedMemoryObjectKey } from "./storage.service";

export type PendingMemoryMediaDeletion = {
  id: string;
  userId: string;
  memoryId: string;
  objectKey: string;
  deletedAt: Date | null;
};

type DeletionDependencies = {
  /** Atomically records deletion work and deletes only the caller-owned memory. */
  commitMemoryDeletion(userId: string, memoryId: string): Promise<boolean>;
  getDeletionRecords(userId: string, memoryId: string): Promise<PendingMemoryMediaDeletion[]>;
  deleteObject(key: string, ownerId: string): Promise<void>;
  markDeleted(id: string): Promise<void>;
  markFailed(id: string): Promise<void>;
};

export function createMemoryDeletionCoordinator(dependencies: DeletionDependencies) {
  return async function deleteMemoryWithMedia(userId: string, memoryId: string, allowMissing = false): Promise<{ id: string }> {
    const memoryWasDeleted = await dependencies.commitMemoryDeletion(userId, memoryId);
    const records = await dependencies.getDeletionRecords(userId, memoryId);
    if (!memoryWasDeleted && records.length === 0 && !allowMissing) throw new Error("Memory not found.");

    for (const record of records) {
      if (record.deletedAt) continue;
      try {
        if (record.userId !== userId || !isOwnedMemoryObjectKey(record.objectKey, userId)) {
          throw new Error("Invalid memory media reference.");
        }
        await dependencies.deleteObject(record.objectKey, userId);
        await dependencies.markDeleted(record.id);
      } catch {
        try { await dependencies.markFailed(record.id); } catch { /* The durable outbox entry remains available for retry. */ }
        throw new Error("Memory media cleanup is pending. Retry the deletion.");
      }
    }

    return { id: memoryId };
  };
}

const deleteMemoryWithMedia = createMemoryDeletionCoordinator({
  async commitMemoryDeletion(userId, memoryId) {
    return prisma.$transaction(async (transaction) => {
      const memory = await transaction.memory.findFirst({ where: { id: memoryId, userId } });
      if (!memory) return false;

      const keys = getMemoryMediaObjectKeys(memory);
      if (keys.length) {
        await transaction.memoryMediaDeletion.createMany({
          data: keys.map((objectKey) => ({ userId, memoryId, objectKey })),
          skipDuplicates: true,
        });
      }
      await transaction.memory.delete({ where: { id: memory.id } });
      return true;
    });
  },
  getDeletionRecords(userId, memoryId) {
    return prisma.memoryMediaDeletion.findMany({ where: { userId, memoryId }, orderBy: { createdAt: "asc" } });
  },
  deleteObject: deleteMemoryObject,
  async markDeleted(id) {
    await prisma.memoryMediaDeletion.update({ where: { id }, data: { deletedAt: new Date(), attempts: { increment: 1 }, lastError: null } });
  },
  async markFailed(id) {
    await prisma.memoryMediaDeletion.update({ where: { id }, data: { attempts: { increment: 1 }, lastError: "S3 object deletion failed; retry pending." } });
  },
});

export { deleteMemoryWithMedia };
