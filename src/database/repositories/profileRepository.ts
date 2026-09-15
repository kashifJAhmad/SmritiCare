import { getDatabase } from '../sqlite';
import { enqueueSyncItem } from './syncQueueRepository';

export type LocalUserProfile = {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  age?: number | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  bloodGroup?: string | null;
  medicalNotes?: string | null;
  profileImageUrl?: string | null;
  language: string;
  caregiverName?: string | null;
  caregiverAccess: boolean;
  gpsSharing: boolean;
  textSize: string;
  syncStatus: 'PENDING' | 'SYNCED';
  updatedAt: string;
};

/**
 * Get cached profile for a user.
 */
export async function getLocalProfile(userId: string): Promise<LocalUserProfile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `SELECT user_id as userId, full_name as fullName, email, role, age, phone,
            date_of_birth as dateOfBirth, gender, address, city, blood_group as bloodGroup,
            medical_notes as medicalNotes, profile_image_url as profileImageUrl, language,
            caregiver_name as caregiverName, caregiver_access as caregiverAccess, gps_sharing as gpsSharing,
            text_size as textSize, sync_status as syncStatus, updated_at as updatedAt
     FROM local_user_profile
     WHERE user_id = ?`,
    userId
  );

  if (!row) return null;

  return {
    ...row,
    caregiverAccess: Boolean(row.caregiverAccess),
    gpsSharing: Boolean(row.gpsSharing),
  } as LocalUserProfile;
}

/**
 * Cache / update profile locally.
 */
export async function saveLocalProfile(profile: {
  userId: string;
  fullName: string;
  email: string;
  role?: string;
  age?: number | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  bloodGroup?: string | null;
  medicalNotes?: string | null;
  profileImageUrl?: string | null;
  language?: string;
  caregiverName?: string | null;
  caregiverAccess?: boolean;
  gpsSharing?: boolean;
  textSize?: string;
  syncStatus?: 'PENDING' | 'SYNCED';
}): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const syncStatus = profile.syncStatus || 'SYNCED';

  await db.runAsync(
    `INSERT INTO local_user_profile (
       user_id, full_name, email, role, age, phone, date_of_birth, gender, address, city,
       blood_group, medical_notes, profile_image_url, language, caregiver_name, caregiver_access,
       gps_sharing, text_size, sync_status, updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       full_name = excluded.full_name,
       email = excluded.email,
       role = excluded.role,
       age = excluded.age,
       phone = excluded.phone,
       date_of_birth = excluded.date_of_birth,
       gender = excluded.gender,
       address = excluded.address,
       city = excluded.city,
       blood_group = excluded.blood_group,
       medical_notes = excluded.medical_notes,
       profile_image_url = excluded.profile_image_url,
       language = excluded.language,
       caregiver_name = excluded.caregiver_name,
       caregiver_access = excluded.caregiver_access,
       gps_sharing = excluded.gps_sharing,
       text_size = excluded.text_size,
       sync_status = excluded.sync_status,
       updated_at = excluded.updated_at`,
    profile.userId,
    profile.fullName,
    profile.email,
    profile.role || 'PATIENT',
    profile.age ?? null,
    profile.phone ?? null,
    profile.dateOfBirth ?? null,
    profile.gender ?? null,
    profile.address ?? null,
    profile.city ?? null,
    profile.bloodGroup ?? null,
    profile.medicalNotes ?? null,
    profile.profileImageUrl ?? null,
    profile.language || 'English',
    profile.caregiverName ?? null,
    profile.caregiverAccess ? 1 : 0,
    profile.gpsSharing ? 1 : 0,
    profile.textSize || 'Normal',
    syncStatus,
    now
  );
}

/**
 * Update profile offline and enqueue sync.
 */
export async function updateProfileLocally(
  userId: string,
  data: Partial<LocalUserProfile>
): Promise<void> {
  const current = await getLocalProfile(userId);
  if (!current) return;

  const merged = {
    ...current,
    ...data,
    userId,
    syncStatus: 'PENDING' as const,
  };

  await saveLocalProfile(merged);

  await enqueueSyncItem({
    userId,
    entityType: 'PROFILE',
    entityId: userId,
    operation: 'UPDATE',
    payload: data,
  });
}
