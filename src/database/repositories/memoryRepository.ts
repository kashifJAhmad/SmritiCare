import { getDatabase } from '../sqlite';
import { generateLocalId } from '../../utils/idGenerator';
import { enqueueSyncItem } from './syncQueueRepository';

export type LocalMemory = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  type: string;
  syncStatus: 'PENDING' | 'SYNCED';
  isDeleted: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Get all active (non-deleted) local memories for a user.
 */
export async function getLocalMemories(userId: string): Promise<LocalMemory[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT id, user_id as userId, title, description, category, image_url as imageUrl, audio_url as audioUrl, type, sync_status as syncStatus, is_deleted as isDeleted, created_at as createdAt, updated_at as updatedAt
     FROM local_memories
     WHERE user_id = ? AND is_deleted = 0
     ORDER BY created_at DESC`,
    userId
  );
  return rows as LocalMemory[];
}

/**
 * Save a new memory locally and enqueue for sync.
 */
export async function createMemoryLocally(data: {
  userId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  type?: string;
}): Promise<LocalMemory> {
  const db = await getDatabase();
  const id = generateLocalId('mem');
  const now = new Date().toISOString();
  const type = data.type || 'text';

  await db.runAsync(
    `INSERT INTO local_memories (id, user_id, title, description, category, image_url, audio_url, type, sync_status, is_deleted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 0, ?, ?)`,
    id,
    data.userId,
    data.title,
    data.description || null,
    data.category || null,
    data.imageUrl || null,
    data.audioUrl || null,
    type,
    now,
    now
  );

  await enqueueSyncItem({
    userId: data.userId,
    entityType: 'MEMORY',
    entityId: id,
    operation: 'CREATE',
    payload: {
      id,
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      imageUrl: data.imageUrl || null,
      audioUrl: data.audioUrl || null,
      type,
      createdAt: now,
    },
  });

  return {
    id,
    userId: data.userId,
    title: data.title,
    description: data.description || null,
    category: data.category || null,
    imageUrl: data.imageUrl || null,
    audioUrl: data.audioUrl || null,
    type,
    syncStatus: 'PENDING',
    isDeleted: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update memory locally and enqueue for sync.
 */
export async function updateMemoryLocally(
  userId: string,
  id: string,
  data: {
    title: string;
    description?: string | null;
    category?: string | null;
  }
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE local_memories
     SET title = ?, description = ?, category = ?, sync_status = 'PENDING', updated_at = ?
     WHERE id = ? AND user_id = ?`,
    data.title,
    data.description || null,
    data.category || null,
    now,
    id,
    userId
  );

  await enqueueSyncItem({
    userId,
    entityType: 'MEMORY',
    entityId: id,
    operation: 'UPDATE',
    payload: {
      id,
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      updatedAt: now,
    },
  });
}

/**
 * Soft delete memory locally and enqueue for sync deletion.
 */
export async function deleteMemoryLocally(userId: string, id: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE local_memories SET is_deleted = 1, sync_status = 'PENDING', updated_at = ? WHERE id = ? AND user_id = ?`,
    now,
    id,
    userId
  );

  await enqueueSyncItem({
    userId,
    entityType: 'MEMORY',
    entityId: id,
    operation: 'DELETE',
    payload: { id },
  });
}

/**
 * Upsert memories pulled from server into local SQLite.
 */
export async function upsertServerMemories(userId: string, memories: any[]): Promise<void> {
  const db = await getDatabase();
  for (const m of memories) {
    await db.runAsync(
      `INSERT INTO local_memories (id, user_id, title, description, category, image_url, audio_url, type, sync_status, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SYNCED', 0, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         category = excluded.category,
         image_url = excluded.image_url,
         audio_url = excluded.audio_url,
         type = excluded.type,
         sync_status = 'SYNCED',
         updated_at = excluded.updated_at`,
      m.id,
      userId,
      m.title,
      m.description ?? null,
      m.category ?? null,
      m.imageUrl ?? null,
      m.audioUrl ?? null,
      m.type || 'text',
      m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
      m.updatedAt ? new Date(m.updatedAt).toISOString() : new Date().toISOString()
    );
  }
}

/**
 * Mark a local memory as SYNCED.
 */
export async function markMemorySynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`UPDATE local_memories SET sync_status = 'SYNCED' WHERE id = ?`, id);
}
