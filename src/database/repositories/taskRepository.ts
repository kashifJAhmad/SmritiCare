import { getDatabase } from '../sqlite';
import { generateLocalId } from '../../utils/idGenerator';
import { enqueueSyncItem } from './syncQueueRepository';

export type LocalTask = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  scheduledAt: string;
  completed: boolean;
  reminderEnabled: boolean;
  repeatType: string;
  syncStatus: 'PENDING' | 'SYNCED';
  isDeleted: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Get all active tasks for a user.
 */
export async function getLocalTasks(userId: string): Promise<LocalTask[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT id, user_id as userId, title, description, category, scheduled_at as scheduledAt,
            completed, reminder_enabled as reminderEnabled, repeat_type as repeatType,
            sync_status as syncStatus, is_deleted as isDeleted, created_at as createdAt, updated_at as updatedAt
     FROM local_tasks
     WHERE user_id = ? AND is_deleted = 0
     ORDER BY scheduled_at ASC`,
    userId
  );
  return rows.map((r: any) => ({
    ...r,
    completed: Boolean(r.completed),
    reminderEnabled: Boolean(r.reminderEnabled),
  })) as LocalTask[];
}

/**
 * Create a task locally and enqueue for sync.
 */
export async function createTaskLocally(data: {
  userId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  scheduledAt: string;
  reminderEnabled?: boolean;
  repeatType?: string;
}): Promise<LocalTask> {
  const db = await getDatabase();
  const id = generateLocalId('tsk');
  const now = new Date().toISOString();
  const reminderEnabled = data.reminderEnabled !== undefined ? (data.reminderEnabled ? 1 : 0) : 1;
  const repeatType = data.repeatType || 'NONE';

  await db.runAsync(
    `INSERT INTO local_tasks (id, user_id, title, description, category, scheduled_at, completed, reminder_enabled, repeat_type, sync_status, is_deleted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 'PENDING', 0, ?, ?)`,
    id,
    data.userId,
    data.title,
    data.description || null,
    data.category || null,
    data.scheduledAt,
    reminderEnabled,
    repeatType,
    now,
    now
  );

  await enqueueSyncItem({
    userId: data.userId,
    entityType: 'TASK',
    entityId: id,
    operation: 'CREATE',
    payload: {
      id,
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      scheduledAt: data.scheduledAt,
      completed: false,
      reminderEnabled: Boolean(reminderEnabled),
      repeatType,
      createdAt: now,
    },
  });

  return {
    id,
    userId: data.userId,
    title: data.title,
    description: data.description || null,
    category: data.category || null,
    scheduledAt: data.scheduledAt,
    completed: false,
    reminderEnabled: Boolean(reminderEnabled),
    repeatType,
    syncStatus: 'PENDING',
    isDeleted: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Toggle task completion locally and enqueue sync.
 */
export async function toggleTaskCompletionLocally(
  userId: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE local_tasks
     SET completed = ?, sync_status = 'PENDING', updated_at = ?
     WHERE id = ? AND user_id = ?`,
    completed ? 1 : 0,
    now,
    taskId,
    userId
  );

  // Retrieve current task for payload
  const current = await db.getFirstAsync(
    `SELECT * FROM local_tasks WHERE id = ? AND user_id = ?`,
    taskId,
    userId
  );

  if (current) {
    await enqueueSyncItem({
      userId,
      entityType: 'TASK',
      entityId: taskId,
      operation: 'UPDATE',
      payload: {
        id: taskId,
        title: current.title,
        description: current.description,
        category: current.category,
        scheduledAt: current.scheduled_at,
        completed,
        reminderEnabled: Boolean(current.reminder_enabled),
        repeatType: current.repeat_type,
        updatedAt: now,
      },
    });
  }
}

/**
 * Update task locally.
 */
export async function updateTaskLocally(
  userId: string,
  taskId: string,
  data: {
    title: string;
    description?: string | null;
    category?: string | null;
    scheduledAt: string;
    completed: boolean;
    reminderEnabled?: boolean;
    repeatType?: string;
  }
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const reminderEnabled = data.reminderEnabled !== undefined ? (data.reminderEnabled ? 1 : 0) : 1;
  const repeatType = data.repeatType || 'NONE';

  await db.runAsync(
    `UPDATE local_tasks
     SET title = ?, description = ?, category = ?, scheduled_at = ?, completed = ?, reminder_enabled = ?, repeat_type = ?, sync_status = 'PENDING', updated_at = ?
     WHERE id = ? AND user_id = ?`,
    data.title,
    data.description || null,
    data.category || null,
    data.scheduledAt,
    data.completed ? 1 : 0,
    reminderEnabled,
    repeatType,
    now,
    taskId,
    userId
  );

  await enqueueSyncItem({
    userId,
    entityType: 'TASK',
    entityId: taskId,
    operation: 'UPDATE',
    payload: {
      id: taskId,
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      scheduledAt: data.scheduledAt,
      completed: data.completed,
      reminderEnabled: Boolean(reminderEnabled),
      repeatType,
      updatedAt: now,
    },
  });
}

/**
 * Soft delete task locally.
 */
export async function deleteTaskLocally(userId: string, taskId: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE local_tasks SET is_deleted = 1, sync_status = 'PENDING', updated_at = ? WHERE id = ? AND user_id = ?`,
    now,
    taskId,
    userId
  );

  await enqueueSyncItem({
    userId,
    entityType: 'TASK',
    entityId: taskId,
    operation: 'DELETE',
    payload: { id: taskId },
  });
}

/**
 * Upsert server tasks into local SQLite.
 */
export async function upsertServerTasks(userId: string, tasks: any[]): Promise<void> {
  const db = await getDatabase();
  for (const t of tasks) {
    await db.runAsync(
      `INSERT INTO local_tasks (id, user_id, title, description, category, scheduled_at, completed, reminder_enabled, repeat_type, sync_status, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SYNCED', 0, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         category = excluded.category,
         scheduled_at = excluded.scheduled_at,
         completed = excluded.completed,
         reminder_enabled = excluded.reminder_enabled,
         repeat_type = excluded.repeat_type,
         sync_status = 'SYNCED',
         updated_at = excluded.updated_at`,
      t.id,
      userId,
      t.title,
      t.description ?? null,
      t.category ?? null,
      t.scheduledAt ? new Date(t.scheduledAt).toISOString() : new Date().toISOString(),
      t.completed ? 1 : 0,
      t.reminderEnabled ? 1 : 0,
      t.repeatType || 'NONE',
      t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
      t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date().toISOString()
    );
  }
}

/**
 * Mark a task as SYNCED.
 */
export async function markTaskSynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`UPDATE local_tasks SET sync_status = 'SYNCED' WHERE id = ?`, id);
}
