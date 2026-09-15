import { getToken } from "./authStorage";

import { API_BASE_URL } from "../constants/api";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  age: number | null;
  language: string;
  caregiverName: string | null;
  caregiverAccess: boolean;
  gpsSharing: boolean;
  textSize: string;

  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  bloodGroup: string | null;
  medicalNotes: string | null;
  profileImageUrl: string | null;

  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileData = Partial<
  Pick<
    UserProfile,
    | "fullName"
    | "age"
    | "language"
    | "caregiverName"
    | "caregiverAccess"
    | "gpsSharing"
    | "textSize"
    | "phone"
    | "dateOfBirth"
    | "gender"
    | "address"
    | "city"
    | "bloodGroup"
    | "medicalNotes"
    | "profileImageUrl"
  >
>;

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
};

async function authenticatedRequest(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${token}`);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

import { getLocalProfile, saveLocalProfile, updateProfileLocally } from "../database/repositories/profileRepository";
import { networkMonitor } from "./networkMonitor";
import { syncManager } from "./syncManager";

export async function getMyProfile(userId?: string): Promise<UserProfile> {
  // If offline or no network, load from local SQLite first
  if (!networkMonitor.getIsOnline() && userId) {
    const local = await getLocalProfile(userId);
    if (local) {
      return {
        ...local,
        createdAt: local.updatedAt,
      } as unknown as UserProfile;
    }
  }

  try {
    const response = await authenticatedRequest(
      `${API_BASE_URL}/api/auth/me`,
    );

    const result: ApiResponse<UserProfile> =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to load profile.",
      );
    }

    const user = result.data ?? result.user;

    if (!user) {
      throw new Error(
        "Profile data was not returned by the server.",
      );
    }

    // Cache locally
    await saveLocalProfile({
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      age: user.age,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      city: user.city,
      bloodGroup: user.bloodGroup,
      medicalNotes: user.medicalNotes,
      profileImageUrl: user.profileImageUrl,
      language: user.language,
      caregiverName: user.caregiverName,
      caregiverAccess: user.caregiverAccess,
      gpsSharing: user.gpsSharing,
      textSize: user.textSize,
      syncStatus: 'SYNCED',
    });

    return user;
  } catch (error) {
    if (userId) {
      const local = await getLocalProfile(userId);
      if (local) {
        return {
          ...local,
          createdAt: local.updatedAt,
        } as unknown as UserProfile;
      }
    }
    throw error;
  }
}

export async function updateMyProfile(
  updates: UpdateProfileData,
  userId?: string
): Promise<UserProfile> {
  const targetUserId = userId || "patient_local";

  if (!networkMonitor.getIsOnline()) {
    await updateProfileLocally(targetUserId, updates);
    const local = await getLocalProfile(targetUserId);
    return {
      ...(local || {}),
      ...updates,
      id: targetUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as UserProfile;
  }

  try {
    const response = await authenticatedRequest(
      `${API_BASE_URL}/api/auth/me`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      },
    );

    const result: ApiResponse<UserProfile> =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to update profile.",
      );
    }

    const user = result.data ?? result.user;

    if (!user) {
      throw new Error(
        "Updated profile data was not returned by the server.",
      );
    }

    await saveLocalProfile({
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      age: user.age,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      city: user.city,
      bloodGroup: user.bloodGroup,
      medicalNotes: user.medicalNotes,
      profileImageUrl: user.profileImageUrl,
      language: user.language,
      caregiverName: user.caregiverName,
      caregiverAccess: user.caregiverAccess,
      gpsSharing: user.gpsSharing,
      textSize: user.textSize,
      syncStatus: 'SYNCED',
    });

    return user;
  } catch (error) {
    // Save locally and enqueue sync on failure
    await updateProfileLocally(targetUserId, updates);
    syncManager.triggerSync().catch(() => {});
    const local = await getLocalProfile(targetUserId);
    return {
      ...(local || {}),
      ...updates,
      id: targetUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as UserProfile;
  }
}

export async function uploadProfileImage(
  uri: string,
): Promise<string> {
  const token = await getToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const formData = new FormData();

  const filename =
    uri.split("/").pop() ||
    `profile-${Date.now()}.jpg`;

  const extension = filename.includes(".")
    ? filename.split(".").pop()?.toLowerCase()
    : "jpg";

  const mimeType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  // --------------------------------------------------
  // WEB
  // --------------------------------------------------
  // Expo Web gives us a browser URI/blob.
  // We must convert it into a real Blob/File.
  // --------------------------------------------------

  if (
    typeof window !== "undefined" &&
    typeof window.fetch === "function"
  ) {
    const imageResponse = await fetch(uri);

    if (!imageResponse.ok) {
      throw new Error(
        "Unable to read the selected image.",
      );
    }

    const blob = await imageResponse.blob();

    const file = new File(
      [blob],
      filename,
      {
        type: mimeType,
      },
    );

    formData.append("image", file);
  } else {
    // ------------------------------------------------
    // ANDROID / IOS
    // ------------------------------------------------

    formData.append(
      "image",
      {
        uri,
        name: filename,
        type: mimeType,
      } as any,
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/auth/profile-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const text = await response.text();

  let result: ApiResponse<{
    profileImageUrl: string;
  }>;

  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}).`,
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to upload profile photo.",
    );
  }

  const imageUrl =
    result.data?.profileImageUrl ??
    result.user?.profileImageUrl;

  if (!imageUrl) {
    throw new Error(
      "Profile image URL was not returned by the server.",
    );
  }

  return imageUrl;
}