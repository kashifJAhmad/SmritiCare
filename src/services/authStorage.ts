import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@smriticCare_auth_token";
const ROLE_KEY = "@smriticCare_auth_role";

export type AuthRole = "patient" | "caregiver";

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function saveAuthSession(
  token: string,
  role: AuthRole,
): Promise<void> {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [ROLE_KEY, role],
  ]);
}

export async function getAuthRole(): Promise<AuthRole | null> {
  const role = await AsyncStorage.getItem(ROLE_KEY);

  if (role === "patient" || role === "caregiver") {
    return role;
  }

  return null;
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.multiRemove([
    TOKEN_KEY,
    ROLE_KEY,
  ]);
}