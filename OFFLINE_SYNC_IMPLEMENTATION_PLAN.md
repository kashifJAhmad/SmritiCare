# SmritiCare Offline-First Synchronization System Implementation Plan

## 1. Executive Summary & Existing Codebase Analysis

SmritiCare is a dementia care assistance platform built on **Expo SDK 57** (React Native 0.86, React 19) with a **Node.js/Express + Prisma (MySQL/MariaDB)** backend.
This plan is derived directly from inspecting existing code in both `src/` and `backend/`.

### 1.1 Existing Local Persistence & Storage
- **`src/database/sqlite.ts`**: Defines an asynchronous `IDatabase` interface (`execAsync`, `runAsync`, `getAllAsync`, `getFirstAsync`).
  - Native `expo-sqlite` (~57.0.3) is installed in `package.json`, but currently `sqlite.ts` defaults to an in-house SQL emulator (`PersistentDatabaseFallback`) backed by `@react-native-async-storage/async-storage`.
  - The fallback parses common SQL operations and persists table arrays into AsyncStorage keys prefixed with `@smriticare_db_<tableName>`.
  - Tables currently registered: `local_game_results`, `local_cognitive_scores`, `local_memories`, `local_tasks`, `local_user_profile`, `sync_queue`.
  - **Identified Gap**: `local_alerts` table is missing. `expo-sqlite` native database loading is not wired up to attempt `SQLite.openDatabaseAsync` on native platforms before falling back.

### 1.2 Existing AsyncStorage Usage
- Used in `src/services/authStorage.ts` for `@smriticCare_auth_token` and `@smriticCare_auth_role`.
- Used in `src/services/auth.ts` for auth token management.
- Used in `src/database/sqlite.ts` for persisting tables in `PersistentDatabaseFallback`.
- **Identified Gap**: `authStorage.ts` does not store the authenticated user ID or cached profile summary. When offline, `App.tsx` attempted to query `getLocalProfile("patient_local")` which returned null (because profiles were saved under real CUIDs), leading to spurious logouts upon network failure.

### 1.3 Existing API Services
- **`src/constants/api.ts`**: Defines `API_BASE_URL = "https://smriticare-3q3c.onrender.com"`.
- **`src/services/api.ts`**: Exports `patientSignup`, `patientLogin`, `getCurrentPatient`.
- **`src/services/auth.ts`**: Generic REST fetch wrapper `request(endpoint, options)`. Handles token injection and throwing error messages.
- **`src/services/profile.service.ts`**: Patient profile fetch, update, image upload.
- **`backend/src/routes/`**:
  - `auth.routes.ts`: `/api/auth` (signup, login, me, reset-password)
  - `task.routes.ts`: `/api/tasks` (CRUD for own tasks + caregiver patient tasks)
  - `caregiverConnection.routes.ts`: `/api/caregiver-connections` (invites, patient codes, linking)
  - `emergencyContact.routes.ts`: `/api/emergency-contacts`
  - `memory.routes.ts` & `memoryUpload.routes.ts`: `/api/memories` and media uploads
  - `game.routes.ts`: `/api/games` (results and cognitive score recording)
  - `sync.routes.ts`: `/api/sync/push` and `/api/sync/pull`
  - `location.routes.ts`: `/api/location`

### 1.4 Existing Authentication & Session Storage
- JWT stored in AsyncStorage.
- Server validates JWT via `authenticate` middleware (`req.userId`, `req.userRole`).
- **Data Loss / Bug Identified**: In `App.tsx`, network failures during `getCurrentPatient(token)` fell into a catch block that cleared the session (`clearAuthSession()`) if `getLocalProfile("patient_local")` failed. A network disconnect was therefore treated as invalid credentials, violating Requirement 6.

### 1.5 Existing Task & Reminder Implementation
- **Frontend**:
  - `ScheduleScreen.tsx`: Renders scheduled tasks. Calls `getLocalTasks(userId)` for initial offline load, then pulls `/api/tasks` if online. Creates tasks via `createTaskLocally`, deletes via `deleteTaskLocally`.
  - `src/services/notifications.ts`: Uses `expo-notifications` (`scheduleNotificationAsync`, `cancelScheduledNotificationAsync`, `cancelTaskRemindersByTaskId`) with Android notification channel `task-reminders`.
