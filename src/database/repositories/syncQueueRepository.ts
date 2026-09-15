import { getDatabase } from '../sqlite';
import { generateLocalId } from '../../utils/idGenerator';

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncEntityType =
  | 'GAME_RESULT'
  | 'COGNITIVE_SCORE'
  | 'MEMORY'
  | 'TASK'
  | 'PROFILE';

export type SyncQueueItem = {
  id: string;
  userId: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  payload: string; // JSON string
  retryCount: number;
  lastError: string | null;
  status: 'PENDING' | 'PROCESSING' | 'SYNCED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
};

/**
 * Enqueues a new sync item.
 */
export async function enqueueSyncItem(data: {
  userId: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  payload: any;
}): Promise<SyncQueueItem> {
  const db = await getDatabase();
  const id = generateLocalId('sq');
  const now = new Date().toISOString();
  const payloadStr = typeof data.payload === 'string' ? data.payload : JSON.stringify(data.payload);

  await db.runAsync(
    `INSERT INTO sync_queue (id, user_id, entity_type, entity_id, operation, payload, retry_count, last_error, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, NULL, 'PENDING', ?, ?)`,
    id,
    data.userId,
    data.entityType,
    data.entityId,
    data.operation,
    payloadStr,
    now,
    now
  );

  return {
    id,
    userId: data.userId,
    entityType: data.entityType,
    entityId: data.entityId,
    operation: data.operation,
    payload: payloadStr,
    retryCount: 0,
    lastError: null,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Retrieves all pending sync items for a user.
 */
export async function getPendingSyncItems(userId?: string): Promise<SyncQueueItem[]> {
  const db = await getDatabase();
  let query = `SELECT id, user_id as userId, entity_type as entityType, entity_id as entityId, operation, payload, retry_count as retryCount, last_error as lastError, status, created_at as createdAt, updated_at as updatedAt
               FROM sync_queue
               WHERE status = 'PENDING'`;
  const params: any[] = [];

  if (userId) {
    query += ` AND user_id = ?`;
    params.push(userId);
  }

  query += ` ORDER BY created_at ASC LIMIT 100`;

  const rows = await db.getAllAsync(query, ...params);
  return rows as SyncQueueItem[];
}

/**
 * Mark item as processing.
 */
export async function markSyncItemProcessing(id: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE sync_queue SET status = 'PROCESSING', updated_at = ? WHERE id = ?`,
    now,
    id
  );
}

/**
 * Mark sync item as synced (or delete it).
 */
export async function markSyncItemSynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, id);
}

/**
 * Mark sync item as failed / retry.
 */
export async function markSyncItemFailed(id: string, error: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE sync_queue
     SET status = 'PENDING', retry_count = retry_count + 1, last_error = ?, updated_at = ?
     WHERE id = ?`,
    error,
    now,
    id
  );
}

/**
 * Get count of pending items.
 */
export async function getPendingCount(userId?: string): Promise<number> {
  const db = await getDatabase();
  let query = `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'PENDING'`;
  const params: any[] = [];

  if (userId) {
    query += ` AND user_id = ?`;
    params.push(userId);
  }

  const result = await db.getFirstAsync(query, ...params);
  return result?.count ? Number(result.count) : 0;
}
