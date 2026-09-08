const API_BASE_URL = "http://192.168.29.253:5000";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  token?: string;
  user?: T;
};

export type PatientUser = {
  id: string;
  fullName: string;
  email: string;
  age: number | null;
  language: string;
  caregiverName: string | null;
  caregiverAccess: boolean;
  gpsSharing: boolean;
  textSize: string;
  createdAt: string;
  updatedAt: string;
};

export async function patientSignup(data: {
  fullName: string;
  email: string;
  password: string;
  age?: number;
  language?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<PatientUser> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to create account");
  }

  return result;
}

export async function patientLogin(data: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<PatientUser> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to login");
  }

  return result;
}

export async function getCurrentPatient(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result: ApiResponse<PatientUser> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to get patient");
  }

  return result;
}