- **Backend**:
  - `task.service.ts` & `task.controller.ts`: Full task lifecycle (`createTask`, `getTasks`, `getTaskById`, `updateTask`, `completeTask`, `deleteTask`, and caregiver variants `getPatientTasksForCaregiver`, `createTaskForPatient`, etc.).
- **Identified Gaps**:
  - Scheduled notifications were never re-synced on app startup from local SQLite tasks.
  - Repeating tasks did not generate deterministic dates.
  - `upsertServerTasks` blindly overwrote local tasks with server data without checking whether the local task had `sync_status = 'PENDING'`.

### 1.6 Existing Alert Implementation
- **Prisma**: `model Alert` is fully declared with `id`, `patientId`, `caregiverId`, `category`, `typeLabel`, `title`, `description`, `badge`, `status` (`AlertStatus`: ACTIVE, ACKNOWLEDGED, RESOLVED), `sourceType` (`AlertSourceType`: TASK, HYDRATION, GAME, MANUAL), `sourceId`, timestamps.
- **Frontend**: `CaregiverAlertsScreen.tsx` existed with static placeholder alerts and in-memory state. No persistence or synchronization existed.
- **Backend**: No alert routes, controller, or sync handlers existed.
- **Requirement 5 Plan**:
  - Build backend alert service, controller, and routes (`GET /api/alerts`, `POST /api/alerts`, `POST /api/alerts/:id/acknowledge`, `POST /api/alerts/:id/resolve`).
  - Integrate `ALERT` entity type into `sync.service.ts` push/pull.
  - Build `local_alerts` table in SQLite schema and `alertRepository.ts` for offline-first creation, local acknowledgement, local resolution, and sync queuing.
  - Connect `CaregiverAlertsScreen.tsx` to local SQLite repository and sync manager.

### 1.7 Existing Caregiver / Patient Synchronization
- Caregiver views patient tasks in `CaregiverPatientTasks.tsx`.
- Currently, `CaregiverPatientTasks.tsx` only called network `fetch(`${API_BASE_URL}/api/tasks/patient/${patientId}`)` without offline SQLite caching or local task creation fallback.
- **Plan**: Update `CaregiverPatientTasks.tsx` to read from and write to local SQLite `local_tasks` with `userId = patientId` and enqueue the corresponding sync item when offline.

### 1.8 Existing Memory Synchronization
- `MemoryScreen.tsx` uses `getLocalMemories` and `createMemoryLocally` for text memories.
- Media upload routes (`/api/memories/upload`) handle photos and audio.
- When offline, text memories queue cleanly. Photo and audio files can be persisted locally in `local_memories` with local URI and queued for background synchronization.

### 1.9 Existing Network / Connectivity Detection
- `src/services/networkMonitor.ts`: Uses `@react-native-community/netinfo` and web event listeners (`online`/`offline`). Provides `subscribe` and `getIsOnline()`.
- **Requirement 7 Enhancement**: Expose unified state: `offline`, `online`, `syncing`, `synced`, `sync_error`.

### 1.10 Existing Retry & Queue Logic
- `src/database/repositories/syncQueueRepository.ts`: Enqueues operations (`CREATE`, `UPDATE`, `DELETE`) for entity types.
- `src/services/syncManager.ts`: Processes push queue (`/api/sync/push`) and pull updates (`/api/sync/pull`).
- **Identified Gaps**:
  - If the app is killed while items are marked `'PROCESSING'`, they become orphaned and never retry. Must reset stale `'PROCESSING'` items back to `'PENDING'` on startup.
  - Sync queue lacks `ALERT` entity type.
  - Push sync does not prevent concurrent sync workers.
  - Exponential backoff retry logic needs formal retry delay tracking.

