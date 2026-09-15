import { getDatabase } from '../sqlite';
import { generateLocalId } from '../../utils/idGenerator';
import { enqueueSyncItem } from './syncQueueRepository';

export type LocalGameResult = {
  id: string;
  userId: string;
  gameId?: string | null;
  gameName: string;
  score: number;
  duration?: number | null;
  playedAt: string;
  syncStatus: 'PENDING' | 'SYNCED';
  createdAt: string;
};

export type LocalCognitiveScore = {
  id: string;
  userId: string;
  score: number;
  memory?: number | null;
  attention?: number | null;
  reaction?: number | null;
  recordedAt: string;
  syncStatus: 'PENDING' | 'SYNCED';
  createdAt: string;
};

/**
 * Save a game result locally and enqueue for synchronization.
 */
export async function saveGameResultLocally(data: {
  userId: string;
  gameName: string;
  gameId?: string | null;
  score: number;
  duration?: number | null;
  playedAt?: string;
}): Promise<LocalGameResult> {
  const db = await getDatabase();
  const id = generateLocalId('gr');
  const now = new Date().toISOString();
  const playedAt = data.playedAt || now;

  await db.runAsync(
    `INSERT INTO local_game_results (id, user_id, game_id, game_name, score, duration, played_at, sync_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
    id,
    data.userId,
    data.gameId || null,
    data.gameName,
    data.score,
    data.duration ?? null,
    playedAt,
    now
  );

  // Enqueue for synchronization
  await enqueueSyncItem({
    userId: data.userId,
    entityType: 'GAME_RESULT',
    entityId: id,
    operation: 'CREATE',
    payload: {
      id,
      gameId: data.gameId || null,
      gameName: data.gameName,
      score: data.score,
      duration: data.duration ?? null,
      playedAt,
    },
  });

  return {
    id,
    userId: data.userId,
    gameId: data.gameId || null,
    gameName: data.gameName,
    score: data.score,
    duration: data.duration ?? null,
    playedAt,
    syncStatus: 'PENDING',
    createdAt: now,
  };
}

/**
 * Save a cognitive score locally and enqueue for synchronization.
 */
export async function saveCognitiveScoreLocally(data: {
  userId: string;
  score: number;
  memory?: number | null;
  attention?: number | null;
  reaction?: number | null;
  recordedAt?: string;
}): Promise<LocalCognitiveScore> {
  const db = await getDatabase();
  const id = generateLocalId('cs');
  const now = new Date().toISOString();
  const recordedAt = data.recordedAt || now;

  await db.runAsync(
    `INSERT INTO local_cognitive_scores (id, user_id, score, memory, attention, reaction, recorded_at, sync_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
    id,
    data.userId,
    data.score,
    data.memory ?? null,
    data.attention ?? null,
    data.reaction ?? null,
    recordedAt,
    now
  );

  // Enqueue for synchronization
  await enqueueSyncItem({
    userId: data.userId,
    entityType: 'COGNITIVE_SCORE',
    entityId: id,
    operation: 'CREATE',
    payload: {
      id,
      score: data.score,
      memory: data.memory ?? null,
      attention: data.attention ?? null,
      reaction: data.reaction ?? null,
      recordedAt,
    },
  });

  return {
    id,
    userId: data.userId,
    score: data.score,
    memory: data.memory ?? null,
    attention: data.attention ?? null,
    reaction: data.reaction ?? null,
    recordedAt,
    syncStatus: 'PENDING',
    createdAt: now,
  };
}

/**
 * Get all local game results for a user.
 */
export async function getLocalGameResults(userId: string): Promise<LocalGameResult[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT id, user_id as userId, game_id as gameId, game_name as gameName, score, duration, played_at as playedAt, sync_status as syncStatus, created_at as createdAt
     FROM local_game_results
     WHERE user_id = ?
     ORDER BY played_at DESC`,
    userId
  );
  return rows as LocalGameResult[];
}

/**
 * Get all local cognitive scores for a user.
 */
export async function getLocalCognitiveScores(userId: string): Promise<LocalCognitiveScore[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT id, user_id as userId, score, memory, attention, reaction, recorded_at as recordedAt, sync_status as syncStatus, created_at as createdAt
     FROM local_cognitive_scores
     WHERE user_id = ?
     ORDER BY recorded_at DESC`,
    userId
  );
  return rows as LocalCognitiveScore[];
}

/**
 * Mark a local game result as SYNCED.
 */
export async function markGameResultSynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`UPDATE local_game_results SET sync_status = 'SYNCED' WHERE id = ?`, id);
}

/**
 * Mark a local cognitive score as SYNCED.
 */
export async function markCognitiveScoreSynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`UPDATE local_cognitive_scores SET sync_status = 'SYNCED' WHERE id = ?`, id);
}
