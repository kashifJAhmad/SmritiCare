import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "smriticcare_patient_token";

export async function saveToken(token: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken() {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
}