### 1.11 Identified Places Where Offline Behavior Can Lose Data or Become Inconsistent
1. **App.tsx Auth Restore**: Network error during `getCurrentPatient` clears token and redirects to welcome screen instead of restoring local cached session.
2. **Unconditional Server Upsert**: `upsertServerTasks` and `upsertServerMemories` overwrite local items even if `local.sync_status === 'PENDING'` and local `updated_at > server.updated_at`.
3. **Queue Items Stuck in PROCESSING**: Crashing or closing the app mid-sync leaves items in `'PROCESSING'` which are ignored by `getPendingSyncItems`.
4. **Caregiver Screen Bypassing Local Storage**: `CaregiverPatientTasks` and `CaregiverAlertsScreen` directly fetch from network with no offline queueing.
5. **No Local Alerts Table**: Alert acknowledgements/resolutions made offline were lost entirely.
6. **Notification Rescheduling**: Offline created/synced tasks were never rescheduled on app reboot.

---

## 2. Target Architecture & Detailed Specifications

### 2.1 Storage Layer (Unified SQLite + Transparent Persistent Fallback)
1. **Interface**: Retain `IDatabase` (`execAsync`, `runAsync`, `getAllAsync`, `getFirstAsync`).
2. **Native SQLite**: Attempt `SQLite.openDatabaseAsync('smriticare.db')` on iOS/Android.
3. **Fallback**: On web, Expo Go, or if native bindings fail, use `PersistentDatabaseFallback` backed by `@react-native-async-storage/async-storage`.
4. **Schema (`src/database/schema.ts`)**:
   - Add `local_alerts`:
     ```sql
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
     ```
   - Register `'local_alerts'` in `PersistentDatabaseFallback.tableNames`.

### 2.2 Conflict Strategy & Documented Schema Metadata
For every synchronized entity (`TASK`, `ALERT`, `MEMORY`, `GAME_RESULT`, `COGNITIVE_SCORE`, `PROFILE`):
| Field | Type | Description |
|---|---|---|
| `local_identifier` | `TEXT` (`id`) | Unique client-generated CUID/UUID (e.g. `tsk_...`, `alt_...`, `mem_...`) |
| `server_identifier` | `TEXT` (`id`) | Matches `local_identifier` directly; server performs idempotent upsert by primary key `id` |
| `createdAt` | `TEXT` (ISO8601) | Client creation timestamp |
| `updatedAt` | `TEXT` (ISO8601) | Timestamp of last modification |
| `operation_type` | `TEXT` | `CREATE`, `UPDATE`, `DELETE` in `sync_queue` |
| `sync_status` | `TEXT` | `PENDING`, `SYNCED` |
| `retry_count` | `INTEGER` | Number of failed push attempts |
| `last_error` | `TEXT` | Last failure message |
| `timestamps_for_conflict` | `TEXT` (`updatedAt`) | Last-Write-Wins (LWW) resolution: server update only applies if server `updatedAt >= local.updatedAt` OR `local.sync_status == 'SYNCED'` |

### 2.3 Reminder / Task Offline Behavior
- Local task creation generates a deterministic ID (`tsk_<nanoid/timestamp>`).
- Enqueues `CREATE` operation into `sync_queue`.
- Schedules notification locally via `scheduleTaskReminder` without network requirement.
- On startup / database init, runs `rescheduleActiveTaskReminders(userId)` to ensure local reminders match database tasks.
- Task completion / toggle offline enqueues `UPDATE` and cancels notification if completed.
- Repeating tasks calculate scheduled instances deterministically to prevent duplicates.

### 2.4 Alert Offline Behavior
- Patient and Caregiver alerts cached in `local_alerts`.
- Offline acknowledge:
  - Sets `status = 'ACKNOWLEDGED'`, `acknowledged_at = now()`, `sync_status = 'PENDING'`.
  - Enqueues `UPDATE` into `sync_queue`.
- Offline resolve:
  - Sets `status = 'RESOLVED'`, `resolved_at = now()`, `sync_status = 'PENDING'`.
  - Enqueues `UPDATE` into `sync_queue`.
- On reconnect:
  - Push queue sends status changes to `/api/sync/push`.
  - Pull sync downloads latest active/acknowledged alerts for connected patients and caregivers.
  - Existing `AlertSourceType` values supported: `TASK`, `HYDRATION`, `GAME`, `MANUAL`.

### 2.5 Authentication & Offline Resilience
- In `src/services/authStorage.ts`:
  - Store `@smriticCare_active_user` with `{ id, role, email, fullName, ... }`.
