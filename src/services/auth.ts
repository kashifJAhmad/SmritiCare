import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";

export type UserRole = "PATIENT" | "CAREGIVER";

export type AuthUser = {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;

    age: number | null;

    phone: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    address: string | null;
    city: string | null;

    bloodGroup: string | null;
    medicalNotes: string | null;

    profileImageUrl: string | null;

    language: string;
    caregiverName: string | null;
    caregiverAccess: boolean;
    gpsSharing: boolean;
    textSize: string;

    createdAt: string;
    updatedAt: string;
};

type AuthResponse = {
    token: string;
    user: AuthUser;
};

const TOKEN_KEY = "@smriticCare_auth_token";

async function request(
    endpoint: string,
    options: RequestInit = {},
) {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        },
    );

    let data: any = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
                data?.error ||
                `Request failed with status ${response.status}`,
        );
    }

    return data;
}

export async function saveToken(token: string) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken() {
    await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function loginUser(
    email: string,
    password: string,
    role: UserRole,
): Promise<AuthResponse> {
    const data = await request(
        "/api/auth/login",
        {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
                role,
            }),
        },
    );

    if (!data?.token || !data?.user) {
        throw new Error(
            "Invalid response from server",
        );
    }

    await saveToken(data.token);

    return data;
}

export async function signupUser(
    fullName: string,
    email: string,
    password: string,
    role: UserRole,
    age?: number,
    language?: string,
): Promise<AuthResponse> {
    const data = await request(
        "/api/auth/signup",
        {
            method: "POST",
            body: JSON.stringify({
                fullName,
                email,
                password,
                role,
                age,
                language,
            }),
        },
    );

    if (!data?.token || !data?.user) {
        throw new Error(
            "Invalid response from server",
        );
    }

    await saveToken(data.token);

    return data;
}

export async function patientLogin(
    email: string,
    password: string,
): Promise<AuthResponse> {
    return loginUser(
        email,
        password,
        "PATIENT",
    );
}

export async function caregiverLogin(
    email: string,
    password: string,
): Promise<AuthResponse> {
    return loginUser(
        email,
        password,
        "CAREGIVER",
    );
}

export async function patientSignup(
    fullName: string,
    email: string,
    password: string,
    age?: number,
    language?: string,
): Promise<AuthResponse> {
    return signupUser(
        fullName,
        email,
        password,
        "PATIENT",
        age,
        language,
    );
}

export async function caregiverSignup(
    fullName: string,
    email: string,
    password: string,
): Promise<AuthResponse> {
    return signupUser(
        fullName,
        email,
        password,
        "CAREGIVER",
    );
}

export async function getCurrentUser(
    token?: string,
): Promise<AuthUser> {
    const authToken =
        token || (await getToken());

    if (!authToken) {
        throw new Error(
            "No authentication token found",
        );
    }

    const data = await request(
        "/api/auth/me",
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        },
    );

    if (!data?.user) {
        throw new Error(
            "Invalid response from server",
        );
    }

    return data.user;
}

export async function getCurrentPatient(
    token?: string,
): Promise<AuthUser> {
    const user = await getCurrentUser(token);

    if (user.role !== "PATIENT") {
        throw new Error(
            "This account is not a patient account",
        );
    }

    return user;
}

export async function getCurrentCaregiver(
    token?: string,
): Promise<AuthUser> {
    const user = await getCurrentUser(token);

    if (user.role !== "CAREGIVER") {
        throw new Error(
            "This account is not a caregiver account",
        );
    }

    return user;
}