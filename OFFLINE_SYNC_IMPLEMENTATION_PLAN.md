# OFFLINE-FIRST SYNCHRONIZATION SYSTEM IMPLEMENTATION PLAN

## 1. Current Architecture Assessment
- **Mobile Frontend**: Expo SDK 57, React Native 0.86, TypeScript.
  - Features: Auth, Games (GuessFood, OddOneOut), Memories, Tasks/Schedule, Cognitive Score, Profile, Caregiver tools.
  - Current Offline State: `App.tsx` conditionally presents `OfflineScreen` blocking the app when internet is lost. No local SQLite database or sync queue exists yet. Game results and cognitive scores are kept in component `useState` without persistence.
  - Storage: `expo-secure-store` used for native auth tokens, `@react-native-async-storage/async-storage` for fallback/preferences.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM with MariaDB/MySQL adapter, JWT authentication.
  - Existing controllers/services: Auth, Task, Memory, EmergencyContact, Location, User.
  - Stubs: `game.controller.ts` and `game.routes.ts` are 0-byte placeholders. No batch sync endpoints exist yet.

---

## 2. Existing Files That Will Be Modified
### Frontend
1. [`package.json`](file:///c:/Programs/Project/Smiriticare/SmritiCare/package.json): Add `expo-sqlite@~57.0.3` compatible with Expo SDK ~57.0.20.
2. [`App.tsx`](file:///c:/Programs/Project/Smiriticare/SmritiCare/App.tsx): Initialize local SQLite database and sync manager on launch; allow full navigation and usage during offline mode (replacing hard screen lock with non-intrusive sync status badge); trigger auto-sync on reconnect.
3. [`src/screens/games/GuessFoodScreen.tsx`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/screens/games/GuessFoodScreen.tsx): Persist game completion results and cognitive score to local SQLite; enqueue for background sync.
4. [`src/screens/games/OddOneOutScreen.tsx`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/screens/games/OddOneOutScreen.tsx): Persist game completion results and cognitive score to local SQLite; enqueue for background sync.
5. [`src/screens/memories/MemoryScreen.tsx`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/screens/memories/MemoryScreen.tsx): Load memories from local SQLite first; persist created/updated/deleted memories locally and enqueue for sync.
6. [`src/screens/reminders/ScheduleScreen.tsx`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/screens/reminders/ScheduleScreen.tsx): Load tasks from local SQLite first; persist created/completed/updated/deleted tasks locally and enqueue for sync.
7. [`src/screens/home/CognitiveScoreScreen.tsx`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/screens/home/CognitiveScoreScreen.tsx): Load cognitive score history from local SQLite.
8. [`src/screens/profile/ProfileScreen.tsx`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/screens/profile/ProfileScreen.tsx): Cache profile locally and persist edits offline into sync queue.

### Backend
9. [`backend/src/app.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/app.ts): Mount `/api/games` routes and `/api/sync` routes.
10. [`backend/src/routes/game.routes.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/routes/game.routes.ts): Define endpoints for game results and cognitive score recording/retrieval.
11. [`backend/src/controllers/game.controller.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/controllers/game.controller.ts): Implement controller methods with JWT validation and error handling.

---

## 3. New Files That Will Be Created
### Frontend
1. [`src/database/sqlite.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/sqlite.ts): Database initialization using `expo-sqlite` with Web AsyncStorage/in-memory adapter fallback.
2. [`src/database/schema.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/schema.ts): DDL statements for `game_results`, `cognitive_scores`, `memories`, `tasks`, `user_profile`, and `sync_queue`.
3. [`src/database/repositories/gameRepository.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/repositories/gameRepository.ts): Local CRUD for game results and cognitive scores.
4. [`src/database/repositories/memoryRepository.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/repositories/memoryRepository.ts): Local CRUD for memories.
5. [`src/database/repositories/taskRepository.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/repositories/taskRepository.ts): Local CRUD for tasks.
6. [`src/database/repositories/profileRepository.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/repositories/profileRepository.ts): Local caching for profile data.
7. [`src/database/repositories/syncQueueRepository.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/repositories/syncQueueRepository.ts): Enqueue, dequeue, update status, increment retries for sync items.
8. [`src/services/syncManager.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/services/syncManager.ts): Sync coordinator (processes queue, triggers on online events, exponential backoff, status publisher).
9. [`src/services/networkMonitor.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/services/networkMonitor.ts): Network state listener using `@react-native-community/netinfo` and web event listeners.
10. [`src/components/SyncStatusBadge.tsx`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/components/SyncStatusBadge.tsx): Simple, accessible UI badge (🟢 Synced / 🟠 Offline — will sync / 🔄 Syncing).
11. [`src/utils/idGenerator.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/utils/idGenerator.ts): Collision-resistant ID generator for offline entities.

### Backend
12. [`backend/src/routes/sync.routes.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/routes/sync.routes.ts): Route definitions for `/api/sync/push` and `/api/sync/pull`.
13. [`backend/src/controllers/sync.controller.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/controllers/sync.controller.ts): Controller for batch sync push and pull.
14. [`backend/src/services/sync.service.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/services/sync.service.ts): Transactional batch sync service with upsert idempotency.
15. [`backend/src/services/game.service.ts`](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/services/game.service.ts): Service handling game lookup/seed, game results recording, and cognitive score calculations.

---

## 4. Dependencies Required
- **Frontend**: `expo-sqlite@~57.0.3` (Expo 57 compatible).
  - Existing `@react-native-community/netinfo` (12.0.1) and `expo-secure-store` (~57.0.3) are reused.
- **Backend**: No new dependencies needed (reuses `express`, `jsonwebtoken`, `@prisma/client`, `bcrypt`).

---

## 5. Local SQLite Architecture
- Uses `expo-sqlite` (or platform-specific database adapter for Web) to open `smriticare.db`.
- Automatic table creation (`CREATE TABLE IF NOT EXISTS ...`) on initial load.
- Repositories encapsulate all SQL queries with parameterized statements preventing SQL injection.
- Asynchronous database operations using Promise wrappers.

---

## 6. Local Database Schema
Tables:
1. `local_game_results` (`id`, `user_id`, `game_id`, `game_name`, `score`, `duration`, `played_at`, `sync_status`, `created_at`)
2. `local_cognitive_scores` (`id`, `user_id`, `score`, `memory`, `attention`, `reaction`, `recorded_at`, `sync_status`, `created_at`)
3. `local_memories` (`id`, `user_id`, `title`, `description`, `image_url`, `audio_url`, `category`, `type`, `sync_status`, `is_deleted`, `created_at`, `updated_at`)
4. `local_tasks` (`id`, `user_id`, `title`, `description`, `category`, `scheduled_at`, `completed`, `reminder_enabled`, `repeat_type`, `sync_status`, `is_deleted`, `created_at`, `updated_at`)
5. `local_user_profile` (`user_id`, `full_name`, `email`, `role`, `age`, `phone`, `date_of_birth`, `gender`, `address`, `city`, `blood_group`, `medical_notes`, `profile_image_url`, `language`, `caregiver_name`, `caregiver_access`, `gps_sharing`, `text_size`, `sync_status`, `updated_at`)
6. `sync_queue` (`id`, `user_id`, `entity_type`, `entity_id`, `operation`, `payload`, `retry_count`, `last_error`, `status`, `created_at`, `updated_at`)

---

## 7. Sync Queue Architecture
- Operations: `CREATE`, `UPDATE`, `DELETE`.
- Entity Types: `GAME_RESULT`, `COGNITIVE_SCORE`, `MEMORY`, `TASK`, `PROFILE`.
- Flow:
  1. Local mutation writes to local entity table with `sync_status = 'PENDING'`.
  2. Creates entry in `sync_queue` with status `'PENDING'`.
  3. `SyncManager` is notified. If online, sync starts. If offline, remains queued.
  4. On sync success, `sync_status` on local entity is set to `'SYNCED'` and queue record is deleted/marked `'SYNCED'`.
  5. On failure, queue item remains `'PENDING'` with incremented `retry_count` and exponential backoff.

---

## 8. Network Detection Strategy
- `NetworkMonitor` subscribes to `@react-native-community/netinfo` on native and `online`/`offline` window events on web.
- Emits connectivity state transitions (`isOnline: boolean`).
- Reconnection automatically triggers `SyncManager.triggerSync()`.

---

## 9. Backend Synchronization APIs
- `POST /api/games/result`: Record game result.
- `GET /api/games/results`: Fetch user's game results.
- `POST /api/games/cognitive-score`: Record cognitive score.
- `GET /api/games/cognitive-scores`: Fetch user's cognitive scores.
- `POST /api/sync/push`: Batch push pending sync items in a single atomic transaction.
- `GET /api/sync/pull?since=ISOString`: Fetch changes modified on server since timestamp.

---

## 10. Prisma / Database Changes
- Keep existing MySQL schema intact without breaking modifications.
- Automatic seeding / lookup of `Game` records (`guess-food`, `odd-one-out`) in backend so foreign key constraints are always satisfied.
- Primary key `id` supplied by client (CUID/UUID) to support idempotent upserts.

---

## 11. Idempotency Strategy
- Client generates unique `id` for every record created offline.
- Server uses `prisma[entity].upsert` or checks existing `id` before inserting.
- Retrying an identical request never creates duplicate database records.

---

## 12. Conflict Resolution Strategy
- **Append-only** (`GameResult`, `CognitiveScore`): No conflicts; duplicate IDs acknowledged safely.
- **Mutable** (`Task`, `Memory`, `Profile`): Last-Write-Wins (LWW) based on `updatedAt` timestamps.
- **Deletions**: Soft delete flag (`is_deleted = 1`) ensures local deletions sync properly to the backend.

---

## 13. Authentication & Security Approach
- Sync requests require valid Bearer JWT.
- Backend middleware verifies JWT and sets `req.userId`.
- Strict ownership verification: `record.userId` MUST match `req.userId`.
- No sensitive credentials or tokens stored in sync queue payload.

---

## 14. Error & Retry Strategy
- Network timeouts/unreachable: Keep pending, retry with backoff (5s, 15s, 30s, 60s, max 5m).
- 401 Unauthorized: Pause sync until user re-logs in; retain queue safely.
- 400 Bad Request / Validation: Mark item failed, log diagnostic, continue processing other items.

---

## 15. Game Integration
- `GuessFoodScreen`: On game finish, store `local_game_results` and `local_cognitive_scores`, queue sync, attempt immediate sync if online.
- `OddOneOutScreen`: On game finish, store `local_game_results` and `local_cognitive_scores`, queue sync, attempt immediate sync if online.

---

## 16. Memory Integration
- `MemoryScreen`: Read memories from local SQLite repository first; write new/edited/deleted memories to local SQLite and sync queue.

---

## 17. Task Integration
- `ScheduleScreen`: Read tasks from local SQLite repository first; write new/completed/updated/deleted tasks to local SQLite and sync queue.

---

## 18. Cognitive Score Integration
- `CognitiveScoreScreen`: Read cognitive scores from local SQLite; display historical trends offline.

---

## 19. Profile / Preferences Integration
- `ProfileScreen`: Store profile updates in local SQLite table, enqueue for sync, and push when online.

---

## 20. Testing Strategy
- Static code inspection and unit test / typecheck verification.
- Verify TypeScript builds cleanly for frontend (`npx tsc --noEmit`) and backend (`npm run build`).

---

## 21. TypeScript Validation
- Full type safety for all database models, repository methods, sync payloads, API responses, and screen props.

---

## 22. Rollback / Safety Considerations
- SQLite failures fall back gracefully to in-memory/AsyncStorage on web.
- Core UI continues rendering even if SQLite or backend is unreachable.

---

## 23. Known Limitations
- Heavy media files (recorded audio / high-res photos) upload requires network connectivity; metadata is queued locally.

---

## 24. Future Improvements
- Chunked background media upload, peer-to-peer caregiver sync.

---

## 25. Implementation Execution Report & Final Summary

### Completed Phases
1. **Phase 1: Research & Local Architecture Planning**
   - Researched Expo 57 setup, React Native 0.86, Prisma/MySQL schema.
   - Designed SQLite database schema, sync queue lifecycle, and idempotency strategy.
2. **Phase 2: Frontend SQLite & Repositories**
   - Installed `expo-sqlite@~57.0.3`.
   - Created [idGenerator.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/utils/idGenerator.ts) for unique CUID generation.
   - Created [schema.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/schema.ts) and [sqlite.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/sqlite.ts) with multi-table DDL and fallback.
   - Built repositories: [syncQueueRepository.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/repositories/syncQueueRepository.ts), [gameRepository.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/repositories/gameRepository.ts), [memoryRepository.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/repositories/memoryRepository.ts), [taskRepository.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/repositories/taskRepository.ts), [profileRepository.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/database/repositories/profileRepository.ts).
3. **Phase 3: Network Monitor & Sync Manager**
   - Created [networkMonitor.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/services/networkMonitor.ts) (NetInfo + Web listeners).
   - Created [syncManager.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/services/syncManager.ts) (Queue processing, push/pull, retry backoff, sync listener callbacks).
   - Created [SyncStatusBadge.tsx](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/components/SyncStatusBadge.tsx) for discreet status display.
4. **Phase 4: Backend API & Synchronization Engine**
   - Created [game.service.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/services/game.service.ts), [game.controller.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/controllers/game.controller.ts), [game.routes.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/routes/game.routes.ts).
   - Created [sync.service.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/services/sync.service.ts), [sync.controller.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/controllers/sync.controller.ts), [sync.routes.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/routes/sync.routes.ts).
   - Mounted `/api/games` and `/api/sync` in [app.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/backend/src/app.ts).
   - Validated Prisma generation and backend build.
5. **Phase 5: Screen Integrations**
   - [GuessFoodScreen.tsx](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/screens/games/GuessFoodScreen.tsx): Persists games & cognitive scores locally, triggers sync.
   - [OddOneOutScreen.tsx](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/screens/games/OddOneOutScreen.tsx): Persists games & cognitive scores locally, triggers sync.
   - [MemoryScreen.tsx](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/screens/memories/MemoryScreen.tsx): Reads/writes local SQLite memories, enqueues sync.
   - [ScheduleScreen.tsx](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/screens/reminders/ScheduleScreen.tsx): Reads/writes local SQLite tasks, enqueues sync.
   - [CognitiveScoreScreen.tsx](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/screens/home/CognitiveScoreScreen.tsx): Loads local cognitive scores with dynamic calculations.
   - [profile.service.ts](file:///c:/Programs/Project/Smiriticare/SmritiCare/src/services/profile.service.ts): Local profile cache and offline updates.
   - [App.tsx](file:///c:/Programs/Project/Smiriticare/SmritiCare/App.tsx): SQLite and sync initialization, offline session restoration, sync status badge header.

### Summary of Files Created & Modified
- **New Files (16)**:
  - `src/database/schema.ts`
  - `src/database/sqlite.ts`
  - `src/database/repositories/syncQueueRepository.ts`
  - `src/database/repositories/gameRepository.ts`
  - `src/database/repositories/memoryRepository.ts`
  - `src/database/repositories/taskRepository.ts`
  - `src/database/repositories/profileRepository.ts`
  - `src/services/networkMonitor.ts`
  - `src/services/syncManager.ts`
  - `src/components/SyncStatusBadge.tsx`
  - `src/utils/idGenerator.ts`
  - `backend/src/services/game.service.ts`
  - `backend/src/controllers/game.controller.ts`
  - `backend/src/routes/game.routes.ts`
  - `backend/src/services/sync.service.ts`
  - `backend/src/controllers/sync.controller.ts`
  - `backend/src/routes/sync.routes.ts`
- **Modified Files (9)**:
  - `package.json`
  - `App.tsx`
  - `src/screens/games/GuessFoodScreen.tsx`
  - `src/screens/games/OddOneOutScreen.tsx`
  - `src/screens/memories/MemoryScreen.tsx`
  - `src/screens/reminders/ScheduleScreen.tsx`
  - `src/screens/home/CognitiveScoreScreen.tsx`
  - `src/services/profile.service.ts`
  - `backend/src/app.ts`

### Database Changes
- **Local SQLite (`smriticare.db`)**: Added tables `local_game_results`, `local_cognitive_scores`, `local_memories`, `local_tasks`, `local_user_profile`, `sync_queue`.
- **Backend MySQL**: Preserved existing Prisma schema; added automatic backend seeding for default games (`guess-food`, `odd-one-out`) to fulfill foreign key constraints without schema breakage.

### APIs Added
- `POST /api/games/result` (Record individual game result)
- `GET /api/games/results` (Fetch user game results history)
- `POST /api/games/cognitive-score` (Record cognitive score)
- `GET /api/games/cognitive-scores` (Fetch user cognitive scores)
- `POST /api/sync/push` (Batch push sync queue items in atomic transaction)
- `GET /api/sync/pull` (Fetch deltas since timestamp)

### Static Validation Performed
- **Frontend Type Check**: `npx tsc --noEmit` passed with **0 errors**.
- **Backend TypeScript Build**: `npm run build` (`tsc`) in `backend/` passed with **0 errors**.
- **Prisma Client Generation**: `npx prisma generate` in `backend/` completed successfully.

### Real-Device Testing Guidelines (For User)
1. Launch backend server (`npm run dev` in `backend/`).
2. Run Expo application on physical device/emulator.
3. Test playing Guess Food / Odd One Out with airplane mode enabled:
   - Verify result is saved and badge shows `🟠 Offline — will sync`.
4. Turn off airplane mode / reconnect WiFi:
   - Observe badge transition `🔄 Syncing` -> `🟢 Synced`.
   - Inspect MySQL database to confirm records match client IDs without duplication.