- In `App.tsx`:
  - If `getCurrentPatient` throws a network error:
    - Inspect error or network state. If it is a network error (not 401/403), DO NOT clear session.
    - Load user from `authStorage` and `getLocalProfile(userId)`.
    - Seamlessly enter app in offline mode.
  - If backend returns explicit 401/403 (invalid JWT), only then call `clearAuthSession()` and route to `welcome`.

### 2.6 Sync Queue & Automatic Sync Architecture
- **Single Worker Lock**: `isSyncing` guard prevents parallel executions.
- **Recovery on App Startup**:
  - `resetStaleProcessingItems()`: resets any items in `'PROCESSING'` back to `'PENDING'`.
- **Automatic Triggering**:
  - Connectivity change to online -> `syncManager.triggerSync()`.
  - User login / restore session -> `syncManager.triggerSync()`.
  - Any local mutation -> triggers `syncManager.triggerSync()` in background.
- **Idempotency**:
  - All database upserts in `backend/src/services/sync.service.ts` use `prisma[entity].upsert` with client ID as primary key. Repeated pushes produce the exact same database state.
- **Status State Machine**:
  - States: `offline`, `online`, `syncing`, `synced`, `sync_error`.
  - Exposed via `syncManager.subscribe((state, pendingCount) => ...)`.

### 2.7 Backend Endpoints & Architecture
1. **`backend/src/services/alert.service.ts`**:
   - `getAlertsForUser(userId: string, role: string)`
   - `createAlert(data: { patientId, caregiverId, category, typeLabel, title, description, badge, sourceType, sourceId })`
   - `acknowledgeAlert(userId: string, alertId: string)`
   - `resolveAlert(userId: string, alertId: string)`
2. **`backend/src/controllers/alert.controller.ts`** & **`backend/src/routes/alert.routes.ts`**:
   - Mounted at `/api/alerts` in `backend/src/app.ts`.
3. **`backend/src/services/sync.service.ts`**:
   - Add `"ALERT"` to `SyncEntityType`.
   - In `processSyncPush`: handle `ALERT` create/update (acknowledgement/resolution).
   - In `processSyncPull`: include `alerts` for patient or caregiver.

---

## 3. Implementation Steps

1. **Backend Alert Support & Sync Extension**:
   - Create `backend/src/services/alert.service.ts`
   - Create `backend/src/controllers/alert.controller.ts`
   - Create `backend/src/routes/alert.routes.ts`
   - Mount `/api/alerts` in `backend/src/app.ts`
   - Update `backend/src/services/sync.service.ts` to support `ALERT` in push and pull

2. **Database & Repository Enhancements (Frontend)**:
   - Update `src/database/schema.ts` to add `local_alerts`
   - Update `src/database/sqlite.ts` to include `local_alerts` in fallback, try native `expo-sqlite`, and provide safe table initialization
   - Create `src/database/repositories/alertRepository.ts`
   - Update `src/database/repositories/syncQueueRepository.ts` to add `ALERT` type and `resetStaleProcessingItems`
   - Update `src/database/repositories/taskRepository.ts` and `memoryRepository.ts` to protect pending local changes from being overwritten during server pulls (LWW conflict resolution)

3. **Sync Manager & Network State**:
   - Update `src/services/syncManager.ts` to support states (`offline`, `online`, `syncing`, `synced`, `sync_error`), process alert syncs, recover from interrupted syncs, and prevent duplicate sync runs
   - Enhance `src/services/networkMonitor.ts` if needed

4. **Authentication & Session Resilience**:
   - Update `src/services/authStorage.ts` to save and restore full active session metadata
   - Update `App.tsx` to distinguish network errors from 401 token expiry and preserve local sessions

5. **Screen Integrations**:
   - Update `src/screens/caregiver/CaregiverAlertsScreen.tsx` to use `alertRepository` with offline queuing and live sync
   - Update `src/screens/caregiver/CaregiverPatientTasks.tsx` to support offline task management via local storage and sync queue
   - Add notification rescheduling on app launch in `App.tsx`
   - Add non-intrusive `SyncStatusBadge` or sync indicator to communicate offline/syncing/error states

6. **Verification & Testing**:
   - Run backend TypeScript build (`npm run build`, `npx tsc --noEmit`)
   - Run frontend TypeScript check (`npx tsc --noEmit`)
   - Verify scenarios A through L
