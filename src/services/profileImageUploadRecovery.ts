export const PROFILE_IMAGE_SAVED_SIGNING_FAILED = "PROFILE_IMAGE_SAVED_SIGNING_FAILED";

type UploadApiResponse = {
  success?: boolean;
  code?: string;
  message?: string;
  data?: { profileImageUrl?: unknown };
  user?: { profileImageUrl?: unknown };
};

type CurrentUserApiResponse = {
  success?: boolean;
  user?: { id?: unknown; profileImageUrl?: unknown };
};

export type ProfileImageFetchResponse = {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
};

export function isUsableProfileImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  if (value.startsWith("/uploads/") && !value.includes("\\")) return true;

  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !!url.hostname && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** Upload once, refreshing /auth/me only for the backend's post-persistence signing error. */
export async function uploadProfileImageWithRecovery(
  uploadRequest: () => Promise<ProfileImageFetchResponse>,
  refreshCurrentUser: (token: string) => Promise<ProfileImageFetchResponse>,
  token: string,
  expectedUserId: string | null,
): Promise<string> {
  const response = await uploadRequest();

  let result: UploadApiResponse;
  try {
    result = await response.json() as UploadApiResponse;
  } catch {
    throw new Error(`Server returned an invalid response (${response.status}).`);
  }

  if (!response.ok || !result.success) {
    if (response.status === 500 && result.code === PROFILE_IMAGE_SAVED_SIGNING_FAILED) {
      try {
        if (!expectedUserId) throw new Error("No authenticated user ID is available.");
        const refreshedResponse = await refreshCurrentUser(token);
        const refreshed = await refreshedResponse.json() as CurrentUserApiResponse;
        const currentUser = refreshed.user;
        const profileImageUrl = currentUser?.profileImageUrl;

        if (
          !refreshedResponse.ok ||
          !refreshed.success ||
          currentUser?.id !== expectedUserId ||
          !isUsableProfileImageUrl(profileImageUrl)
        ) {
          throw new Error("The authenticated profile did not contain a usable image URL.");
        }

        return profileImageUrl;
      } catch {
        throw new Error("Profile photo was saved, but its display link could not be refreshed. Reopen your profile before trying again.");
      }
    }

    throw new Error(result.message || "Failed to upload profile photo.");
  }

  const profileImageUrl = result.data?.profileImageUrl ?? result.user?.profileImageUrl;
  if (typeof profileImageUrl !== "string" || !profileImageUrl) {
    throw new Error("Profile image URL was not returned by the server.");
  }

  return profileImageUrl;
}
