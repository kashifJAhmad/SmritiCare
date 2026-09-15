import { API_BASE_URL } from '../constants/api';
import { getToken } from './authStorage';
import { networkMonitor } from './networkMonitor';
import {
  getPendingSyncItems,
  markSyncItemSynced,
  markSyncItemFailed,
  markSyncItemProcessing,
  getPendingCount,
  SyncQueueItem,
} from '../database/repositories/syncQueueRepository';
import { markGameResultSynced, markCognitiveScoreSynced } from '../database/repositories/gameRepository';
import { markMemorySynced, upsertServerMemories } from '../database/repositories/memoryRepository';
import { markTaskSynced, upsertServerTasks } from '../database/repositories/taskRepository';
import { saveLocalProfile } from '../database/repositories/profileRepository';

export type SyncState = 'SYNCED' | 'OFFLINE' | 'SYNCING' | 'PENDING';
type SyncListener = (state: SyncState, pendingCount: number) => void;

class SyncManager {
  private isSyncing: boolean = false;
  private currentUserId: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private lastSyncTimestamp: string | null = null;
  private syncTimeout: any = null;

  constructor() {
    this.init();
  }

  private init() {
    networkMonitor.subscribe((isOnline) => {
      if (isOnline) {
        this.triggerSync();
      } else {
        this.notifyListeners('OFFLINE');
      }
    });
  }

  public setUserId(userId: string | null) {
    this.currentUserId = userId;
    if (userId) {
      this.triggerSync();
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.updateStatus();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async notifyListeners(forcedState?: SyncState) {
    const pending = await getPendingCount(this.currentUserId || undefined);
    let state: SyncState = forcedState || 'SYNCED';

    if (!forcedState) {
      if (!networkMonitor.getIsOnline()) {
        state = 'OFFLINE';
      } else if (this.isSyncing) {
        state = 'SYNCING';
      } else if (pending > 0) {
        state = 'PENDING';
      } else {
        state = 'SYNCED';
      }
    }

    this.listeners.forEach((listener) => {
      try {
        listener(state, pending);
      } catch (e) {
        console.error('Error in sync listener:', e);
      }
    });
  }

  public async updateStatus() {
    await this.notifyListeners();
  }

  /**
   * Triggers background synchronization.
   */
  public async triggerSync(): Promise<void> {
    if (this.isSyncing) return;
    if (!networkMonitor.getIsOnline()) {
      await this.notifyListeners('OFFLINE');
      return;
    }

    const token = await getToken();
    if (!token) {
      // Not logged in yet; cannot sync with server
      await this.notifyListeners();
      return;
    }

    this.isSyncing = true;
    await this.notifyListeners('SYNCING');

    try {
      // 1. Process pending outgoing changes (Push)
      await this.processPushQueue(token);

      // 2. Fetch server changes (Pull)
      await this.processPull(token);

      await this.notifyListeners('SYNCED');
    } catch (error) {
      console.warn('Sync attempt encountered an error:', error);
      await this.notifyListeners();
    } finally {
      this.isSyncing = false;
      await this.notifyListeners();
    }
  }

  /**
   * Push pending items to backend.
   */
  private async processPushQueue(token: string): Promise<void> {
    const pendingItems = await getPendingSyncItems(this.currentUserId || undefined);
    if (pendingItems.length === 0) return;

    for (const item of pendingItems) {
      await markSyncItemProcessing(item.id);
    }

    const payloadItems = pendingItems.map((item) => ({
      id: item.id,
      entityType: item.entityType,
      entityId: item.entityId,
      operation: item.operation,
      payload: item.payload,
      clientTimestamp: item.createdAt,
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: payloadItems }),
      });

      if (!response.ok) {
        const errorText = `Server returned ${response.status}`;
        for (const item of pendingItems) {
          await markSyncItemFailed(item.id, errorText);
        }
        return;
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.results)) {
        for (const item of pendingItems) {
          await markSyncItemFailed(item.id, 'Invalid server response');
        }
        return;
      }

      for (const res of data.results) {
        if (res.status === 'SUCCESS') {
          // Update entity local sync status
          await this.markEntitySynced(res.entityType, res.entityId);
          // Remove from queue
          await markSyncItemSynced(res.id);
        } else {
          await markSyncItemFailed(res.id, res.error || 'Sync error');
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error during push';
      for (const item of pendingItems) {
        await markSyncItemFailed(item.id, errorMsg);
      }
      throw err;
    }
  }

  /**
   * Pull server updates into local database.
   */
  private async processPull(token: string): Promise<void> {
    try {
      let url = `${API_BASE_URL}/api/sync/pull`;
      if (this.lastSyncTimestamp) {
        url += `?since=${encodeURIComponent(this.lastSyncTimestamp)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const result = await response.json();
      if (!result.success || !result.data) return;

      const { data } = result;

      if (this.currentUserId) {
        if (Array.isArray(data.memories) && data.memories.length > 0) {
          await upsertServerMemories(this.currentUserId, data.memories);
        }

        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          await upsertServerTasks(this.currentUserId, data.tasks);
        }

        if (data.profile) {
          await saveLocalProfile({
            userId: data.profile.id,
            fullName: data.profile.fullName,
            email: data.profile.email,
            role: data.profile.role,
            age: data.profile.age,
            phone: data.profile.phone,
            dateOfBirth: data.profile.dateOfBirth,
            gender: data.profile.gender,
            address: data.profile.address,
            city: data.profile.city,
            bloodGroup: data.profile.bloodGroup,
            medicalNotes: data.profile.medicalNotes,
            profileImageUrl: data.profile.profileImageUrl,
            language: data.profile.language,
            caregiverName: data.profile.caregiverName,
            caregiverAccess: data.profile.caregiverAccess,
            gpsSharing: data.profile.gpsSharing,
            textSize: data.profile.textSize,
            syncStatus: 'SYNCED',
          });
        }
      }

      this.lastSyncTimestamp = data.timestamp || new Date().toISOString();
    } catch (error) {
      console.warn('Pull sync error:', error);
    }
  }

  private async markEntitySynced(entityType: string, entityId: string): Promise<void> {
    switch (entityType) {
      case 'GAME_RESULT':
        await markGameResultSynced(entityId);
        break;
      case 'COGNITIVE_SCORE':
        await markCognitiveScoreSynced(entityId);
        break;
      case 'MEMORY':
        await markMemorySynced(entityId);
        break;
      case 'TASK':
        await markTaskSynced(entityId);
        break;
    }
  }
}

export const syncManager = new SyncManager();
