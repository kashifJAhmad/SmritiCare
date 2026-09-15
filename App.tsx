import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import HomeScreen from "./src/screens/home/HomeScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import SignupScreen from "./src/screens/auth/SignupScreen";

import CaregiverAuthScreen from "./src/screens/auth/CaregiverAuthScreen";
import CaregiverSignupScreen from "./src/screens/caregiver/CaregiverSignupScreen";

import CaregiverDashboardScreen from "./src/screens/caregiver/CaregiverDashboardScreen";
import CaregiverProfileScreen from "./src/screens/caregiver/CaregiverProfileScreen";
import CaregiverAlertsScreen from "./src/screens/caregiver/CaregiverAlertsScreen";
import CaregiverRemindersScreen from "./src/screens/caregiver/CaregiverRemindersScreen";

import ScheduleScreen from "./src/screens/reminders/ScheduleScreen";
import ProfileScreen from "./src/screens/profile/ProfileScreen";

import MemoryScreen from "./src/screens/memories/MemoryScreen";

import {
  getToken,
  removeToken,
} from "./src/services/authStorage";

type Screen =
  | "home"
  | "login"
  | "signup"
  | "profile"
  | "schedule"
  | "memory"
  | "caregiver-auth"
  | "caregiver-signup"
  | "caregiver-dashboard"
  | "caregiver-profile"
  | "caregiver-alerts"
  | "caregiver-reminders";

export default function App() {
  const [screen, setScreen] =
    useState<Screen>("login");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  /**
   * Restore the existing authentication session.
   */
  const checkAuthentication = async () => {
    try {
      const token = await getToken();

      if (token) {
        setScreen("home");
      } else {
        setScreen("login");
      }
    } catch (error) {
      console.warn(
        "Unable to restore authentication:",
        error
      );

      setScreen("login");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Shared logout handler.
   *
   * Used by both patient and caregiver
   * profile/dashboard screens.
   */
  const handleLogout = async () => {
    try {
      await removeToken();
    } catch (error) {
      console.warn(
        "Unable to remove authentication token:",
        error
      );
    }

    setScreen("login");
  };

  /**
   * Initial loading state.
   */
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
  // PATIENT AUTHENTICATION
  // ============================================================

  if (screen === "login") {
    return (
      <LoginScreen
        onLogin={(token?: string) => {
          setScreen("home");
        }}
        onSignup={() => {
          setScreen("signup");
        }}
        onBack={() => {
          setScreen("home");
        }}
        onCaregiver={() => {
          setScreen("caregiver-auth");
        }}
      />
    );
  }

  if (screen === "signup") {
    return (
      <SignupScreen
        onSignup={(token?: string) => {
          setScreen("home");
        }}
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
  // CAREGIVER AUTHENTICATION
  // ============================================================

  if (screen === "caregiver-auth") {
    return (
      <CaregiverAuthScreen
        onBack={() => {
          setScreen("login");
        }}
        onSignIn={() => {
          setScreen("caregiver-dashboard");
        }}
        onSignUp={() => {
          setScreen("caregiver-signup");
        }}
      />
    );
  }

  if (screen === "caregiver-signup") {
    return (
      <CaregiverSignupScreen
        onBack={() => {
          setScreen("caregiver-auth");
        }}
        onLogin={() => {
          setScreen("caregiver-auth");
        }}
        onSignup={() => {
          setScreen("caregiver-dashboard");
        }}
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
          setScreen("login");
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
  //
  // This is the caregiver's separate Remind section.
  //
  // It displays reminders/tasks belonging to the
  // connected patient selected by the caregiver.
  //
  // It does NOT open the patient's ScheduleScreen.
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

        /*
         * These callbacks are required by HomeScreen.
         *
         * The corresponding screens are not currently
         * registered in this App.tsx, so they remain
         * placeholders for now.
         *
         * Once Medical Help / Call Family / Cognitive Score
         * screens are available, these can navigate to them.
         */
        onMedicalHelp={() => {
          console.log(
            "Medical Help screen is not registered yet."
          );
        }}
        onCallFamily={() => {
          console.log(
            "Call Family screen is not registered yet."
          );
        }}
        onCognitiveScore={() => {
          console.log(
            "Cognitive Score screen is not registered yet."
          );
        }}
      />
    );
  }

  // ============================================================
  // PATIENT SCHEDULE
  //
  // Completely separate from CaregiverRemindersScreen.
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FBF9F1",
    alignItems: "center",
    justifyContent: "center",
  },
});