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
// PATIENT AUTH / DATABASE / SYNC
// ============================================================

import {
  getCurrentPatient,
} from "./src/services/api";

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
  | "profile"
  | "schedule"
  | "memory"

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
  // INITIALIZE APP
  // ============================================================

  useEffect(() => {
    initializeApp();
  }, []);

  // ============================================================
  // INITIALIZE DATABASE + RESTORE SESSION
  // ============================================================

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
  // RESTORE AUTHENTICATION SESSION
  // ============================================================

  async function restoreAuthenticationSession() {
    const token = await getToken();
    const role = await getAuthRole();

    // ----------------------------------------------------------
    // No token
    // ----------------------------------------------------------

    if (!token) {
      console.log(
        "SmritiCare: no saved login found",
      );

      setPatient(null);
      setScreen("welcome");
      return;
    }

    console.log(
      "SmritiCare: saved authentication token found",
    );

    // ==========================================================
    // CAREGIVER SESSION
    // ==========================================================

    if (role === "caregiver") {
      console.log(
        "SmritiCare: restoring caregiver session",
      );

      setScreen("caregiver-dashboard");
      return;
    }

    // ==========================================================
    // PATIENT SESSION
    // ==========================================================

    if (role === "patient") {
      await restorePatientSession(token);
      return;
    }

    // ==========================================================
    // OLD SESSION WITHOUT ROLE
    // ==========================================================

    /*
     * Older versions of SmritiCare stored only the JWT.
     *
     * We attempt to validate that token as a patient session.
     * If it works, we upgrade the stored session to include
     * the patient role.
     */

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

        console.log(
          "SmritiCare: patient session restored:",
          user.fullName,
        );

        setPatient(user);

        // Save the correct role for future launches.
        await saveAuthSession(
          token,
          "patient",
        );

        // ------------------------------------------------------
        // Sync manager
        // ------------------------------------------------------

        syncManager.setUserId(user.id);

        // ------------------------------------------------------
        // Save patient locally
        // ------------------------------------------------------

        try {
          await saveLocalProfile({
            userId: user.id,
            fullName: user.fullName,
            email: user.email,
            age: user.age,
           language: user.language ?? undefined,
            caregiverName:
              user.caregiverName,
            caregiverAccess:
              user.caregiverAccess,
            gpsSharing:
              user.gpsSharing,
             textSize: user.textSize ?? undefined,
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
      /*
       * Network may be unavailable.
       *
       * We therefore attempt to restore the patient from
       * the SQLite cache rather than immediately logging out.
       */

      console.log(
        "SmritiCare: online session restore failed; checking local cache.",
      );

      try {
        const cached =
          await getLocalProfile(
            "patient_local",
          );

        if (cached) {
          console.log(
            "SmritiCare: patient restored from local cache.",
          );

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

          /*
           * Keep the token. The user can continue using the
           * locally available patient experience while offline.
           */
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

      /*
       * No valid online session and no local patient profile.
       */
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
      /*
       * CaregiverLoginScreen is expected to save the session.
       *
       * We also save here when a token is returned, making the
       * navigation layer safe if the screen returns its token.
       */
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
      /*
       * If signup returned a token, save it immediately as a
       * caregiver session.
       */
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
  // CAREGIVER AUTH LANDING
  // ============================================================

  if (screen === "caregiver-auth") {
    return (
      <CaregiverAuthScreen
        onBack={() => {
          setScreen("welcome");
        }}
        onSignIn={() => {
          /*
           * VERY IMPORTANT:
           *
           * Never go directly to the caregiver dashboard.
           * The caregiver must authenticate first.
           */
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
        onLogout={handleLogout}
        onMedicalHelp={() => {
          console.log(
            "Medical Help screen is not registered yet.",
          );
        }}
        onCallFamily={() => {
          console.log(
            "Call Family screen is not registered yet.",
          );
        }}
        onCognitiveScore={() => {
          console.log(
            "Cognitive Score screen is not registered yet.",
          );
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