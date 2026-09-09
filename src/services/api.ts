import {
  patientLogin as authPatientLogin,
  patientSignup as authPatientSignup,
  getCurrentPatient as authGetCurrentPatient,
  AuthUser,
} from "./auth";

export type PatientUser = AuthUser;

type PatientAuthResponse = {
  success: boolean;
  message?: string;
  token: string;
  user: PatientUser;
};

export async function patientSignup(data: {
  fullName: string;
  email: string;
  password: string;
  age?: number;
  language?: string;
}): Promise<PatientAuthResponse> {
  const result = await authPatientSignup(
    data.fullName,
    data.email,
    data.password,
    data.age,
    data.language,
  );

  return {
    success: true,
    token: result.token,
    user: result.user,
  };
}

export async function patientLogin(data: {
  email: string;
  password: string;
}): Promise<PatientAuthResponse> {
  const result = await authPatientLogin(
    data.email,
    data.password,
  );

  return {
    success: true,
    token: result.token,
    user: result.user,
  };
}

export async function getCurrentPatient(
  token: string,
): Promise<{
  success: boolean;
  user: PatientUser;
}> {
  const user = await authGetCurrentPatient(token);

  return {
    success: true,
    user,
  };
}