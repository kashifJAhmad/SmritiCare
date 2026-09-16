# Caregiver–Patient Implementation Plan

## Evidence-based current state

This plan was written after inspecting the Expo frontend (`App.tsx`, `src/`) and Express/Prisma backend (`backend/src`, `backend/prisma/schema.prisma`). The app keeps its production base URL in `src/constants/api.ts` (`https://smriticare-3q3c.onrender.com`).

### Authentication and session restoration

- `backend/src/services/auth.service.ts` supports both `PATIENT` and `CAREGIVER` signup/login, hashes passwords, embeds the role in a seven-day JWT, and sanitizes users before returning them.
- `src/services/auth.ts` has role-specific helpers and validates a restored user's role via `/api/auth/me`.
- `App.tsx` persists `{token, role}` through `src/services/authStorage.ts`, routes a saved `caregiver` role directly to `caregiver-dashboard`, and restores a patient profile into SQLite. A caregiver restoration currently trusts the saved role without validating `/api/auth/me`; patient restoration falls back to SQLite for every failure, including invalid authentication.

### Connections and permissions

- Prisma already has `CaregiverPatient` (unique caregiver/patient pair) and `CaregiverInvite`; `User.patientCode` is unique. No schema change is required for a relationship.
- `backend/src/services/caregiverConnection.service.ts` implements both existing mechanisms: caregiver enters a permanent `SC-PAT-*` patient code (`connectCaregiverToPatient`), or a patient redeems a one-time, 24-hour caregiver invite (`connectPatient`). Both persist `CaregiverPatient`.
- `src/screens/caregiver/CaregiverDashboardScreen.tsx` uses the patient-code endpoint and displays/disconnects live connections. `src/screens/profile/ProfileScreen.tsx` shows the patient code and the connected caregiver.
- `User.caregiverAccess` is described in `ProfileScreen.tsx` as permission for a connected caregiver to access care information. It is separate from `User.gpsSharing`, which controls current-location sharing. The connection list currently exposes detailed patient fields irrespective of `caregiverAccess`, and the existing caregiver task functions check only the relationship.

### Existing care data

- Tasks: `Task`, patient task CRUD, repeat renewal, and caregiver-specific task routes already exist in `backend/src/services/task.service.ts` and `backend/src/routes/task.routes.ts`. `CaregiverPatientTasks.tsx` uses those online routes.
- Alerts: Prisma has `ACTIVE`, `ACKNOWLEDGED`, `RESOLVED` and `TASK`, `HYDRATION`, `GAME`, `MANUAL`. Local alert repository and backend endpoints exist, but `CaregiverAlertsScreen.tsx` only renders placeholders. Alert creation and sync currently accept client-selected patient/caregiver IDs without adequate relationship/role validation.
- Memories, game results, and cognitive scores are implemented only for the authenticated user's own records (`memory.service.ts`, `game.service.ts`, routes). There are no caregiver-authorized read endpoints.
- Location: `location.service.ts` checks a connection and `gpsSharing`, but does not explicitly prove the requester is a caregiver. The dashboard already consumes this endpoint.
- Profile: patient controls `caregiverAccess` and `gpsSharing` in `ProfileScreen.tsx`; profile changes are sent via `profile.service.ts` and cached locally.

### Offline state and synchronization

- Expo SQLite schema/repositories and the sole `syncManager` already exist. The queue supports game results, scores, memories, tasks, profiles, and alerts.
- `syncManager.ts` has one-worker protection and network-triggered retry; `resetStaleProcessingItems()` is available but is not called during startup. Pull does not hydrate alerts, game results, or scores locally.
- `syncQueueRepository.ts` has an INSERT placeholder/value mismatch, so queue insertion is unreliable. Tasks are keyed by patient user ID locally, but queued task payloads carry no actor/target metadata. Thus caregiver offline task changes would be replayed as if owned by the caregiver.

## Implementation work

1. Add a shared backend authorization service that resolves the database user role and verifies a caregiver-to-patient relationship. Require `caregiverAccess` for care information and require both care access and `gpsSharing` for location. Use it in every caregiver data path instead of frontend filtering.
2. Keep the existing patient-code and caregiver-invite connection system. Make repeated connection attempts idempotent where safe, add a patient-facing invite redemption control using the existing `/connect` endpoint, and expose all connected caregivers rather than silently selecting only one.
3. Restrict connection list data to relationship metadata and safe identity fields when care access is off; show authorized patient profile data only through an authorized detail endpoint.
4. Complete backend caregiver read APIs for patient profile, tasks, memories, cognitive scores, game results, and alerts. Preserve the existing models and response fields. Add authorization for alert creation/status updates and only create patient-event alerts for connected caregivers.
5. Enforce roles for task, location, alert, and sync operations. A patient operates only on their own data; a caregiver may operate only through an existing permitted relationship and only on that relationship's patient.
6. Extend the existing offline schema/queue—not a new database or queue—with caregiver target metadata. Repair queue insertion, reset interrupted operations on startup, coalesce duplicate pending entity operations, classify HTTP 401/403 as authentication/authorization failures without treating network failure as logout, and reconcile server alerts and authorized patient task snapshots.
7. Make the existing caregiver dashboard and reminder/task screens use shared API functions and selected connection state. Add minimally invasive patient selection/detail controls for authorized memories, cognitive scores, and game results; retain the warm screen layout.
8. Replace alert placeholders with live authorized alerts and local optimistic acknowledge/resolve actions using the existing queue.
9. Preserve separate `caregiverAccess` and `gpsSharing` profile toggles, prevent stale locations from being returned after sharing is disabled, and keep logout/session behavior role-safe.
10. Add focused backend service tests where the repository's test tooling permits, run TypeScript/build checks, and document any environment-only limitation truthfully.

## Authorization rules

- Every caregiver patient request: valid JWT, current DB role `CAREGIVER`, relationship exists, requested patient is that relationship's patient, and `caregiverAccess` is true for care data.
- Location additionally requires `gpsSharing` true. Disabled sharing returns no coordinates.
- Patients can read/change only their own data and can disconnect only their own relationships.
- Alert creation requires the patient actor or an authorized caregiver relationship; alert status changes are restricted to the alert's authorized caregiver (and the owning patient for patient-facing handling).
- Sync items never trust a client-provided user ID or target patient without server-side authorization.

## Database plan

No Prisma schema migration is needed for relationship or permission storage: the required models and fields exist. SQLite receives additive `CREATE TABLE IF NOT EXISTS`/migration-safe columns required to persist caregiver-targeted queue operations. No database reset, destructive migration, or production data operation will be performed.

## Verification plan

Run backend `npm run build` and `npx tsc --noEmit`, then frontend `npx tsc --noEmit` (and any configured Expo check). Exercise service-level authorization cases for unrelated caregivers/patients, permitted task lifecycle, alert status, access toggles, and location sharing. Validate queue SQL and idempotent replay structurally; end-to-end production account tests cannot be run without supplied test credentials and must not be fabricated.
