import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ============================================================
// WELCOME
// ============================================================

import WelcomeScreen from "./src/screens/WelcomeScreen";

// ============================================================
// PATIENT SCREENS
// ============================================================

import HomeScreen from "./src/screens/home/HomeScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import SignupScreen from "./src/screens/auth/SignupScreen";
import ProfileScreen from "./src/screens/profile/ProfileScreen";
import ScheduleScreen from "./src/screens/reminders/ScheduleScreen";
import MemoryScreen from "./src/screens/memories/MemoryScreen";
import GamesScreen from "./src/screens/games/GamesScreen";

// ============================================================
// PATIENT FEATURE SCREENS
// ============================================================

import MedicalHelpScreen from "./src/screens/medical/MedicalHelpScreen";
import CognitiveScoreScreen from "./src/screens/home/CognitiveScoreScreen";
import CallFamilyScreen from "./src/screens/home/CallFamilyScreen";
import VoiceAssistantScreen from "./src/screens/home/VoiceAssistantScreen";

// ============================================================
// CAREGIVER AUTHENTICATION
// ============================================================

import CaregiverAuthScreen from "./src/screens/auth/CaregiverAuthScreen";
import CaregiverLoginScreen from "./src/screens/caregiver/CaregiverLoginScreen";
import CaregiverSignupScreen from "./src/screens/caregiver/CaregiverSignupScreen";

// ============================================================
// CAREGIVER APPLICATION
// ============================================================

import CaregiverDashboardScreen from "./src/screens/caregiver/CaregiverDashboardScreen";
import CaregiverProfileScreen from "./src/screens/caregiver/CaregiverProfileScreen";
import CaregiverAlertsScreen from "./src/screens/caregiver/CaregiverAlertsScreen";
import CaregiverRemindersScreen from "./src/screens/caregiver/CaregiverRemindersScreen";

// ============================================================
// SERVICES
// ============================================================

import { getCurrentPatient } from "./src/services/api";

import {
  clearAuthSession,
  getAuthRole,
  getToken,
  saveAuthSession,
} from "./src/services/authStorage";

import { initDatabase } from "./src/database/sqlite";

import { syncManager } from "./src/services/syncManager";

import {
  getLocalProfile,
  saveLocalProfile,
} from "./src/database/repositories/profileRepository";

// ============================================================
// PATIENT USER TYPE
// ============================================================

type PatientUser = {
  id: string;
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

  language?: string | null;

  caregiverName?: string | null;
  caregiverAccess?: boolean;

  gpsSharing?: boolean;

  textSize?: string | null;

  createdAt?: string | Date;
  updatedAt?: string | Date;
};

// ============================================================
// SCREEN TYPE
// ============================================================

type Screen =
  // ----------------------------------------------------------
  // Common
  // ----------------------------------------------------------

  | "welcome"

  // ----------------------------------------------------------
  // Patient authentication
  // ----------------------------------------------------------

  | "login"
  | "signup"

  // ----------------------------------------------------------
  // Patient application
  // ----------------------------------------------------------

  | "home"
  | "games"
  | "schedule"
  | "memory"
  | "profile"

  // ----------------------------------------------------------
  // Patient feature screens
  // ----------------------------------------------------------

  | "medical-help"
  | "call-family"
  | "cognitive-score"
  | "voice-assistant"

  // ----------------------------------------------------------
  // Caregiver authentication
  // ----------------------------------------------------------

  | "caregiver-auth"
  | "caregiver-login"
  | "caregiver-signup"

  // ----------------------------------------------------------
  // Caregiver application
  // ----------------------------------------------------------

  | "caregiver-dashboard"
  | "caregiver-profile"
  | "caregiver-alerts"
  | "caregiver-reminders";

// ============================================================
// APP CONTENT
// ============================================================

