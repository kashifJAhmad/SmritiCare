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
import { initDatabase } from './src/database/sqlite';
import { syncManager } from './src/services/syncManager';
import { getLocalProfile, saveLocalProfile } from './src/database/repositories/profileRepository';
import SyncStatusBadge from './src/components/SyncStatusBadge';

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

  const [patient, setPatient] = useState<PatientUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ---------------------------------------------------------
  // OFFLINE DETECTION
  // ---------------------------------------------------------

  const [isOffline, setIsOffline] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);

  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // RESTORE PATIENT SESSION & INITIALIZE SQLITE
  // ---------------------------------------------------------

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      await initDatabase();
    } catch (e) {
      console.warn('SQLite init error:', e);
    }

    await restorePatientSession();
  }

  async function restorePatientSession() {
    try {
      const token = await getToken();

    try {
      const token = await getToken();

      if (!token) {
        console.log('SmritiCare: no saved login found');

        setPatient(null);
        setScreen('welcome');
        return;
      }

      console.log('SmritiCare: saved token found');

      try {
        const result = await getCurrentPatient(token);

        if (result.success && result.user) {
          console.log(
            'SmritiCare: patient session restored:',
            result.user.fullName,
          );

          setPatient(result.user);
          syncManager.setUserId(result.user.id);
          await saveLocalProfile({
            userId: result.user.id,
            fullName: result.user.fullName,
            email: result.user.email,
            age: result.user.age,
            language: result.user.language,
            caregiverName: result.user.caregiverName,
            caregiverAccess: result.user.caregiverAccess,
            gpsSharing: result.user.gpsSharing,
            textSize: result.user.textSize,
            syncStatus: 'SYNCED',
          });
          setScreen('home');
          return;
        }
      } catch (netErr) {
        console.log('Network error restoring session online, checking local cache...');

      }

      // If offline or network unavailable, check if we have cached profile
      const cached = await getLocalProfile('patient_local');
      if (cached) {
        const localPatient: PatientUser = {
          id: cached.userId,
          fullName: cached.fullName,
          email: cached.email,
          role: 'PATIENT',
          age: cached.age ?? null,
          phone: cached.phone ?? null,
          dateOfBirth: cached.dateOfBirth ?? null,
          gender: cached.gender ?? null,
          address: cached.address ?? null,
          city: cached.city ?? null,
          bloodGroup: cached.bloodGroup ?? null,
          medicalNotes: cached.medicalNotes ?? null,
          profileImageUrl: cached.profileImageUrl ?? null,
          language: cached.language,
          caregiverName: cached.caregiverName ?? null,
          caregiverAccess: cached.caregiverAccess,
          gpsSharing: cached.gpsSharing,
          textSize: cached.textSize,
          createdAt: cached.updatedAt,
          updatedAt: cached.updatedAt,
        };
        setPatient(localPatient);
        syncManager.setUserId(cached.userId);
        setScreen('home');
        return;
      }

      setPatient(null);
      setScreen('welcome');
    } catch (error) {
      console.warn(
        "Unable to restore authentication:",
        error
      );

      setPatient(null);
      setScreen('welcome');
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

  if (!connectionChecked) {
    return null;
  }

  // ---------------------------------------------------------
  // WELCOME
  // ---------------------------------------------------------

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onPatient={() => setScreen('patient-auth')}
        onFamilyMember={() => setScreen('caregiver-auth')}
      />
    );
  }

  // ---------------------------------------------------------
  // PATIENT AUTH
  // ---------------------------------------------------------

  if (screen === 'patient-auth') {
    return (
      <PatientAuthScreen
        onBack={() => setScreen('welcome')}
        onSignIn={() => setScreen('login')}
        onSignUp={() => setScreen('signup')}
      />
    );
  }

  // ---------------------------------------------------------
  // CAREGIVER AUTH
  // ---------------------------------------------------------

  if (screen === 'caregiver-auth') {
    return (
      <CaregiverAuthScreen
        onBack={() => setScreen('welcome')}
        onSignIn={() => setScreen('caregiver-login')}
        onSignUp={() => setScreen('caregiver-signup')}
      />
    );
  }

  // ---------------------------------------------------------
  // PATIENT LOGIN
  // ---------------------------------------------------------

  if (screen === 'login') {
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
        onBack={() => setScreen('caregiver-auth')}
        onLogout={() => setScreen('caregiver-auth')}
      />
    );
  }

  // ---------------------------------------------------------
  // MEDICAL HELP
  // ---------------------------------------------------------

  if (screen === 'medical-help') {
    return (
      <MedicalHelpScreen
        onBack={() => setScreen('home')}
      />
    );
  }

  // ---------------------------------------------------------
  // SCHEDULE
  // ---------------------------------------------------------

  if (screen === 'schedule') {
    return (
      <ScheduleScreen
        userId={patient?.id}
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onGames={() => setScreen('games')}
        onSchedule={() => setScreen('schedule')}
        onMemory={() => setScreen('memory')}
        onProfile={() => setScreen('profile')}
      />
    );
  }

  // ---------------------------------------------------------
  // CALL FAMILY
  // ---------------------------------------------------------

  if (screen === 'call-family') {
    return (
      <CallFamilyScreen
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onGames={() => setScreen('games')}
        onSchedule={() => setScreen('schedule')}
        onMemory={() => setScreen('memory')}
        onProfile={() => setScreen('profile')}
      />
    );
  }

  // ---------------------------------------------------------
  // COGNITIVE SCORE
  // ---------------------------------------------------------

  if (screen === 'cognitive-score') {
    return (
      <CognitiveScoreScreen
        userId={patient?.id}
        onBack={() => setScreen('home')}
      />
    );
  }

  // ---------------------------------------------------------
  // PROFILE
  // ---------------------------------------------------------

  if (screen === 'profile') {
    return (
      <ProfileScreen
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onGames={() => setScreen('games')}
        onSchedule={() => setScreen('schedule')}
        onMemory={() => setScreen('memory')}
        onProfile={() => setScreen('profile')}
      />
    );
  }

  // ---------------------------------------------------------
  // GAMES
  // ---------------------------------------------------------

  if (screen === 'games') {
    return (
      <GamesScreen
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onSchedule={() => setScreen('schedule')}
        onMemory={() => setScreen('memory')}
        onProfile={() => setScreen('profile')}
        onVoiceAssistant={() => setScreen('voice-assistant')}
        onOddOneOut={() => setScreen('odd-one-out')}
        onGuessFood={() => setScreen('guess-food')}
      />
    );
  }

  // ---------------------------------------------------------
  // GUESS FOOD
  // ---------------------------------------------------------

  if (screen === 'guess-food') {
    return (
      <GuessFoodScreen
        userId={patient?.id}
        onBack={() => setScreen('games')}
        onNextGame={() => {
          console.log('NEXT GAME PRESSED');
        }}
      />
    );
  }

  // ---------------------------------------------------------
  // MEMORY
  // ---------------------------------------------------------

  if (screen === 'memory') {
    return (
      <MemoryScreen
        userId={patient?.id}
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onGames={() => setScreen('games')}
        onSchedule={() => setScreen('schedule')}
        onProfile={() => setScreen('profile')}
        onVoiceAssistant={() => setScreen('voice-assistant')}
      />
    );
  }

  // ---------------------------------------------------------
  // ODD ONE OUT
  // ---------------------------------------------------------

  if (screen === 'odd-one-out') {
    return (
      <OddOneOutScreen
        userId={patient?.id}
        onBack={() => setScreen('games')}
        onNextGame={() => {
          console.log('NEXT GAME PRESSED');
        }}
      />
    );
  }

  // ---------------------------------------------------------
  // PATIENT DASHBOARD
  // ---------------------------------------------------------

  if (screen === 'patient-dashboard') {
    return (
      <PatientDashboardScreen
        onHome={() => setScreen('home')}
        onGames={() => setScreen('games')}
        onSchedule={() => setScreen('schedule')}
        onMemory={() => setScreen('memory')}
        onProfile={() => setScreen('profile')}
      />
    );
  }

  // ---------------------------------------------------------
  // VOICE ASSISTANT
  // ---------------------------------------------------------

  if (screen === 'voice-assistant') {
    return (
      <VoiceAssistantScreen
        onBack={() => setScreen('home')}
        onMedicine={() => {
          setScreen('schedule');
        }}
        onProfile={() => {
          setScreen('profile');
        }}
        onFamily={() => {
          setScreen('call-family');
        }}
        onGame={() => {
          setScreen('games');
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