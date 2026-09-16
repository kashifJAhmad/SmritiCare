/**
 * SQLite Database Schema and Table Creation DDL for SmritiCare.
 */

export const CREATE_TABLES_SQL = `
-- ============================================================
-- GAME RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS local_game_results (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  game_id TEXT,
  game_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  duration INTEGER,
  played_at TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_game_results_user ON local_game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_sync ON local_game_results(sync_status);

-- ============================================================
-- COGNITIVE SCORES
-- ============================================================
CREATE TABLE IF NOT EXISTS local_cognitive_scores (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  memory INTEGER,
  attention INTEGER,
  reaction INTEGER,
  recorded_at TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cognitive_scores_user ON local_cognitive_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_scores_sync ON local_cognitive_scores(sync_status);

-- ============================================================
-- MEMORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS local_memories (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  audio_url TEXT,
  type TEXT NOT NULL DEFAULT 'text',
  sync_status TEXT NOT NULL DEFAULT 'PENDING',
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memories_user ON local_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_sync ON local_memories(sync_status);

-- ============================================================
-- TASKS / SCHEDULE
-- ============================================================
CREATE TABLE IF NOT EXISTS local_tasks (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  scheduled_at TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  reminder_enabled INTEGER NOT NULL DEFAULT 1,
  repeat_type TEXT NOT NULL DEFAULT 'NONE',
  sync_status TEXT NOT NULL DEFAULT 'PENDING',
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_user ON local_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sync ON local_tasks(sync_status);

-- ============================================================
-- USER PROFILE CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS local_user_profile (
  user_id TEXT PRIMARY KEY NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'PATIENT',
  age INTEGER,
  phone TEXT,
  date_of_birth TEXT,
  gender TEXT,
  address TEXT,
  city TEXT,
  blood_group TEXT,
  medical_notes TEXT,
  profile_image_url TEXT,
  language TEXT NOT NULL DEFAULT 'English',
  caregiver_name TEXT,
  caregiver_access INTEGER NOT NULL DEFAULT 0,
  gps_sharing INTEGER NOT NULL DEFAULT 0,
  text_size TEXT NOT NULL DEFAULT 'Normal',
  sync_status TEXT NOT NULL DEFAULT 'SYNCED',
  updated_at TEXT NOT NULL
);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS local_alerts (
  id TEXT PRIMARY KEY NOT NULL,
  patient_id TEXT NOT NULL,
  caregiver_id TEXT NOT NULL,
  category TEXT NOT NULL,
  type_label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  badge TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  source_type TEXT NOT NULL DEFAULT 'TASK',
  source_id TEXT,
  acknowledged_at TEXT,
  resolved_at TEXT,
  sync_status TEXT NOT NULL DEFAULT 'PENDING',
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_patient ON local_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_alerts_caregiver ON local_alerts(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON local_alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_sync ON local_alerts(sync_status);

-- ============================================================
-- SYNCHRONIZATION QUEUE
-- ============================================================
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user ON sync_queue(user_id);
`;