function AppContent() {
  const [screen, setScreen] =
    useState<Screen>("welcome");

  const [patient, setPatient] =
    useState<PatientUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  // ============================================================
  // INITIALIZE
  // ============================================================

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      await initDatabase();
    } catch (error) {
      console.warn(
        "SmritiCare: SQLite initialization error:",
        error,
      );
    }

    try {
      await restoreAuthenticationSession();
    } catch (error) {
      console.warn(
        "SmritiCare: authentication restore error:",
        error,
      );

      setPatient(null);
      setScreen("welcome");
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // RESTORE AUTHENTICATION
  // ============================================================

  async function restoreAuthenticationSession() {
    const token = await getToken();
    const role = await getAuthRole();

    if (!token) {
      setPatient(null);
      setScreen("welcome");
      return;
    }

    // ----------------------------------------------------------
    // CAREGIVER
    // ----------------------------------------------------------

    if (role === "caregiver") {
      setScreen("caregiver-dashboard");
      return;
    }

    // ----------------------------------------------------------
    // PATIENT
    // ----------------------------------------------------------

    await restorePatientSession(token);
  }

  // ============================================================
  // RESTORE PATIENT SESSION
  // ============================================================

  async function restorePatientSession(
    token: string,
  ) {
    try {
      const result =
        await getCurrentPatient(token);

      if (
        result.success &&
        result.user
      ) {
        const user =
          result.user as PatientUser;

        setPatient(user);

        await saveAuthSession(
          token,
          "patient",
        );

        syncManager.setUserId(user.id);

        try {
          await saveLocalProfile({
            userId: user.id,
            fullName: user.fullName,
            email: user.email,
            age: user.age,
            language:
              user.language ?? undefined,
            caregiverName:
              user.caregiverName ?? undefined,
            caregiverAccess:
              user.caregiverAccess,
            gpsSharing:
              user.gpsSharing,
            textSize:
              user.textSize ?? undefined,
            syncStatus: "SYNCED",
          });
        } catch (localError) {
          console.warn(
            "SmritiCare: unable to cache patient profile:",
            localError,
          );
        }

        setScreen("home");
        return;
      }

      throw new Error(
        "Unable to restore patient session.",
      );
    } catch (networkError) {
      console.log(
        "SmritiCare: online session restore failed; checking local cache.",
      );

      try {
        const cached =
          await getLocalProfile(
            "patient_local",
          );

        if (cached) {
          const localPatient: PatientUser = {
            id: cached.userId,
            fullName: cached.fullName,
            email: cached.email,
            role: "PATIENT",

            age:
              cached.age ?? null,

            phone:
              cached.phone ?? null,

            dateOfBirth:
              cached.dateOfBirth ?? null,

            gender:
              cached.gender ?? null,

            address:
              cached.address ?? null,

            city:
              cached.city ?? null,

            bloodGroup:
              cached.bloodGroup ?? null,

            medicalNotes:
              cached.medicalNotes ?? null,

            profileImageUrl:
              cached.profileImageUrl ?? null,

            language:
              cached.language ?? null,

            caregiverName:
              cached.caregiverName ?? null,

            caregiverAccess:
              cached.caregiverAccess,

            gpsSharing:
              cached.gpsSharing,

            textSize:
              cached.textSize ?? null,

            createdAt:
              cached.updatedAt,

            updatedAt:
              cached.updatedAt,
          };

          setPatient(localPatient);

          syncManager.setUserId(
            cached.userId,
          );

          await saveAuthSession(
            token,
            "patient",
          );

          setScreen("home");
          return;
        }
      } catch (cacheError) {
        console.warn(
          "SmritiCare: local patient cache restore failed:",
          cacheError,
        );
      }

      console.warn(
        "SmritiCare: no valid patient session available.",
        networkError,
      );

      await clearAuthSession();

      setPatient(null);
      setScreen("welcome");
    }
  }

  // ============================================================
  // PATIENT LOGIN
  // ============================================================

  const handlePatientLogin = async (
    token?: string,
  ) => {
    try {
      if (token) {
        await saveAuthSession(
          token,
          "patient",
        );
      }

      setScreen("home");
    } catch (error) {
      console.warn(
        "SmritiCare: unable to save patient login:",
        error,
      );

      setScreen("welcome");
    }
  };

  // ============================================================
  // PATIENT SIGNUP
  // ============================================================

  const handlePatientSignup = async (
    token?: string,
  ) => {
    try {
      if (token) {
        await saveAuthSession(
          token,
          "patient",
        );
      }

      setScreen("home");
    } catch (error) {
      console.warn(
        "SmritiCare: unable to save patient signup session:",
        error,
      );

      setScreen("welcome");
    }
  };

  // ============================================================
  // CAREGIVER LOGIN
  // ============================================================

  const handleCaregiverLogin = async (
    token?: string,
  ) => {
    try {
      if (token) {
        await saveAuthSession(
          token,
          "caregiver",
        );
      }

      setScreen("caregiver-dashboard");
    } catch (error) {
      console.warn(
        "SmritiCare: unable to save caregiver login:",
        error,
      );

      setScreen("caregiver-login");
    }
  };

  // ============================================================
  // CAREGIVER SIGNUP
  // ============================================================

  const handleCaregiverSignup = async (
    token?: string,
  ) => {
    try {
      if (token) {
        await saveAuthSession(
          token,
          "caregiver",
        );
      }

      setScreen("caregiver-dashboard");
    } catch (error) {
      console.warn(
        "SmritiCare: unable to save caregiver signup session:",
        error,
      );

      setScreen("caregiver-signup");
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    try {
      await clearAuthSession();
    } catch (error) {
      console.warn(
        "SmritiCare: unable to clear authentication:",
        error,
      );
    }

    setPatient(null);

    try {
      syncManager.setUserId("");
    } catch (error) {
      console.warn(
        "SmritiCare: unable to reset sync manager:",
        error,
      );
    }

    setScreen("welcome");
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#3F6F45"
        />
      </View>
    );
  }

  // ============================================================
  // WELCOME
  // ============================================================

  if (screen === "welcome") {
    return (
      <WelcomeScreen
        onPatient={() => {
          setScreen("login");
        }}
        onFamilyMember={() => {
          setScreen("caregiver-auth");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT LOGIN
  // ============================================================

  if (screen === "login") {
    return (
      <LoginScreen
        onLogin={handlePatientLogin}
        onSignup={() => {
          setScreen("signup");
        }}
        onBack={() => {
          setScreen("welcome");
        }}
        onCaregiver={() => {
          setScreen("caregiver-auth");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT SIGNUP
  // ============================================================

  if (screen === "signup") {
    return (
      <SignupScreen
        onSignup={handlePatientSignup}
        onLogin={() => {
          setScreen("login");
        }}
        onBack={() => {
          setScreen("login");
        }}
      />
    );
  }

  // ============================================================
  // CAREGIVER AUTH
  // ============================================================

  if (screen === "caregiver-auth") {
    return (
      <CaregiverAuthScreen
        onBack={() => {
          setScreen("welcome");
        }}
        onSignIn={() => {
          setScreen("caregiver-login");
        }}
        onSignUp={() => {
          setScreen("caregiver-signup");
        }}
      />
    );
  }

  // ============================================================
  // CAREGIVER LOGIN
  // ============================================================

  if (screen === "caregiver-login") {
    return (
      <CaregiverLoginScreen
        onBack={() => {
          setScreen("caregiver-auth");
        }}
        onSignup={() => {
          setScreen("caregiver-signup");
        }}
        onLogin={handleCaregiverLogin}
      />
    );
  }

  // ============================================================
  // CAREGIVER SIGNUP
  // ============================================================

  if (screen === "caregiver-signup") {
    return (
      <CaregiverSignupScreen
        onBack={() => {
          setScreen("caregiver-auth");
        }}
        onLogin={() => {
          setScreen("caregiver-login");
        }}
        onSignup={handleCaregiverSignup}
      />
    );
  }

  // ============================================================
  // CAREGIVER DASHBOARD
  // ============================================================

  if (screen === "caregiver-dashboard") {
    return (
      <CaregiverDashboardScreen
        onBack={() => {
          setScreen("welcome");
        }}
        onHome={() => {
          setScreen("caregiver-dashboard");
        }}
        onSchedule={() => {
          setScreen("caregiver-reminders");
        }}
        onAlerts={() => {
          setScreen("caregiver-alerts");
        }}
        onProfile={() => {
          setScreen("caregiver-profile");
        }}
        onLogout={handleLogout}
      />
    );
  }

  // ============================================================
  // CAREGIVER REMINDERS
  // ============================================================

  if (screen === "caregiver-reminders") {
    return (
      <CaregiverRemindersScreen
        onBack={() => {
          setScreen("caregiver-dashboard");
        }}
        onHome={() => {
          setScreen("caregiver-dashboard");
        }}
        onSchedule={() => {
          setScreen("caregiver-reminders");
        }}
        onAlerts={() => {
          setScreen("caregiver-alerts");
        }}
        onProfile={() => {
          setScreen("caregiver-profile");
        }}
      />
    );
  }

  // ============================================================
  // CAREGIVER ALERTS
  // ============================================================

  if (screen === "caregiver-alerts") {
    return (
      <CaregiverAlertsScreen
        onBack={() => {
          setScreen("caregiver-dashboard");
        }}
        onHome={() => {
          setScreen("caregiver-dashboard");
        }}
        onSchedule={() => {
          setScreen("caregiver-reminders");
        }}
        onAlerts={() => {
          setScreen("caregiver-alerts");
        }}
        onProfile={() => {
          setScreen("caregiver-profile");
        }}
      />
    );
  }

  // ============================================================
  // CAREGIVER PROFILE
  // ============================================================

  if (screen === "caregiver-profile") {
    return (
      <CaregiverProfileScreen
        onBack={() => {
          setScreen("caregiver-dashboard");
        }}
        onHome={() => {
          setScreen("caregiver-dashboard");
        }}
        onSchedule={() => {
          setScreen("caregiver-reminders");
        }}
        onAlerts={() => {
          setScreen("caregiver-alerts");
        }}
        onProfile={() => {
          setScreen("caregiver-profile");
        }}
        onLogout={handleLogout}
      />
    );
  }

  // ============================================================
  // PATIENT HOME
  // ============================================================

  if (screen === "home") {
    return (
      <HomeScreen
        onProfile={() => {
          setScreen("profile");
        }}
        onSchedule={() => {
          setScreen("schedule");
        }}
        onMemory={() => {
          setScreen("memory");
        }}
        onGames={() => {
          setScreen("games");
        }}
        onLogout={handleLogout}
        onMedicalHelp={() => {
          setScreen("medical-help");
        }}
        onCallFamily={() => {
          setScreen("call-family");
        }}
        onCognitiveScore={() => {
          setScreen("cognitive-score");
        }}
        onVoiceAssistant={() => {
          setScreen("voice-assistant");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT VOICE ASSISTANT
  // ============================================================

  if (screen === "voice-assistant") {
    return (
      <VoiceAssistantScreen
        onBack={() => {
          setScreen("home");
        }}
        onProfile={() => {
          setScreen("profile");
        }}
        onMedicine={() => {
          setScreen("schedule");
        }}
        onFamily={() => {
          setScreen("call-family");
        }}
        onGame={() => {
          setScreen("games");
        }}
        onSchedule={() => {
          setScreen("schedule");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT MEDICAL HELP
  // ============================================================

  if (screen === "medical-help") {
    return (
      <MedicalHelpScreen
        onBack={() => {
          setScreen("home");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT CALL FAMILY
  // ============================================================

  if (screen === "call-family") {
    return (
      <CallFamilyScreen
        onBack={() => {
          setScreen("home");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT COGNITIVE SCORE
  // ============================================================

  if (screen === "cognitive-score") {
    return (
      <CognitiveScoreScreen
        userId={patient?.id}
        onBack={() => {
          setScreen("home");
        }}
        onMemoryGame={() => {
          setScreen("games");
        }}
        onFamilyPhotos={() => {
          setScreen("memory");
        }}
        onStartExercise={() => {
          setScreen("games");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT GAMES
  // ============================================================

  if (screen === "games") {
    return (
      <GamesScreen
        onBack={() => {
          setScreen("home");
        }}
        onHome={() => {
          setScreen("home");
        }}
        onGames={() => {
          setScreen("games");
        }}
        onSchedule={() => {
          setScreen("schedule");
        }}
        onMemory={() => {
          setScreen("memory");
        }}
        onProfile={() => {
          setScreen("profile");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT SCHEDULE
  // ============================================================

  if (screen === "schedule") {
    return (
      <ScheduleScreen
        onBack={() => {
          setScreen("home");
        }}
        onHome={() => {
          setScreen("home");
        }}
        onGames={() => {
          setScreen("games");
        }}
        onProfile={() => {
          setScreen("profile");
        }}
        onMemory={() => {
          setScreen("memory");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT MEMORY
  // ============================================================

  if (screen === "memory") {
    return (
      <MemoryScreen
        onBack={() => {
          setScreen("home");
        }}
        onHome={() => {
          setScreen("home");
        }}
        onGames={() => {
          setScreen("games");
        }}
        onSchedule={() => {
          setScreen("schedule");
        }}
        onProfile={() => {
          setScreen("profile");
        }}
      />
    );
  }

  // ============================================================
  // PATIENT PROFILE
  // ============================================================

  if (screen === "profile") {
    return (
      <ProfileScreen
        onBack={() => {
          setScreen("home");
        }}
        onHome={() => {
          setScreen("home");
        }}
        onGames={() => {
          setScreen("games");
        }}
        onSchedule={() => {
          setScreen("schedule");
        }}
        onMemory={() => {
          setScreen("memory");
        }}
        onLogout={handleLogout}
      />
    );
  }

  // ============================================================
  // FALLBACK
  // ============================================================

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color="#3F6F45"
      />
    </View>
  );
}

// ============================================================
// ROOT APP
// ============================================================

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FBF9F1",
    alignItems: "center",
    justifyContent: "center",
  },
});