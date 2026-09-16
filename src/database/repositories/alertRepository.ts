import { getDatabase } from '../sqlite';
import { generateLocalId } from '../../utils/idGenerator';
import { enqueueSyncItem } from './syncQueueRepository';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
export type AlertSourceType = 'TASK' | 'HYDRATION' | 'GAME' | 'MANUAL';

export type LocalAlert = {
  id: string;
  patientId: string;
  caregiverId: string;
  category: string;
  typeLabel: string;
  title: string;
  description: string;
  badge: string;
  status: AlertStatus;
  sourceType: AlertSourceType;
  sourceId?: string | null;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  syncStatus: 'PENDING' | 'SYNCED';
  isDeleted: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Get all active local alerts for a user (as patient or caregiver).
 */
export async function getLocalAlerts(userId: string): Promise<LocalAlert[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT id, patient_id as patientId, caregiver_id as caregiverId,
            category, type_label as typeLabel, title, description, badge,
            status, source_type as sourceType, source_id as sourceId,
            acknowledged_at as acknowledgedAt, resolved_at as resolvedAt,
            sync_status as syncStatus, is_deleted as isDeleted,
            created_at as createdAt, updated_at as updatedAt
     FROM local_alerts
     WHERE (caregiver_id = ? OR patient_id = ?) AND is_deleted = 0
     ORDER BY created_at DESC`,
    userId,
    userId
  );
  return rows as LocalAlert[];
}

/**
 * Create an alert locally and enqueue for synchronization.
 */
export async function createAlertLocally(data: {
  patientId: string;
  caregiverId: string;
  category: string;
  typeLabel: string;
  title: string;
  description: string;
  badge: string;
  sourceType?: AlertSourceType;
  sourceId?: string | null;
}): Promise<LocalAlert> {
  const db = await getDatabase();
  const id = generateLocalId('alt');
  const now = new Date().toISOString();
  const sourceType = data.sourceType || 'TASK';

  await db.runAsync(
    `INSERT INTO local_alerts (id, patient_id, caregiver_id, category, type_label, title, description, badge, status, source_type, source_id, sync_status, is_deleted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, 'PENDING', 0, ?, ?)`,
    id,
    data.patientId,
    data.caregiverId,
    data.category,
    data.typeLabel,
    data.title,
    data.description || '',
    data.badge,
    sourceType,
    data.sourceId || null,
    now,
    now
  );

  await enqueueSyncItem({
    userId: data.caregiverId,
    entityType: 'ALERT',
    entityId: id,
    operation: 'CREATE',
    payload: {
      id,
      patientId: data.patientId,
      caregiverId: data.caregiverId,
      category: data.category,
      typeLabel: data.typeLabel,
      title: data.title,
      description: data.description || '',
      badge: data.badge,
      status: 'ACTIVE',
      sourceType,
      sourceId: data.sourceId || null,
      createdAt: now,
    },
  });

  return {
    id,
    patientId: data.patientId,
    caregiverId: data.caregiverId,
    category: data.category,
    typeLabel: data.typeLabel,
    title: data.title,
    description: data.description || '',
    badge: data.badge,
    status: 'ACTIVE',
    sourceType,
    sourceId: data.sourceId || null,
    syncStatus: 'PENDING',
    isDeleted: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Acknowledge an alert locally and enqueue sync.
 */
export async function acknowledgeAlertLocally(userId: string, alertId: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE local_alerts
     SET status = 'ACKNOWLEDGED', acknowledged_at = ?, sync_status = 'PENDING', updated_at = ?
     WHERE id = ?`,
    now,
    now,
    alertId
  );

  await enqueueSyncItem({
    userId,
    entityType: 'ALERT',
    entityId: alertId,
    operation: 'UPDATE',
    payload: {
      id: alertId,
      status: 'ACKNOWLEDGED',
      acknowledgedAt: now,
      updatedAt: now,
    },
  });
}

/**
 * Resolve an alert locally and enqueue sync.
 */
export async function resolveAlertLocally(userId: string, alertId: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE local_alerts
     SET status = 'RESOLVED', resolved_at = ?, sync_status = 'PENDING', updated_at = ?
     WHERE id = ?`,
    now,
    now,
    alertId
  );

  await enqueueSyncItem({
    userId,
    entityType: 'ALERT',
    entityId: alertId,
    operation: 'UPDATE',
    payload: {
      id: alertId,
      status: 'RESOLVED',
      resolvedAt: now,
      updatedAt: now,
    },
  });
}

/**
 * Upsert alerts pulled from server into local SQLite with deterministic conflict resolution.
 */
export async function upsertServerAlerts(alerts: any[]): Promise<void> {
  const db = await getDatabase();
  for (const a of alerts) {
    const existing = await db.getFirstAsync(
      `SELECT sync_status as syncStatus, updated_at as updatedAt FROM local_alerts WHERE id = ?`,
      a.id
    );

    // If local has pending changes and is newer, keep local pending version
    if (existing && existing.syncStatus === 'PENDING') {
      const localUpdated = new Date(existing.updatedAt).getTime();
      const serverUpdated = new Date(a.updatedAt || a.createdAt).getTime();
      if (localUpdated >= serverUpdated) {
        continue;
      }
    }

    await db.runAsync(
      `INSERT INTO local_alerts (id, patient_id, caregiver_id, category, type_label, title, description, badge, status, source_type, source_id, acknowledged_at, resolved_at, sync_status, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SYNCED', 0, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         category = excluded.category,
         type_label = excluded.type_label,
         title = excluded.title,
         description = excluded.description,
         badge = excluded.badge,
         status = excluded.status,
         source_type = excluded.source_type,
         source_id = excluded.source_id,
         acknowledged_at = excluded.acknowledged_at,
         resolved_at = excluded.resolved_at,
         sync_status = 'SYNCED',
         updated_at = excluded.updated_at`,
      a.id,
      a.patientId,
      a.caregiverId,
      a.category,
      a.typeLabel || 'Alert',
      a.title,
      a.description || '',
      a.badge || 'Alert',
      a.status || 'ACTIVE',
      a.sourceType || 'TASK',
      a.sourceId || null,
      a.acknowledgedAt ? new Date(a.acknowledgedAt).toISOString() : null,
      a.resolvedAt ? new Date(a.resolvedAt).toISOString() : null,
      a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
      a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString()
    );
  }
}

/**
 * Mark a local alert as SYNCED.
 */
export async function markAlertSynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`UPDATE local_alerts SET sync_status = 'SYNCED' WHERE id = ?`, id);
}
